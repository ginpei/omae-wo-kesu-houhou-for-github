import Balloon from './Balloon.js';

// eslint-disable-next-line no-unused-vars
export default class AssistantUI {
  constructor (options) {
    this.html = options.html;
  }

  getBalloonPath ({ rectBalloon }) {
    const balloon = new Balloon({ rectBalloon });
    const d = balloon.getBalloonPath();
    return d;
  }
}
