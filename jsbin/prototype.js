(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const debug_1 = require("./debug");
/** Action that does nothing. */
exports.EMPTY_ACTION = () => { return; };
/**
 * Parses all the actions from the given attributes, ignoring whitelisted ones.
 * @param attributes The list of attributes from an element to take into account.
 * @param context The context in which these actions are being parsed.
 */
function parseActions(attributes, context) {
    const usedAttributes = attributes.filter(attribute => !WHITELISTED_HTML_ATTRIBUTES.has(attribute.name));
    const actions = usedAttributes.map(attribute => parseAction(attribute, context));
    return mergeActions(actions);
}
exports.parseActions = parseActions;
function parseAction(attribute, context) {
    const parser = ACTION_PARSERS[attribute.name];
    try {
        utils_1.assert(parser, `Unknown action: ${attribute.name}`);
        return parser(attribute.value, context);
    }
    catch (e) {
        throw Error(`${e.message} in ${utils_1.renderNodePath(attribute.ownerElement)}`);
    }
}
function mergeActions(actions) {
    if (actions.length === 0) {
        return exports.EMPTY_ACTION;
    }
    return () => {
        for (const a of actions) {
            a();
        }
    };
}
exports.mergeActions = mergeActions;
/**
 * Plugin system. Call here to register extra action parsers.
 */
function registerActionParser(attribute, parser) {
    if (ACTION_PARSERS[attribute]) {
        debug_1.debug(`Overriding existing action parser "${attribute}"`);
    }
    ACTION_PARSERS[attribute] = parser;
}
exports.registerActionParser = registerActionParser;
/**
 * A map of action names to action parsers.
 */
const ACTION_PARSERS = {
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
function parseRemoteRoomState(value, context) {
    const parsed = context.game.getValidatedRoomStateRef(value, `invalid room reference: ${value}`);
    if (parsed.state === undefined) {
        throw new Error(`Missing :state. The whole point of remote-room-state is to change the ` +
            `state of another room without going to it.`);
    }
    else {
        const state = parsed.state;
        return () => {
            const room = context.game.getRoom(parsed.id);
            if (room === context.game.getCurrentRoom()) {
                context.game.navigate(parsed.id, parsed.state);
            }
            else {
                room.setState(state);
            }
        };
    }
}
function parseGotoRoom(value, context) {
    const parsed = context.game.getValidatedRoomStateRef(value, `invalid room reference: ${value}`);
    return () => {
        context.game.navigate(parsed.id, parsed.state);
    };
}
function parseInventoryAdd(value, context) {
    const inventory = context.game.inventory;
    if (!inventory) {
        throw Error(`No <inventory> defined inside <game>`);
    }
    const items = value.split(',');
    for (const item of items) {
        utils_1.assert(inventory.hasItem(item), `Invalid inventory item ${item}`);
    }
    return () => {
        inventory.enable(...items);
    };
}
function parseInventoryDel(value, context) {
    const inventory = context.game.inventory;
    if (!inventory) {
        throw Error(`No <inventory> defined inside <game>`);
    }
    const items = value.split(',');
    for (const item of items) {
        utils_1.assert(inventory.hasItem(item), `Invalid inventory item ${item}`);
    }
    return () => {
        inventory.disable(...items);
    };
}
function parseSay(value, context) {
    return () => {
        context.game.say(value);
    };
}
function convParser(value, context) {
    utils_1.assert(context.roomState.hasConv(value), 'Unknown conv: ' + value);
    return () => {
        context.roomState.enableConv(value);
    };
}
function nextConvParser(value, context) {
    const conv = context.conversation;
    if (!conv) {
        throw new Error(`"next-conv" can't used outside of a <conv> node`);
    }
    utils_1.assert(conv.exists(value), 'Bad conversation link: ' + value);
    return () => {
        conv.enable(value);
    };
}

},{"./debug":3,"./utils":9}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const actions_1 = require("./actions");
class Conversation {
    constructor(convGroup) {
        this.convMap = new Map();
        this.promptHolder = convGroup.querySelector('prompt');
        const convs = convGroup.querySelectorAll('conv');
        for (const conv of convs) {
            utils_1.assert(!this.convMap.has(conv.id), 'Duplicate entry' + conv.id);
            utils_1.assert(!conv.hasAttribute('prompt') || this.promptHolder, 'A <prompt> tag is needed inside <conv-group> in order to display prompts');
            this.convMap.set(conv.id, conv);
            if (conv.hasAttribute('default')) {
                this.defaultConvId = conv.id;
            }
        }
    }
    parseActions(context) {
        for (const conv of this.convMap.values()) {
            const lines = conv.querySelectorAll('li');
            for (const line of lines) {
                this.configLine(line, context);
            }
        }
    }
    reset() {
        // Disable any enabled conversation
        if (this.currentConv !== undefined) {
            this.currentConv.classList.remove('enabled');
            this.currentConv = undefined;
        }
        // Enable the default one, if any.
        if (this.defaultConvId) {
            this.enable(this.defaultConvId);
        }
        else {
            // Otherwise clear the prompt.
            this.showPrompt('');
        }
    }
    exists(cnv) {
        return this.convMap.has(cnv);
    }
    enable(convId) {
        utils_1.assert(this.exists(convId), 'Conversation ' + convId + ' does not exist!');
        // Disable previous node
        if (this.currentConv !== undefined) {
            this.currentConv.classList.remove('enabled');
        }
        const conv = this.convMap.get(convId);
        this.currentConv = conv;
        if (conv) {
            // Show the prompt
            this.showPrompt(conv.getAttribute('prompt') || '');
            // Enable the one selected
            conv.classList.add('enabled');
        }
    }
    configLine(line, context) {
        const actions = actions_1.parseActions(Array.from(line.attributes), Object.assign({}, context, { conversation: this }));
        line.addEventListener('click', actions);
    }
    showPrompt(prompt) {
        if (!this.promptHolder) {
            utils_1.assert(!prompt, 'No prompt holder to show a prompt!');
            return;
        }
        if (prompt) {
            this.promptHolder.textContent = prompt;
            this.promptHolder.style.display = 'block';
        }
        else {
            this.promptHolder.style.display = 'none';
        }
    }
}
exports.Conversation = Conversation;

},{"./actions":1,"./utils":9}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Checks whether window.DEBUG has been set to true in the HTML. */
function debugEnabled() {
    return !!window.DEBUG;
}
exports.debugEnabled = debugEnabled;
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
function padTimeUnit(u) {
    return `0${u}`.slice(-2);
}
/** Renders a message in the debug console. */
function debug(msg, level = 'DEBUG') {
    if (debugEnabled()) {
        const now = new Date();
        const time = `${padTimeUnit(now.getHours())}:${padTimeUnit(now.getMinutes())}:${padTimeUnit(now.getSeconds())}`;
        const element = document.createElement('div');
        element.className = level;
        element.textContent = `${time}: ${msg}\n`;
        getOrCreateDebugConsole().appendChild(element);
        getOrCreateDebugConsole().scrollTop = getOrCreateDebugConsole().scrollHeight;
    }
    else {
        // tslint:disable-next-line:no-console
        console.log(msg);
    }
}
exports.debug = debug;
/**
 * Creates a handle with the given class that moves the given target when
 * dragged around.
 */
function makeHandle(klass, target, onRelease) {
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
        event.dataTransfer.setData('application/handle', 'handle');
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
exports.makeHandle = makeHandle;
/** In debug mode, renders the handles to move regions. */
function maybeSetupRegionDebugHandles(region) {
    if (!debugEnabled()) {
        return;
    }
    region.appendChild(makeHandle('top-left', {
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
    region.appendChild(makeHandle('bottom-right', {
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
exports.maybeSetupRegionDebugHandles = maybeSetupRegionDebugHandles;
function debugRegion(region) {
    const top = region.offsetTop;
    const left = region.offsetLeft;
    const bottom = top + region.offsetHeight;
    const right = left + region.offsetWidth;
    debug(`coords: ${[left, top, right, bottom]}`);
}
function updateRegionCoords(region) {
    const top = region.offsetTop;
    const left = region.offsetLeft;
    const bottom = top + region.offsetHeight;
    const right = left + region.offsetWidth;
    region.setAttribute('coords', [left, top, right, bottom].join(','));
}

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_state_1 = require("./room_state");
const utils_1 = require("./utils");
const inventory_1 = require("./inventory");
const room_1 = require("./room");
const debug_1 = require("./debug");
/**
 * The controller for the <game> tag.
 */
class Game {
    constructor(gameElement) {
        this.rooms = new Map();
        this.playerPrompt = new PlayerPrompt();
        const rooms = gameElement.querySelectorAll('room');
        for (const roomElement of rooms) {
            const ref = parseRoomStateRef(utils_1.getAttribute(roomElement, 'id'));
            const roomState = new room_state_1.RoomState(roomElement);
            const room = this.getOrCreateRoom(ref.id);
            room.addState(ref.state || '', roomState);
        }
        const inventoryElm = gameElement.querySelector('inventory');
        this.inventory = inventoryElm ? new inventory_1.Inventory(inventoryElm) : undefined;
        // Now that we know all the rooms and inventory items that exist, we can
        // safely parse all the actions, and validate that they point to existing
        // stuff.
        for (const room of this.rooms.values()) {
            room.parseActions(this);
        }
        const firstRoomRef = this.getValidatedRoomStateRef(utils_1.getAttribute(gameElement, 'first-room'), 'attribute first-room of game');
        const width = gameElement.getAttribute('width');
        const height = gameElement.getAttribute('height');
        if (width && height) {
            gameElement.style.width = `${width}px`;
            gameElement.style.height = `${height}px`;
        }
        this.currentRoomId = firstRoomRef.id;
        this.getCurrentRoom().setState(firstRoomRef.state || '');
        this.getCurrentRoom().enter();
        this.playerPrompt.attach(gameElement);
    }
    /**
     * Parses a RoomStateRef, throwing an error if it fails.
     * @param ref The string to be parsed.
     * @param errorContext Something the user can identify as the point in the
     *   code where the error is.
     */
    getValidatedRoomStateRef(ref, errorContext) {
        const parsed = parseRoomStateRef(ref);
        utils_1.assert(this.rooms.has(parsed.id), `In ${errorContext}: ${parsed.id} is not a valid room id`);
        if (parsed.state) {
            utils_1.assert(this.getRoom(parsed.id).hasState(parsed.state), `In ${errorContext}: Room ${parsed.id} doesn't have a state ${parsed.state}`);
        }
        return parsed;
    }
    /** Get a room given its ID. */
    getRoom(id) {
        return utils_1.assert(this.rooms.get(id), `Unknown room ${id}`);
    }
    /** Navigate to another room, optionally setting its state too. */
    navigate(roomId, state) {
        this.getCurrentRoom().leave();
        this.currentRoomId = roomId;
        if (state) {
            this.getCurrentRoom().setState(state);
        }
        this.getCurrentRoom().enter();
        if (debug_1.debugEnabled()) {
            debug_1.debug(`Current room: "${this.currentRoomId}"`);
        }
        window.history.pushState({ roomId, state }, '', './#' + roomId);
        this.maybeLogVisit(roomId);
    }
    /** Pretend the player is saying something. */
    say(message) {
        this.playerPrompt.show(message);
    }
    getCurrentRoom() {
        return this.getRoom(this.currentRoomId);
    }
    getOrCreateRoom(id) {
        const existing = this.rooms.get(id);
        if (existing) {
            return existing;
        }
        const newRoom = new room_1.Room(id);
        this.rooms.set(id, newRoom);
        return newRoom;
    }
    maybeLogVisit(page) {
        const gaWindow = window;
        if (gaWindow.ga) {
            gaWindow.ga('send', 'pageview', page);
        }
    }
}
exports.Game = Game;
/**
 * Only Game should use this, all other classes should go through
 * Game.getValidatedRoomStateRef, to make sure that references exist.
 */
function parseRoomStateRef(roomRefStr) {
    const pieces = roomRefStr.split(':');
    utils_1.assert(pieces.length > 0 && pieces.length < 3, 'Wrong id format!');
    if (pieces.length === 1) {
        return {
            id: pieces[0],
        };
    }
    else {
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
    constructor() {
        this.prompt = document.createElement('player-prompt');
        this.prompt.onclick = () => {
            this.hide();
        };
    }
    attach(parentElement) {
        parentElement.appendChild(this.prompt);
    }
    show(message) {
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

},{"./debug":3,"./inventory":5,"./room":7,"./room_state":8,"./utils":9}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
/**
 * The controller of the <inventory> tag.
 */
class Inventory {
    constructor(element) {
        this.items = new Map();
        const images = element.querySelectorAll('img');
        for (const image of images) {
            this.items.set(utils_1.assert(image.id, 'All inventory images must have IDs'), image);
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
    hasItem(id) {
        return !!this.items.get(id);
    }
    enabled(id) {
        return this.getItem(id).classList.contains('enabled');
    }
    enable(...ids) {
        for (const id of ids) {
            this.getItem(id).classList.add('enabled');
        }
    }
    disable(...ids) {
        for (const id of ids) {
            this.getItem(id).classList.remove('enabled');
        }
    }
    getItem(id) {
        return utils_1.assert(this.items.get(id), `Unknown inventory item ${id}`);
    }
}
Inventory.MIME = "application/inventory";
exports.Inventory = Inventory;
function configureDragAndDrop(image) {
    image.addEventListener('dragstart', event => {
        const target = event.target;
        if (target && target instanceof Element) {
            event.dataTransfer.setData(Inventory.MIME, target.id);
            event.dataTransfer.effectAllowed = "move";
        }
    }, false);
}

},{"./utils":9}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("./game");
const debug_1 = require("./debug");
/** Bootstraps the toolkit. */
function bootstrap() {
    if (debug_1.debugEnabled()) {
        document.documentElement.classList.add('debug');
    }
    const gameElement = document.querySelector('game');
    try {
        const game = gameElement && new game_1.Game(gameElement);
        if (game) {
            window.addEventListener('popstate', () => {
                alert('Back button not supported');
            });
        }
    }
    catch (e) {
        debug_1.debug(e.message, 'ERROR');
    }
}
/** Wait for the DOM to finish loading, then bootstrap. */
document.addEventListener("DOMContentLoaded", bootstrap);

},{"./debug":3,"./game":4}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const debug_1 = require("./debug");
/**
 * Controller for the <room> tag.
 */
class Room {
    constructor(id) {
        this.id = id;
        this.states = new Map();
        this.currentStateId = '';
    }
    addState(id, state) {
        this.states.set(id, state);
    }
    setState(state) {
        utils_1.assert(this.hasState(state), `Unknown state "${state}"`);
        debug_1.debug(`Room ${this.id} is now in state "${state}"`);
        this.currentStateId = state;
    }
    hasState(state) {
        return this.states.has(state);
    }
    currentState() {
        return utils_1.assert(this.states.get(this.currentStateId));
    }
    /** Leaves this room, hiding it and resetting variables. */
    leave() {
        this.currentState().leave();
    }
    /** Enters the room, showing it and initializing varibles. */
    enter() {
        this.currentState().enter();
    }
    /**
     * Actions have to be parsed *after* constructing the whole game tree, because
     * they may reference other rooms, and we want to validate during parsing to
     * provide useful error messages.
     */
    parseActions(game) {
        for (const state of this.states.values()) {
            state.parseActions(game, this);
        }
    }
}
exports.Room = Room;

},{"./debug":3,"./utils":9}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conversation_1 = require("./conversation");
const utils_1 = require("./utils");
const actions_1 = require("./actions");
const inventory_1 = require("./inventory");
const debug_1 = require("./debug");
/**
 * One of the possible states of a room in a game. Often, a room only has one
 * state, but in some cases it can have multiple states (for example to change
 * the background image), and there will be more than one RoomState associated
 * with the Room.
 */
class RoomState {
    constructor(element) {
        this.element = element;
        this.conversationGroups = new Map();
        const convGroups = element.querySelectorAll('conv-group');
        for (const convGroup of convGroups) {
            if (convGroup instanceof HTMLElement) {
                this.conversationGroups.set(convGroup.id, new conversation_1.Conversation(convGroup));
            }
        }
        this.setupRegions(this.element.querySelectorAll('region'));
    }
    /**
     * Actions have to be parsed *after* constructing the whole game tree, because
     * they may reference other rooms, and we want to validate during parsing to
     * provide useful error messages.
     */
    parseActions(game, room) {
        const context = { game, room, roomState: this };
        for (const region of this.element.querySelectorAll('region')) {
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
    hasConv(name) {
        utils_1.assert(this.conversationGroups.size, 'No conversations available!');
        const parts = name.split('.');
        utils_1.assert(parts.length === 2, 'Wrong conv id: ' + parts);
        const [groupId, node] = parts;
        const group = this.conversationGroups.get(groupId);
        return !!group && group.exists(node);
    }
    /** Activates the given conversation. */
    enableConv(name) {
        const [conv, node] = name.split('.');
        for (const [id, value] of this.conversationGroups) {
            if (id === conv) {
                value.enable(node);
            }
            else {
                value.reset();
            }
        }
    }
    setupRegions(regionElements) {
        for (const region of regionElements) {
            const coords = utils_1.getAttribute(region, 'coords').split(',');
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
    parseRegionActions(region, context) {
        const actionAttributes = Array.from(region.attributes).
            filter(attribute => attribute.name !== 'coords');
        region.addEventListener('click', actions_1.parseActions(actionAttributes, context));
        const { giveActions, defaultAction } = this.parseGiveActions(region, context);
        const canGive = giveActions.size > 0 || defaultAction !== actions_1.EMPTY_ACTION;
        if (canGive) {
            setupGiveDragAndDrop(region, giveActions, defaultAction);
        }
        debug_1.maybeSetupRegionDebugHandles(region);
    }
    parseGiveActions(region, context) {
        const giveActions = new Map();
        let defaultAction = actions_1.EMPTY_ACTION;
        const giveCases = region.querySelectorAll('give');
        for (const kase of giveCases) {
            const kaseActionAttributes = Array.from(kase.attributes).
                filter(attribute => attribute.name !== 'default');
            const kaseActions = actions_1.parseActions(kaseActionAttributes, context);
            if (kase.hasAttribute('default')) {
                defaultAction = kaseActions;
            }
            else {
                giveActions.set(kase.id, kaseActions);
            }
        }
        return { giveActions, defaultAction };
    }
}
exports.RoomState = RoomState;
/**
 * TODO: Support mobile devices.
 * @param region The region that supports dropping.
 * @param giveActions The actions to execute when dropping certain things.
 * @param defaultAction The default action to execute if the dropped thing is
 *     not in the giveActions map.
 */
function setupGiveDragAndDrop(region, giveActions, defaultAction) {
    region.addEventListener('dragenter', event => {
        if (utils_1.hasType(event.dataTransfer, inventory_1.Inventory.MIME)) {
            event.preventDefault();
            const target = event.target;
            if (target && target instanceof Element) {
                target.classList.add('inventory-drag');
            }
        }
    }, false);
    region.addEventListener('dragover', event => {
        if (utils_1.hasType(event.dataTransfer, inventory_1.Inventory.MIME)) {
            event.preventDefault();
        }
    }, false);
    region.addEventListener('dragleave', e => {
        const target = e.target;
        if (target) {
            target.classList.remove('inventory-drag');
        }
    }, false);
    region.addEventListener('drop', event => {
        const target = event.target;
        if (target) {
            target.classList.remove('inventory-drag');
        }
        event.preventDefault();
        const item = event.dataTransfer.getData(inventory_1.Inventory.MIME);
        const action = giveActions.get(item);
        if (action !== undefined) {
            action();
        }
        else {
            defaultAction();
        }
    }, false);
}

},{"./actions":1,"./conversation":2,"./debug":3,"./inventory":5,"./utils":9}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Checks that the given condition is truthy, throwing an error otherwise.
 *
 * @param condition The condition value to check
 * @param msg A message to use for the exception.
 * @return The same value removing null or undefined.
 */
function assert(condition, msg) {
    if (!condition) {
        throw new Error(msg);
    }
    return condition;
}
exports.assert = assert;
/**
 * Debug helper to render the path leading to a node as a string.
 */
function renderNodePath(node) {
    const parent = node.parentElement;
    if (parent && parent !== node && parent !== document.body) {
        const siblings = Array.from(parent.children);
        if (siblings.length === 1) {
            return `${renderNodePath(parent)}.${node.nodeName}`;
        }
        else {
            const id = node.id;
            const index = siblings.indexOf(node) + 1;
            const ref = node.id ? `#${id}` : `[${index}]`;
            return `${renderNodePath(parent)}.${node.nodeName}${ref}`;
        }
    }
    return node.nodeName;
}
exports.renderNodePath = renderNodePath;
/** Checks that a value from the DOM is not null/undefined, and throws with a nice error otherwise. */
function checkDOM(thing, part, context) {
    if (thing === null || thing === undefined) {
        throw new Error(`Missing ${part} in ${renderNodePath(context)}`);
    }
    return thing;
}
exports.checkDOM = checkDOM;
/** Version of getAttribute with nice errors. */
function getAttribute(node, attribute) {
    return checkDOM(node.getAttribute(attribute), `attribute ${attribute}`, node);
}
exports.getAttribute = getAttribute;
/** Checks the type of a DataTransfer, for DnD. */
function hasType(dataTransfer, mime) {
    return dataTransfer.types.some(type => type === mime);
}
exports.hasType = hasType;

},{}]},{},[6]);
