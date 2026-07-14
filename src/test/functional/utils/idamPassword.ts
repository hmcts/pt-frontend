export function resolveIdamPassword(): string {
  const encodedPassword = process.env.IDAM_PT_USER_PASSWORD_B64?.trim();
  if (encodedPassword) {
    return Buffer.from(encodedPassword, 'base64').toString('utf8').trim();
  }

  return (process.env.IDAM_PT_USER_PASSWORD ?? 'Pa$$word').trim();
}
