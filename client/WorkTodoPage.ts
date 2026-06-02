// client/WorkTodoPage.ts
// The todo page component — same code runs during SSR and in the browser.
// Server functions are imported directly; build plugin replaces them with RPC stubs.

import { html, atom, asyncAction, onMount } from "mates";
import type { Props } from "mates";
import type { Todo } from "../shared/types/todo.ts";
import {
  getTodos,
  addTodo,
  toggleTodoDone,
  removeTodo,
  clearDone,
  editTodo,
} from "../server/api/todos.ts";
import { ValidationError } from "mates-fullstack";

import "./app.css";
import "../public/style.css";
type Filter = "all" | "active" | "done";

export const WorkTodoPage = (_: Props<{}>) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const todos = atom<Todo[]>([]);
  const input = atom("");
  const filter = atom<Filter>("all");
  const editingId = atom<string | null>(null);
  const editingText = atom("");
  const error = atom("");

  // ── Server calls ───────────────────────────────────────────────────────────

  const fetchTodos = asyncAction(async () => {
    todos.set(await getTodos({}));
  });

  fetchTodos(); // load on mount — during SSR this runs via the Fetch shortcut

  onMount(() => {
    console.log("[WorkTodoPage] mounted");
    return () => console.log("[WorkTodoPage] unmounted");
  });

  const add = asyncAction(async () => {
    const text = input().trim();
    if (!text) return;
    error.set("");
    try {
      const todo = await addTodo({ text });
      todos.set((t) => [todo, ...t]);
      input.set("");
    } catch (e) {
      if (e instanceof ValidationError) {
        error.set(e.fields.text ?? e.message);
      }
    }
  });

  const toggle = asyncAction(async (id: string) => {
    debugger;
    const updated = await toggleTodoDone({ id });
    todos.set((t) => t.map((todo) => (todo.id === id ? updated : todo)));
  });

  const remove = asyncAction(async (id: string) => {
    await removeTodo({ id });
    todos.set((t) => t.filter((todo) => todo.id !== id));
  });

  const startEdit = (todo: Todo) => {
    editingId.set(todo.id);
    editingText.set(todo.text);
  };

  const saveEdit = asyncAction(async () => {
    const id = editingId();
    const text = editingText().trim();
    if (!id) return;
    if (!text) {
      editingId.set(null);
      return;
    }
    const updated = await editTodo({ id, text });
    todos.set((t) => t.map((todo) => (todo.id === id ? updated : todo)));
    editingId.set(null);
  });

  const clearCompleted = asyncAction(async () => {
    const { deleted } = await clearDone({});
    if (deleted > 0) todos.set((t) => t.filter((todo) => !todo.done));
  });
  console.log("inside outer");

  // ── Derived ─────────────────────────────────────────────────────────────────

  const filteredTodos = () => {
    const f = filter();
    const all = todos();
    if (f === "active") return all.filter((t) => !t.done);
    if (f === "done") return all.filter((t) => t.done);
    return all;
  };

  const activeCount = () => todos().filter((t) => !t.done).length;
  const doneCount = () => todos().filter((t) => t.done).length;

  // ── Template ────────────────────────────────────────────────────────────────

  return () => html`
    <div class="app">
      <header class="header">
        <h1>work todos</h1>
      </header>

      <main class="main">
        <input
          class="add-input ${error() ? "add-input--error" : ""}"
          type="text"
          placeholder="What needs to be done?"
          .value=${input()}
          @input=${(e: Event) => {
            input.set((e.target as HTMLInputElement).value);
            error.set("");
          }}
          @keydown=${(e: KeyboardEvent) => {
            debugger;
            if (e.key === "Escape") input.set("");
            if (e.key === "Enter") {
              e.preventDefault();
              if (!add.isLoading()) add();
            }
          }}
        />
        <button class="add-btn" type="submit" ?disabled=${add.isLoading()}>
          ${add.isLoading() ? "Adding…" : "Add work todo"}
        </button>

        ${error() ? html`<p class="field-error">${error()}</p>` : null}
        ${todos().length > 0
          ? html`
              <div class="filters">
                ${(["all", "active", "done"] as Filter[]).map(
                  (f) => html`
                    <button
                      class="filter-btn ${filter() === f
                        ? "filter-btn--active"
                        : ""}"
                      @click=${() => filter.set(f)}
                    >
                      ${f}
                    </button>
                  `,
                )}
              </div>
            `
          : null}
        ${fetchTodos.isLoading()
          ? html` <p class="loading">Loading…</p> `
          : filteredTodos().length === 0
            ? html`
                <p class="empty">
                  ${todos().length === 0
                    ? "No todos yet. Add one above."
                    : `No ${filter()} todos.`}
                </p>
              `
            : html`
                <ul class="todo-list">
                  ${filteredTodos().map(
                    (todo) => html`
                      <li
                        class="todo-item ${todo.done ? "todo-item--done" : ""}"
                      >
                        <button
                          class="todo-check ${todo.done
                            ? "todo-check--done"
                            : ""}"
                          @click=${() => toggle(todo.id)}
                          aria-label="${todo.done
                            ? "Mark undone"
                            : "Mark done"}"
                        >
                          ${todo.done ? "✓" : ""}
                        </button>

                        ${editingId() === todo.id
                          ? html`
                              <form
                                class="edit-form"
                                @submit=${(e: Event) => {
                                  e.preventDefault();
                                  saveEdit();
                                }}
                              >
                                <input
                                  class="edit-input"
                                  .value=${editingText()}
                                  @input=${(e: Event) =>
                                    editingText.set(
                                      (e.target as HTMLInputElement).value,
                                    )}
                                  @keydown=${(e: KeyboardEvent) => {
                                    if (e.key === "Escape") editingId.set(null);
                                  }}
                                  @blur=${() => saveEdit()}
                                />
                              </form>
                            `
                          : html`
                              <span
                                class="todo-text"
                                @dblclick=${() => startEdit(todo)}
                                title="Double-click to edit"
                              >
                                ${todo.text}
                              </span>
                            `}

                        <button
                          class="todo-delete"
                          @click=${() => remove(todo.id)}
                          aria-label="Delete"
                        >
                          ×
                        </button>
                      </li>
                    `,
                  )}
                </ul>
              `}
        ${todos().length > 0
          ? html`
              <footer class="footer">
                <span class="todo-count"
                  >${activeCount()} item${activeCount() === 1 ? "" : "s"}
                  left</span
                >
                ${doneCount() > 0
                  ? html`
                      <button
                        class="clear-btn"
                        @click=${() => clearCompleted()}
                      >
                        Clear completed (${doneCount()})
                      </button>
                    `
                  : null}
              </footer>
            `
          : null}
      </main>
    </div>
  `;
};
