import { RoomState } from "./room_state";
import { assert } from "./utils";
import { Game } from "./game";
import { debug } from "./debug";

/**
 * Controller for the <room> tag.
 */
export class Room {
  private readonly states = new Map<string, RoomState>();
  private currentStateId: string = '';
  readonly stateChangeListeners: Array<() => void> = [];

  constructor(private readonly id: string) {}

  addState(id: string, state: RoomState) {
    this.states.set(id, state);
  }

  setState(state: string) {
    assert(this.hasState(state), `Unknown state "${state}"`);
    debug(`Room ${this.id} is now in state "${state}"`);
    this.currentStateId = state;
    this.onStateChange();
  }

  getState(id: string): RoomState {
    assert(this.hasState(id), `Unknown state "${id}"`);
    return this.states.get(id)!;
  }

  hasState(state: string) {
    return this.states.has(state);
  }

  getCurrentState(): RoomState {
    return assert(this.states.get(this.currentStateId));
  }

  /** Leaves this room, hiding it and resetting variables. */
  leave() {
    this.getCurrentState().leave();
  }

  /** Enters the room, showing it and initializing varibles. */
  enter() {
    this.getCurrentState().enter();
  }

  /**
   * Actions have to be parsed *after* constructing the whole game tree, because
   * they may reference other rooms, and we want to validate during parsing to
   * provide useful error messages.
   */
  parseActions(game: Game) {
    for (const state of this.states.values()) {
      state.parseActions(game, this);
    }
  }

  encodeUrlState(): string {
    return encodeURIComponent(this.currentStateId);
  }

  applyUrlState(state: string) {
    const decoded = decodeURIComponent(state);
    if (this.states.has(decoded)) {
      this.currentStateId = decoded;
    } else {
      throw Error('Unknown state ' + decoded);
    }
  }

  private onStateChange() {
    for (const listener of this.stateChangeListeners) {
      listener();
    }
  }
}
