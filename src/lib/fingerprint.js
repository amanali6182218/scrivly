let cachedVisitorId = null

export async function getFingerprint() {
  if (typeof window === 'undefined') return null
  if (cachedVisitorId) return cachedVisitorId

  try {
    const FingerprintJS = (await import('@fingerprintjs/fingerprintjs')).default
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    cachedVisitorId = result.visitorId
    return cachedVisitorId
  } catch {
    return null
  }
}
