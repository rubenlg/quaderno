import { assert, renderNodePath } from "./utils";
import { Game } from "./game";
import { debug } from "./debug";
import { RoomState } from "./room_state";
import { Conversation } from "./conversation";
import { Room } from "./room";

/**
 * An action to perform when the user interacts with some game object.
 */
export type Action = () => void;

/** Action that does nothing. */
export const EMPTY_ACTION: Action = () => { return; };

export interface ActionContext {
  readonly game: Game;
  readonly room: Room;
  readonly roomState: RoomState;
  readonly conversation?: Conversation;
}

/**
 * Parses all the actions from the given attributes, ignoring whitelisted ones.
 * @param attributes The list of attributes from an element to take into account.
 * @param context The context in which these actions are being parsed.
 */
export function parseActions(
  attributes: Attr[],
  context: ActionContext): Action {

  const usedAttributes = attributes.filter(attribute =>
    !WHITELISTED_HTML_ATTRIBUTES.has(attribute.name));
  const actions = usedAttributes.map(attribute =>
    parseAction(attribute, context));

  return mergeActions(actions);
}

function parseAction(attribute: Attr, context: ActionContext): Action {
  const parser = ACTION_PARSERS[attribute.name];
  try {
    assert(parser, `Unknown action: ${attribute.name}`);
    return parser(attribute.value, context);
  } catch (e) {
    throw Error(`${e.message} in ${renderNodePath(attribute.ownerElement)}`);
  }
}

export function mergeActions(actions: Action[]): Action {
  if (actions.length === 0) {
    return EMPTY_ACTION;
  }
  return () => {
    for (const a of actions) { a(); }
  };
}

export type ActionParser = (value: string, context: ActionContext) => Action;

/**
 * Plugin system. Call here to register extra action parsers.
 */
export function registerActionParser(attribute: string, parser: ActionParser) {
  if (ACTION_PARSERS[attribute]) {
    debug(`Overriding existing action parser "${attribute}"`);
  }
  ACTION_PARSERS[attribute] = parser;
}

/**
 * A map of action names to action parsers.
 */
const ACTION_PARSERS: Record<string, ActionParser> = {
  'remote-room-state': parseRemoteRoomState,
  'goto-room': parseGotoRoom,
  'inventory-add': parseInventoryAdd,
  'inventory-del': parseInventoryDel,
  'say': parseSay,
  'show-conv': convParser,
  'next-conv': nextConvParser,
};

/**
 * These attributes are ignored, we never attempt to parse actions with this
 * name.
 */
const WHITELISTED_HTML_ATTRIBUTES = new Set([
  'id', 'style', 'tooltip', 'class', 'alt',
]);

function parseRemoteRoomState(value: string, context: ActionContext) {
  const parsed = context.game.getValidatedRoomStateRef(
    value, `invalid room reference: ${value}`);
  if (parsed.state === undefined) {
    throw new Error(
      `Missing :state. The whole point of remote-room-state is to change the ` +
      `state of another room without going to it.`);
  } else {
    const state = parsed.state;
    return () => {
      const room = context.game.getRoom(parsed.id);
      if (room === context.game.getCurrentRoom()) {
        context.game.navigate(parsed.id, parsed.state);
      } else {
        room.setState(state);
      }
    };
  }
}

function parseGotoRoom(value: string, context: ActionContext) {
  const parsed = context.game.getValidatedRoomStateRef(
    value, `invalid room reference: ${value}`);
  return () => {
    context.game.navigate(parsed.id, parsed.state);
  };
}

function parseInventoryAdd(value: string, context: ActionContext) {
  const inventory = context.game.inventory;
  if (!inventory) {
    throw Error(`No <inventory> defined inside <game>`);
  }
  const items = value.split(',');
  for (const item of items) {
    assert(inventory.hasItem(item), `Invalid inventory item ${item}`);
  }
  return () => {
    inventory.enable(...items);
  };
}

function parseInventoryDel(value: string, context: ActionContext) {
  const inventory = context.game.inventory;
  if (!inventory) {
    throw Error(`No <inventory> defined inside <game>`);
  }
  const items = value.split(',');
  for (const item of items) {
    assert(inventory.hasItem(item), `Invalid inventory item ${item}`);
  }
  return () => {
    inventory.disable(...items);
  };
}

function parseSay(value: string, context: ActionContext) {
  return () => {
    context.game.say(value);
  };
}

function convParser(value: string, context: ActionContext) {
  assert(context.roomState.hasConv(value), 'Unknown conv: ' + value);
  return () => {
    context.roomState.enableConv(value);
  };
}

function nextConvParser(value: string, context: ActionContext) {
  const conv = context.conversation;
  if (!conv) {
    throw new Error(`"next-conv" can't used outside of a <conv> node`);
  }
  assert(conv.exists(value), 'Bad conversation link: ' + value);
  return () => {
    conv.enable(value);
  };
}
