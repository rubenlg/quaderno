import { RoomState } from './room_state';
import { Room } from './room';
import { Game } from './game';
import { makeDOM, createSpyFor } from './testing';

describe('RoomState', () => {
  it('sets the right class on enter, clears on leave', () => {
    const domElement = makeDOM(`
    <room id="my-room"></room>`);

    const instance = new RoomState(domElement);
    expect(domElement.classList).not.toContain('enabled');
    instance.enter();
    expect(domElement.classList).toContain('enabled');
    instance.leave();
    expect(domElement.classList).not.toContain('enabled');
  });

  it('handles conversations', () => {
    const domElement = makeDOM(`
    <room id="my-room">
      <conv-group id="my-group">
        <conv id="my-conv">
        </conv>
      </conv-group>
    </room>`);

    const instance = new RoomState(domElement);
    expect(instance.hasConv('my-group.my-conv')).toBeTruthy();
    expect(instance.hasConv('unknown-group.my-conv')).toBeFalsy();
    expect(instance.hasConv('my-group.unknown-conv')).toBeFalsy();

    expect(domElement.querySelector('#my-conv')!.classList).not.toContain('enabled');
    instance.enableConv('my-group.my-conv');
    expect(domElement.querySelector('#my-conv')!.classList).toContain('enabled');
  });

  it('handles region actions', () => {
    const domElement = makeDOM(`
    <room id="my-room">
      <region coords="133,107,310,410" goto-room="other-room"></region>
    </room>`);

    const instance = new RoomState(domElement);
    const game = createSpyFor(Game);
    game.getValidatedRoomStateRef.and.returnValue({id: 'other-room'});
    const room = {} as Room;
    instance.parseActions(game as any, room);
    domElement.querySelector<HTMLElement>('region')!.click();
    expect(game.navigate).toHaveBeenCalledWith('other-room', undefined);
  });
});
