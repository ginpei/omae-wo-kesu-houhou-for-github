import AssistantUI from './AssistantUI.js';

/* globals browser */

// eslint-disable-next-line no-unused-vars
export default class BackgroundController {
  constructor () {
    this._targets = [];
    this.assistant = new AssistantUI({
      html: document.querySelector('#template-Assistant').text,
    });
  }

  async start () {
    browser.runtime.onMessage.addListener(async (message, sender) => {
      const { type } = message;
      let retValue;

      if (type === 'ready') {
        this._initTab({
          tabId: sender.tab.id,
        });
      } else if (type === 'getBalloonPath') {
        retValue = this.assistant.getBalloonPath(message);
      } else if (type === 'resolvePath') {
        retValue = { path: this._resolvePath(message.path) };
      } else if (type === 'action') {
        this._runAction(message);
      } else if (type === 'close') {
        const index = this._targets.findIndex(v => v.tabId === sender.tab.id);
        if (index < 0) {
          throw new Error('Target not found');
        }
        this._targets.splice(index, 1);
      }

      return retValue;
    });
  }

  async sendMessage (target, type, data) {
    if (!target || !target.tabId) {
      throw new Error('Invalid target');
    }

    try {
      const message = { type, ...data };
      const result = await browser.tabs.sendMessage(target.tabId, message);
      return result;
    } catch (error) {
      console.warn('Failed', type, data);
      throw error;
    }
  }

  _initTab ({ tabId }) {
    const target = { tabId };
    this._targets.push(target);

    const { html } = this.assistant;
    this.sendMessage(target, 'init', { html });
  }

  _resolvePath (path) {
    return browser.runtime.getURL(path);
  }

  _runAction (message) {
    const { name } = message;
    if (name === 'inputQuery') {
      this._query = message.input;
    } else if (name === 'openOptions') {
      browser.runtime.openOptionsPage();
    }
  }
}
