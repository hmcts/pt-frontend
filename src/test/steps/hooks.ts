import { closeExtraBrowserTabs } from '../functional/utils/browserTabs';

After(async () => {
  await closeExtraBrowserTabs();
});
