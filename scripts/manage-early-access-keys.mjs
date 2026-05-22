import { createHash, randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

const defaultCsvPath = 'private/early-access-api-keys.csv'
const defaultHeaders = [
  'label',
  'key',
  'status',
  'issued_to',
  'issued_at',
  'notes',
  'key_hash_prefix',
  'plan',
  'hourly_limit',
  'monthly_limit',
  'issued_channel',
  'privacy_ack_at',
  'last_contacted_at',
  'revoked_at',
  'revocation_reason',
  'feedback_day3_at',
  'feedback_day10_at',
]

function parseArgs(argv) {
  const args = { _: [] }
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (!value.startsWith('--')) {
      args._.push(value)
      continue
    }

    const key = value.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      index += 1
    }
  }
  return args
}

function parseCsvLine(line) {
  const values = []
  let value = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]
    if (char === '"' && quoted && next === '"') {
      value += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      values.push(value)
      value = ''
    } else {
      value += char
    }
  }

  values.push(value)
  return values
}

function readCsv(path) {
  if (!existsSync(path)) {
    return { headers: [...defaultHeaders], rows: [] }
  }

  const content = readFileSync(path, 'utf8').trim()
  if (!content) return { headers: [...defaultHeaders], rows: [] }

  const [headerLine, ...lines] = content.split(/\r?\n/)
  const headers = parseCsvLine(headerLine)
  const rows = lines.filter(Boolean).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })

  return { headers: mergeHeaders(headers), rows }
}

function mergeHeaders(headers) {
  return [...headers, ...defaultHeaders.filter((header) => !headers.includes(header))]
}

function escapeCsv(value) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

function writeCsv(path, headers, rows) {
  mkdirSync(dirname(path), { recursive: true })
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header] ?? '')).join(',')),
  ]
  const tempPath = `${path}.tmp-${process.pid}`
  writeFileSync(tempPath, `${lines.join('\n')}\n`)
  renameSync(tempPath, path)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function fingerprint(key) {
  if (!key) return ''
  return createHash('sha256').update(key).digest('hex').slice(0, 16)
}

function generateKey(label) {
  return `tc_live_${label}_${randomBytes(32).toString('hex')}`
}

function ensureSafeLedgerPath(path, args) {
  if (args['allow-unsafe-path']) return

  const cwd = process.cwd()
  const relativePath = relative(cwd, path).replaceAll('\\', '/')
  if (relativePath.startsWith('..') || !relativePath.startsWith('private/')) {
    throw new Error('Refusing to manage keys outside private/. Pass --allow-unsafe-path only for disposable tests.')
  }

  try {
    execFileSync('git', ['check-ignore', relativePath], { cwd, stdio: 'ignore' })
  } catch {
    throw new Error(`${relativePath} is not ignored by git. Refusing to write secrets.`)
  }

  try {
    execFileSync('git', ['ls-files', '--error-unmatch', relativePath], { cwd, stdio: 'ignore' })
    throw new Error(`${relativePath} is tracked by git. Stop and rotate any exposed keys before continuing.`)
  } catch (error) {
    if (error.message.includes('tracked by git')) throw error
  }
}

function requireArg(args, name) {
  const value = args[name]
  if (!value || value === true) {
    throw new Error(`Missing --${name}`)
  }
  return value
}

function ensureUniqueLabel(rows, label) {
  if (rows.some((row) => row.label === label)) {
    throw new Error(`Key label already exists: ${label}`)
  }
}

function nextLabel(rows, date = today()) {
  const prefix = `ea-${date.replaceAll('-', '')}-`
  const used = new Set(rows.map((row) => row.label))
  for (let number = 1; number < 1000; number += 1) {
    const label = `${prefix}${String(number).padStart(2, '0')}`
    if (!used.has(label)) return label
  }
  throw new Error(`Could not allocate label for ${prefix}`)
}

function findRow(rows, label) {
  const row = rows.find((item) => item.label === label)
  if (!row) throw new Error(`Key label not found: ${label}`)
  return row
}

function listKeys(rows, args) {
  const status = args.status && args.status !== true ? String(args.status) : undefined
  const filtered = status ? rows.filter((row) => row.status === status) : rows
  const showSecrets = Boolean(args['show-secrets'])
  for (const row of filtered) {
    const safe = {
      label: row.label,
      status: row.status,
      issued_to: row.issued_to,
      issued_at: row.issued_at,
      key_hash_prefix: row.key_hash_prefix || fingerprint(row.key),
      notes: row.notes,
    }
    if (showSecrets) safe.key = row.key
    console.log(JSON.stringify(safe))
  }
}

function generate(args, state) {
  const count = Number(args.count && args.count !== true ? args.count : 1)
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    throw new Error('--count must be an integer from 1 to 100')
  }
  const requestedLabel = args.label && args.label !== true ? args.label : undefined
  if (requestedLabel && count !== 1) {
    throw new Error('--label can only be used with --count 1')
  }
  const generated = []
  for (let index = 0; index < count; index += 1) {
    const label = requestedLabel ?? nextLabel(state.rows, args.date && args.date !== true ? args.date : today())
    ensureUniqueLabel(state.rows, label)
    const key = generateKey(label)
    const row = {
      label,
      key,
      status: args.status && args.status !== true ? args.status : 'available',
      issued_to: args['issued-to'] && args['issued-to'] !== true ? args['issued-to'] : '',
      issued_at: args['issued-at'] && args['issued-at'] !== true ? args['issued-at'] : '',
      notes: args.notes && args.notes !== true ? args.notes : '',
      key_hash_prefix: fingerprint(key),
      plan: args.plan && args.plan !== true ? args.plan : 'early-access',
      hourly_limit: args['hourly-limit'] && args['hourly-limit'] !== true ? args['hourly-limit'] : '120',
      monthly_limit: args['monthly-limit'] && args['monthly-limit'] !== true ? args['monthly-limit'] : '',
      issued_channel: args.channel && args.channel !== true ? args.channel : '',
      privacy_ack_at: args['privacy-ack-at'] && args['privacy-ack-at'] !== true ? args['privacy-ack-at'] : '',
      last_contacted_at: '',
      revoked_at: '',
      revocation_reason: '',
      feedback_day3_at: '',
      feedback_day10_at: '',
    }
    state.rows.push(row)
    generated.push(row)
  }

  for (const row of generated) {
    console.log(`Generated ${row.label}`)
    console.log(`Key fingerprint: ${row.key_hash_prefix}`)
    if (args['show-secret']) console.log(`Key: ${row.key}`)
  }
}

function use(args, state) {
  const label = args.label && args.label !== true ? args.label : args._[1]
  if (!label) throw new Error('Missing key label')
  const row = findRow(state.rows, label)
  if (row.status && row.status !== 'available') {
    throw new Error(`Only available keys can be marked used. ${label} is ${row.status}.`)
  }
  if (!args['issued-to'] || args['issued-to'] === true) {
    throw new Error('Missing --issued-to')
  }
  row.status = 'used'
  row.issued_to = args['issued-to']
  row.issued_at = args['issued-at'] && args['issued-at'] !== true ? args['issued-at'] : today()
  if (args.notes && args.notes !== true) row.notes = args.notes
  if (args.channel && args.channel !== true) row.issued_channel = args.channel
  if (args['privacy-ack-at'] && args['privacy-ack-at'] !== true) row.privacy_ack_at = args['privacy-ack-at']
  row.key_hash_prefix = row.key_hash_prefix || fingerprint(row.key)
  console.log(`Marked ${row.label} as used`)
}

function show(args, state) {
  const label = args.label && args.label !== true ? args.label : args._[1]
  if (!label) throw new Error('Missing key label')
  if (!args.reveal) {
    throw new Error('Refusing to print a secret without --reveal')
  }
  const row = findRow(state.rows, label)
  console.error('Warning: printing a live secret. Do not paste it into public logs, issues, screenshots, or chat.')
  console.log(row.key)
}

function mark(args, state) {
  const row = findRow(state.rows, requireArg(args, 'label'))
  row.status = requireArg(args, 'status')
  if (args['issued-to'] && args['issued-to'] !== true) row.issued_to = args['issued-to']
  if (args['issued-at'] && args['issued-at'] !== true) row.issued_at = args['issued-at']
  if (args.notes && args.notes !== true) row.notes = args.notes
  if (args.channel && args.channel !== true) row.issued_channel = args.channel
  if (args['privacy-ack-at'] && args['privacy-ack-at'] !== true) row.privacy_ack_at = args['privacy-ack-at']
  if (args['last-contacted-at'] && args['last-contacted-at'] !== true) row.last_contacted_at = args['last-contacted-at']
  row.key_hash_prefix = row.key_hash_prefix || fingerprint(row.key)
  console.log(`Marked ${row.label} as ${row.status}`)
}

function revoke(args, state) {
  const row = findRow(state.rows, requireArg(args, 'label'))
  row.status = 'revoked'
  row.revoked_at = args['revoked-at'] && args['revoked-at'] !== true ? args['revoked-at'] : today()
  row.revocation_reason = args.reason && args.reason !== true ? args.reason : 'manual revocation'
  row.key_hash_prefix = row.key_hash_prefix || fingerprint(row.key)
  console.log(`Revoked ${row.label}`)
}

function exportEnv(rows, args) {
  const statuses = args.status && args.status !== true ? String(args.status).split(',') : ['used', 'active']
  const keys = rows.filter((row) => statuses.includes(row.status)).map((row) => row.key).filter(Boolean)
  console.log(keys.join(','))
}

function printHelp() {
  console.log(`Usage:
  node scripts/manage-early-access-keys.mjs list [--csv ${defaultCsvPath}] [--status available] [--show-secrets]
  node scripts/manage-early-access-keys.mjs generate [--count 5] [--label ea-YYYYMMDD-01] [--show-secret]
  node scripts/manage-early-access-keys.mjs use ea-YYYYMMDD-01 --issued-to user [--notes text]
  node scripts/manage-early-access-keys.mjs show ea-YYYYMMDD-01 --reveal
  node scripts/manage-early-access-keys.mjs mark --label ea-YYYYMMDD-01 --status used [--issued-to user] [--notes text]
  node scripts/manage-early-access-keys.mjs revoke --label ea-YYYYMMDD-01 [--reason text]
  node scripts/manage-early-access-keys.mjs export-env [--status used,active]

The default CSV lives under private/ and is ignored by git. Do not paste --show-secret output into public logs.`)
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const command = args._[0]
  if (!command || command === 'help') {
    printHelp()
    return
  }

  const csvPath = resolve(args.csv && args.csv !== true ? args.csv : defaultCsvPath)
  ensureSafeLedgerPath(csvPath, args)
  const state = readCsv(csvPath)

  if (command === 'list') {
    listKeys(state.rows, args)
    return
  }
  if (command === 'export-env') {
    exportEnv(state.rows, args)
    return
  }
  if (command === 'show') {
    show(args, state)
    return
  }
  if (command === 'generate') {
    generate(args, state)
  } else if (command === 'use') {
    use(args, state)
  } else if (command === 'mark') {
    mark(args, state)
  } else if (command === 'revoke') {
    revoke(args, state)
  } else {
    throw new Error(`Unknown command: ${command}`)
  }

  for (const row of state.rows) {
    row.key_hash_prefix = row.key_hash_prefix || fingerprint(row.key)
  }
  writeCsv(csvPath, state.headers, state.rows)
}

try {
  main()
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
