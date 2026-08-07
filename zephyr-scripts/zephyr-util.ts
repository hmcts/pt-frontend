#!/usr/bin/env node
import * as path from 'node:path';

import { ZephyrCliOptions } from '@hmcts/zephyr-automation-nodejs';

export function createZephyrOptions(actionType: string, processType: string, reportPath: string): ZephyrCliOptions {
  const jiraToken = process.env['JIRA_AUTH_TOKEN'];
  if (!jiraToken) {
    throw new Error('JIRA_AUTH_TOKEN environment variable is required for Zephyr integration');
  }

  const jiraProjectId = (process.env['JIRA_PROJECT_ID'] ?? '29506').trim();
  if (!jiraProjectId) {
    throw new Error('JIRA_PROJECT_ID must be a non-empty numeric Jira project id for PTSD');
  }

  const basePath = path.resolve(process.cwd());
  const jiraLocation = path.resolve(process.cwd(), 'lib/uk.gov.hmcts-zephyr-automation-independent.jar');

  return {
    actionType,
    basePath,
    reportPath,
    processType,
    githubRepoBaseSrcDir:
      process.env['ZEPHYR_GITHUB_REPO_BASE_SRC_DIR'] ?? 'https://github.com/hmcts/pt-frontend/tree/master',
    jiraBaseUrl: process.env['JIRA_BASE_URL'] ?? 'https://tools.hmcts.net/jira/rest/api/latest',
    jiraProjectId,
    jiraDefaultUser: process.env['JIRA_DEFAULT_USER'] ?? 'PT.Zephyr.automation',
    jiraEpicLinkCustomFieldId: process.env['JIRA_EPIC_LINK_CUSTOM_FIELD_ID'] ?? 'customfield_10008',
    jiraDefaultComponents: process.env['JIRA_DEFAULT_COMPONENTS'] ?? 'pt-frontend',
    jiraAuthToken: jiraToken,
    jarLocation: jiraLocation,
  };
}
