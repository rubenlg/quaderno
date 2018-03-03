import { parseActions, EMPTY_ACTION, registerActionParser } from "./actions";
import { Game } from "./game";
import { SpiedClass, createSpyFor, makeDOM } from "./testing";
import { Room } from "./room";
import { RoomState } from "./room_state";

describe('parseActions', () => {
  let game: SpiedClass<Game>;
  let room: SpiedClass<Room>;
  let roomState: SpiedClass<RoomState>;

  beforeEach(() => {
    game = createSpyFor(Game);
    room = createSpyFor(Room);
    roomState = createSpyFor(RoomState);
    game.getValidatedRoomStateRef.and.callFake((ref: string) => {
      const pieces = ref.split(':');
      return {
        id: pieces[0],
        state: pieces[1],
      };
    });
  });

  it('supports no actions', () => {
    const composedAction = parseActions([], { game, room, roomState });
    expect(composedAction).toBe(EMPTY_ACTION);
  });

  it('merges actions', () => {
    const action1 = jasmine.createSpy('action1');
    const action2 = jasmine.createSpy('action2');
    const domElement = makeDOM(`
      <foo action1="action1-payload" action2="action2-payload"></foo>`);
    registerActionParser('action1', () => action1);
    registerActionParser('action2', () => action2);
    const composedAction = parseActions(
      Array.from(domElement.attributes), { game, room, roomState });
    expect(action1).not.toHaveBeenCalled();
    expect(action2).not.toHaveBeenCalled();
    composedAction();
    expect(action1).toHaveBeenCalled();
    expect(action2).toHaveBeenCalled();
  });

  it('reports unknown actions', () => {
    const domElement = makeDOM(`
      <foo unknown-action="action1-payload"></foo>`);
    expect(() => parseActions(
      Array.from(domElement.attributes), { game, room, roomState })).toThrowError(
        'Unknown action: unknown-action in DIV.FOO');
  });
});

describe('remote-room-state', () => {
  it('works on the current room', () => {
    const domElement = makeDOM(`
      <game first-room="room1">
        <room id="room1">
          <region coords="0,0,1,1" remote-room-state="room1:mystate"></region>
        </room>
        <room id="room1:mystate"></room>
      </game>`);
    new Game(domElement);
    expect(domElement.querySelector('room.enabled')!.id).toBe('room1');
    domElement.querySelector<HTMLElement>('region')!.click();
    expect(domElement.querySelector('room.enabled')!.id).toBe('room1:mystate');
  });

  it('works on remote room', () => {
    const domElement = makeDOM(`
      <game first-room="room1">
        <room id="room1">
          <region coords="0,0,1,1" remote-room-state="room2:mystate"></region>
        </room>
        <room id="room2"></room>
        <room id="room2:mystate"></room>
      </game>`);
    const game = new Game(domElement);

    expect(domElement.querySelector('room.enabled')!.id).toBe('room1');
    domElement.querySelector<HTMLElement>('region')!.click();
    game.navigate('room2');
    expect(domElement.querySelector('room.enabled')!.id).toBe('room2:mystate');
  });
});

describe('goto-room', () => {
  it('works on the current room', () => {
    const domElement = makeDOM(`
      <game first-room="room1">
        <room id="room1">
          <region coords="0,0,1,1" goto-room="room1:mystate"></region>
        </room>
        <room id="room1:mystate"></room>
      </game>`);
    new Game(domElement);
    expect(domElement.querySelector('room.enabled')!.id).toBe('room1');
    domElement.querySelector<HTMLElement>('region')!.click();
    expect(domElement.querySelector('room.enabled')!.id).toBe('room1:mystate');
  });

  it('works on another room', () => {
    const domElement = makeDOM(`
      <game first-room="room1">
        <room id="room1">
          <region coords="0,0,1,1" goto-room="room2:mystate"></region>
        </room>
        <room id="room2"></room>
        <room id="room2:mystate"></room>
      </game>`);
    new Game(domElement);

    expect(domElement.querySelector('room.enabled')!.id).toBe('room1');
    domElement.querySelector<HTMLElement>('region')!.click();
    expect(domElement.querySelector('room.enabled')!.id).toBe('room2:mystate');
  });
});

describe('inventory-add', () => {
  it('adds an item', () => {
    const domElement = makeDOM(`
      <game first-room="room1">
        <room id="room1">
          <region coords="0,0,1,1" inventory-add="peanuts"></region>
        </room>
        <inventory initial-contents="">
          <img src="peanuts.png" id="peanuts"/>
        </inventory>
      </game>`);
    new Game(domElement);
    expect(domElement.querySelector('inventory img.enabled')).toBeNull();
    domElement.querySelector<HTMLElement>('region')!.click();
    expect(domElement.querySelector('inventory img.enabled')!.id).toBe('peanuts');
  });

  it('does not add again existing items', () => {
    const domElement = makeDOM(`
      <game first-room="room1">
        <room id="room1">
          <region coords="0,0,1,1" inventory-add="peanuts"></region>
        </room>
        <inventory initial-contents="peanuts">
          <img src="peanuts.png" id="peanuts"/>
        </inventory>
      </game>`);
    new Game(domElement);
    expect(domElement.querySelectorAll('inventory img.enabled').length).toBe(1);
    domElement.querySelector<HTMLElement>('region')!.click();
    expect(domElement.querySelectorAll('inventory img.enabled').length).toBe(1);
  });
});

describe('inventory-del', () => {
  it('does not delete if it is not there', () => {
    const domElement = makeDOM(`
      <game first-room="room1">
        <room id="room1">
          <region coords="0,0,1,1" inventory-del="peanuts"></region>
        </room>
        <inventory initial-contents="">
          <img src="peanuts.png" id="peanuts"/>
        </inventory>
      </game>`);
    new Game(domElement);
    expect(domElement.querySelector('inventory img.enabled')).toBeNull();
    domElement.querySelector<HTMLElement>('region')!.click();
    expect(domElement.querySelector('inventory img.enabled')).toBeNull();
  });

  it('deletes an item', () => {
    const domElement = makeDOM(`
      <game first-room="room1">
        <room id="room1">
          <region coords="0,0,1,1" inventory-del="peanuts"></region>
        </room>
        <inventory initial-contents="peanuts">
          <img src="peanuts.png" id="peanuts"/>
        </inventory>
      </game>`);
    new Game(domElement);
    expect(domElement.querySelectorAll('inventory img.enabled').length).toBe(1);
    domElement.querySelector<HTMLElement>('region')!.click();
    expect(domElement.querySelector('inventory img.enabled')).toBeNull();
  });
});

describe('say', () => {
  it('does say', () => {
    const domElement = makeDOM(`
      <game first-room="room1">
        <room id="room1">
          <region coords="0,0,1,1" say="Hello"></region>
        </room>
      </game>`);
    new Game(domElement);

    expect(domElement.querySelector('player-prompt')!.textContent).toBe('');
    expect(domElement.querySelector('player-prompt')!.classList).not.toContain('visible');
    domElement.querySelector<HTMLElement>('region')!.click();
    expect(domElement.querySelector('player-prompt')!.textContent).toBe('Hello');
    expect(domElement.querySelector('player-prompt')!.classList).toContain('visible');
  });
});

describe('show-conv', () => {
  it('does show a conv', () => {
    const domElement = makeDOM(`
      <game first-room="room1">
        <room id="room1">
          <region coords="0,0,1,1" show-conv="my-group.my-conv1"></region>
          <conv-group id="my-group">
            <conv id="my-conv1"></conv>
          </conv-group>
        </room>
      </game>`);
    new Game(domElement);

    expect(domElement.querySelector('conv.enabled')!).toBeNull();
    domElement.querySelector<HTMLElement>('region')!.click();
    expect(domElement.querySelector('conv.enabled')!.id).toBe('my-conv1');
  });
});

describe('next-conv', () => {
  it('does show a conv', () => {
    const domElement = makeDOM(`
      <game first-room="room1">
        <room id="room1">
          <region coords="0,0,1,1" show-conv="my-group.my-conv1"></region>
          <conv-group id="my-group">
            <conv id="my-conv1">
              <li next-conv="my-conv2">Some text</li>
            </conv>
            <conv id="my-conv2"></conv>
          </conv-group>
        </room>
      </game>`);
    new Game(domElement);

    expect(domElement.querySelector('conv.enabled')!).toBeNull();
    domElement.querySelector<HTMLElement>('region')!.click();
    expect(domElement.querySelector('conv.enabled')!.id).toBe('my-conv1');
    domElement.querySelector<HTMLElement>('li')!.click();
    expect(domElement.querySelector('conv.enabled')!.id).toBe('my-conv2');
  });
});
