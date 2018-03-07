import { Game } from './game';
import { debugEnabled, debug } from './debug';
import { polyfill as dndPolyfill } from "mobile-drag-drop";

/** Bootstraps the toolkit. */
function bootstrap() {
  if (debugEnabled()) {
    document.documentElement.classList.add('debug');
  }
  const gameElement = document.querySelector('game');
  try {
    new Game(gameElement as HTMLElement);
  } catch (e) {
    debug(e.message, 'ERROR');
  }
  dndPolyfill();
}

/** Wait for the DOM to finish loading, then bootstrap. */
document.addEventListener("DOMContentLoaded", bootstrap);
