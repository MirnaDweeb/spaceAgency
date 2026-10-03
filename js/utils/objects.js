/**
 * Object utility functions
 */

/**
 * Deeply merge two objects.
 * @param {Object} target - The object to merge into.
 * @param {Object} source - The object containing overrides.
 * @returns {Object} The merged object.
 */
export function deepMerge(target, source) {
  if (!source) return target;
  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
