import { buildGreeting } from "./lib/impl.ts";

/**
 * The package's entry point — its whole public surface. It delegates to
 * `lib/impl.ts` rather than re-exporting it, so the package is visibly deep
 * and the implementation stays hidden.
 */
export function greet(name: string): string {
  return buildGreeting(name);
}
