# Functional tests

BDD functional tests for pt-frontend, run with [CodeceptJS](https://codecept.io/) and Playwright.

## Quick start

```bash
export IDAM_PT_USER_PASSWORD='<password-from-keyvault>'
yarn test:functional
```

To run tests and upload results to Jira/Zephyr:

```bash
export JIRA_AUTH_TOKEN='Bearer ...'
export IDAM_PT_USER_PASSWORD='...'
yarn test:functional:zephyr
```

## Folder structure

```
src/test/
├── config.ts                      # Test config (URL, timeouts, Gherkin paths)
├── steps/                         # Step definitions (auto-loaded via gherkin.steps glob)
│   ├── common.ts
│   └── idam-login.ts
└── functional/
    ├── features/                  # Gherkin feature files
    │   └── idam-login.feature
    ├── page-data/                 # Page copy / labels used by steps
    ├── utils/                     # Shared helpers (password, Playwright actions)
    └── README.md                  # This file

zephyr-scripts/                    # Jira/Zephyr upload tooling
├── run-zephyr.ts
├── zephyr-util.ts
├── zephyr-cycle-folder.ts
├── postprocess-cucumber-report.ts
├── list-zephyr-cycle-folders.ts
└── fetch-zephyr-jar.sh

lib/
└── uk.gov.hmcts-zephyr-automation-independent.jar
```

## Prerequisites

| Requirement                 | Notes                                                                       |
| --------------------------- | --------------------------------------------------------------------------- |
| Node 18+                    |                                                                             |
| Yarn                        |                                                                             |
| Java 21+                    | Required for Zephyr upload (`yarn test:functional:zephyr`)                  |
| Azure Key Vault `pt-kv-aat` | Citizen test user password                                                  |
| `JIRA_AUTH_TOKEN`           | Required for Zephyr upload (`JIRA_PROJECT_ID` defaults to `29506` for PTSD) |

## Running tests

### All functional features

```bash
export IDAM_PT_USER_PASSWORD='<password-from-keyvault>'
yarn test:functional
```

Outputs:

- Playwright failure screenshots → `functional-output/functional/reports/`
- Cucumber JSON report (for Zephyr) → `functional-output/zephyr/cucumber-report.json`

### Headed browser

```bash
TEST_HEADLESS=false yarn test:functional
```

### Different environment

```bash
TEST_URL=https://pt.demo.platform.hmcts.net yarn test:functional
```

## Configuration

Test defaults live in `config/test.json` (loaded when `NODE_CONFIG_ENV=test`, set automatically by `yarn test:functional` and Jenkins):

| Config key            | Purpose                      | Override env var     |
| --------------------- | ---------------------------- | -------------------- |
| `frontend.url`        | PT base URL (AAT by default) | `TEST_URL`           |
| `idam.testUser.email` | Citizen test user email      | `IDAM_PT_USER_EMAIL` |

PR/pipeline env mappings are in `config/custom-environment-variables.json`.

### IDAM credentials

| Item     | Value / location                                                                      |
| -------- | ------------------------------------------------------------------------------------- |
| Email    | `pt-citizen@test.com` (`idam.testUser.email` in `config/test.json`)                   |
| Password | Azure Key Vault secret `pt-idam-test-user-password` in `pt-kv-aat`                    |
| Env var  | `IDAM_PT_USER_PASSWORD` (or `IDAM_PT_USER_PASSWORD_B64` for awkward shell characters) |

In Jenkins, the secret is mapped to `IDAM_PT_USER_PASSWORD` via `Jenkinsfile_CNP`. If the password is missing, login tests fail early with a message pointing to Key Vault.

## Current features

### `idam-login.feature`

Covers IDAM authentication against PT AAT:

1. Unauthenticated visit to PT redirects to IDAM
2. Successful login returns to the PT UI (`My applications`)
3. Incorrect credentials show `Incorrect email or password`

Each scenario uses `@JIRA-EPIC:` on the feature and `@JIRA-TEST-KEY:` on each scenario for Zephyr integration.

## Adding a new feature

1. Add a `.feature` file under `features/` with `@JIRA-*` tags on the feature and each scenario
2. Add step definitions under `src/test/steps/` (matched by `./src/test/steps/**/*.ts`)
3. Put shared labels/copy in `page-data/` and helpers in `utils/`
4. Run with `yarn test:functional`

---

## Zephyr automation

Uploads Cucumber JSON results to HMCTS Jira/Zephyr, following the same pattern as [opal-frontend](https://github.com/hmcts/opal-frontend): CodeceptJS → Cucumber JSON → `@hmcts/zephyr-automation-nodejs` → Java automation jar.

### Yarn script

| Script                        | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| `yarn test:functional:zephyr` | Clear outputs, run functional tests, then upload results to Jira/Zephyr |

The jar at `lib/uk.gov.hmcts-zephyr-automation-independent.jar` is committed; `run-zephyr.ts` fetches it via Maven only if missing. To update the jar manually: `bash zephyr-scripts/fetch-zephyr-jar.sh`.

### Jira tags

| Tag prefix         | Example                       | Purpose                                      |
| ------------------ | ----------------------------- | -------------------------------------------- |
| `@JIRA-TEST-KEY:`  | `@JIRA-TEST-KEY:PTSD-531`     | Link scenario to an existing Zephyr test key |
| `@JIRA-EPIC:`      | `@JIRA-EPIC:HDPD-295`         | Epic link when creating tickets              |
| `@JIRA-STORY:`     | `@JIRA-STORY:HDPD-123`        | Story link when creating tickets             |
| `@JIRA-COMPONENT:` | `@JIRA-COMPONENT:pt-frontend` | Jira component                               |
| `@JIRA-LABEL:`     | `@JIRA-LABEL:functional`      | Jira label                                   |
| `@JIRA-IGNORE:`    | `@JIRA-IGNORE`                | Skip ticket creation/update                  |

### Environment variables

**Required**

| Variable          | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| `JIRA_AUTH_TOKEN` | Jira API token for Zephyr automation                   |
| `JIRA_PROJECT_ID` | Numeric Jira project id for PTSD (defaults to `29506`) |

**Optional overrides**

`JIRA_DEFAULT_USER`, `JIRA_DEFAULT_COMPONENTS`, `EXECUTION_ENVIRONMENT`, `EXECUTION_BUILD`, `EXECUTION_TEST_CYCLE_NAME`, `ZEPHYR_PROJECT_NAME`, `ZEPHYR_FIX_VERSION`, `ZEPHYR_TARGET_CYCLE_ID`, `ZEPHYR_TARGET_CYCLE_NAME`, `ZEPHYR_RUN_FOLDER_NAME`, `ZEPHYR_TARGET_CYCLE_DISABLED`.

### Where results go in Jira

After upload, the jar creates a temporary test cycle, then results are copied into the PTSD **Regression** cycle (default id `3976`) inside a new **datetime folder** (e.g. `pt-frontend functional 2026-08-03 09-22`). Each run gets its own folder so previous results are not overwritten.

The script prints a **Test run URL** opening the Zephyr execution navigator filtered to that folder (`/secure/enav/#?query=...`, not `/secure/Tests.jspa#/testCycle/...`).

If folder creation fails, executions are still saved at the Regression cycle root and the temporary cycle is removed.

Default cycle names use the local timestamp (`pt-frontend functional YYYY-MM-DD HH:mm`). Unset `EXECUTION_TEST_CYCLE_NAME` if you still have a stale value like `pt-frontend idam local 2026-07-31` in your shell.

### Advanced commands

Day-to-day use only needs `yarn test:functional:zephyr`. `run-zephyr.ts` defaults to `CREATE_EXECUTION` against `functional-output/zephyr/cucumber-report.json`. Override with `--action-type` when needed:

| Action type        | Purpose                                              | When to use                                   |
| ------------------ | ---------------------------------------------------- | --------------------------------------------- |
| `CREATE_EXECUTION` | Upload pass/fail results to a Zephyr test cycle      | Default — re-upload without re-running tests  |
| `CREATE_TICKETS`   | Create new Jira test tickets from scenarios          | Scenarios without `@JIRA-TEST-KEY`            |
| `UPDATE_TICKETS`   | Sync scenario text/metadata to existing Jira tickets | After changing feature titles or descriptions |

```bash
export JIRA_AUTH_TOKEN='Bearer ...'

# Re-upload only (tests already ran)
node zephyr-scripts/run-with-log.js -- tsx zephyr-scripts/run-zephyr.ts

# One-off ticket setup
tsx zephyr-scripts/run-zephyr.ts --action-type=CREATE_TICKETS
tsx zephyr-scripts/run-zephyr.ts --action-type=UPDATE_TICKETS

# Inspect Regression cycle folders in Jira
tsx zephyr-scripts/list-zephyr-cycle-folders.ts
```

Console output is mirrored to `tmp/zephyr/*.log` (filename derived from action type, e.g. `create-execution.log`).

### Troubleshooting

Verify Jira auth before uploading:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: $JIRA_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST "https://tools.hmcts.net/jira/rest/api/latest/search" \
  -d '{"jql":"key=PTSD-531","maxResults":1}'
```

Expect `200`. The upload step logs `Using Jira project id 29506` (or your override).
