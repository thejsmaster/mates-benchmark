// client/components/Component0760.ts
// Benchmark component #760 — identical logic to TodoPage, scoped class names.

import { html, atom, asyncAction, onMount } from "mates";
import type { Props } from "mates";
import type { Todo } from "../../shared/types/todo.ts";
import {
  getTodos,
  addTodo,
  toggleTodoDone,
  removeTodo,
  clearDone,
  editTodo,
} from "../../server/api/todos.ts";
import { ValidationError } from "mates-fullstack";

import "./Component0760.css";

type Filter = "all" | "active" | "done";

export const Component0760 = (_: Props<{}>) => {
  const todos = atom<Todo[]>([]);
  const input = atom("");
  const filter = atom<Filter>("all");
  const editingId = atom<string | null>(null);
  const editingText = atom("");
  const error = atom("");

  const fetchTodos = asyncAction(async () => {
    todos.set(await getTodos({}));
  });

  fetchTodos();

  onMount(() => {
    console.log("[Component0760] mounted");
    return () => console.log("[Component0760] unmounted");
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
    if (!text) { editingId.set(null); return; }
    const updated = await editTodo({ id, text });
    todos.set((t) => t.map((todo) => (todo.id === id ? updated : todo)));
    editingId.set(null);
  });

  const clearCompleted = asyncAction(async () => {
    const { deleted } = await clearDone({});
    if (deleted > 0) todos.set((t) => t.filter((todo) => !todo.done));
  });

  const filteredTodos = () => {
    const f = filter(), all = todos();
    if (f === "active") return all.filter((t) => !t.done);
    if (f === "done")   return all.filter((t) => t.done);
    return all;
  };

  const activeCount = () => todos().filter((t) => !t.done).length;
  const doneCount   = () => todos().filter((t) => t.done).length;

  return () => html`
    <div class="app-760">
      <header class="header-760">
        <h1>todos — Component0760</h1>
      </header>

      <main class="main-760">
        <input
          class="add-input-760 ${error() ? "add-input--error-760" : ""}"
          type="text"
          placeholder="What needs to be done?"
          .value=${input()}
          @input=${(e: Event) => {
            input.set((e.target as HTMLInputElement).value);
            error.set("");
          }}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === "Escape") input.set("");
            if (e.key === "Enter") { e.preventDefault(); if (!add.isLoading()) add(); }
          }}
        />
        <button class="add-btn-760" type="submit" ?disabled=${add.isLoading()}>
          ${add.isLoading() ? "Adding…" : "Add"}
        </button>

        ${error() ? html`<p class="field-error-760">${error()}</p>` : null}

        ${todos().length > 0 ? html`
          <div class="filters-760">
            ${(["all", "active", "done"] as Filter[]).map((f) => html`
              <button
                class="filter-btn-760 ${filter() === f ? "filter-btn--active-760" : ""}"
                @click=${() => filter.set(f)}
              >${f}</button>
            `)}
          </div>
        ` : null}

        ${fetchTodos.isLoading()
          ? html`<p class="loading-760">Loading…</p>`
          : filteredTodos().length === 0
            ? html`<p class="empty-760">${todos().length === 0 ? "No todos yet." : `No ${filter()} todos.`}</p>`
            : html`
              <ul class="todo-list-760">
                ${filteredTodos().map((todo) => html`
                  <li class="todo-item-760 ${todo.done ? "todo-item--done-760" : ""}">
                    <button
                      class="todo-check-760 ${todo.done ? "todo-check--done-760" : ""}"
                      @click=${() => toggle(todo.id)}
                      aria-label="${todo.done ? "Mark undone" : "Mark done"}"
                    >${todo.done ? "✓" : ""}</button>

                    ${editingId() === todo.id
                      ? html`
                          <form class="edit-form-760" @submit=${(e: Event) => { e.preventDefault(); saveEdit(); }}>
                            <input
                              class="edit-input-760"
                              .value=${editingText()}
                              @input=${(e: Event) => editingText.set((e.target as HTMLInputElement).value)}
                              @keydown=${(e: KeyboardEvent) => { if (e.key === "Escape") editingId.set(null); }}
                              @blur=${() => saveEdit()}
                            />
                          </form>
                        `
                      : html`
                          <span class="todo-text-760" @dblclick=${() => startEdit(todo)} title="Double-click to edit">
                            ${todo.text}
                          </span>
                        `}

                    <button class="todo-delete-760" @click=${() => remove(todo.id)} aria-label="Delete">×</button>
                  </li>
                `)}
              </ul>
            `}

        ${todos().length > 0 ? html`
          <footer class="footer-760">
            <span class="todo-count-760">${activeCount()} item${activeCount() === 1 ? "" : "s"} left</span>
            ${doneCount() > 0
              ? html`<button class="clear-btn-760" @click=${() => clearCompleted()}>Clear completed (${doneCount()})</button>`
              : null}
          </footer>
        ` : null}
      </main>
    </div>
  `;
};
