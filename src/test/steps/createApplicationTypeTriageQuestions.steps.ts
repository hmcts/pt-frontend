import { createApplicationTypeTriageQuestions } from '../functional/page-data/createApplicationTypeTriageQuestions.data';

const { I } = inject();

Given('I am on the "What type of application do you want to make" page', () => {
  I.amOnPage(createApplicationTypeTriageQuestions.applyingForUrl);
});
