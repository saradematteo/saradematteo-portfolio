(function () {
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;

  // One shared timeline drives the nozzle and the reveal mask, so deposited
  // sauce never leads the bottle or continues while it moves between strokes.
  function sampleFrame(ms, pointAtProgress) {
    const left = smooth((ms - 600) / 450);
    const right = smooth((ms - 1550) / 450);
    const mouth = clamp((ms - 2600) / 2100);
    let x = 25, y = 14.6, angle = 18, squeeze = 0, opacity = 1;
    if (ms < 600) {
      const t = smooth(ms / 600);
      x = mix(95, 25, t); y = mix(-30, 14.6, t);
      opacity = t; angle = mix(35, 18, t);
    } else if (ms < 1050) {
      squeeze = Math.sin(Math.PI * left);
    } else if (ms < 1550) {
      const t = smooth((ms - 1050) / 500);
      x = mix(25, 75, t); y = mix(14.6, 14.5, t) - 14 * Math.sin(Math.PI * t);
    } else if (ms < 2000) {
      x = 75; y = 14.5; squeeze = Math.sin(Math.PI * right);
    } else if (ms < 2600) {
      const t = smooth((ms - 2000) / 600);
      x = mix(75, 7, t); y = mix(14.5, 46, t) - 18 * Math.sin(Math.PI * t);
    } else if (ms < 4700) {
      const point = pointAtProgress(mouth);
      x = point.x; y = point.y; angle = 18 + 5 * Math.sin(Math.PI * mouth);
      squeeze = .6 + .15 * Math.sin(mouth * Math.PI * 4);
    } else {
      const t = smooth((ms - 4700) / 800);
      x = mix(93.5, 125, t); y = mix(46, -40, t);
      angle = mix(18, 35, t); opacity = 1 - t;
    }
    return { left, right, mouth, x, y, angle, squeeze, opacity, done:ms >= 5500 };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { sampleFrame };
  if (typeof document === 'undefined') return;
  const smile = document.querySelector('.sauce-smile');
  if (!smile) return;
  const bottle = smile.querySelector('.sauce-bottle');
  const leftEye = smile.querySelector('.sauce-deposit-left');
  const rightEye = smile.querySelector('.sauce-deposit-right');
  const mouth = smile.querySelector('.sauce-deposit-mouth');
  const length = mouth.getTotalLength();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, started = false, ready = false, visible = false;

  function render(frame) {
    leftEye.setAttribute('r', String(frame.left * 5));
    rightEye.setAttribute('r', String(frame.right * 5));
    mouth.style.strokeDasharray = `${length} ${length}`;
    mouth.style.strokeDashoffset = String(length * (1 - frame.mouth));
    mouth.style.opacity = frame.mouth > 0 ? '1' : '0';
    bottle.style.left = `${frame.x}%`;
    bottle.style.top = `${frame.y}%`;
    bottle.style.opacity = String(frame.opacity);
    bottle.style.transform = `translate(-50%,-100%) rotate(${frame.angle}deg) scale(${1 - frame.squeeze * .08},${1 + frame.squeeze * .015})`;
  }
  const pointAtProgress = progress => mouth.getPointAtLength(progress * length);
  function finish() {
    cancelAnimationFrame(raf);
    render(sampleFrame(5500, pointAtProgress));
  }
  function play() {
    if (!ready || motion.matches) return;
    cancelAnimationFrame(raf);
    started = true;
    const start = performance.now();
    const tick = now => {
      const frame = sampleFrame(now - start, pointAtProgress);
      render(frame);
      if (!frame.done) raf = requestAnimationFrame(tick);
    };
    render(sampleFrame(0, pointAtProgress));
    raf = requestAnimationFrame(tick);
  }
  if (!motion.matches) render(sampleFrame(0, pointAtProgress));
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && ready && !started) play();
  }, { threshold:.7 });
  observer.observe(smile);
  const sauceAsset = new Image();
  sauceAsset.src = 'assets/sauce-smile-thin.png';
  Promise.all([bottle.decode(), sauceAsset.decode()]).then(() => {
    ready = true;
    if (visible && !started) play();
  }).catch(finish);
  smile.addEventListener('click', play);
  motion.addEventListener('change', finish);
  document.addEventListener('visibilitychange', () => { if (document.hidden && started) finish(); });
})();
