import { staticCacheControl } from '@utils/staticCache';

describe('staticCacheControl', () => {
  it.each([
    'main.a1b2c3d4e5f6a7b8c9d0.css',
    'main.a1b2c3d4e5f6a7b8c9d0.js',
    '/app/dist/public/main.0123456789abcdef.css',
  ])('caches content-hashed asset %s immutably', filePath => {
    expect(staticCacheControl(filePath)).toBe('public, max-age=31536000, immutable');
  });

  it.each([
    '/app/dist/public/locales/en/common.json',
    '/app/dist/public/locales/cy/common.json',
    '/app/dist/public/assets/images/favicon.ico',
    '/app/dist/public/assets/fonts/bold-b542beb274.woff2',
    'main-dev.css',
    'main-dev.js',
  ])('does not cache unhashed asset %s immutably', filePath => {
    expect(staticCacheControl(filePath)).toBe('public, max-age=3600');
  });
});
