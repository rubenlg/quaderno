(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*! mobile-drag-drop 2.3.0-rc.0 | Copyright (c) 2018 Tim Ruffles | MIT License */
!function(t,i){"object"==typeof exports&&"undefined"!=typeof module?i(exports):"function"==typeof define&&define.amd?define(["exports"],i):i(t.MobileDragDrop=t.MobileDragDrop||{})}(this,function(t){"use strict";var i="dnd-poly-",s=i+"snapback",n=["none","copy","copyLink","copyMove","link","linkMove","move","all"],h=["none","copy","move","link"];var e=function(){var t=!1;try{var i=Object.defineProperty({},"passive",{get:function(){t=!0}});window.addEventListener("test",null,i)}catch(t){}return t}();function r(t){return t&&t.tagName}function o(t,i,s){void 0===s&&(s=!0),document.addEventListener(t,i,!!e&&{passive:s})}function u(t,i){document.removeEventListener(t,i)}function a(t,i,s,n){void 0===n&&(n=!1);var h=e?{passive:!0,capture:n}:n;return t.addEventListener(i,s,h),{off:function(){t.removeEventListener(i,s,h)}}}function c(t){return 0===t.length?0:t.reduce(function(t,i){return i+t},0)/t.length}function f(t,i){for(var s=0;s<t.changedTouches.length;s++){if(t.changedTouches[s].identifier===i)return!0}return!1}function d(t,i,s){for(var n=[],h=[],e=0;e<i.touches.length;e++){var r=i.touches[e];n.push(r[t+"X"]),h.push(r[t+"Y"])}s.x=c(n),s.y=c(h)}var l=["","-webkit-"];function v(t,i,s,n,h){void 0===h&&(h=!0);var e=i.x,r=i.y;n&&(e+=n.x,r+=n.y),h&&(e-=parseInt(t.offsetWidth,10)/2,r-=parseInt(t.offsetHeight,10)/2);for(var o="translate3d("+e+"px,"+r+"px, 0)",u=0;u<l.length;u++){var a=l[u]+"transform";t.style[a]=o+" "+s[u]}}var p=function(){function t(t,i){this.t=t,this.i=i,this.s=h[0]}return Object.defineProperty(t.prototype,"dropEffect",{get:function(){return this.s},set:function(t){0!==this.t.mode&&n.indexOf(t)>-1&&(this.s=t)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"types",{get:function(){if(0!==this.t.mode)return Object.freeze(this.t.types)},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"effectAllowed",{get:function(){return this.t.effectAllowed},set:function(t){2===this.t.mode&&n.indexOf(t)>-1&&(this.t.effectAllowed=t)},enumerable:!0,configurable:!0}),t.prototype.setData=function(t,i){if(2===this.t.mode){if(t.indexOf(" ")>-1)throw new Error("illegal arg: type contains space");this.t.data[t]=i,-1===this.t.types.indexOf(t)&&this.t.types.push(t)}},t.prototype.getData=function(t){if(1===this.t.mode||2===this.t.mode)return this.t.data[t]||""},t.prototype.clearData=function(t){if(2===this.t.mode){if(t&&this.t.data[t]){delete this.t.data[t];var i=this.t.types.indexOf(t);return void(i>-1&&this.t.types.splice(i,1))}this.t.data={},this.t.types=[]}},t.prototype.setDragImage=function(t,i,s){2===this.t.mode&&this.i(t,i,s)},t}();function g(t,i){return t?t===n[0]?h[0]:0===t.indexOf(n[1])||t===n[7]?h[1]:0===t.indexOf(n[4])?h[3]:t===n[6]?h[2]:h[1]:3===i.nodeType&&"A"===i.tagName?h[3]:h[1]}function m(t,i,s,n,h,e,r){void 0===e&&(e=!0),void 0===r&&(r=null);var o=function(t,i,s,n,h,e,r){void 0===r&&(r=null);var o=i.changedTouches[0],u=new Event(s,{bubbles:!0,cancelable:n});u.dataTransfer=e,u.relatedTarget=r,u.screenX=o.screenX,u.screenY=o.screenY,u.clientX=o.clientX,u.clientY=o.clientY,u.pageX=o.pageX,u.pageY=o.pageY;var a=t.getBoundingClientRect();return u.offsetX=u.clientX-a.left,u.offsetY=u.clientY-a.top,u}(i,s,t,e,document.defaultView,h,r),u=!i.dispatchEvent(o);return n.mode=0,u}function y(t,i){if(!t||t===n[7])return i;if(i===h[1]){if(0===t.indexOf(h[1]))return h[1]}else if(i===h[3]){if(0===t.indexOf(h[3])||t.indexOf("Link")>-1)return h[3]}else if(i===h[2]&&(0===t.indexOf(h[2])||t.indexOf("Move")>-1))return h[2];return h[0]}var b,w=function(){function t(t,i,s,n){this.h=t,this.o=i,this.u=s,this.l=n,this.v=0,this.p=null,this.g=null,this.m=t,this.I=t.changedTouches[0],this.j=this.S.bind(this),this.k=this.A.bind(this),o("touchmove",this.j,!1),o("touchend",this.k,!1),o("touchcancel",this.k,!1)}return t.prototype.O=function(){var t=this;this.v=1,this.C=h[0],this.D={data:{},effectAllowed:void 0,mode:3,types:[]},this.M={x:null,y:null},this.F={x:null,y:null};var i=this.u;if(this.N=new p(this.D,function(s,n,h){i=s,"number"!=typeof n&&"number"!=typeof h||(t.P={x:n||0,y:h||0})}),this.D.mode=2,this.N.dropEffect=h[0],m("dragstart",this.u,this.m,this.D,this.N))return this.v=3,this.T(),!1;d("page",this.m,this.F);var s,n=this.o.dragImageSetup(i);if(this.L=(s=n,l.map(function(t){var i=s.style[t+"transform"];return i&&"none"!==i?i.replace(/translate\(\D*\d+[^,]*,\D*\d+[^,]*\)\s*/g,""):""})),n.style.position="absolute",n.style.left="0px",n.style.top="0px",n.style.zIndex="999999",n.classList.add("dnd-poly-drag-image"),n.classList.add("dnd-poly-icon"),this._=n,!this.P)if(this.o.dragImageOffset)this.P={x:this.o.dragImageOffset.x,y:this.o.dragImageOffset.y};else if(this.o.dragImageCenterOnTouch){var e=getComputedStyle(i);this.P={x:0-parseInt(e.marginLeft,10),y:0-parseInt(e.marginTop,10)}}else{var r=i.getBoundingClientRect();e=getComputedStyle(i);this.P={x:r.left-this.I.clientX-parseInt(e.marginLeft,10)+r.width/2,y:r.top-this.I.clientY-parseInt(e.marginTop,10)+r.height/2}}return v(this._,this.F,this.L,this.P,this.o.dragImageCenterOnTouch),document.body.appendChild(this._),this.V=window.setInterval(function(){t.X||(t.X=!0,t.Y(),t.X=!1)},this.o.iterationInterval),!0},t.prototype.T=function(){this.V&&(clearInterval(this.V),this.V=null),u("touchmove",this.j),u("touchend",this.k),u("touchcancel",this.k),this._&&(this._.parentNode.removeChild(this._),this._=null),this.l(this.o,this.m,this.v)},t.prototype.S=function(t){var i=this;if(!1!==f(t,this.I.identifier)){if(this.m=t,0===this.v){var s=void 0;if(this.o.dragStartConditionOverride)try{s=this.o.dragStartConditionOverride(t)}catch(t){s=!1}else s=1===t.touches.length;return s?void(!0===this.O()&&(this.h.preventDefault(),t.preventDefault())):void this.T()}if(t.preventDefault(),d("client",t,this.M),d("page",t,this.F),this.o.dragImageTranslateOverride)try{var n=!1;if(this.o.dragImageTranslateOverride(t,{x:this.M.x,y:this.M.y},this.p,function(t,s){i._&&(n=!0,i.M.x+=t,i.M.y+=s,i.F.x+=t,i.F.y+=s,v(i._,i.F,i.L,i.P,i.o.dragImageCenterOnTouch))}),n)return}catch(t){}v(this._,this.F,this.L,this.P,this.o.dragImageCenterOnTouch)}},t.prototype.A=function(t){if(!1!==f(t,this.I.identifier)){if(this.o.dragImageTranslateOverride)try{this.o.dragImageTranslateOverride(void 0,void 0,void 0,function(){})}catch(t){}0!==this.v?(t.preventDefault(),this.v="touchcancel"===t.type?3:2):this.T()}},t.prototype.Y=function(){var t=this,n=this.C;this.D.mode=3,this.N.dropEffect=h[0];var e=m("drag",this.u,this.m,this.D,this.N);if(e&&(this.C=h[0]),e||2===this.v||3===this.v)return this.q(this.v)?void function(t,i,n,h){var e=getComputedStyle(t);if("hidden"!==e.visibility&&"none"!==e.display){i.classList.add(s);var r=getComputedStyle(i),o=parseFloat(r.transitionDuration);if(isNaN(o)||0===o)h();else{var u=t.getBoundingClientRect(),a={x:u.left,y:u.top};a.x+=document.body.scrollLeft||document.documentElement.scrollLeft,a.y+=document.body.scrollTop||document.documentElement.scrollTop,a.x-=parseInt(e.marginLeft,10),a.y-=parseInt(e.marginTop,10);var c=parseFloat(r.transitionDelay),f=Math.round(1e3*(o+c));v(i,a,n,void 0,!1),setTimeout(h,f)}}else h()}(this.u,this._,this.L,function(){t.B()}):void this.B();var o=this.o.elementFromPoint(this.M.x,this.M.y),u=this.g;o!==this.p&&o!==this.g&&(this.p=o,null!==this.g&&(this.D.mode=3,this.N.dropEffect=h[0],m("dragexit",this.g,this.m,this.D,this.N,!1)),null===this.p?this.g=this.p:(this.D.mode=3,this.N.dropEffect=g(this.D.effectAllowed,this.u),m("dragenter",this.p,this.m,this.D,this.N)?(this.g=this.p,this.C=y(this.N.effectAllowed,this.N.dropEffect)):this.p!==document.body&&(this.g=document.body))),u!==this.g&&r(u)&&(this.D.mode=3,this.N.dropEffect=h[0],m("dragleave",u,this.m,this.D,this.N,!1,this.g)),r(this.g)&&(this.D.mode=3,this.N.dropEffect=g(this.D.effectAllowed,this.u),!1===m("dragover",this.g,this.m,this.D,this.N)?this.C=h[0]:this.C=y(this.N.effectAllowed,this.N.dropEffect)),n!==this.C&&this._.classList.remove(i+n);var a=i+this.C;this._.classList.add(a)},t.prototype.q=function(t){var i=this.C===h[0]||null===this.g||3===t;return i?r(this.g)&&(this.D.mode=3,this.N.dropEffect=h[0],m("dragleave",this.g,this.m,this.D,this.N,!1)):r(this.g)&&(this.D.mode=1,this.N.dropEffect=this.C,!0===m("drop",this.g,this.m,this.D,this.N)?this.C=this.N.dropEffect:this.C=h[0]),i},t.prototype.B=function(){this.D.mode=3,this.N.dropEffect=this.C,m("dragend",this.u,this.m,this.D,this.N,!1),this.v=2,this.T()},t}(),x={iterationInterval:150,tryFindDraggableTarget:function(t){var i=t.target;do{if(!1!==i.draggable&&i.getAttribute&&"true"===i.getAttribute("draggable"))return i}while((i=i.parentNode)&&i!==document.body)},dragImageSetup:function(t){var i=t.cloneNode(!0);return function t(i,s){if(1===i.nodeType){for(var n=getComputedStyle(i),h=0;h<n.length;h++){var e=n[h];s.style.setProperty(e,n.getPropertyValue(e),n.getPropertyPriority(e))}if(s.style.pointerEvents="none",s.removeAttribute("id"),s.removeAttribute("class"),s.removeAttribute("draggable"),"CANVAS"===s.nodeName){var r=i,o=s,u=r.getContext("2d").getImageData(0,0,r.width,r.height);o.getContext("2d").putImageData(u,0,0)}}if(i.hasChildNodes())for(h=0;h<i.childNodes.length;h++)t(i.childNodes[h],s.childNodes[h])}(t,i),i},elementFromPoint:function(t,i){return document.elementFromPoint(t,i)}};function I(t){if(!b){var i=x.tryFindDraggableTarget(t);if(i)try{b=new w(t,x,i,S)}catch(i){throw S(x,t,3),i}}}function j(t){var i=t.target,s=function(t){h.off(),e.off(),r.off(),clearTimeout(n)},n=window.setTimeout(function(){h.off(),e.off(),r.off(),I(t)},x.holdToDrag),h=a(i,"touchend",s),e=a(i,"touchcancel",s),r=a(window,"scroll",s,!0)}function S(t,i,s){if(0===s&&t.defaultActionOverride)try{t.defaultActionOverride(i),i.defaultPrevented}catch(t){}b=null}t.polyfill=function(t){if(t&&Object.keys(t).forEach(function(i){x[i]=t[i]}),!x.forceApply){var i=(s={dragEvents:"ondragstart"in document.documentElement,draggable:"draggable"in document.documentElement,userAgentSupportingNativeDnD:void 0},n=!!window.chrome||/chrome/i.test(navigator.userAgent),s.userAgentSupportingNativeDnD=!(/iPad|iPhone|iPod|Android/.test(navigator.userAgent)||n&&"ontouchstart"in document.documentElement),s);if(i.userAgentSupportingNativeDnD&&i.draggable&&i.dragEvents)return!1}var s,n;return x.holdToDrag?o("touchstart",j,!1):o("touchstart",I,!1),!0},Object.defineProperty(t,"__esModule",{value:!0})});

},{}],2:[function(require,module,exports){
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

},{"./debug":4,"./utils":10}],3:[function(require,module,exports){
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

},{"./actions":2,"./utils":10}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
        const width = gameElement.getAttribute('width');
        const height = gameElement.getAttribute('height');
        if (width && height) {
            gameElement.style.width = `${width}px`;
            gameElement.style.height = `${height}px`;
        }
        if (location.hash) {
            this.currentRoomId = this.applyUrlState(location.hash.slice(1)); // Drop '#'
        }
        else {
            const firstRoomRef = this.getValidatedRoomStateRef(utils_1.getAttribute(gameElement, 'first-room'), 'attribute first-room of game');
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
        this.onStateChanged();
        this.maybeLogVisit(roomId);
    }
    /** Pretend the player is saying something. */
    say(message) {
        this.playerPrompt.show(message);
    }
    getCurrentRoom() {
        return this.getRoom(this.currentRoomId);
    }
    onStateChanged() {
        window.location.hash = '#' + this.encodeUrlState();
    }
    /** Encodes the current state of the game as a URL hash. */
    encodeUrlState() {
        const currentRoomId = encodeURIComponent(this.currentRoomId);
        const inventoryState = this.inventory ? this.inventory.encodeUrlState() : '';
        const currentRoomStates = this.getRoomsUrlStates();
        return `cr=${currentRoomId}&i=${inventoryState}&rs=${currentRoomStates}`;
    }
    applyUrlState(state) {
        let currentRoomId;
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
        }
        else {
            return currentRoomId;
        }
    }
    getRoomsUrlStates() {
        const nonDefaultStates = [];
        for (const [name, room] of this.rooms) {
            const encodedName = encodeURIComponent(name);
            const encodedState = room.encodeUrlState();
            if (encodedState) {
                nonDefaultStates.push(`${encodedName}:${encodedState}`);
            }
        }
        return nonDefaultStates.join(',');
    }
    applyRoomUrlStates(state) {
        const parts = state.split(',').filter(p => !!p).map(part => part.split(':'));
        for (const [name, roomState] of parts) {
            const decodedName = decodeURIComponent(name);
            this.getRoom(decodedName).applyUrlState(roomState);
        }
    }
    installStateChangeListeners() {
        if (this.inventory) {
            this.inventory.stateChangeListeners.push(() => this.onStateChanged());
        }
        for (const room of this.rooms.values()) {
            room.stateChangeListeners.push(() => this.onStateChanged());
        }
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

},{"./debug":4,"./inventory":6,"./room":8,"./room_state":9,"./utils":10}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
/**
 * The controller of the <inventory> tag.
 */
class Inventory {
    constructor(element) {
        this.items = new Map();
        this.stateChangeListeners = [];
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
        this.onStateChange();
    }
    disable(...ids) {
        for (const id of ids) {
            this.getItem(id).classList.remove('enabled');
        }
        this.onStateChange();
    }
    encodeUrlState() {
        return Array.from(this.items.keys())
            .filter(id => this.enabled(id))
            .map(encodeURIComponent).join(',');
    }
    applyUrlState(state) {
        const enabled = new Set(state.split(',').map(decodeURIComponent));
        for (const id of this.items.keys()) {
            if (enabled.has(id)) {
                this.enable(id);
            }
            else {
                this.disable(id);
            }
        }
    }
    onStateChange() {
        for (const listener of this.stateChangeListeners) {
            listener();
        }
    }
    getItem(id) {
        return utils_1.assert(this.items.get(id), `Unknown inventory item ${id}`);
    }
}
Inventory.MIME = "application/inventory";
exports.Inventory = Inventory;
function configureDragAndDrop(image) {
    image.draggable = true; // needed just for the mobile polyfill.
    image.addEventListener('dragstart', event => {
        const target = event.target;
        if (target && target instanceof Element) {
            if (event.dataTransfer) {
                event.dataTransfer.setData(Inventory.MIME, target.id);
                event.dataTransfer.effectAllowed = "move";
            }
        }
    }, false);
}

},{"./utils":10}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("./game");
const debug_1 = require("./debug");
const mobile_drag_drop_1 = require("mobile-drag-drop");
/** Bootstraps the toolkit. */
function bootstrap() {
    if (debug_1.debugEnabled()) {
        document.documentElement.classList.add('debug');
    }
    const gameElement = document.querySelector('game');
    try {
        new game_1.Game(gameElement);
    }
    catch (e) {
        debug_1.debug(e.message, 'ERROR');
    }
    mobile_drag_drop_1.polyfill();
}
/** Wait for the DOM to finish loading, then bootstrap. */
document.addEventListener("DOMContentLoaded", bootstrap);

},{"./debug":4,"./game":5,"mobile-drag-drop":1}],8:[function(require,module,exports){
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
        this.stateChangeListeners = [];
    }
    addState(id, state) {
        this.states.set(id, state);
    }
    setState(state) {
        utils_1.assert(this.hasState(state), `Unknown state "${state}"`);
        debug_1.debug(`Room ${this.id} is now in state "${state}"`);
        this.currentStateId = state;
        this.onStateChange();
    }
    getState(id) {
        utils_1.assert(this.hasState(id), `Unknown state "${id}"`);
        return this.states.get(id);
    }
    hasState(state) {
        return this.states.has(state);
    }
    getCurrentState() {
        return utils_1.assert(this.states.get(this.currentStateId));
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
    parseActions(game) {
        for (const state of this.states.values()) {
            state.parseActions(game, this);
        }
    }
    encodeUrlState() {
        return encodeURIComponent(this.currentStateId);
    }
    applyUrlState(state) {
        const decoded = decodeURIComponent(state);
        if (this.states.has(decoded)) {
            this.currentStateId = decoded;
        }
        else {
            throw Error('Unknown state ' + decoded);
        }
    }
    onStateChange() {
        for (const listener of this.stateChangeListeners) {
            listener();
        }
    }
}
exports.Room = Room;

},{"./debug":4,"./utils":10}],9:[function(require,module,exports){
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
        if (event.dataTransfer && utils_1.hasType(event.dataTransfer, inventory_1.Inventory.MIME)) {
            event.preventDefault();
            const target = event.target;
            if (target && target instanceof Element) {
                target.classList.add('inventory-drag');
            }
        }
    }, false);
    region.addEventListener('dragover', event => {
        if (event.dataTransfer && utils_1.hasType(event.dataTransfer, inventory_1.Inventory.MIME)) {
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
        if (!event.dataTransfer) {
            return;
        }
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

},{"./actions":2,"./conversation":3,"./debug":4,"./inventory":6,"./utils":10}],10:[function(require,module,exports){
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

},{}]},{},[7]);
