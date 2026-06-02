# mates-fullstack example — Todo App

A minimal todo app demonstrating the current mates-fullstack architecture.

## What this shows

- Direct RPC-style server function calls from client code
- SSR through `client/App.ts`
- Dev no-bundle mode (`/_src`, `/_pkg`, import map)
- Production Model B output: browser assets plus compiled `dist/server`
- Validation errors with `ValidationError`
- `server/main.ts` middleware
- Shared types in `shared/types`

## Structure

```txt
client/
  App.ts             # root app/router used for SSR and hydration
  TodoPage.ts        # todo UI
  client.ts          # browser entry point

server/
  api/todos.ts       # listTodos, addTodo, toggleTodoDone, editTodo, removeTodo, clearCompleted
  helpers/store.ts   # in-memory todo store
  main.ts            # onRequest middleware

shared/
  types/todo.ts      # Todo interface

public/
  style.css          # static CSS copied to dist/public
```

## Running

```bash
npm install
npm run dev         # development server, native ESM source modules
npm run build       # production build: dist/assets + dist/server + dist/public
npm run start       # production server, compiled runtime only
```

## Production output

After `npm run build`:

```txt
dist/
  server/
    App.js
    main.js
    api/todos.js
  assets/
    client-[hash].js
    manifest.json
  public/
    style.css
  manifest.json
```

`npm run start` reads from `dist/server/**`; it does not import source `.ts` files.

## Key patterns

### Server function — plain async RPC

```ts
// server/api/todos.ts
import type { ServerCtx } from "mates-fullstack-beta";
import { ValidationError } from "mates-fullstack-beta";

export async function addTodo(payload: { text: string }, ctx: ServerCtx) {
  if (!payload.text.trim()) {
    throw new ValidationError("Required", {
      fields: { text: "Cannot be empty" },
    });
  }
  return createTodo(payload.text);
}
```

### Client — direct import, called like a local function

```ts
import { asyncAction } from "mates";
import { addTodo } from "../server/api/todos.ts";

const add = asyncAction(async () => {
  const todo = await addTodo({ text: input() });
  todos.set((items) => [todo, ...items]);
});
```

The build/dev transform replaces `server/api/**` imports with RPC stubs. Any other `server/**` import from client code is blocked.

## Docker

The included `Dockerfile` uses a Node 20 multi-stage build. The runtime image copies only package output, dependencies, and the compiled app `dist/` directory, then runs:

```bash
node ../../dist/cli-new.js start
```
