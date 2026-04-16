/**
 * Extracts the success data from orval's discriminated union response.
 * Safe because the mutator throws on non-2xx — data at runtime is always a success variant.
 */
export function unwrapSuccess<
  T extends { status: number; data: unknown },
>(response: T | undefined): Extract<T, { status: 200 | 201 | 202 | 204 }>['data'] | undefined {
  if (!response) return undefined;
  return response.data as Extract<T, { status: 200 | 201 | 202 | 204 }>['data'];
}
