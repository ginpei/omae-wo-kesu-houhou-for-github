/* globals BackgroundController */

describe('BackgroundController', () => {
  const { expect } = chai;

  let controller;

  beforeEach(() => {
    controller = new BackgroundController();
  });

  // TODO replace with actual tests
  it('is OK', () => {
    expect(controller).to.be.an.instanceof(BackgroundController);
  });
});
