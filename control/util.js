/**
 * Shared control utilities
 */

/** Resolve a container option (selector string or element) to an element. */
export const resolveEl = (c) => typeof c === 'string' ? document.querySelector(c) : c
