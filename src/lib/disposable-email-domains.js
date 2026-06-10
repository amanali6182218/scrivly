export const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwam.com',
  'yopmail.com',
  'sharklasers.com',
  'guerrillamailblock.com',
  'grr.la',
  'guerrillamail.info',
  'spam4.me',
  'trashmail.com',
  'trashmail.me',
  'trashmail.net',
  'dispostable.com',
  'mailnull.com',
  'spamgourmet.com',
  'mytemp.email',
  'fakeinbox.com',
  'tempr.email',
  'discard.email',
  'spamthisplease.com',
  'binkmail.com',
  'bobmail.info',
  'chammy.info',
  'devnullmail.com',
  'dingbone.com',
  'fudgerub.com',
  'lookugly.com',
  'yep.it',
  'mailzilla.com',
  'mohmal.com',
]

export function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  return domain ? DISPOSABLE_DOMAINS.includes(domain) : false
}
