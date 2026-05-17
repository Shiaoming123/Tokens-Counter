import type { DocumentMetadata } from '../../types/domain'

let pdfjsPromise: typeof import('pdfjs-dist') | undefined

async function getPdfjs() {
  if (!pdfjsPromise) {
    const lib = await import('pdfjs-dist')
    lib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString()
    pdfjsPromise = lib
  }
  return pdfjsPromise
}

const MAX_PDF_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_PAGES = 2000

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const value = String(reader.result ?? '')
      resolve(value.includes(',') ? value.split(',')[1] : value)
    }
    reader.onerror = () => reject(new Error('PDF encoding failed'))
    reader.readAsDataURL(file)
  })
}

export async function extractPdfMetadata(file: File): Promise<DocumentMetadata> {
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are supported')
  }
  if (file.size > MAX_PDF_SIZE) {
    throw new Error(`PDF file too large (max ${MAX_PDF_SIZE / 1024 / 1024}MB)`)
  }

  const pdfjsLib = await getPdfjs()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pageCount = Math.min(pdf.numPages, MAX_PAGES)

  const textParts: string[] = []
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
    if (pageText.trim()) {
      textParts.push(pageText)
    }
  }

  return {
    id: crypto.randomUUID(),
    name: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    pageCount,
    text: textParts.join('\n'),
    base64: await fileToBase64(file),
  }
}
