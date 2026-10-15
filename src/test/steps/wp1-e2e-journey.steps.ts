// Placeholder check-your-answers pages have a heading and no section button yet.
When('the citizen returns to the task list', async () => {
  const { I } = inject();
  const currentUrl = await I.grabCurrentUrl();
  const taskListUrl = currentUrl.replace(/\/[^/?#]+(?:[?#].*)?$/, '/task-list');
  I.amOnPage(taskListUrl);
});
