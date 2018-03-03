import { Conversation } from "./conversation";
import { assert, getAttribute, hasType } from "./utils";
import { Action, parseActions, EMPTY_ACTION, ActionContext } from "./actions";
import { Inventory } from "./inventory";
import { Game } from "./game";
import { maybeSetupRegionDebugHandles } from "./debug";
import { Room } from "./room";

/**
 * One of the possible states of a room in a game. Often, a room only has one
 * state, but in some cases it can have multiple states (for example to change
 * the background image), and there will be more than one RoomState associated
 * with the Room.
 */
export class RoomState {
  private readonly conversationGroups = new Map<string, Conversation>();

  constructor(private readonly element: Element) {
    const convGroups = element.querySelectorAll('conv-group');
    for (const convGroup of convGroups) {
      if (convGroup instanceof HTMLElement) {
        this.conversationGroups.set(convGroup.id, new Conversation(convGroup));
      }
    }
    this.setupRegions(this.element.querySelectorAll('region'));
  }

  /**
   * Actions have to be parsed *after* constructing the whole game tree, because
   * they may reference other rooms, and we want to validate during parsing to
   * provide useful error messages.
   */
  parseActions(game: Game, room: Room) {
    const context: ActionContext = { game, room, roomState: this };

    for (const region of this.element.querySelectorAll<HTMLElement>('region')) {
      this.parseRegionActions(region, context);
    }
    for (const conv of this.conversationGroups.values()) {
      conv.parseActions(context);
    }
  }

  /** Hide the room and reset conversations. */
  leave() {
    this.element.classList.remove('enabled');
    for (const conv of this.conversationGroups.values()) {
      conv.reset();
    }
  }

  /** Reset conversations and show the room.. */
  enter() {
    for (const conv of this.conversationGroups.values()) {
      conv.reset();
    }
    this.element.classList.add('enabled');
  }

  /** Checks whether the given conversation exists in this room. */
  hasConv(name: string): boolean {
    assert(this.conversationGroups.size, 'No conversations available!');
    const parts = name.split('.');
    assert(parts.length === 2, 'Wrong conv id: ' + parts);
    const [groupId, node] = parts;
    const group = this.conversationGroups.get(groupId);
    return !!group && group.exists(node);
  }

  /** Activates the given conversation. */
  enableConv(name: string) {
    const [conv, node] = name.split('.');
    for (const [id, value] of this.conversationGroups) {
      if (id === conv) {
        value.enable(node);
      } else {
        value.reset();
      }
    }
  }

  private setupRegions(regionElements: NodeListOf<HTMLElement>) {
    for (const region of regionElements) {
      const coords = getAttribute(region, 'coords').split(',');
      const left = Number(coords[0]);
      const top = Number(coords[1]);
      const right = Number(coords[2]);
      const bottom = Number(coords[3]);
      region.style.left = left + 'px';
      region.style.top = top + 'px';
      region.style.width = (right - left) + 'px';
      region.style.height = (bottom - top) + 'px';
    }
  }

  private parseRegionActions(region: HTMLElement, context: ActionContext) {
    const actionAttributes = Array.from(region.attributes).
      filter(attribute => attribute.name !== 'coords');
    region.addEventListener('click', parseActions(actionAttributes, context));

    const { giveActions, defaultAction } = this.parseGiveActions(region, context);
    const canGive = giveActions.size > 0 || defaultAction !== EMPTY_ACTION;
    if (canGive) {
      setupGiveDragAndDrop(region, giveActions, defaultAction);
    }
    maybeSetupRegionDebugHandles(region);
  }

  private parseGiveActions(region: HTMLElement, context: ActionContext) {
    const giveActions = new Map<string, Action>();
    let defaultAction: Action = EMPTY_ACTION;
    const giveCases = region.querySelectorAll('give');
    for (const kase of giveCases) {
      const kaseActionAttributes = Array.from(kase.attributes).
        filter(attribute => attribute.name !== 'default');
      const kaseActions = parseActions(kaseActionAttributes, context);
      if (kase.hasAttribute('default')) {
        defaultAction = kaseActions;
      } else {
        giveActions.set(kase.id, kaseActions);
      }
    }
    return { giveActions, defaultAction };
  }
}

/**
 * TODO: Support mobile devices.
 * @param region The region that supports dropping.
 * @param giveActions The actions to execute when dropping certain things.
 * @param defaultAction The default action to execute if the dropped thing is
 *     not in the giveActions map.
 */
function setupGiveDragAndDrop(
  region: HTMLElement,
  giveActions: Map<string, Action>,
  defaultAction: Action) {

  region.addEventListener('dragenter', event => {
    if (hasType(event.dataTransfer, Inventory.MIME)) {
      event.preventDefault();
      const target = event.target;
      if (target && target instanceof Element) {
        target.classList.add('inventory-drag');
      }
    }
  }, false);
  region.addEventListener('dragover', event => {
    if (hasType(event.dataTransfer, Inventory.MIME)) {
      event.preventDefault();
    }
  }, false);
  region.addEventListener('dragleave', e => {
    const target = e.target as Element;
    if (target) {
      target.classList.remove('inventory-drag');
    }
  }, false);
  region.addEventListener('drop', event => {
    const target = event.target as Element;
    if (target) {
      target.classList.remove('inventory-drag');
    }
    event.preventDefault();
    const item = event.dataTransfer.getData(Inventory.MIME);
    const action = giveActions.get(item);
    if (action !== undefined) {
      action();
    } else {
      defaultAction();
    }
  }, false);
}
