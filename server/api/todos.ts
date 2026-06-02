// server/api/todos.ts
//
// RPC functions for the todo app.
// Called directly from client code — no REST API design needed.
// All functions are plain async — mates-fullstack handles the transport.

import type { ServerCtx } from "mates-fullstack";
import type { Todo } from "../../shared/types/todo.ts";
import {
  getAllTodos,
  createTodo,
  toggleTodo,
  updateTodo,
  deleteTodo,
  clearCompleted,
} from "../helpers/store.ts";
import { NotFoundError, ValidationError } from "mates-fullstack";

/**
 * Returns all todos, newest first.
 */
export async function getTodos(payload: {}, ctx?: ServerCtx): Promise<Todo[]> {
  return getAllTodos();
}

/**
 * Create a new todo.
 */
export async function addTodo(
  payload: { text: string },
  ctx?: ServerCtx,
): Promise<Todo> {
  if (!payload.text?.trim()) {
    throw new ValidationError("Todo text is required", {
      fields: { text: "Cannot be empty" },
    });
  }
  if (payload.text.trim().length > 500) {
    throw new ValidationError("Todo text is too long", {
      fields: { text: "Maximum 500 characters" },
    });
  }
  return createTodo(payload.text);
}

/**
 * Toggle a todo's done state.
 */
export async function toggleTodoDone(
  payload: { id: string },
  ctx?: ServerCtx,
): Promise<Todo> {
  const todo = toggleTodo(payload.id);
  if (!todo) throw new NotFoundError("Todo not found");
  return todo;
}

/**
 * Update a todo's text.
 */
export async function editTodo(
  payload: { id: string; text: string },
  ctx?: ServerCtx,
): Promise<Todo> {
  if (!payload.text?.trim()) {
    throw new ValidationError("Todo text is required", {
      fields: { text: "Cannot be empty" },
    });
  }
  const todo = updateTodo(payload.id, payload.text);
  if (!todo) throw new NotFoundError("Todo not found");
  return todo;
}

/**
 * Delete a todo by id.
 */
export async function removeTodo(
  payload: { id: string },
  ctx?: ServerCtx,
): Promise<{ ok: boolean }> {
  const deleted = deleteTodo(payload.id);
  if (!deleted) throw new NotFoundError("Todo not found");
  return { ok: true };
}

/**
 * Delete all completed todos.
 */
export async function clearDone(
  payload: {},
  ctx?: ServerCtx,
): Promise<{ deleted: number }> {
  const deleted = clearCompleted();
  return { deleted };
}
