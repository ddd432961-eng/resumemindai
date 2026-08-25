const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'yahoo.com',
  'ymail.com',
  'proton.me',
  'protonmail.com',
  'edu',
  'edu.in',
  'ac.in'
]

const BLOCKED_EMAIL_DOMAINS = [
  'g.com',
  'ex.com',
  'test.com',
  'example.com',
  'fake.com',
  'dummy.com',
  'invalid.com',
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'trashmail.com',
  'dispostable.com'
]

const BLOCKED_EMAIL_USERNAMES = [
  'abc',
  'abcd',
  'test',
  'demo',
  'admin',
  'user',
  'sample',
  'fake',
  'null',
  'none',
  'ass',
  'asdf',
  'qwerty',
  'resume',
  'resumemind'
]

const BLOCKED_NAMES = [
  'abc',
  'abcd',
  'test',
  'demo',
  'admin',
  'user',
  'sample',
  'fake',
  'null',
  'none',
  'asdf',
  'qwerty'
]

export function validateEmailOnly(email) {
  const cleanEmail = String(email || '').trim().toLowerCase()

  if (!cleanEmail) {
    return 'Please enter your email address.'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  if (!emailRegex.test(cleanEmail)) {
    return 'Please enter a valid email address.'
  }

  const [username, domain] = cleanEmail.split('@')

  if (!username || !domain) {
    return 'Please enter a valid email address.'
  }

  if (username.length < 4) {
    return 'Email username is too short. Please use your real email.'
  }

  if (BLOCKED_EMAIL_USERNAMES.includes(username)) {
    return 'This email looks fake or temporary. Please use your real email.'
  }

  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
    return 'This email domain is not allowed. Please use Gmail, Outlook, Yahoo, iCloud, Proton, or your college email.'
  }

  const isAllowedDomain = ALLOWED_EMAIL_DOMAINS.some((allowedDomain) => {
    return domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
  })

  if (!isAllowedDomain) {
    return 'Please use a trusted email like Gmail, Outlook, Yahoo, iCloud, Proton, or your college email.'
  }

  return null
}

export function validateSignupDetails({ name, email, password, confirmPassword }) {
  const cleanName = String(name || '').trim()
  const cleanPassword = String(password || '')
  const cleanConfirmPassword = String(confirmPassword || '')

  if (!cleanName) {
    return 'Please enter your full name.'
  }

  if (cleanName.length < 3) {
    return 'Name must be at least 3 characters long.'
  }

  if (!/^[A-Za-z\s]+$/.test(cleanName)) {
    return 'Name should contain only letters and spaces.'
  }

  const nameParts = cleanName.split(/\s+/).filter(Boolean)

  if (nameParts.length < 2) {
    return 'Please enter your full name, including first and last name.'
  }

  if (BLOCKED_NAMES.includes(cleanName.toLowerCase())) {
    return 'Please enter a valid real name.'
  }

  const emailError = validateEmailOnly(email)

  if (emailError) {
    return emailError
  }

  if (!cleanPassword) {
    return 'Please create a password.'
  }

  if (cleanPassword.length < 8) {
    return 'Password must be at least 8 characters long.'
  }

  if (!/[A-Z]/.test(cleanPassword)) {
    return 'Password must include at least one uppercase letter.'
  }

  if (!/[a-z]/.test(cleanPassword)) {
    return 'Password must include at least one lowercase letter.'
  }

  if (!/[0-9]/.test(cleanPassword)) {
    return 'Password must include at least one number.'
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]`~;]/.test(cleanPassword)) {
    return 'Password must include at least one special character.'
  }

  if (cleanPassword !== cleanConfirmPassword) {
    return 'Passwords do not match.'
  }

  return null
}