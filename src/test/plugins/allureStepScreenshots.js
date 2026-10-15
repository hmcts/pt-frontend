const Container = require('codeceptjs/lib/container');
const event = require('codeceptjs/lib/event');
const recorder = require('codeceptjs/lib/recorder');

// Codecept's stepByStepReport skips every step in this version: it bails out
// when `step.test` is missing, and nothing ever sets that flag. Attach the
// page image here, after the step has run and while Allure still has it open.
module.exports = function () {
  event.dispatcher.on(event.step.after, step => {
    if (typeof step.isBDD === 'function' && step.isBDD()) {
      return;
    }

    recorder.add('attach step screenshot to Allure', async () => {
      const helper = Container.helpers('Playwright');
      const allure = Container.plugins('allure');
      if (!helper?.page || !allure) {
        return;
      }

      try {
        const buffer = await helper.page.screenshot({ fullPage: true, type: 'png' });
        allure.addAttachment(step.toString(), buffer, 'image/png');
      } catch {
        // The page can be closed or mid-navigation. The step result still stands.
      }
    });
  });
};
