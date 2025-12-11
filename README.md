## Description
This is a todo-app using React, Next.js and TypeScript. The idea is mostly from this [article](https://medium.com/@amayawickramasinghe2001/creating-a-to-do-app-with-next-js-cdb58f0b12d1), and the code is referenced from [here](https://github.com/Amaya-2001/ToDoApp).

The main purpose of the repo is to demonstrate how to test Next.js applications with combined coverage:
- Unit tests with Vitest (jsdom + browser mode via Playwright)
- E2E/Integration tests with Playwright
- V8 code coverage collection using [nextcov](https://github.com/anthropics/nextcov-standalone)
- Coverage merging from unit tests and E2E tests
- json-server as mock server: supports memory database, CRUD operations, and response override for server side rendering tests
- Execute tests in GitHub Actions

**Constraint**:
The current solution for SSR test is by changing the mock server data before each test, which means tests can only be run serially. Parallel testing is not supported at the moment.


## Getting Started

First, start the mock server:

```bash
npm run mock
```

then, run the development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Run unit tests
```bash
npm test
```
This runs both:
- Unit tests with jsdom (`*.test.tsx`)
- Browser tests with Playwright (`*.browser.test.tsx`)

Coverage output: `./coverage/unit`

View coverage report: `npm run lcov:unit`

## Run Playwright E2E tests in local machine
1. Run local build: `npm run build:local`
2. Start the mock server and local Next.js server: `npm run start:integration`
3. Run Playwright tests: `npm run playwright-test`
4. View the Playwright coverage report: `npm run lcov:integration`

## Run Playwright tests in CI
1. Run local build: `npm run build:local`
2. Start the integration tests: `npm run integration-test`

Check the GitHub Actions script for details: [ci.yml](.github/workflows/ci.yml)

## How to collect the Playwright test coverage
Coverage is collected using V8 via [nextcov](https://github.com/anthropics/nextcov-standalone). The configuration is in `playwright.config.ts`.

nextcov collects V8 coverage from CDP (Chrome DevTools Protocol) and converts it to Istanbul format for reporting.

## How to combine unit test and Playwright integration test coverage
1. Run unit tests: `npm test` - coverage output under `./coverage/unit`
2. Run Playwright tests: follow the steps above - coverage output under `./coverage/integration`
3. Merge coverage: `npm run coverage:merge` - combined report under `./coverage`

View merged coverage report: `npm run lcov`

The whole process is included in the GitHub Actions script: [ci.yml](.github/workflows/ci.yml)

## Test Stack
- **Vitest**: Test runner for unit and browser tests
- **@vitest/browser**: Browser testing with Playwright provider
- **Playwright**: E2E testing and browser automation
- **nextcov**: V8 coverage collection for Next.js with Playwright
- **@vitest/coverage-v8**: V8 coverage for Vitest tests
