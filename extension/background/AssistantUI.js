// eslint-disable-next-line no-unused-vars
export default class AssistantUI {
  constructor (options) {
    this.html = options.html;
  }

  getBalloonPath (options) {
    const {
      rectBalloon,
      padding = 0,
      radius = 10,
      spikeWidth = 10,
      spikeHeight = 15,
      spikePosition = 0.5,
      strokeTilt = 1.0,
    } = options;

    const { width, height } = rectBalloon;
    const innerWidth = width - ((padding + radius) * 2);
    const innerHeight = height - ((padding + radius) * 2);

    const d = [
      // →
      `M ${padding + radius} ${padding}`,
      `l ${innerWidth} 0`,
      `a ${radius} ${radius} 0 0 1 ${radius} ${radius}`,
      // ↓
      `l 0 ${innerHeight}`,
      `a ${radius} ${radius} 0 0 1 -${radius} ${radius}`,
      // ← v ←
      `l -${(innerWidth - spikeWidth) * spikePosition} 0`,
      `l -${spikeWidth * strokeTilt} ${spikeHeight}`,
      `l -${spikeWidth * (1 - strokeTilt)} -${spikeHeight}`,
      `l -${(innerWidth - spikeWidth) * (1 - spikePosition)} 0`,
      `a ${radius} ${radius} 0 0 1 -${radius} -${radius}`,
      // ↑
      `l 0 -${innerHeight}`,
      `a ${radius} ${radius} 0 0 1 ${radius} -${radius}`,
    ].join(' ');

    return d;
  }
}
