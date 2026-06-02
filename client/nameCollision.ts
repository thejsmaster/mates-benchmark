// Intentionally exports a non-component with the same name as the rendered
// TodoPage component. Editing this file should NOT hot-replace TodoPage because
// HMR identity is based on module URL + export name, not just function name.
export function TodoPage() {
  console.log("[nameCollision] non-component TodoPage helper updated");
  return "not a mates component asdfasdf asdf";
}

export const collisionLabel = "same export name, different module";
