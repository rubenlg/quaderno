import { assert } from "./utils";
import { parseActions, ActionContext } from "./actions";

export class Conversation {
  private readonly convMap = new Map<string, Element>();
  /**
   * An element that will hold the prompt of the conversation (that is, the
   * responses to the user's sentences)
   */
  private promptHolder: HTMLElement | null;
  private defaultConvId?: string;
  private currentConv?: Element;

  constructor(convGroup: HTMLElement) {
    this.promptHolder = convGroup.querySelector('prompt');

    const convs = convGroup.querySelectorAll('conv');
    for (const conv of convs) {
      assert(!this.convMap.has(conv.id), 'Duplicate entry' + conv.id);
      assert(!conv.hasAttribute('prompt') || this.promptHolder,
        'A <prompt> tag is needed inside <conv-group> in order to display prompts');
      this.convMap.set(conv.id, conv);
      if (conv.hasAttribute('default')) {
        this.defaultConvId = conv.id;
      }
    }
  }

  parseActions(context: ActionContext) {
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
    } else {
      // Otherwise clear the prompt.
      this.showPrompt('');
    }
  }

  exists(cnv: string): boolean {
    return this.convMap.has(cnv);
  }

  enable(convId: string) {
    assert(this.exists(convId), 'Conversation ' + convId + ' does not exist!');
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

  private configLine(line: Element, context: ActionContext) {
    const actions = parseActions(
      Array.from(line.attributes), { ...context, conversation: this });
    line.addEventListener('click', actions);
  }

  private showPrompt(prompt: string) {
    if (!this.promptHolder) {
      assert(!prompt, 'No prompt holder to show a prompt!');
      return;
    }
    if (prompt) {
      this.promptHolder.textContent = prompt;
      this.promptHolder.style.display = 'block';
    } else {
      this.promptHolder.style.display = 'none';
    }
  }
}
