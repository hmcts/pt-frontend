# Functional tests

BDD functional tests for pt-frontend, run with [CodeceptJS](https://codecept.io/) and Playwright.

## Folder structure

```
src/test/
├── config.ts                      # Test config (URL, timeouts, Gherkin paths)
├── steps/                         # Step definitions (auto-loaded via **/*.ts)
│   ├── common.ts
│   └── idam-login.ts
└── functional/
    ├── features/                  # Gherkin feature files
    │   └── idam-login.feature
    ├── page-data/                 # Page copy / labels used by steps
    ├── utils/                     # Shared helpers (password, Playwright actions)
    └── README.md                  # This file
```

## Prerequisites

- Node 18+
- Yarn
- Access to Azure Key Vault `pt-kv-aat` (for the citizen test user password)

## Configuration

Defaults live in `config/default.json`:

| Config key | Purpose | Override env var |
| --- | --- | --- |
| `frontend.url` | PT base URL (AAT by default) | `TEST_URL` |
| `idam.testUser.email` | Citizen test user email | `IDAM_PT_USER_EMAIL` |

The test user **password is not stored in git**. Provide it via environment variable (see below).

Env mappings are in `config/custom-environment-variables.json`.

## Running tests

### All functional features

```bash
yarn test:functional
```

### IDAM login only (HDPD-509)

```bash
export IDAM_PT_USER_PASSWORD='<password-from-keyvault>'
yarn test:functional:login
```

### Headed browser (optional)

```bash
TEST_HEADLESS=false yarn test:functional:login
```

### Against a different environment

```bash
TEST_URL=https://pt.demo.platform.hmcts.net yarn test:functional:login
```

Failure screenshots and reports are written to `functional-output/functional/reports/`.

## IDAM login credentials

| Item | Value / location |
| --- | --- |
| Email | `pt-citizen@test.com` (`idam.testUser.email` in `config/default.json`) |
| Password | Azure Key Vault secret `pt-idam-test-user-password` in `pt-kv-aat` |
| Env var | `IDAM_PT_USER_PASSWORD` (or `IDAM_PT_USER_PASSWORD_B64` if the password has awkward shell characters) |

In Jenkins, the same secret is already mapped to `IDAM_PT_USER_PASSWORD` via `Jenkinsfile_CNP`.

If the password is missing, login tests fail early with a message telling you to fetch it from Key Vault.

## Current features

### `idam-login.feature`

Covers IDAM authentication against PT AAT:

1. Unauthenticated visit to PT redirects to IDAM
2. Successful login with the citizen test user returns to the PT UI (`My applications`)
3. Incorrect credentials show the IDAM error `Incorrect email or password`

## Adding a new feature

1. Add a `.feature` file under `features/`
2. Add step definitions under `src/test/steps/` (files matching `**/*.ts` are loaded automatically)
3. Put shared labels/copy in `page-data/` and helpers in `utils/`
4. Run with `yarn test:functional`, or add a focused script in `package.json` if useful
