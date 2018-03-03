import { Room } from "./room";
import { RoomState } from "./room_state";
import { createSpyFor } from "./testing";

describe('Room', () => {
  it('knows its states', () => {
    const state1 = {} as RoomState;
    const room = new Room('my-room');
    expect(room.hasState('state1')).toBeFalsy();
    room.addState('state1', state1);
    expect(room.hasState('state1')).toBeTruthy();
  });

  it('changes state', () => {
    const state1 = {} as RoomState;
    const state2 = {} as RoomState;
    const room = new Room('my-room');
    room.addState('state1', state1);
    room.addState('state2', state2);
    expect(() => room.currentState()).toThrowError();
    room.setState('state1');
    expect(room.currentState()).toBe(state1);
    room.setState('state2');
    expect(room.currentState()).toBe(state2);
  });

  it('enables and disables states', () => {
    const state1 = createSpyFor(RoomState);
    const room = new Room('my-room');
    room.addState('state1', state1);
    room.setState('state1');
    room.enter();
    expect(state1.enter).toHaveBeenCalled();
    room.leave();
    expect(state1.leave).toHaveBeenCalled();
  });
});
