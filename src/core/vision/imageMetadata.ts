import type { ImageMetadata } from '../../types/domain.js'

const supportedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function getImageMetadata(file: File): Promise<ImageMetadata> {
  if (!supportedMimeTypes.has(file.type)) {
    throw new Error('Only JPG, PNG, WEBP, GIF images are supported')
  }

  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Failed to read image'))
    })

    return {
      id: crypto.randomUUID(),
      name: file.name,
      width: image.naturalWidth,
      height: image.naturalHeight,
      mimeType: file.type,
      sizeBytes: file.size,
      base64: await fileToBase64(file),
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const value = String(reader.result ?? '')
      resolve(value.includes(',') ? value.split(',')[1] : value)
    }
    reader.onerror = () => reject(new Error('Image encoding failed'))
    reader.readAsDataURL(file)
  })
}
