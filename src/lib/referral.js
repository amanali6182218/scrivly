export const REFERRAL_SIGNUP_BONUS = 5
export const REFERRAL_PURCHASE_BONUS = 10
export const REFERRED_USER_BONUS = 3
export const SITE_URL = 'https://scrivly.vercel.app'

export function referralUrl(code) {
  return `${SITE_URL}/signup?ref=${code}`
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function statRow(label, value) {
  return `
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #888;">${escapeHtml(label)}</td>
      <td style="padding: 8px 0; font-size: 14px; color: #222; font-weight: 700; text-align: right;">${escapeHtml(value)}</td>
    </tr>
  `
}

function emailShell({ heading, intro, highlight, rows, link }) {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background: #f4f4f7; padding: 32px;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; text-align: center;">
        <img src="${SITE_URL}/logo.png" alt="Scrivly" style="height: 40px; margin-bottom: 16px;" />
        <h1 style="font-size: 20px; margin: 0 0 12px;">${escapeHtml(heading)}</h1>
        <p style="font-size: 15px; color: #444; line-height: 1.5;">${escapeHtml(intro)}</p>
        <div style="background: #f4f4f7; border-radius: 10px; padding: 16px; margin: 20px 0;">
          <p style="font-size: 14px; color: #444; margin: 0;">${highlight}</p>
        </div>
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
          ${rows.join('')}
        </table>
        <p style="font-size: 13px; color: #888;">Keep sharing and keep earning!</p>
        ${
          link
            ? `<div style="background: #f4f4f7; border: 1px solid #e0e0e0; border-radius: 10px; padding: 14px; font-family: monospace; font-size: 13px; color: #FF3D8B; word-break: break-all;">${escapeHtml(link)}</div>`
            : ''
        }
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #aaa;">— The Scrivly Team</p>
      </div>
    </div>
  `
}

export function buildReferralSignupEmailHtml({ referralCode, totalReferrals, creditsEarned }) {
  return emailShell({
    heading: 'Someone used your referral link! 🎉',
    intro: 'Great news! Someone just signed up to Scrivly using your referral link.',
    highlight: `We have added <strong>${REFERRAL_SIGNUP_BONUS} bonus credits</strong> to your account.`,
    rows: [statRow('Total referrals', totalReferrals), statRow('Total credits earned', creditsEarned)],
    link: referralUrl(referralCode),
  })
}

export function buildReferralPurchaseEmailHtml({ totalReferrals, referralPurchases, creditsEarned }) {
  return emailShell({
    heading: 'Your referral just made a purchase! 🎉',
    intro: 'Amazing news! Someone you referred to Scrivly just purchased a credit pack.',
    highlight: `We have added <strong>${REFERRAL_PURCHASE_BONUS} bonus credits</strong> to your account as a thank you.`,
    rows: [
      statRow('Total referrals', totalReferrals),
      statRow('Referrals who purchased', referralPurchases),
      statRow('Total credits earned', creditsEarned),
    ],
  })
}
