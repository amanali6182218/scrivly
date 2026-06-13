import { NextResponse } from 'next/server'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasBulkCsvExport } from '@/lib/plans'

function escapeCsvField(value) {
  const str = String(value ?? '').replace(/\r?\n/g, ' ')
  if (str.includes('"') || str.includes(',')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function POST(request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const generationIds = Array.isArray(body.generationIds) ? body.generationIds : []
  if (generationIds.length === 0) {
    return NextResponse.json({ error: 'generationIds is required.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: profile } = await admin.from('profiles').select('pack_tier').eq('id', user.id).single()
  if (!hasBulkCsvExport(profile?.pack_tier ?? 'none')) {
    return NextResponse.json({ error: 'CSV export requires Pro or Power pack' }, { status: 403 })
  }

  const { data: rows } = await admin
    .from('generation_history')
    .select('*')
    .eq('user_id', user.id)
    .in('id', generationIds)
    .order('created_at', { ascending: false })

  const records = rows || []

  const headers = [
    'Title',
    'Description',
    ...Array.from({ length: 13 }, (_, i) => `Tag ${i + 1}`),
    'Price Min',
    'Price Max',
    'Health Score',
    'Generation Date',
  ]

  const lines = [headers.join(',')]

  for (const record of records) {
    const tags = record.generated_tags || []
    const row = [
      escapeCsvField(record.generated_title),
      escapeCsvField(record.generated_description),
      ...Array.from({ length: 13 }, (_, i) => escapeCsvField(tags[i] ?? '')),
      escapeCsvField(record.suggested_price_min ?? ''),
      escapeCsvField(record.suggested_price_max ?? ''),
      escapeCsvField(record.health_score ?? ''),
      escapeCsvField(record.created_at ? record.created_at.split('T')[0] : ''),
    ]
    lines.push(row.join(','))
  }

  const csv = lines.join('\n')
  const filename = `scrivly-listings-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
