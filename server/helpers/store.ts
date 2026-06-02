// server/helpers/store.ts
//
// In-memory todo store. No database — just a Map.
// In a real app this would be a DB call in server/helpers/db.ts.

import type { Todo } from "../../shared/types/todo.ts";
import crypto from "node:crypto";

const _todos = new Map<string, Todo>();

export function getAllTodos(): Todo[] {
  return [..._todos.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export function getTodo(id: string): Todo | null {
  return _todos.get(id) ?? null;
}

export function createTodo(text: string): Todo {
  const todo: Todo = {
    id: crypto.randomUUID(),
    text: text.trim(),
    done: false,
    createdAt: Date.now(),
  };
  _todos.set(todo.id, todo);
  return todo;
}

export function toggleTodo(id: string): Todo | null {
  const todo = _todos.get(id);
  if (!todo) return null;
  todo.done = !todo.done;
  return todo;
}

export function updateTodo(id: string, text: string): Todo | null {
  const todo = _todos.get(id);
  if (!todo) return null;
  todo.text = text.trim();
  return todo;
}

export function deleteTodo(id: string): boolean {
  return _todos.delete(id);
}

export function clearCompleted(): number {
  let count = 0;
  for (const [id, todo] of _todos) {
    if (todo.done) {
      _todos.delete(id);
      count++;
    }
  }
  return count;
}
