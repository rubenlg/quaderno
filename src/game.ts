import { RoomState } from './room_state';
import { assert, getAttribute, RoomStateRef } from './utils';
import { Inventory } from './inventory';
import { Room } from './room';
import { debugEnabled, debug } from './debug';

export interface WindowWithAnalytics extends Window {
  ga?(...args: any[]): void;
}

/**
 * The controller for the <game> tag.
 */
export class Game {
  private readonly rooms = new Map<string, Room>();
  private readonly playerPrompt = new PlayerPrompt();
  private currentRoomId: string;
  readonly inventory?: Inventory;

  constructor(gameElement: HTMLElement) {
    const rooms = gameElement.querySelectorAll('room');
    for (const roomElement of rooms) {
      const ref = parseRoomStateRef(getAttribute(roomElement, 'id'));
      const roomState = new RoomState(roomElement);
      const room = this.getOrCreateRoom(ref.id);
      room.addState(ref.state || '', roomState);
    }

    const inventoryElm = gameElement.querySelector('inventory');
    this.inventory = inventoryElm ? new Inventory(inventoryElm) : undefined;

    // Now that we know all the rooms and inventory items that exist, we can
    // safely parse all the actions, and validate that they point to existing
    // stuff.
    for (const room of this.rooms.values()) {
      room.parseActions(this);
    }

    const width = gameElement.getAttribute('width');
    const height = gameElement.getAttribute('height');
    if (width && height) {
      gameElement.style.width = `${width}px`;
      gameElement.style.height = `${height}px`;
    }
    if (location.hash) {
      this.currentRoomId = this.applyUrlState(location.hash.slice(1)); // Drop '#'
    } else {
      const firstRoomRef = this.getValidatedRoomStateRef(getAttribute(
        gameElement, 'first-room'), 'attribute first-room of game');
      this.currentRoomId = firstRoomRef.id;
      this.getCurrentRoom().setState(firstRoomRef.state || '');
    }
    this.getCurrentRoom().enter();
    this.playerPrompt.attach(gameElement);

    // Event listeners must be installed *after* recovering the state from the hash.
    this.installStateChangeListeners();
  }

  /**
   * Parses a RoomStateRef, throwing an error if it fails.
   * @param ref The string to be parsed.
   * @param errorContext Something the user can identify as the point in the
   *   code where the error is.
   */
  getValidatedRoomStateRef(ref: string, errorContext: string): RoomStateRef {
    const parsed = parseRoomStateRef(ref);
    assert(this.rooms.has(parsed.id), `In ${errorContext}: ${parsed.id} is not a valid room id`);
    if (parsed.state) {
      assert(this.getRoom(parsed.id).hasState(parsed.state),
        `In ${errorContext}: Room ${parsed.id} doesn't have a state ${parsed.state}`);
    }
    return parsed;
  }

  /** Get a room given its ID. */
  getRoom(id: string): Room {
    return assert(this.rooms.get(id), `Unknown room ${id}`);
  }

  /** Navigate to another room, optionally setting its state too. */
  navigate(roomId: string, state?: string) {
    this.getCurrentRoom().leave();
    this.currentRoomId = roomId;
    if (state) {
      this.getCurrentRoom().setState(state);
    }
    this.getCurrentRoom().enter();

    if (debugEnabled()) {
      debug(`Current room: "${this.currentRoomId}"`);
    }
    this.onStateChanged();
    this.maybeLogVisit(roomId);
  }

  /** Pretend the player is saying something. */
  say(message: string) {
    this.playerPrompt.show(message);
  }

  getCurrentRoom() {
    return this.getRoom(this.currentRoomId);
  }

  onStateChanged() {
    window.location.hash = '#' + this.encodeUrlState();
  }

  /** Encodes the current state of the game as a URL hash. */
  private encodeUrlState() {
    const currentRoomId = encodeURIComponent(this.currentRoomId);
    const inventoryState = this.inventory ? this.inventory.encodeUrlState() : '';
    const currentRoomStates = this.getRoomsUrlStates();
    return `cr=${currentRoomId}&i=${inventoryState}&rs=${currentRoomStates}`;
  }

  private applyUrlState(state: string) {
    let currentRoomId: string | undefined;
    const pieces = state.split('&').map(piece => piece.split('='));
    for (const [k, v] of pieces) {
      switch (k) {
        case 'cr':
          currentRoomId = decodeURIComponent(v);
          break;
        case 'i':
          if (this.inventory) {
            this.inventory.applyUrlState(v);
          }
          break;
        case 'rs':
          this.applyRoomUrlStates(v);
          break;
        default:
          throw Error(`Invalid URL state ${state}`);
      }
    }
    if (currentRoomId === undefined || !this.rooms.has(currentRoomId)) {
      throw Error('Invalid current room ID');
    } else {
      return currentRoomId;
    }
  }

  private getRoomsUrlStates(): string {
    const nonDefaultStates: string[] = [];
    for (const [name, room] of this.rooms) {
      const encodedName = encodeURIComponent(name);
      const encodedState = room.encodeUrlState();
      if (encodedState) {
        nonDefaultStates.push(`${encodedName}:${encodedState}`);
      }
    }
    return nonDefaultStates.join(',');
  }

  private applyRoomUrlStates(state: string) {
    const parts = state.split(',').filter(p => !!p).map(part => part.split(':'));
    for (const [name, roomState] of parts) {
      const decodedName = decodeURIComponent(name);
      this.getRoom(decodedName).applyUrlState(roomState);
    }
  }

  private installStateChangeListeners() {
    if (this.inventory) {
      this.inventory.stateChangeListeners.push(() => this.onStateChanged());
    }
    for (const room of this.rooms.values()) {
      room.stateChangeListeners.push(() => this.onStateChanged());
    }
  }

  private getOrCreateRoom(id: string): Room {
    const existing = this.rooms.get(id);
    if (existing) {
      return existing;
    }
    const newRoom = new Room(id);
    this.rooms.set(id, newRoom);
    return newRoom;
  }

  private maybeLogVisit(page: string) {
    const gaWindow = window as WindowWithAnalytics;
    if (gaWindow.ga) {
      gaWindow.ga('send', 'pageview', page);
    }
  }
}

/**
 * Only Game should use this, all other classes should go through
 * Game.getValidatedRoomStateRef, to make sure that references exist.
 */
function parseRoomStateRef(roomRefStr: string): RoomStateRef {
  const pieces = roomRefStr.split(':');
  assert(pieces.length > 0 && pieces.length < 3, 'Wrong id format!');
  if (pieces.length === 1) {
    return {
      id: pieces[0],
    };
  } else {
    return {
      id: pieces[0],
      state: pieces[1],
    };
  }
}

/**
 * Handles the <player-prompt> node created inside game to render the strings
 * given to Game.say().
 *
 * Handles also auto-hiding of the text after a while.
 */
class PlayerPrompt {
  private timeoutHandle: number | undefined;
  private prompt: HTMLElement;

  constructor() {
    this.prompt = document.createElement('player-prompt');
    this.prompt.onclick = () => {
      this.hide();
    };
  }

  attach(parentElement: HTMLElement) {
    parentElement.appendChild(this.prompt);
  }

  show(message: string) {
    this.prompt.textContent = message;
    this.prompt.classList.add('visible');
    this.timeoutHandle = setTimeout(() => {
      this.hide();
    }, 3000);
  }

  hide() {
    this.prompt.classList.remove('visible');
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
  }
}
