// server/main.ts
// Per-request middleware.

import { onRequest, setServerTimeout } from "mates-fullstack";

setServerTimeout(60);

onRequest((c) => {
  c.resHeaders["x-benchmark"] = "1";
});
