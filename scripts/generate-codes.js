require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') })

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Alphanumeric chars excluding confusing lookalikes: O, 0, I, 1, L
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

const TIER_CONFIG = {
  starter: { prefix: 'ETY', credits: 100 },
  pro: { prefix: 'PRO', credits: 250 },
  power: { prefix: 'PWR', credits: 550 },
}

function randomChar() {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)]
}

function generateCode(prefix) {
  // Format: PREFIX-XXXX-XXXX-XX
  const a = Array.from({ length: 4 }, randomChar).join('')
  const b = Array.from({ length: 4 }, randomChar).join('')
  const c = Array.from({ length: 2 }, randomChar).join('')
  return `${prefix}-${a}-${b}-${c}`
}

function generateUniqueCodes(prefix, count) {
  const set = new Set()
  while (set.size < count) {
    set.add(generateCode(prefix))
  }
  return Array.from(set)
}

function parseArgs() {
  const args = { tier: 'starter', count: 50 }
  for (const arg of process.argv.slice(2)) {
    const [key, value] = arg.replace(/^--/, '').split('=')
    if (key === 'tier') args.tier = value
    if (key === 'count') args.count = Number(value)
  }
  return args
}

async function main() {
  const { tier, count } = parseArgs()
  const config = TIER_CONFIG[tier]

  if (!config) {
    console.error(`Unknown tier "${tier}". Valid tiers: ${Object.keys(TIER_CONFIG).join(', ')}`)
    process.exit(1)
  }

  if (!count || count <= 0) {
    console.error('Invalid --count. Must be a positive number.')
    process.exit(1)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`Generating ${count} unique ${tier} codes (${config.credits} credits each)…`)
  const codes = generateUniqueCodes(config.prefix, count)
  const now = new Date().toISOString()

  const rows = codes.map((code) => ({
    code,
    credits: config.credits,
    pack_tier: tier,
    is_used: false,
    created_at: now,
  }))

  // Insert in batches of 100 to stay within Supabase limits
  const BATCH = 100
  let inserted = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase.from('redeem_codes').insert(batch)
    if (error) {
      console.error(`Batch ${i / BATCH + 1} failed:`, error.message)
    } else {
      inserted += batch.length
      console.log(`Batch ${i / BATCH + 1}: inserted ${batch.length} codes (total: ${inserted})`)
    }
  }

  console.log(`\nInserted ${inserted} / ${count} codes successfully.`)

  // Export to CSV
  const csvPath = path.resolve(__dirname, `codes-export-${tier}.csv`)
  const header = 'code,credits,pack_tier,is_used,created_at'
  const csvLines = rows.map((r) => `${r.code},${r.credits},${r.pack_tier},${r.is_used},${r.created_at}`)
  fs.writeFileSync(csvPath, [header, ...csvLines].join('\n'), 'utf8')
  console.log(`CSV exported to: ${csvPath}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
