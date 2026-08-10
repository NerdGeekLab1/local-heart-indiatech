// Shared brand styling for roamyoo transactional emails.
export const brand = {
  primary: '#F97316',
  primaryText: '#ffffff',
  accent: '#1F7A5C',
  foreground: '#14181F',
  muted: '#5B6472',
  border: '#EAE7E1',
  radius: '20px',
  font: "'Outfit', Helvetica, Arial, sans-serif",
  siteName: 'roamyoo',
  siteUrl: 'https://roamyoo.lovable.app',
}

export const main = { backgroundColor: '#ffffff', fontFamily: brand.font }
export const container = { padding: '24px 28px', maxWidth: '600px' }
export const eyebrow = {
  fontSize: '12px',
  letterSpacing: '1.5px',
  textTransform: 'uppercase' as const,
  color: brand.primary,
  fontWeight: 700 as const,
  margin: '0 0 8px',
}
export const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: brand.foreground,
  margin: '0 0 16px',
}
export const text = {
  fontSize: '15px',
  color: brand.muted,
  lineHeight: '1.6',
  margin: '0 0 18px',
}
export const button = {
  backgroundColor: brand.primary,
  color: brand.primaryText,
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: brand.radius,
  padding: '13px 26px',
  textDecoration: 'none',
  display: 'inline-block',
}
export const card = {
  border: `1px solid ${brand.border}`,
  borderRadius: brand.radius,
  padding: '18px 20px',
  margin: '0 0 22px',
}
export const rowLabel = { fontSize: '13px', color: brand.muted, margin: '0 0 2px' }
export const rowValue = {
  fontSize: '15px',
  color: brand.foreground,
  fontWeight: 600 as const,
  margin: '0 0 12px',
}
export const footer = { fontSize: '12px', color: '#9AA1AC', margin: '28px 0 0', lineHeight: '1.6' }
export const link = { color: brand.primary, textDecoration: 'underline' }
