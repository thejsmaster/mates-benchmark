// client/client.ts — browser entry point
// Clear SSR content before mounting to prevent lit-html from
// appending a second copy (SSR outputs inert HTML, then renderX
// adds live content — without clearing, both appear).
import { renderX } from "mates";
import { renderMatesDevTools } from "mates-devtools";
import { App } from "./App.ts";

// Install DevTools hooks BEFORE any component mounts
renderMatesDevTools();

const container = document.getElementById("app")!;
// Clear SSR HTML so lit-html doesn't append a duplicate
container.innerHTML = "";
renderX(App, container);
