import { makeDOM } from "./testing";
import { Conversation } from "./conversation";

describe('Conversation', () => {
  it('knows its convs', () => {
    const domElement = makeDOM(`
      <conv-group id="my-group">
        <conv id="my-conv1"></conv>
        <conv id="my-conv2"></conv>
      </conv-group>`);
    const conversation = new Conversation(domElement);
    expect(conversation.exists('my-conv1')).toBeTruthy();
    expect(conversation.exists('my-conv2')).toBeTruthy();
    expect(conversation.exists('my-conv3')).toBeFalsy();
  });

  it(`Respects "default" absence`, () => {
    const domElement = makeDOM(`
      <conv-group id="my-group">
        <conv id="my-conv1"></conv>
      </conv-group>`);
    const conversation = new Conversation(domElement);
    conversation.reset();
    expect(domElement.querySelector('conv.enabled')).toBeNull();
  });

  it(`Respects "default" presence`, () => {
    const domElement = makeDOM(`
      <conv-group id="my-group">
        <conv id="my-conv1" default></conv>
      </conv-group>`);
    const conversation = new Conversation(domElement);
    conversation.reset();
    expect(domElement.querySelector('conv.enabled')!.id).toBe('my-conv1');
  });

  it('enables convs', () => {
    const domElement = makeDOM(`
      <conv-group id="my-group">
        <conv id="my-conv1"></conv>
        <conv id="my-conv2"></conv>
      </conv-group>`);
    const conversation = new Conversation(domElement);
    expect(domElement.querySelector('conv.enabled')!).toBeNull();
    conversation.enable('my-conv1');
    expect(domElement.querySelector('conv.enabled')!.id).toBe('my-conv1');
    conversation.enable('my-conv2');
    expect(domElement.querySelector('conv.enabled')!.id).toBe('my-conv2');
  });

});
