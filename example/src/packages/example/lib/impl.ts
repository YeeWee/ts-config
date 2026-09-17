/**
 * Internal implementation. Private: reachable only through the package's entry
 * point (`../index.ts`), which is what makes this package a deep module.
 */
export function buildGreeting(name: string): string {
  return `Hello, ${name}!`;
}
