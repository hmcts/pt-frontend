function nodeEnv(): string {
  return process.env.NODE_ENV ?? 'development';
}

export function isLocalDev(): boolean {
  return nodeEnv() === 'development';
}

export function isDiagnosticsEnabled(): boolean {
  return nodeEnv() !== 'production';
}

export function isSecureTransport(): boolean {
  if (process.env.ALLOW_INSECURE_COOKIES === 'true') {
    return false;
  }
  return !isLocalDev();
}
