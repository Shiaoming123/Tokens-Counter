import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = path.join(root, 'artifacts', 'gumroad')
const packageName = 'tokens-counter-pro-gumroad'
const stageDir = path.join(outputRoot, packageName)
const zipPath = path.join(outputRoot, `${packageName}.zip`)

const buyerFiles = [
  ['docs/gumroad/buyer-readme.md', 'README.md'],
  ['docs/gumroad/product-page.md', 'gumroad-product-page.md'],
  ['docs/gumroad/package-manifest.md', 'package-manifest.md'],
  ['docs/gumroad/license-activation.md', 'license-activation.md'],
  ['docs/gumroad/api-early-access-request.md', 'api-early-access-request.md'],
  ['docs/gumroad/templates/ai-cost-audit-template.md', 'templates/ai-cost-audit-template.md'],
  ['docs/gumroad/templates/prompt-review-checklist.md', 'templates/prompt-review-checklist.md'],
  ['docs/gumroad/templates/pricing-profile-template.csv', 'templates/pricing-profile-template.csv'],
]

const referenceFiles = [
  'README.md',
  'README.zh-CN.md',
  'LICENSE',
  'LICENSES.md',
  'SECURITY.md',
  'docs/early-access-operating-model.md',
  'docs/early-access-api-key-ledger-template.md',
  'docs/external-token-api.md',
  'docs/openapi.json',
  'docs/known-limitations.md',
  'docs/pricing-profiles.md',
  'docs/anonymized-case-studies.md',
  'docs/vercel-deployment-env.md',
]

const assetFiles = [
  'screenshot.png',
  'public/logo.svg',
  'public/favicon.svg',
  'public/og-image.svg',
]

const forbiddenPathParts = [
  `${path.sep}.git${path.sep}`,
  `${path.sep}.vercel${path.sep}`,
  `${path.sep}.agents${path.sep}`,
  `${path.sep}.claude${path.sep}`,
  `${path.sep}.playwright-mcp${path.sep}`,
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}private${path.sep}`,
  `${path.sep}tmp${path.sep}`,
]

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function copyRequired(sourceRelative, destinationRelative) {
  const source = path.join(root, sourceRelative)
  const destination = path.join(stageDir, destinationRelative)
  if (!existsSync(source)) {
    throw new Error(`Required package source is missing: ${sourceRelative}`)
  }
  mkdirSync(path.dirname(destination), { recursive: true })
  copyFileSync(source, destination)
}

function copyOptional(sourceRelative, destinationRelative) {
  const source = path.join(root, sourceRelative)
  if (!existsSync(source)) return false
  const destination = path.join(stageDir, destinationRelative)
  mkdirSync(path.dirname(destination), { recursive: true })
  const stats = statSync(source)
  if (stats.isDirectory()) {
    cpSync(source, destination, { recursive: true })
  } else {
    copyFileSync(source, destination)
  }
  return true
}

function walkFiles(directory) {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath))
    } else {
      files.push(fullPath)
    }
  }
  return files
}

function assertSafePackage() {
  const files = walkFiles(stageDir)
  const violations = []
  for (const file of files) {
    const relative = path.relative(stageDir, file)
    const normalized = `${path.sep}${relative}`
    const posix = toPosix(relative)
    const basename = path.basename(file)

    if (basename === '.env' || basename.startsWith('.env.')) {
      violations.push(`Forbidden env file: ${posix}`)
    }
    if (forbiddenPathParts.some((part) => normalized.includes(part))) {
      violations.push(`Forbidden path copied: ${posix}`)
    }

    const extension = path.extname(file).toLowerCase()
    if (!['.md', '.txt', '.json', '.csv', '.svg', '.html', '.js', '.css', '.map', '.png', '.ico', '.webp', '.woff', '.woff2'].includes(extension)) {
      continue
    }

    const content = readFileSync(file, 'utf8')
    const riskyPatterns = [
      [/tc_(?:live|test)_[A-Za-z0-9_-]{12,}/, 'Token Counter live/test API key'],
      [/sk-[A-Za-z0-9_-]{24,}/, 'OpenAI-style API key'],
      [/ghp_[A-Za-z0-9_]{20,}/, 'GitHub personal access token'],
      [/-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/, 'private key block'],
    ]
    for (const [pattern, label] of riskyPatterns) {
      if (pattern.test(content)) violations.push(`${label}: ${posix}`)
    }
  }

  if (violations.length > 0) {
    throw new Error(`Unsafe Gumroad package contents:\n${violations.map((item) => `- ${item}`).join('\n')}`)
  }
}

function zipPackage() {
  if (existsSync(zipPath)) rmSync(zipPath, { force: true })
  const stage = stageDir.replaceAll("'", "''")
  const zip = zipPath.replaceAll("'", "''")
  const command = [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    `$ErrorActionPreference = 'Stop'; Compress-Archive -Path (Join-Path -Path '${stage}' -ChildPath '*') -DestinationPath '${zip}' -Force; if (!(Test-Path -LiteralPath '${zip}')) { throw 'Zip was not created.' }`,
  ]
  execFileSync('powershell.exe', command, { cwd: root, stdio: 'inherit' })
}

function writeBuildInfo(includedWebDist) {
  const files = walkFiles(stageDir)
  const hash = createHash('sha256')
  for (const file of files.sort()) {
    hash.update(path.relative(stageDir, file))
    hash.update(readFileSync(file))
  }

  const info = {
    package: packageName,
    generatedAt: new Date().toISOString(),
    includedWebDist,
    fileCount: files.length,
    sha256: hash.digest('hex'),
    boundary:
      'Tokens Counter estimates are for planning, audit, review, and comparison. Provider invoices remain the source of truth.',
  }
  writeFileSync(path.join(stageDir, 'build-info.json'), `${JSON.stringify(info, null, 2)}\n`)
}

rmSync(stageDir, { recursive: true, force: true })
mkdirSync(stageDir, { recursive: true })

for (const [source, destination] of buyerFiles) copyRequired(source, destination)
for (const source of referenceFiles) copyRequired(source, `reference/${source}`)
for (const source of assetFiles) copyOptional(source, `assets/${source}`)

const includedWebDist = copyOptional('dist', 'web-dist')
writeBuildInfo(includedWebDist)
assertSafePackage()
zipPackage()

console.log(`Gumroad package staged: ${path.relative(root, stageDir)}`)
console.log(`Gumroad zip created: ${path.relative(root, zipPath)}`)
