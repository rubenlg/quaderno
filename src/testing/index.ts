/** Helper to create a piece of DOM from HTML code. */
export function makeDOM(contents: string): HTMLElement {
  const result = document.createElement('div');
  result.innerHTML = contents;
  return result.children[0] as HTMLElement;
}

export type SpyOf<Klass> = Record<keyof Klass, jasmine.Spy>;

export type SpiedClass<Klass> = Klass & SpyOf<Klass>;

export interface Constructor<T> {
  new (...args: any[]): T;
}

/** Helper to create a spy of a class. */
export function createSpyFor<Klass>(klass: Constructor<Klass>): SpiedClass<Klass> {
  const result: Record<string, {}> = {};
  for (const key of Object.getOwnPropertyNames(klass.prototype)) {
    if (typeof klass.prototype[key] === 'function') {
      result[key] = jasmine.createSpy(key);
    }
  }
  return result as any;
}
