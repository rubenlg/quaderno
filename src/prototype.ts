import {Game} from './game';
import { debugEnabled, debug } from './debug';

/** Bootstraps the toolkit. */
function bootstrap() {
  if (debugEnabled()) {
    document.documentElement.classList.add('debug');
  }
  const gameElement = document.querySelector('game');
  try {
    const game = gameElement && new Game(gameElement as HTMLElement);
    if (game) {
      window.addEventListener('popstate', () => {
        alert('Back button not supported');
      });
    }
  } catch (e) {
    debug(e.message, 'ERROR');
  }
}

/** Wait for the DOM to finish loading, then bootstrap. */
document.addEventListener("DOMContentLoaded", bootstrap);
