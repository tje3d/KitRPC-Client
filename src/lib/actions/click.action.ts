interface ClickParams {
  scale?: number;
  duration?: number;
  disable?: boolean;
}

export default function Click(node: HTMLElement, vars?: ClickParams) {
  // SSR guard - only run in browser environment
  if (typeof window === 'undefined') {
    return {
      update() {},
      destroy() {}
    };
  }

  const scale = vars?.scale || 0.9;
  const config = { scale: [null, scale], duration: 0.1, ...vars };
  const duration = (vars?.duration || 0.1) * 1000; // Convert seconds to ms

  let disable = !!vars?.disable;
  let wasPress = false;
  let goesLeave = false;
  let isRelease = false;

  function handlePress(e: MouseEvent | TouchEvent) {
    if (disable) return;

    node.animate([{ transform: `scale(${scale})` }], {
      duration: duration,
      fill: 'forwards',
      easing: 'ease-out'
    });
    wasPress = true;
    goesLeave = false;
    isRelease = false;
  }

  function handleRelease(e: MouseEvent | TouchEvent) {
    if (disable) return;

    if (goesLeave) {
      return;
    }

    isRelease = true;

    node.animate([{ transform: 'scale(1)' }], {
      duration: duration,
      fill: 'forwards',
      easing: 'ease-out'
    });
  }

  function handleMouseLeave() {
    if (disable) return;
    if (!wasPress) return;
    if (goesLeave) return;
    if (isRelease) return;

    goesLeave = true;

    node.animate([{ transform: 'scale(1)' }], {
      duration: duration,
      fill: 'forwards',
      easing: 'ease-out'
    });
  }

  function handleTouchMoveOut(e: TouchEvent) {
    if (disable) return;
    if (!wasPress) return;
    if (goesLeave) return;
    if (isRelease) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const rect = node.getBoundingClientRect();
    const isOutside =
      touch.clientX < rect.left ||
      touch.clientX > rect.right ||
      touch.clientY < rect.top ||
      touch.clientY > rect.bottom;

    if (isOutside) {
      goesLeave = true;
      node.animate([{ transform: 'scale(1)' }], {
        duration: duration,
        fill: 'forwards',
        easing: 'ease-out'
      });
    }
  }

  node.addEventListener('mousedown', handlePress);
  node.addEventListener('mouseup', handleRelease);
  node.addEventListener('mouseleave', handleMouseLeave);
  node.addEventListener('touchstart', handlePress, { passive: true });
  node.addEventListener('touchend', handleRelease);
  node.addEventListener('touchcancel', handleRelease);
  node.addEventListener('touchmove', handleTouchMoveOut, { passive: true });

  return {
    update(params?: ClickParams) {
      disable = !!params?.disable;
    },
    destroy() {
      node.removeEventListener('mousedown', handlePress);
      node.removeEventListener('mouseup', handleRelease);
      node.removeEventListener('mouseleave', handleMouseLeave);
      node.removeEventListener('touchstart', handlePress);
      node.removeEventListener('touchend', handleRelease);
      node.removeEventListener('touchcancel', handleRelease);
      node.removeEventListener('touchmove', handleTouchMoveOut);
    }
  };
}
