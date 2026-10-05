// A visual demo of the shipped dial. Timer actions and device sensors belong to the app.
(() => {
  'use strict';
  const demo = document.querySelector('.device-demo');
  if (!demo) return;

  const paint = demo.querySelector('.device-demo__paint');
  const ticks = demo.querySelector('.device-demo__ticks');
  const hit = demo.querySelector('.device-demo__dial-hit');
  const interaction = demo.querySelector('.device-demo__interaction');
  const systemAppearance = matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  let rotation = 90;
  let drag = null;
  let animation = null;
  // A direct appearance link also lets the two assets be inspected independently.
  const previewAppearance = new URLSearchParams(location.search).get('appearance');

  // Exact detents from ControlDiscComponent: 60 seconds, 12 minute stops, six hours.
  const stops = [];
  for (let i = 0; i <= 60; i++) stops.push({angle: i * 3, seconds: i});
  for (let i = 1; i < 12; i++) stops.push({angle: 180 + i * 7.5, seconds: i * 300});
  for (let i = 0; i <= 5; i++) stops.push({angle: 270 + i * 15, seconds: (i + 1) * 3600});

  function radialLine(angle, inner, outer, className, cap) {
    const radians = angle * Math.PI / 180;
    const line = document.createElementNS(ns, 'line');
    for (const [name, value] of Object.entries({
      x1: 200 + inner * Math.cos(radians), y1: 200 + inner * Math.sin(radians),
      x2: 200 + outer * Math.cos(radians), y2: 200 + outer * Math.sin(radians),
      class: className, 'stroke-linecap': cap
    })) line.setAttribute(name, value);
    ticks.append(line);
    return line;
  }
  for (let i = 1; i < 60; i++) {
    radialLine(-90 - i * 3, 80, 200, i % 15 === 0 ? 'tick-major' : 'tick-minor', 'square');
  }
  for (let i = 0; i < 12; i++) {
    radialLine(90 - i * 7.5, 80, 200, i % 6 === 0 ? 'tick-major' : 'tick-minor', 'butt');
  }
  for (let i = 0; i < 6; i++) {
    radialLine(-i * 15, 80, 200, i % 3 === 0 ? 'tick-major' : 'tick-minor', 'butt');
  }
  radialLine(-90, 82.5, 197.5, 'dial-pointer', 'round').setAttribute('filter', 'url(#pointer-shadow)');

  function clamp(value) { return Math.max(0, Math.min(345, value)); }
  function nearestIndex(angle) {
    let nearest = 0;
    for (let i = 1; i < stops.length; i++) {
      if (Math.abs(stops[i].angle - angle) <= Math.abs(stops[nearest].angle - angle)) nearest = i;
    }
    return nearest;
  }
  function durationText(seconds) {
    if (seconds < 60) return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
    if (seconds < 3600) return `${seconds / 60} ${seconds === 60 ? 'minute' : 'minutes'}`;
    return `${seconds / 3600} ${seconds === 3600 ? 'hour' : 'hours'}`;
  }
  function draw(angle) {
    rotation = clamp(angle);
    paint.style.transform = `rotate(${-rotation}deg)`;
    ticks.setAttribute('transform', `rotate(${rotation} 200 200)`);
    const stop = stops[nearestIndex(rotation)];
    hit.setAttribute('aria-valuenow', stop.seconds);
    hit.setAttribute('aria-valuetext', durationText(stop.seconds));
    demo.dataset.rotation = rotation.toFixed(3);
  }
  function stopAnimation() {
    if (animation !== null) cancelAnimationFrame(animation);
    animation = null;
  }
  function settle(angle) {
    stopAnimation();
    const target = stops[nearestIndex(clamp(angle))].angle;
    if (reducedMotion.matches || Math.abs(target - rotation) < .01) {
      draw(target);
      return;
    }
    const from = rotation, began = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - began) / 220);
      draw(from + (target - from) * (1 - Math.pow(1 - t, 3)));
      animation = t < 1 ? requestAnimationFrame(frame) : null;
    }
    animation = requestAnimationFrame(frame);
  }
  function angleAt(event) {
    const rect = interaction.getBoundingClientRect();
    return Math.atan2(event.clientY - rect.top - rect.height / 2,
                      event.clientX - rect.left - rect.width / 2) * 180 / Math.PI;
  }
  function angularDelta(next, previous) {
    let delta = next - previous;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return delta;
  }

  hit.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    stopAnimation();
    hit.setPointerCapture(event.pointerId);
    demo.classList.add('has-pointer-focus');
    hit.focus({preventScroll: true});
    drag = {id: event.pointerId, angle: angleAt(event), at: event.timeStamp, velocity: 0};
    demo.classList.add('is-dragging');
  });
  hit.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const next = angleAt(event);
    const delta = angularDelta(next, drag.angle);
    const elapsed = event.timeStamp - drag.at;
    if (elapsed > 0) drag.velocity = delta / elapsed;
    drag.angle = next;
    drag.at = event.timeStamp;
    draw(rotation + delta);
  });
  function endDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    // A small release carry keeps the dial tactile; long pauses release at the current stop.
    const carry = event.type === 'pointerup' && event.timeStamp - drag.at < 80
      ? Math.max(-12, Math.min(12, drag.velocity * 20)) : 0;
    drag = null;
    demo.classList.remove('is-dragging');
    if (hit.hasPointerCapture(event.pointerId)) hit.releasePointerCapture(event.pointerId);
    settle(rotation + carry);
  }
  hit.addEventListener('pointerup', endDrag);
  hit.addEventListener('pointercancel', endDrag);
  hit.addEventListener('lostpointercapture', event => {
    if (drag?.id === event.pointerId) endDrag(event);
  });
  hit.addEventListener('blur', () => demo.classList.remove('has-pointer-focus'));
  hit.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const index = nearestIndex(rotation);
    let next;
    switch (event.key) {
      case 'ArrowRight': case 'ArrowUp': next = Math.min(stops.length - 1, index + 1); break;
      case 'ArrowLeft': case 'ArrowDown': next = Math.max(0, index - 1); break;
      case 'PageUp': next = Math.min(stops.length - 1, index + 5); break;
      case 'PageDown': next = Math.max(0, index - 5); break;
      case 'Home': next = 0; break;
      case 'End': next = stops.length - 1; break;
      default: return;
    }
    event.preventDefault();
    demo.classList.remove('has-pointer-focus');
    stopAnimation();
    draw(stops[next].angle);
  });

  function setAppearance(dark) {
    document.documentElement.dataset.appearance = dark ? 'dark' : 'light';
    demo.querySelectorAll('source').forEach(source => { source.media = dark ? 'all' : 'not all'; });
    document.querySelectorAll('.device-fallback source').forEach(source => { source.media = dark ? 'all' : 'not all'; });
  }
  systemAppearance.addEventListener('change', event => {
    if (previewAppearance !== 'light' && previewAppearance !== 'dark') setAppearance(event.matches);
  });
  setAppearance(previewAppearance === 'dark' || (previewAppearance !== 'light' && systemAppearance.matches));
  draw(rotation);

  // Preserve the native static image if an interactive layer cannot load.
  Promise.all(Array.from(demo.querySelectorAll('img'), image => image.decode())).then(() => {
    document.querySelector('.device-fallback').hidden = true;
    demo.hidden = false;
  }).catch(() => {});
})();
