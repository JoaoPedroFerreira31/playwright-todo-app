# Playwright Todo

A small todo app (Node + Express + SQLite) built for practising end-to-end testing with Playwright.

## Requirements

- Node.js **22.13 or later** (uses the built-in `node:sqlite` module, so there is no database to install)

## Getting started

```bash
npm install
npx playwright install chromium
npm run dev        # http://localhost:3000
```

Demo login (created automatically on first run): **demo@example.com / password123**

| Command            | What it does                                              |
| ------------------ | --------------------------------------------------------- |
| `npm run dev`      | Starts the app on port 3000 and restarts on code changes  |
| `npm start`        | Starts the app without watch mode                         |
| `npm run db:reset` | Wipes the development database and re-seeds it            |
| `npm test`         | Runs the Playwright tests                                 |
| `npm run test:ui`  | Opens Playwright UI mode (the best way to learn)          |
| `npm run codegen`  | Records browser clicks and generates test code            |
| `npm run report`   | Opens the HTML report from the last run                   |

## Docker

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
docker compose up -d --build     # build and start → http://localhost:8080
docker compose logs -f app       # follow the logs
docker compose down              # stop (data is kept)
docker compose down -v           # stop and delete the database
```

The database lives in the `todo-data` volume, so it survives container restarts and rebuilds.
After changing code, run `docker compose up -d --build` again.

### Running the tests against the container

There is a second service in test mode (with `POST /api/test/reset` enabled and an in-memory database):

```bash
docker compose --profile test up -d --build    # → http://localhost:8081
```

PowerShell:
```powershell
$env:BASE_URL="http://localhost:8081"; npx playwright test
```

Git Bash:
```bash
BASE_URL=http://localhost:8081 npx playwright test
```

When `BASE_URL` is set, Playwright tests that server instead of starting a local one.

## Project structure

```
src/
  server.js          server entry point
  app.js             Express: API routes and pages
  db.js              SQLite connection + table creation
  auth.js            passwords, sessions (cookie) and middleware
  seed.js            sample data + reset
  routes/
    auth.js          /api/auth/*
    todos.js         /api/todos/*
    testing.js       /api/test/reset (only with NODE_ENV=test)
public/
  index.html         todo list (requires login)
  login.html         /login
  register.html      /register
  js/api.js          fetch helper
  js/todos.js        todo page logic
tests/
  todo.spec.js       UI tests (todos)
  auth.spec.js       login / sign-up tests
  api.spec.js        direct API tests
```

## Database

| Environment        | File           | Port |
| ------------------ | -------------- | ---- |
| `npm run dev`      | `data/app.db`  | 3000 |
| Playwright tests   | `data/test.db` | 3001 |

Playwright starts the test server by itself (`webServer` in `playwright.config.js`).
To start each test from a clean state, call `POST /api/test/reset`:

```js
test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset');                       // wipe everything + seed
  // await request.post('/api/test/reset', { data: { seed: false } }); // empty database
});
```

## API

All `/api/todos` routes require a session (the `session` cookie, set on login/sign-up).

| Method | Route                           | Body / query                               | Responses            |
| ------ | ------------------------------- | ------------------------------------------ | -------------------- |
| POST   | `/api/auth/register`            | `{ name, email, password }`                | 201, 400, 409        |
| POST   | `/api/auth/login`               | `{ email, password }`                      | 200, 401             |
| POST   | `/api/auth/logout`              |                                            | 204                  |
| GET    | `/api/auth/me`                  |                                            | 200, 401             |
| GET    | `/api/todos`                    | `?status=all\|active\|completed&q=text`    | 200 `{ todos, remaining, total }` |
| GET    | `/api/todos/:id`                |                                            | 200, 404             |
| POST   | `/api/todos`                    | `{ title, priority?, dueDate? }`           | 201, 400, 409        |
| PATCH  | `/api/todos/:id`                | `{ title?, completed?, priority?, dueDate? }` | 200, 400, 404, 409 |
| DELETE | `/api/todos/:id`                |                                            | 204, 404             |
| DELETE | `/api/todos?completed=true`     |                                            | 200 `{ deleted }`    |
| POST   | `/api/test/reset`               | `{ seed?: boolean }` (test mode only)      | 204                  |
| GET    | `/api/health`                   |                                            | 200                  |

Rules: title is required, max 100 characters, no duplicates (case-insensitive);
`priority` is `low`, `medium` or `high`; `dueDate` uses the `YYYY-MM-DD` format;
passwords must be at least 8 characters.

> The app's UI and error messages are in Portuguese, so assertions on visible text
> (e.g. `"Essa tarefa já existe."`) must use the Portuguese strings.

## Useful selectors (`data-testid`)

- **Login:** `login-email`, `login-password`, `login-submit`, `login-error`, `go-to-register`
- **Sign-up:** `register-name`, `register-email`, `register-password`, `register-confirm`, `register-submit`, `register-error`, `go-to-login`
- **Header:** `user-name`, `logout-button`
- **New todo:** `new-todo-input`, `new-todo-priority`, `new-todo-due-date`, `add-todo-button`, `error-message`
- **List:** `todo-list`, `todo-item`, `todo-checkbox`, `todo-title`, `todo-priority`, `todo-due-date`, `todo-delete`, `todo-edit-input`
- **Filters/search:** `filter-all`, `filter-active`, `filter-completed`, `search-input`
- **Footer:** `todo-counter`, `clear-completed`, `empty-state`, `loading`

Elements also have accessible labels, so you can practise `getByRole` and `getByLabel` too.

Good exercises:
- Deleting a todo opens a `confirm()` dialog → handle it with `page.on('dialog', d => d.accept())`.
- Search is debounced by 250 ms → a good way to understand Playwright's auto-waiting.
- Log in once and reuse the session with `storageState`.
- Create data through the API (`request`) and check the result in the UI.
