import { assert } from "./utils";

/**
 * The controller of the <inventory> tag.
 */
export class Inventory {
  static readonly MIME = "application/inventory";
  readonly items = new Map<string, Element>();

  constructor(element: Element) {
    const images = element.querySelectorAll('img');
    for (const image of images) {
      this.items.set(assert(image.id, 'All inventory images must have IDs'), image);
      configureDragAndDrop(image);
      const tooltip = image.getAttribute('tooltip');
      if (tooltip) {
        image.title = tooltip;
      }
    }
    const initialContents = element.getAttribute('initial-contents');
    if (initialContents) {
      this.enable(...initialContents.split(' '));
    }
  }

  hasItem(id: string): boolean {
    return !!this.items.get(id);
  }

  enabled(id: string): boolean {
    return this.getItem(id).classList.contains('enabled');
  }

  enable(...ids: string[]) {
    for (const id of ids) {
      this.getItem(id).classList.add('enabled');
    }
  }

  disable(...ids: string[]) {
    for (const id of ids) {
      this.getItem(id).classList.remove('enabled');
    }
  }

  private getItem(id: string): Element {
    return assert(this.items.get(id), `Unknown inventory item ${id}`);
  }
}

function configureDragAndDrop(image: HTMLImageElement) {
  image.addEventListener('dragstart', event => {
    const target = event.target;
    if (target && target instanceof Element) {
      event.dataTransfer.setData(Inventory.MIME, target.id);
      event.dataTransfer.effectAllowed = "move";
    }
  }, false);
}
