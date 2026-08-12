export async function closeExtraBrowserTabs(): Promise<void> {
  const { I } = inject();

  await I.usePlaywrightTo('close extra browser tabs', async ({ page }) => {
    const context = page.context();
    let pages = context.pages();

    while (pages.length > 1) {
      await pages[pages.length - 1].close();
      pages = context.pages();
    }

    await pages[0].bringToFront();
  });
}
