export interface Point {
  x: number;
  y: number;
}

/** Checks whether window.DEBUG has been set to true in the HTML. */
export function debugEnabled() {
  return !!(window as any).DEBUG;
}

function getOrCreateDebugConsole() {
  const ID = '_debug_console';
  let console = document.querySelector('#' + ID);
  if (!console) {
    console = document.createElement('div');
    console.id = ID;
    document.body.appendChild(console);
  }
  return console;
}

function padTimeUnit(u: number): string {
  return `0${u}`.slice(-2);
}

export type DebugLevel = 'DEBUG' | 'WARNING' | 'ERROR';

/** Renders a message in the debug console. */
export function debug(msg: string, level: DebugLevel = 'DEBUG') {
  if (debugEnabled()) {
    const now = new Date();
    const time = `${padTimeUnit(now.getHours())}:${padTimeUnit(now.getMinutes())}:${padTimeUnit(now.getSeconds())}`;
    const element = document.createElement('div');
    element.className = level;
    element.textContent = `${time}: ${msg}\n`;
    getOrCreateDebugConsole().appendChild(element);
    getOrCreateDebugConsole().scrollTop = getOrCreateDebugConsole().scrollHeight;
  } else {
    // tslint:disable-next-line:no-console
    console.log(msg);
  }
}

/**
 * Creates a handle with the given class that moves the given target when
 * dragged around.
 */
export function makeHandle(klass: string, target: Point, onRelease: () => void): Element {
  const handle = document.createElement('handle');
  handle.setAttribute('draggable', 'true');
  handle.classList.add(klass);
  let startX = 0;
  let startY = 0;
  let targetStartX = 0;
  let targetStartY = 0;
  handle.addEventListener('dragstart', event => {
    startX = event.clientX;
    startY = event.clientY;
    targetStartX = target.x;
    targetStartY = target.y;
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/handle', 'handle');
    }
  });
  handle.addEventListener('drag', e => {
    // Workaround for bogus last drag event from Chrome.
    if (e.clientX !== 0) {
      target.x = targetStartX + e.clientX - startX;
      target.y = targetStartY + e.clientY - startY;
    }
  });
  handle.addEventListener('dragend', onRelease);
  return handle;
}

/** In debug mode, renders the handles to move regions. */
export function maybeSetupRegionDebugHandles(region: HTMLElement) {
  if (!debugEnabled()) {
    return;
  }
  region.appendChild(
    makeHandle('top-left', {
      get x() { return region.offsetLeft; },
      get y() { return region.offsetTop; },
      set x(val) {
        region.style.left = val + 'px';
        updateRegionCoords(region);
      },
      set y(val) {
        region.style.top = val + 'px';
        updateRegionCoords(region);
      },
    }, () => debugRegion(region)));
  region.appendChild(
    makeHandle('bottom-right', {
      get x() { return region.offsetLeft + region.offsetWidth; },
      get y() { return region.offsetTop + region.offsetHeight; },
      set x(val) {
        region.style.width = (val - region.offsetLeft) + 'px';
        updateRegionCoords(region);
      },
      set y(val) {
        region.style.height = (val - region.offsetTop) + 'px';
        updateRegionCoords(region);
      },
    }, () => debugRegion(region)));
}

function debugRegion(region: HTMLElement) {
  const top = region.offsetTop;
  const left = region.offsetLeft;
  const bottom = top + region.offsetHeight;
  const right = left + region.offsetWidth;
  debug(`coords: ${[left, top, right, bottom]}`);
}

function updateRegionCoords(region: HTMLElement) {
  const top = region.offsetTop;
  const left = region.offsetLeft;
  const bottom = top + region.offsetHeight;
  const right = left + region.offsetWidth;
  region.setAttribute('coords', [left, top, right, bottom].join(','));
}
