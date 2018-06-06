/* globals browser */

(async () => {
  async function sendMessage (type, data = {}) {
    if (!type) {
      throw new Error('Type is required');
    }
    const result = await browser.runtime.sendMessage({ type, ...data });
    return result;
  }

  function getEventPosition (event) {
    return {
      left: event.clientX,
      top: event.clientY,
    };
  }

  async function init (elRoot, message) {
    elRoot.innerHTML = message.html;

    const elBalloon = elRoot.querySelector('.OMEWKSHH-balloon');
    const domRectBalloon = elBalloon.getBoundingClientRect();
    const rectBalloon = {
      height: domRectBalloon.height,
      width: domRectBalloon.width,
    };
    const d = await sendMessage('getBalloonPath', { rectBalloon });
    const elBalloonPath = elRoot.querySelector('.OMEWKSHH-balloonFrame-path');
    elBalloonPath.setAttribute('d', d);

    elRoot.querySelectorAll('[data-OMEWKSHH-image]').forEach(async (el) => {
      const path = el.getAttribute('src');
      const result = await sendMessage('resolvePath', { path });
      el.setAttribute('src', result.path);
    });

    elRoot.querySelectorAll('[data-OMEWKSHH-actions]').forEach((el) => {
      const sActions = el.getAttribute('data-OMEWKSHH-actions');
      const actions = sActions
        .split(';')
        .map(v => v.split(':').map(w => w.trim()));
      actions.forEach(([eventType, name]) => {
        el.addEventListener(eventType, () => {
          const data = { eventType, name };
          if (eventType === 'input') {
            data.input = el.value;
          }
          sendMessage('action', data);
        });
      });
    });
  }

  function draggable (elRoot) {
    const elWrapper = elRoot.querySelector('.OMEWKSHH');
    const elBalloon = elRoot.querySelector('.OMEWKSHH-balloon');
    const elAssistant = elRoot.querySelector('.OMEWKSHH-assistant');
    const pos = { left: 0, top: 0 };
    let dragging = false;
    let dragPosition = null;
    let balloonVisible = true;
    let justAfterDragged = false;

    elAssistant.addEventListener('click', () => {
      if (justAfterDragged) {
        return;
      }

      balloonVisible = !balloonVisible;
      elBalloon.style.display = balloonVisible ? '' : 'none';
    });

    elAssistant.addEventListener('mousedown', (event) => {
      // prevent dragging image
      event.preventDefault();
      dragging = true;
    });

    document.addEventListener('mousemove', (event) => {
      if (!dragging) {
        return;
      }

      const p = getEventPosition(event);

      if (dragPosition) {
        pos.left += p.left - dragPosition.left;
        pos.top += p.top - dragPosition.top;
        elWrapper.style.transform = `translate(${pos.left}px, ${pos.top}px)`;
      }

      dragPosition = p;
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) {
        return;
      }

      // to stop click
      if (dragPosition) {
        justAfterDragged = true;
        setTimeout(() => {
          justAfterDragged = false;
        }, 1);

        // get back to inside screen
        const rect = elAssistant.getBoundingClientRect();
        const elHtml = document.documentElement;
        let changed = false;
        if (rect.top < 0) {
          pos.top -= rect.top;
          changed = true;
        } else if (rect.bottom > elHtml.clientHeight) {
          pos.top -= rect.bottom - elHtml.clientHeight;
          changed = true;
        }
        if (rect.left < 0) {
          pos.left -= rect.left;
          changed = true;
        } else if (rect.right > elHtml.clientWidth) {
          pos.left -= rect.right - elHtml.clientWidth;
          changed = true;
        }
        if (changed) {
          elWrapper.style.transition = 'transform 200ms';
          elWrapper.style.transform = `translate(${pos.left}px, ${pos.top}px)`;
          elWrapper.addEventListener('transitionend', () => {
            elWrapper.style.transition = '';
          }, { once: true });
        }
      }

      dragging = false;
      dragPosition = null;
    });
  }

  // ----

  // reset
  const elOld = document.querySelector('#OMEWKSHH');
  if (elOld) {
    elOld.parentElement.removeChild(elOld);
  }

  // insert
  const el = document.createElement('div');
  el.id = 'OMEWKSHH';
  document.body.appendChild(el);

  window.addEventListener('unload', () => {
    sendMessage('close');
  });

  // wait for commands
  browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === 'init') {
      init(el, message);
      draggable(el);
    } else {
      console.warn(`Unknown message type ${message.type}.`, message);
    }
  });

  // wait until background is ready
  setTimeout(() => {
    // I'm ready!
    sendMessage('ready');
  }, 1);
})();
