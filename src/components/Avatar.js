export default function Avatar({ profile, email, size = 36, fontSize = undefined }) {
  const initials = profile?.avatar_initials || (email ? email.charAt(0).toUpperCase() : '?')
  const fs = fontSize || Math.round(size * 0.4)

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: `${fs}px`,
    flexShrink: 0,
    background: profile?.avatar_color || 'var(--brand-gradient)',
  }

  return <div style={style}>{initials}</div>
}
