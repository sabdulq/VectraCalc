/* VectraCalc · Three.js enhancements
   - Progressive enhancement only. If WebGL is unavailable, the viewport is
     narrow (<=840px), or the user prefers reduced motion, this does nothing
     and the existing CSS visuals remain as the fallback.
   - Only the scene currently in the viewport renders; rendering pauses when
     the tab is hidden. Pixel ratio is capped. */
(function () {
  if (!window.THREE) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow = window.innerWidth <= 840;
  if (reduce || narrow) return;
  try {
    var probe = document.createElement('canvas');
    if (!(probe.getContext('webgl') || probe.getContext('experimental-webgl'))) return;
  } catch (e) { return; }

  var AMBER = 0xf4a62a, AMBER2 = 0xffc15e;
  var mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  var scenes = [];
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  function register(canvas, camera, scene, renderer, render, onResize) {
    var api = { canvas: canvas, camera: camera, scene: scene, renderer: renderer,
                render: render, onResize: onResize || function () {}, visible: false };
    scenes.push(api);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { api.visible = e.isIntersecting; });
    }, { threshold: 0.02 });
    io.observe(canvas.parentElement || canvas);
    // fade in
    requestAnimationFrame(function () { canvas.classList.add('v3d-on'); });
    return api;
  }

  function sizeOf(canvas) {
    var r = canvas.getBoundingClientRect();
    return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
  }

  function baseRenderer(canvas) {
    var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    r.setPixelRatio(DPR);
    var s = sizeOf(canvas);
    r.setSize(s.w, s.h, false);
    return r;
  }

  /* ---------- surface (function graph) ---------- */
  function initSurface(canvas, opts) {
    opts = opts || {};
    var renderer = baseRenderer(canvas);
    var s = sizeOf(canvas);
    var camera = new THREE.PerspectiveCamera(55, s.w / s.h, 0.1, 100);
    camera.position.set(0, opts.camY || 2.5, opts.camZ || 4.8); camera.lookAt(0, 0, 0);
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x14161b, 5, 12);
    var group = new THREE.Group(); scene.add(group);
    var SEG = 60, SIZE = 7.5;
    var geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); geo.rotateX(-Math.PI / 2);
    var mat = new THREE.MeshBasicMaterial({ color: AMBER, wireframe: true, transparent: true, opacity: opts.opacity || 0.5 });
    var mesh = new THREE.Mesh(geo, mat); group.add(mesh);
    var pmat = new THREE.PointsMaterial({ color: AMBER2, size: 0.045, transparent: true, opacity: 0.85 });
    group.add(new THREE.Points(geo, pmat));
    var pos = geo.attributes.position, base = [];
    for (var i = 0; i < pos.count; i++) base.push(pos.getX(i), pos.getZ(i));
    function wave(t) {
      for (var i = 0; i < pos.count; i++) {
        var x = base[i * 2], z = base[i * 2 + 1], d = Math.sqrt(x * x + z * z);
        pos.setY(i, Math.sin(x * 0.9 + t) * 0.33 + Math.cos(z * 0.8 - t * 0.8) * 0.3 + Math.sin(d * 1.1 - t * 1.4) * 0.26);
      }
      pos.needsUpdate = true;
    }
    wave(0);
    function render(t) {
      wave(t * 0.7);
      group.rotation.y = Math.sin(t * 0.1) * 0.25 + mouse.x * 0.3;
      group.rotation.x = -0.04 + mouse.y * 0.1;
      renderer.render(scene, camera);
    }
    function onResize() {
      var z = sizeOf(canvas); renderer.setSize(z.w, z.h, false);
      camera.aspect = z.w / z.h; camera.updateProjectionMatrix();
    }
    return register(canvas, camera, scene, renderer, render, onResize);
  }

  /* ---------- glyphs (floating math symbols) ---------- */
  function initGlyphs(canvas, opts) {
    opts = opts || {};
    var renderer = baseRenderer(canvas);
    var s = sizeOf(canvas);
    var camera = new THREE.PerspectiveCamera(55, s.w / s.h, 0.1, 100);
    camera.position.set(0, 0, 7);
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x14161b, 6, 15);
    var group = new THREE.Group(); scene.add(group);
    var syms = ['∑', 'π', '√', '∫', '×', '÷', '=', '∞', 'θ', 'Δ', 'λ', '∂'];
    function tex(sym, faint) {
      var c = document.createElement('canvas'); c.width = c.height = 128;
      var g = c.getContext('2d');
      g.font = '700 92px "Space Grotesk", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = faint ? 'rgba(145,151,163,0.5)' : '#f4a62a';
      g.shadowColor = 'rgba(244,166,42,0.65)'; g.shadowBlur = faint ? 0 : 16;
      g.fillText(sym, 64, 68);
      var t = new THREE.CanvasTexture(c); return t;
    }
    var count = opts.count || 15, items = [];
    for (var i = 0; i < count; i++) {
      var faint = Math.random() < 0.5;
      var m = new THREE.MeshBasicMaterial({ map: tex(syms[i % syms.length], faint), transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: opts.opacity || 1 });
      var sz = 0.6 + Math.random() * 0.8;
      var mesh = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), m);
      mesh.position.set((Math.random() - 0.5) * 11, (Math.random() - 0.5) * 6.5, (Math.random() - 0.5) * 6 - 1);
      mesh.userData = { rx: (Math.random() - 0.5) * 0.008, ry: (Math.random() - 0.5) * 0.012, ph: Math.random() * 6 };
      group.add(mesh); items.push(mesh);
    }
    function render(t) {
      for (var i = 0; i < items.length; i++) {
        var m = items[i];
        m.rotation.x += m.userData.rx; m.rotation.y += m.userData.ry;
        m.position.y += Math.sin(t + m.userData.ph) * 0.0016;
        if (m.position.y > 3.5) m.position.y = -3.5; else if (m.position.y < -3.5) m.position.y = 3.5;
      }
      group.rotation.y = mouse.x * 0.2; group.rotation.x = mouse.y * 0.12;
      renderer.render(scene, camera);
    }
    function onResize() {
      var z = sizeOf(canvas); renderer.setSize(z.w, z.h, false);
      camera.aspect = z.w / z.h; camera.updateProjectionMatrix();
    }
    return register(canvas, camera, scene, renderer, render, onResize);
  }

  /* ---------- phone (device with live screen) ---------- */
  function initPhone(canvas) {
    var renderer = baseRenderer(canvas);
    var s = sizeOf(canvas);
    var camera = new THREE.PerspectiveCamera(50, s.w / s.h, 0.1, 100);
    camera.position.set(0, 0, 7.4);
    var scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(3, 5, 6); scene.add(dir);
    var pl = new THREE.PointLight(AMBER, 0.9, 30); pl.position.set(-4, -2, 4); scene.add(pl);
    var phone = new THREE.Group(); scene.add(phone);
    phone.add(new THREE.Mesh(new THREE.BoxGeometry(2.5, 5.0, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x1c1f26, metalness: 0.6, roughness: 0.4 })));
    var frame = new THREE.Mesh(new THREE.BoxGeometry(2.62, 5.12, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x2c313c, metalness: 0.8, roughness: 0.3 }));
    frame.position.z = -0.02; phone.add(frame);
    var sc = document.createElement('canvas'); sc.width = 512; sc.height = 1024;
    var sg = sc.getContext('2d'); var stex = new THREE.CanvasTexture(sc);
    var screen = new THREE.Mesh(new THREE.PlaneGeometry(2.28, 4.72), new THREE.MeshBasicMaterial({ map: stex }));
    screen.position.z = 0.15; phone.add(screen);
    var readouts = [
      { l: 'Scientific', e: 'sin(45°) × √2', r: '1' },
      { l: 'Calculus', e: 'd/dx [ x² ] at x=3', r: '6' },
      { l: 'Finance', e: '$10,000 · 8% · 5y', r: '$14,693' },
      { l: 'Algebra', e: '3x + 7 = x − 1', r: 'x = −4' }
    ];
    var si = 0, typed = 0, phase = 0, last = 0;
    function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
    function draw() {
      sg.fillStyle = '#10131a'; sg.fillRect(0, 0, 512, 1024);
      sg.fillStyle = '#f4a62a'; sg.fillRect(0, 0, 512, 8);
      sg.textAlign = 'left'; sg.fillStyle = '#6b717c'; sg.font = '500 22px monospace'; sg.fillText('VECTRACALC', 30, 56);
      var s0 = readouts[si];
      sg.fillStyle = '#6b717c'; sg.font = '500 24px monospace'; sg.fillText(s0.l.toUpperCase(), 30, 150);
      sg.fillStyle = '#f3efe6'; sg.font = '600 40px monospace';
      sg.fillText(s0.e.slice(0, Math.floor(typed)) + (Math.floor(phase * 2) % 2 ? '|' : ''), 30, 230);
      if (typed >= s0.e.length) { sg.fillStyle = '#f4a62a'; sg.font = '700 64px monospace'; sg.textAlign = 'right'; sg.fillText('= ' + s0.r, 482, 340); sg.textAlign = 'left'; }
      var keys = ['sin', 'cos', '√', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+'];
      var kx = 30, ky = 470, kw = 108, kh = 108, gap = 8;
      for (var i = 0; i < keys.length; i++) {
        var cx = kx + (i % 4) * (kw + gap), cy = ky + Math.floor(i / 4) * (kh + gap), op = (i % 4 === 3);
        sg.fillStyle = op ? '#22262f' : '#1c1f26'; roundRect(sg, cx, cy, kw, kh, 16); sg.fill();
        sg.fillStyle = op ? '#5b8def' : '#9197a3'; sg.font = '500 34px monospace'; sg.textAlign = 'center';
        sg.fillText(keys[i], cx + kw / 2, cy + kh / 2 + 12); sg.textAlign = 'left';
      }
      sg.fillStyle = '#f4a62a'; roundRect(sg, 30, 470 + 4 * (kh + gap), kw * 4 + gap * 3, kh, 16); sg.fill();
      sg.fillStyle = '#1a1205'; sg.font = '700 40px monospace'; sg.textAlign = 'center'; sg.fillText('=', 256, 470 + 4 * (kh + gap) + kh / 2 + 14); sg.textAlign = 'left';
      stex.needsUpdate = true;
    }
    draw();
    function render(t) {
      if (last === 0) last = t; var dt = t - last; last = t; phase += dt;
      var s0 = readouts[si];
      if (typed < s0.e.length) { typed += dt * 14; if (typed > s0.e.length) typed = s0.e.length; }
      else if (phase > 3.0) { si = (si + 1) % readouts.length; typed = 0; phase = 0; }
      draw();
      phone.rotation.y = Math.sin(t * 0.25) * 0.32 + mouse.x * 0.45;
      phone.rotation.x = -mouse.y * 0.22;
      renderer.render(scene, camera);
    }
    function onResize() {
      var z = sizeOf(canvas); renderer.setSize(z.w, z.h, false);
      camera.aspect = z.w / z.h; camera.updateProjectionMatrix();
    }
    return register(canvas, camera, scene, renderer, render, onResize);
  }

  /* ---------- morph (scroll-driven surface) ---------- */
  function initMorph(canvas, opts) {
    opts = opts || {};
    var renderer = baseRenderer(canvas);
    var s = sizeOf(canvas);
    var camera = new THREE.PerspectiveCamera(55, s.w / s.h, 0.1, 100);
    camera.position.set(0, 2.7, 5.0); camera.lookAt(0, 0, 0);
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x14161b, 5, 13);
    var group = new THREE.Group(); scene.add(group);
    var SEG = 60, SIZE = 7.5;
    var geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); geo.rotateX(-Math.PI / 2);
    var mat = new THREE.MeshBasicMaterial({ color: AMBER, wireframe: true, transparent: true, opacity: opts.opacity || 0.5 });
    group.add(new THREE.Mesh(geo, mat));
    var pos = geo.attributes.position, base = [];
    for (var i = 0; i < pos.count; i++) base.push(pos.getX(i), pos.getZ(i));
    function fn(idx, x, z) {
      switch (idx) {
        case 0: return 0;
        case 1: return Math.sin(x) * 0.55;
        case 2: return Math.sin(x) * Math.cos(z) * 0.55;
        case 3: return (x * x - z * z) * 0.055;
        default: return Math.sin(Math.sqrt(x * x + z * z) * 1.4) * 0.55;
      }
    }
    function shape(p) {
      var seg = p * 4, i0 = Math.floor(seg), f = seg - i0, i1 = Math.min(i0 + 1, 4);
      for (var k = 0; k < pos.count; k++) {
        var x = base[k * 2], z = base[k * 2 + 1];
        pos.setY(k, fn(i0, x, z) * (1 - f) + fn(i1, x, z) * f);
      }
      pos.needsUpdate = true;
    }
    function progress() {
      var r = canvas.getBoundingClientRect();
      return Math.max(0, Math.min(1, (window.innerHeight * 0.5 - r.top) / r.height));
    }
    shape(0);
    function render(t) {
      shape(progress());
      group.rotation.y = Math.sin(t * 0.09) * 0.18;
      renderer.render(scene, camera);
    }
    function onResize() {
      var z = sizeOf(canvas); renderer.setSize(z.w, z.h, false);
      camera.aspect = z.w / z.h; camera.updateProjectionMatrix();
    }
    return register(canvas, camera, scene, renderer, render, onResize);
  }

  var INITS = { surface: initSurface, glyphs: initGlyphs, phone: initPhone, morph: initMorph };

  function boot() {
    var nodes = document.querySelectorAll('canvas.v3d');
    if (!nodes.length) return;
    var any = false;
    nodes.forEach(function (c) {
      var type = c.getAttribute('data-scene');
      if (!INITS[type]) return;
      var opts = {};
      var op = c.getAttribute('data-opacity'); if (op) opts.opacity = parseFloat(op);
      var ct = c.getAttribute('data-count'); if (ct) opts.count = parseInt(ct, 10);
      try { INITS[type](c, opts); any = true; } catch (e) {}
    });
    if (any) document.documentElement.classList.add('v3d-active');

    var start = null;
    function loop(ts) {
      if (!document.hidden) {
        if (start === null) start = ts;
        var t = (ts - start) / 1000;
        for (var i = 0; i < scenes.length; i++) if (scenes[i].visible) scenes[i].render(t);
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { scenes.forEach(function (s) { s.onResize(); }); }, 150);
    }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
