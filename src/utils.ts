/**
 * Checks that the given condition is truthy, throwing an error otherwise.
 *
 * @param condition The condition value to check
 * @param msg A message to use for the exception.
 * @return The same value removing null or undefined.
 */
export function assert<T>(condition: T | null | undefined | false, msg?: string): T {
  if (!condition) {
    throw new Error(msg);
  }
  return condition as T;
}

/**
 * Debug helper to render the path leading to a node as a string.
 */
export function renderNodePath(node: Element): string {
  const parent = node.parentElement;
  if (parent && parent !== node && parent !== document.body) {
    const siblings = Array.from(parent.children);
    if (siblings.length === 1) {
      return `${renderNodePath(parent)}.${node.nodeName}`;
    } else {
      const id = node.id;
      const index = siblings.indexOf(node) + 1;
      const ref = node.id ? `#${id}` : `[${index}]`;
      return `${renderNodePath(parent)}.${node.nodeName}${ref}`;
    }
  }
  return node.nodeName;
}

/** Checks that a value from the DOM is not null/undefined, and throws with a nice error otherwise. */
export function checkDOM<T>(thing: T | null | undefined | false, part: string, context: Element): T {
  if (thing === null || thing === undefined) {
    throw new Error(`Missing ${part} in ${renderNodePath(context)}`);
  }
  return thing as T;
}

/** Version of getAttribute with nice errors. */
export function getAttribute(node: Element, attribute: string): string {
  return checkDOM(node.getAttribute(attribute), `attribute ${attribute}`, node);
}

/** Checks the type of a DataTransfer, for DnD. */
export function hasType(dataTransfer: DataTransfer, mime: string): boolean {
  return dataTransfer.types.some(type => type === mime);
}

/** A reference to another room, with optional state. */
export interface RoomStateRef {
  readonly id: string;
  readonly state?: string;
}
