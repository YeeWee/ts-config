import assert from "node:assert/strict";
import { test } from "node:test";

// Tests reach the package through its entry point, exactly like outside code.
// Importing "../lib/impl.js" here is what `tests-through-entrypoints` forbids.
import { greet } from "../index.ts";

test("greet returns a greeting", () => {
  assert.equal(greet("Wee"), "Hello, Wee!");
});
