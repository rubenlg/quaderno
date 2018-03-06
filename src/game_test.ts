import { makeDOM } from "./testing";
import { Game } from "./game";

describe('Game', () => {
  afterEach(() => {
    location.hash = '';
  });

  it('parses just rooms', () => {
    const domElement = makeDOM(`
      <game first-room="first">
        <room id="first"></room>
      </game>`);
    const game = new Game(domElement);
    expect(game.getRoom('first')).not.toBeUndefined();
    expect(game.inventory).toBeUndefined();
    expect(domElement.querySelector('room.enabled')!.id).toBe('first');
  });

  it('parses just inventory', () => {
    const domElement = makeDOM(`
      <game first-room="first">
        <room id="first"></room>
        <inventory></inventory>
      </game>`);
    const game = new Game(domElement);
    expect(game.inventory).not.toBeUndefined();
  });

  it('navigates', () => {
    const domElement = makeDOM(`
      <game first-room="first">
        <room id="first"></room>
        <room id="second"></room>
        <room id="second:state"></room>
      </game>`);
    const game = new Game(domElement);
    expect(domElement.querySelector('room.enabled')!.id).toBe('first');
    game.navigate('second');
    expect(domElement.querySelector('room.enabled')!.id).toBe('second');
    game.navigate('second', 'state');
    expect(domElement.querySelector('room.enabled')!.id).toBe('second:state');
    game.navigate('first');
    expect(domElement.querySelector('room.enabled')!.id).toBe('first');
    game.navigate('second');
    // The state is remembered now.
    expect(domElement.querySelector('room.enabled')!.id).toBe('second:state');
  });

  it('says', () => {
    const domElement = makeDOM(`
    <game first-room="first">
      <room id="first"></room>
    </game>`);
    const game = new Game(domElement);
    expect(domElement.querySelector('player-prompt')!.textContent).toBe('');
    expect(domElement.querySelector('player-prompt')!.classList).not.toContain('visible');
    game.say('Hello');
    expect(domElement.querySelector('player-prompt')!.textContent).toBe('Hello');
    expect(domElement.querySelector('player-prompt')!.classList).toContain('visible');
  });

});

describe('URL state', () => {
  afterEach(() => {
    location.hash = '';
  });

  it('works for rooms', () => {
    const domElement = makeDOM(`
    <game first-room="first">
      <room id="first"></room>
      <room id="second"></room>
    </game>`);
    const game = new Game(domElement);
    game.navigate('second');
    expect(window.location.hash).toBeTruthy();
    const game2 = new Game(domElement);
    expect(game2.getCurrentRoom()).toBe(game2.getRoom('second'));
  });

  it('works for inventory', () => {
    const domElement = makeDOM(`
    <game first-room="first">
      <room id="first"></room>
      <inventory initial-contents="coin">
        <img id="coin"></img>
        <img id="pebble"></img>
      </inventory>
    </game>`);
    const game = new Game(domElement);
    game.inventory!.enable('pebble');

    expect(window.location.hash).toBeTruthy();
    const game2 = new Game(domElement);
    expect(game2.inventory!.enabled('pebble')).toBeTruthy();
  });

  it('works for room states', () => {
    const domElement = makeDOM(`
    <game first-room="first">
      <room id="first"></room>
      <room id="second"></room>
      <room id="second:state1"></room>
    </game>`);
    const game = new Game(domElement);
    game.navigate('second', 'state1');
    game.navigate('first');

    expect(window.location.hash).toBeTruthy();
    const game2 = new Game(domElement);
    expect(game2.getCurrentRoom()).toBe(game2.getRoom('first'));
    expect(game2.getRoom('second').getCurrentState()).toBe(game2.getRoom('second').getState('state1'));
  });
});

describe('getValidatedRoomStateRef', () => {
  it('works for existing', () => {
    const domElement = makeDOM(`
      <game first-room="first">
        <room id="first"></room>
        <room id="second"></room>
        <room id="second:state"></room>
      </game>`);
    const game = new Game(domElement);
    expect(game.getValidatedRoomStateRef('first', '')).toEqual({ id: 'first' });
    expect(game.getValidatedRoomStateRef('second', '')).toEqual({ id: 'second' });
    expect(game.getValidatedRoomStateRef('second:state', '')).toEqual(
      { id: 'second', state: 'state' });
  });

  it('throws readable errors for non existing', () => {
    const domElement = makeDOM(`
      <game first-room="first">
        <room id="first"></room>
      </game>`);
    const game = new Game(domElement);
    expect(() => game.getValidatedRoomStateRef('second', 'context')).toThrowError(
      'In context: second is not a valid room id');
    expect(() => game.getValidatedRoomStateRef('second:state', 'context')).toThrowError(
      'In context: second is not a valid room id');
    expect(() => game.getValidatedRoomStateRef('first:state', 'context')).toThrowError(
      `In context: Room first doesn't have a state state`);
  });

});
