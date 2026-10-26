const CONTENT_HASHED_ASSET = /\.[0-9a-f]{8,}\.(css|js)$/;
const HASHED_ASSET_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const STATIC_ASSET_CACHE_CONTROL = 'public, max-age=3600';

export const staticCacheControl = (filePath: string): string =>
  CONTENT_HASHED_ASSET.test(filePath) ? HASHED_ASSET_CACHE_CONTROL : STATIC_ASSET_CACHE_CONTROL;
