import { makeDOM } from "./testing";
import { Game } from "./game";

describe('Game', () => {
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
