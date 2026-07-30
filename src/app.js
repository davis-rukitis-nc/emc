const qs = (selector, context = document) => context.querySelector(selector);
const qsa = (selector, context = document) => [...context.querySelectorAll(selector)];
const NS = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}, text = '') => {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (text) node.textContent = text;
  return node;
};
const format = value => new Intl.NumberFormat('en-GB').format(Math.round(Number(value) || 0));
const load = name => fetch(`/assets/data/${name}`).then(response => {
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  return response.json();
});

function initMenu() {
  const button = qs('[data-menu-button]');
  const menu = qs('[data-mobile-menu]');
  if (!button || !menu) return;

  button.addEventListener('click', () => {
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
  });

  qsa('a', menu).forEach(link => link.addEventListener('click', () => {
    menu.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  }));
}

function initScroll() {
  const header = qs('[data-header]');
  const progress = qs('.page-progress span');
  const links = qsa('.desktop-nav a[href^="#"]');
  const sections = qsa('[data-section]');

  const update = () => {
    header?.classList.toggle('scrolled', scrollY > 20);
    if (progress) {
      const maximum = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${maximum ? scrollY / maximum * 100 : 0}%`;
    }
  };

  addEventListener('scroll', update, { passive: true });
  update();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.dataset.section;
      links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
    });
  }, { rootMargin: '-35% 0px -58%', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

function initReveal() {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    qsa('.reveal').forEach(node => node.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      qsa('[data-draw-path]', entry.target).forEach(path => path.style.strokeDashoffset = '0');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  qsa('.reveal').forEach(node => observer.observe(node));
}

function initCounts() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const destination = Number(element.dataset.count);
      const started = performance.now();
      const duration = 1150;

      const tick = time => {
        const progress = Math.min(1, (time - started) / duration);
        const value = destination * (1 - Math.pow(1 - progress, 3));
        element.textContent = format(value);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      observer.unobserve(element);
    });
  }, { threshold: 0.5 });

  qsa('[data-count]').forEach(node => observer.observe(node));
}

const HERO_RINGS = [
  { city: 'Rome', date: '14 March', colour: '#E2181A' },
  { city: 'Vienna', date: '18 April', colour: '#3F4997' },
  { city: 'Madrid', date: '25 April', colour: '#3DADE3' },
  { city: 'London', date: '24 April', colour: '#C14692' },
  { city: 'Rimi Riga Marathon', date: '15–16 May', colour: '#40B07A', riga: true },
  { city: 'Warsaw', date: '27 September', colour: '#F7B601' },
  { city: 'Lisbon', date: '10 October', colour: '#9F5198' },
  { city: 'Frankfurt', date: '25 October', colour: '#ED752D' },
  { city: 'Copenhagen', date: '9 May', colour: '#D0CFD0' },
  { city: 'The circle continues', date: '', colour: '#00609C' }
];

function initHeroRings() {
  const group = qs('#hero-ring-list');
  const label = qs('#ring-detail-label');
  const date = qs('#ring-detail-date');
  if (!group) return;

  HERO_RINGS.forEach((ring, index) => {
    const radius = 350 - index * 31.5;
    const circle = svg('circle', {
      cx: 380,
      cy: 380,
      r: radius,
      stroke: ring.colour,
      class: `hero-ring${ring.riga ? ' riga' : ''}`,
      tabindex: '0',
      role: 'button',
      'aria-label': ring.date ? `${ring.city}, ${ring.date}` : ring.city
    });

    circle.style.setProperty('--i', index);
    circle.style.color = ring.colour;
    const length = 2 * Math.PI * radius;
    circle.style.strokeDasharray = length;
    circle.style.strokeDashoffset = length;

    const show = () => {
      label.textContent = ring.city;
      date.textContent = ring.date;
      date.hidden = !ring.date;
    };

    circle.addEventListener('mouseenter', show);
    circle.addEventListener('focus', show);
    group.append(circle);

    requestAnimationFrame(() => setTimeout(() => {
      circle.style.transition = `stroke-dashoffset 1.15s cubic-bezier(.2,.75,.2,1) ${index * 0.065}s, stroke-width .3s, filter .3s, opacity .3s, transform .3s`;
      circle.style.strokeDashoffset = '0';
    }, 30));
  });
}

const CLASSICS_SHIFTS = [-10, 18, -18, 14, -28, 4, 25, -8, 12];
function readableText(colour) {
  return ['#F7B601', '#3DADE3', '#D0CFD0', '#40B07A'].includes(colour.toUpperCase()) ? '#07120d' : '#ffffff';
}

function renderClassicsSequence(target, cities) {
  const node = typeof target === 'string' ? qs(target) : target;
  if (!node) return;
  node.innerHTML = cities.map((city, index) => `
    <article class="classics-race${city.candidate ? ' riga' : ''}" data-city="${city.city}" style="--city:${city.colour};--ink:${readableText(city.colour)};--shift:${CLASSICS_SHIFTS[index] || 0}px">
      <strong>${city.city}</strong><span>${city.date}</span>
    </article>`).join('');
}

function renderHeroCalendar(cities) {
  renderClassicsSequence('#hero-classics-sequence', cities);
}

const DISTANCE_COLOURS = {
  all: '#D0CFD0',
  mile: '#F7B601',
  short: '#3DADE3',
  tenKm: '#ED752D',
  half: '#9F5198',
  marathon: '#40B07A'
};

function renderDistances(rows) {
  const node = qs('#distance-chart');
  if (!node) return;
  const distances = rows.filter(row => !row.distance.includes('Relay'));
  const maximum = Math.max(...distances.map(row => row.finishers));
  const colours = [
    DISTANCE_COLOURS.mile,
    DISTANCE_COLOURS.short,
    DISTANCE_COLOURS.tenKm,
    DISTANCE_COLOURS.half,
    DISTANCE_COLOURS.marathon
  ];

  node.innerHTML = distances.map((distance, index) => `
    <div class="distance-row" style="--bar:${colours[index]}">
      <span class="distance-label">${distance.distance}</span>
      <span class="distance-track"><i class="distance-fill" style="--width:${(distance.finishers / maximum * 100).toFixed(1)}%"></i></span>
      <span class="distance-value">${format(distance.finishers)}</span>
      <span class="distance-share">${distance.share}%</span>
    </div>`).join('');
}

function linePath(points) {
  if (points.length < 2) return '';
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let index = 0; index < points.length - 1; index++) {
    const p0 = points[index - 1] || points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return path;
}

const GROWTH_METRICS = [
  { key: 'registered', label: 'All participants', colour: DISTANCE_COLOURS.all },
  { key: 'mile', label: 'DPD mile', colour: DISTANCE_COLOURS.mile },
  { key: 'short', label: '5 km', colour: DISTANCE_COLOURS.short },
  { key: 'tenKm', label: '10 km', colour: DISTANCE_COLOURS.tenKm },
  { key: 'half', label: 'Half marathon', colour: DISTANCE_COLOURS.half },
  { key: 'marathon', label: 'Marathon', colour: DISTANCE_COLOURS.marathon }
];

function renderGrowthSwitcher(reach) {
  const node = qs('#growth-metrics');
  if (!node) return;
  node.innerHTML = GROWTH_METRICS.map((metric, index) => `<button class="${index === 0 ? 'active' : ''}" data-metric="${metric.key}" style="--metric:${metric.colour}">${metric.label}</button>`).join('');
  node.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    qsa('button', node).forEach(item => item.classList.toggle('active', item === button));
    renderGrowthChart(reach, button.dataset.metric);
  });
}

function renderGrowthChart(reach, key = 'registered') {
  const node = qs('#growth-chart');
  const tooltip = qs('#growth-tooltip');
  if (!node) return;

  const metric = GROWTH_METRICS.find(item => item.key === key) || GROWTH_METRICS[0];
  const rows = reach.filter(row => Number.isFinite(Number(row[key])) && Number(row[key]) > 0);
  const W = 1200;
  const H = 460;
  const padding = { left: 72, right: 32, top: 34, bottom: 62 };
  const years = rows.map(row => row.year);
  const values = rows.map(row => Number(row[key]));
  const minimumYear = Math.min(...years);
  const maximumYear = Math.max(...years);
  const maximumValue = Math.max(...values) * 1.1;
  const x = value => padding.left + (value - minimumYear) / (maximumYear - minimumYear) * (W - padding.left - padding.right);
  const y = value => H - padding.bottom - value / maximumValue * (H - padding.top - padding.bottom);

  node.innerHTML = '';
  const defs = svg('defs');
  const gradient = svg('linearGradient', { id: 'growth-gradient', x1: '0', y1: '0', x2: '0', y2: '1' });
  gradient.append(svg('stop', { offset: '0%', 'stop-color': metric.colour, 'stop-opacity': '.32' }));
  gradient.append(svg('stop', { offset: '100%', 'stop-color': metric.colour, 'stop-opacity': '0' }));
  defs.append(gradient);
  node.append(defs);

  for (let index = 0; index <= 4; index++) {
    const value = maximumValue / 4 * index;
    const yy = y(value);
    node.append(svg('line', { x1: padding.left, y1: yy, x2: W - padding.right, y2: yy, class: 'chart-grid' }));
    node.append(svg('text', { x: padding.left - 13, y: yy + 4, 'text-anchor': 'end', class: 'chart-axis' }, value >= 1000 ? `${Math.round(value / 1000)}K` : Math.round(value)));
  }

  for (let year = Math.ceil(minimumYear / 5) * 5; year <= maximumYear; year += 5) {
    node.append(svg('line', { x1: x(year), y1: padding.top, x2: x(year), y2: H - padding.bottom, class: 'chart-grid' }));
    node.append(svg('text', { x: x(year), y: H - 24, 'text-anchor': 'middle', class: 'chart-axis' }, year));
  }
  if (minimumYear % 5 !== 0) node.append(svg('text', { x: x(minimumYear), y: H - 24, 'text-anchor': 'start', class: 'chart-axis' }, minimumYear));

  const points = rows.map(row => [x(row.year), y(Number(row[key]))]);
  const pathData = linePath(points);
  node.append(svg('path', { d: `${pathData} L ${points.at(-1)[0]} ${H - padding.bottom} L ${points[0][0]} ${H - padding.bottom} Z`, class: 'chart-area' }));
  const path = svg('path', { d: pathData, class: 'chart-line', 'data-draw-path': 'true' });
  path.style.stroke = metric.colour;
  node.append(path);

  requestAnimationFrame(() => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    requestAnimationFrame(() => path.style.strokeDashoffset = '0');
  });

  rows.forEach((row, index) => node.append(svg('circle', { cx: points[index][0], cy: points[index][1], r: 3, class: 'chart-dot', fill: metric.colour, opacity: .65 })));

  [2020, 2021].forEach((pandemicYear, pandemicIndex) => {
    const rowIndex = rows.findIndex(row => row.year === pandemicYear);
    if (rowIndex < 0) return;
    const [px, py] = points[rowIndex];
    node.append(svg('line', { x1: px, y1: padding.top + 8, x2: px, y2: H - padding.bottom, class: 'chart-event-line' }));
    node.append(svg('circle', { cx: px, cy: py, r: 6, class: 'chart-event-dot', stroke: metric.colour }));
    node.append(svg('text', { x: px + (pandemicIndex ? 8 : -8), y: padding.top + 1, 'text-anchor': pandemicIndex ? 'start' : 'end', class: 'chart-event-label' }, `${pandemicYear} · pandemic`));
  });

  const hoverLine = svg('line', { y1: padding.top, y2: H - padding.bottom, class: 'chart-hover-line', opacity: 0 });
  const hoverPoint = svg('circle', { r: 7, fill: '#090909', stroke: metric.colour, 'stroke-width': 3, opacity: 0 });
  node.append(hoverLine, hoverPoint);
  const overlay = svg('rect', { x: padding.left, y: padding.top, width: W - padding.left - padding.right, height: H - padding.top - padding.bottom, fill: 'transparent', style: 'cursor:crosshair' });
  node.append(overlay);

  overlay.addEventListener('pointermove', event => {
    const point = node.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(node.getScreenCTM().inverse());
    let closestIndex = 0;
    let closestDistance = Infinity;
    points.forEach((candidate, index) => {
      const distance = Math.abs(candidate[0] - local.x);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const [px, py] = points[closestIndex];
    const row = rows[closestIndex];
    hoverLine.setAttribute('x1', px);
    hoverLine.setAttribute('x2', px);
    hoverLine.setAttribute('opacity', '1');
    hoverPoint.setAttribute('cx', px);
    hoverPoint.setAttribute('cy', py);
    hoverPoint.setAttribute('opacity', '1');

    if (tooltip) {
      tooltip.hidden = false;
      tooltip.innerHTML = `<span>${row.year}</span><strong>${format(row[key])}</strong>${metric.label}`;
      const bounds = node.getBoundingClientRect();
      tooltip.style.left = `${event.clientX - bounds.left}px`;
      tooltip.style.top = `${event.clientY - bounds.top}px`;
    }
  });

  overlay.addEventListener('pointerleave', () => {
    hoverLine.setAttribute('opacity', '0');
    hoverPoint.setAttribute('opacity', '0');
    if (tooltip) tooltip.hidden = true;
  });
}

function renderSimpleLine(target, rows, key, colour = '#40B07A') {
  const node = qs(target);
  if (!node) return;
  const filtered = rows.filter(row => Number(row[key]) > 0);
  const W = 1200;
  const H = 400;
  const padding = { left: 94, right: 42, top: 34, bottom: 55 };
  const minimumYear = Math.min(...filtered.map(row => row.year));
  const maximumYear = Math.max(...filtered.map(row => row.year));
  const maximumValue = Math.max(...filtered.map(row => Number(row[key]))) * 1.16;
  const x = value => padding.left + (value - minimumYear) / (maximumYear - minimumYear) * (W - padding.left - padding.right);
  const y = value => H - padding.bottom - value / maximumValue * (H - padding.top - padding.bottom);

  node.innerHTML = '';
  const defs = svg('defs');
  const gradient = svg('linearGradient', { id: 'kids-gradient', x1: '0', y1: '0', x2: '0', y2: '1' });
  gradient.append(svg('stop', { offset: '0%', 'stop-color': colour, 'stop-opacity': '.3' }));
  gradient.append(svg('stop', { offset: '100%', 'stop-color': colour, 'stop-opacity': '0' }));
  defs.append(gradient);
  node.append(defs);

  for (let index = 0; index <= 4; index++) {
    const value = maximumValue / 4 * index;
    const yy = y(value);
    node.append(svg('line', { x1: padding.left, y1: yy, x2: W - padding.right, y2: yy, class: 'chart-grid' }));
    node.append(svg('text', { x: padding.left - 16, y: yy + 4, 'text-anchor': 'end', class: 'chart-axis' }, `${Math.round(value / 1000)}K`));
  }

  filtered.forEach(row => node.append(svg('text', { x: x(row.year), y: H - 22, 'text-anchor': 'middle', class: 'chart-axis' }, row.year)));
  const points = filtered.map(row => [x(row.year), y(Number(row[key]))]);
  const pathData = linePath(points);
  node.append(svg('path', { d: `${pathData} L ${points.at(-1)[0]} ${H - padding.bottom} L ${points[0][0]} ${H - padding.bottom} Z`, fill: 'url(#kids-gradient)' }));
  const path = svg('path', { d: pathData, class: 'chart-line', 'data-draw-path': 'true', stroke: colour });
  node.append(path);

  requestAnimationFrame(() => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
  });

  filtered.forEach((row, index) => {
    const [px, py] = points[index];
    node.append(svg('circle', { cx: px, cy: py, r: 5, fill: '#090909', stroke: colour, 'stroke-width': 3 }));
    const anchor = index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle';
    const labelX = index === 0 ? px + 10 : index === points.length - 1 ? px - 10 : px;
    node.append(svg('text', { x: labelX, y: py - 14, 'text-anchor': anchor, class: 'chart-label' }, format(row[key])));
  });
}

const SEGMENTS = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
function initDigital() {
  qsa('[data-digital]').forEach(node => {
    for (const character of node.dataset.digital) {
      if (/\d/.test(character)) {
        const digit = document.createElement('span');
        digit.className = 'digital-char';
        for (const segmentName of 'abcdefg') {
          const segment = document.createElement('i');
          segment.className = `segment ${segmentName}${SEGMENTS[character].includes(segmentName) ? ' on' : ''}`;
          digit.append(segment);
        }
        node.append(digit);
      } else if (character === ':') {
        const colon = document.createElement('span');
        colon.className = 'digital-char colon';
        colon.innerHTML = '<i class="digital-pip"></i><i class="digital-pip"></i>';
        node.append(colon);
      } else if (character === '.') {
        const dot = document.createElement('span');
        dot.className = 'digital-char dot';
        dot.innerHTML = '<i class="digital-pip"></i>';
        node.append(dot);
      }
    }
  });
}

function attachTilt(card, strength = 6) {
  let frame;
  const reset = () => card.style.transform = '';
  card.addEventListener('pointermove', event => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      card.style.transform = `perspective(1100px) rotateX(${(-y * strength).toFixed(2)}deg) rotateY(${(x * strength * 1.2).toFixed(2)}deg) translateY(-3px)`;
    });
  });
  card.addEventListener('pointerleave', reset);
  card.addEventListener('blur', reset, true);
}

function initTilt() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  qsa('[data-tilt]').forEach(card => attachTilt(card, 5));
}

function initMedalTilt() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  qsa('[data-medal-tilt]').forEach(art => {
    let frame;
    art.addEventListener('pointermove', event => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = art.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        const image = art.querySelector('img');
        if (image) image.style.transform = `perspective(900px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg) scale(1.045)`;
      });
    });
    art.addEventListener('pointerleave', () => {
      const image = art.querySelector('img');
      if (image) image.style.transform = '';
    });
  });
}

function initRecordShowcase() {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stages = qsa('.record-stage');
  if (reducedMotion) {
    stages.forEach(stage => stage.classList.add('record-ready'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('record-ready');
      observer.unobserve(entry.target);
    });
  }, { threshold: .3 });
  stages.forEach(stage => observer.observe(stage));
}

function initLabelPhysics() {
  const container = qs('#label-physics');
  if (!container) return;
  const addFallback = () => {
    if (container.querySelector('.physics-fallback-ball')) return;
    const assets = [
      ...Array(5).fill('/assets/brand/world-athletics-label-2026.svg'),
      ...Array(9).fill('/assets/brand/emc-rings-only.svg')
    ];
    assets.forEach((src, index) => {
      const image = document.createElement('img');
      image.className = 'physics-fallback-ball';
      image.src = src;
      image.alt = '';
      image.style.width = `${index < 5 ? 92 + (index % 3) * 14 : 70 + (index % 4) * 9}px`;
      image.style.left = `${10 + (index % 5) * 19}%`;
      image.style.top = `${16 + Math.floor(index / 5) * 45 + (index % 2) * 7}%`;
      image.style.animationDelay = `${index * -.37}s`;
      container.append(image);
    });
  };
  if (!window.Matter) {
    addFallback();
    return;
  }
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { Engine, Render, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = window.Matter;
  let engine;
  let render;
  let runner;
  let resizeTimer;

  const destroy = () => {
    if (render) {
      Render.stop(render);
      render.canvas?.remove();
      render.textures = {};
    }
    if (runner) Runner.stop(runner);
    if (engine) {
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    }
    engine = null;
    render = null;
    runner = null;
  };

  const build = () => {
    destroy();
    const width = Math.max(320, container.clientWidth);
    const height = Math.max(420, container.clientHeight);
    const compact = width < 700;
    const scale = compact ? .72 : Math.min(1, width / 1200);

    engine = Engine.create({ enableSleeping: false });
    engine.gravity.y = reducedMotion ? .2 : .62;
    engine.gravity.scale = .001;

    render = Render.create({
      element: container,
      engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: Math.min(devicePixelRatio || 1, 2)
      }
    });
    render.canvas.setAttribute('aria-hidden', 'true');
    render.canvas.style.touchAction = 'pan-y';

    const wall = 80;
    const walls = [
      Bodies.rectangle(width / 2, -wall / 2, width + wall * 2, wall, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(width / 2, height + wall / 2, width + wall * 2, wall, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(-wall / 2, height / 2, wall, height + wall * 2, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(width + wall / 2, height / 2, wall, height + wall * 2, { isStatic: true, render: { visible: false } })
    ];

    const labelRadii = [62, 54, 58, 50, 64].map(radius => radius * scale);
    const ringRadii = [46, 40, 52, 43, 37, 48, 34, 42, 38].map(radius => radius * scale);
    const bodies = [];

    const makeBody = (radius, texture, imageSize, index, type) => {
      const columns = compact ? 3 : 5;
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = width * (.15 + column / Math.max(columns - 1, 1) * .7) + (Math.random() - .5) * 28;
      const y = 70 + row * (compact ? 115 : 135) + (Math.random() - .5) * 24;
      const body = Bodies.circle(x, y, radius, {
        restitution: .97,
        friction: .012,
        frictionStatic: .01,
        frictionAir: .005,
        density: .0025,
        render: {
          sprite: {
            texture,
            xScale: radius * 2 / imageSize,
            yScale: radius * 2 / imageSize
          }
        }
      });
      Body.setVelocity(body, { x: (Math.random() - .5) * 2.2, y: (Math.random() - .5) * 1.2 });
      Body.setAngularVelocity(body, (Math.random() - .5) * (type === 'label' ? .025 : .05));
      bodies.push(body);
    };

    labelRadii.forEach((radius, index) => makeBody(radius, '/assets/brand/world-athletics-label-2026.svg', 75, index, 'label'));
    ringRadii.forEach((radius, index) => makeBody(radius, '/assets/brand/emc-rings-only.svg', 100, index + 5, 'ring'));

    Composite.add(engine.world, [...walls, ...bodies]);

    if (!compact) {
      const mouse = Mouse.create(render.canvas);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: .18, render: { visible: false } }
      });
      Composite.add(engine.world, mouseConstraint);
      render.mouse = mouse;
      // Keep drag interaction, but let trackpads and mouse wheels scroll the page.
      if (mouse.mousewheel) {
        render.canvas.removeEventListener('mousewheel', mouse.mousewheel);
        render.canvas.removeEventListener('DOMMouseScroll', mouse.mousewheel);
        render.canvas.removeEventListener('wheel', mouse.mousewheel);
      }
    }

    if (!reducedMotion) {
      let cycleStarted = performance.now();
      let lifted = false;
      let scattered = false;
      Events.on(engine, 'beforeUpdate', () => {
        const now = performance.now();
        const cycleLength = 4300;
        const phase = (now - cycleStarted) / cycleLength;

        if (phase >= 1) {
          cycleStarted = now;
          lifted = false;
          scattered = false;
        }

        // Gravity remains present, while time slows for longer as the objects hang in the air.
        const slowWindow = phase > .18 && phase < .72;
        engine.timing.timeScale = slowWindow ? .34 : .82 + Math.sin(now / 780) * .08;
        engine.gravity.y = .92 + Math.sin(now / 2100) * .08;
        engine.gravity.x = Math.sin(now / 1700) * .08;

        // Lift the full field together, then throw the objects sideways while they are still falling.
        if (!lifted && phase > .08) {
          lifted = true;
          bodies.forEach((body, index) => {
            const spread = (index - (bodies.length - 1) / 2) * .24;
            Body.setVelocity(body, {
              x: spread + (Math.random() - .5) * 2.8,
              y: -(8.4 + Math.random() * 3.2)
            });
            Body.setAngularVelocity(body, (Math.random() - .5) * .18);
          });
        }

        if (!scattered && phase > .43) {
          scattered = true;
          const direction = Math.random() > .5 ? 1 : -1;
          bodies.forEach((body, index) => {
            const alternating = index % 2 ? -direction : direction;
            Body.setVelocity(body, {
              x: body.velocity.x + alternating * (4.6 + Math.random() * 4.8),
              y: body.velocity.y - (1.4 + Math.random() * 2.6)
            });
            Body.setAngularVelocity(body, body.angularVelocity + alternating * (.08 + Math.random() * .11));
          });
        }

        bodies.forEach((body, index) => {
          // A light current avoids dead-looking trajectories.
          Body.applyForce(body, body.position, {
            x: Math.cos(now / 720 + index * .67) * body.mass * .000045,
            y: Math.sin(now / 810 + index * .53) * body.mass * .000018
          });

          // Do not allow objects to sit on the floor between cycles.
          if (body.position.y > height - body.circleRadius - 16 && Math.abs(body.velocity.y) < 2.2) {
            Body.setVelocity(body, {
              x: body.velocity.x + (Math.random() - .5) * 3.4,
              y: -(3.2 + Math.random() * 2.5)
            });
          }
        });
      });
    }

    runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);
  };

  build();
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 180);
  }).observe(container);
}

function mercator(lat, lon, zoom) {
  const size = 256 * 2 ** zoom;
  const sine = Math.sin(lat * Math.PI / 180);
  return {
    x: (lon + 180) / 360 * size,
    y: (.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * size
  };
}

function fitMap(coords, width, height, padding = 55) {
  for (let zoom = 16; zoom >= 2; zoom--) {
    const points = coords.map(([lon, lat]) => mercator(lat, lon, zoom));
    const xs = points.map(point => point.x);
    const ys = points.map(point => point.y);
    if (Math.max(...xs) - Math.min(...xs) <= width - padding * 2 && Math.max(...ys) - Math.min(...ys) <= height - padding * 2) {
      return { zoom, points };
    }
  }
  return { zoom: 2, points: coords.map(([lon, lat]) => mercator(lat, lon, 2)) };
}

function createTileMap(container, coords, options = {}) {
  const width = container.clientWidth || 1000;
  const height = container.clientHeight || 650;
  const fit = fitMap(coords, width, height, options.padding || 70);
  const zoom = options.zoom || fit.zoom;
  const projected = coords.map(([lon, lat]) => mercator(lat, lon, zoom));
  const xs = projected.map(point => point.x);
  const ys = projected.map(point => point.y);
  const defaultCenter = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  const center = options.center ? mercator(options.center[1], options.center[0], zoom) : defaultCenter;
  const visualScale = Number(options.visualScale || 1);
  const origin = { x: center.x - width / (2 * visualScale), y: center.y - height / (2 * visualScale) };

  container.innerHTML = '';
  const tiles = document.createElement('div');
  tiles.className = 'tile-layer';
  container.append(tiles);

  const startX = Math.floor(origin.x / 256) - 1;
  const endX = Math.ceil((origin.x + width / visualScale) / 256) + 1;
  const startY = Math.floor(origin.y / 256) - 1;
  const endY = Math.ceil((origin.y + height / visualScale) / 256) + 1;
  const tileCount = 2 ** zoom;

  for (let tileX = startX; tileX <= endX; tileX++) {
    for (let tileY = startY; tileY <= endY; tileY++) {
      if (tileY < 0 || tileY >= tileCount) continue;
      const image = document.createElement('img');
      const wrappedX = ((tileX % tileCount) + tileCount) % tileCount;
      const subdomain = ['a', 'b', 'c'][Math.abs(tileX + tileY) % 3];
      image.alt = '';
      image.decoding = 'async';
      image.referrerPolicy = 'no-referrer';
      image.src = `https://${subdomain}.basemaps.cartocdn.com/dark_nolabels/${zoom}/${wrappedX}/${tileY}.png`;
      image.style.width = `${256 * visualScale}px`;
      image.style.height = `${256 * visualScale}px`;
      image.style.left = `${(tileX * 256 - origin.x) * visualScale}px`;
      image.style.top = `${(tileY * 256 - origin.y) * visualScale}px`;
      tiles.append(image);
    }
  }

  const overlay = svg('svg', { class: 'map-overlay', width, height, viewBox: `0 0 ${width} ${height}` });
  container.append(overlay);
  const toLocal = ([lon, lat]) => {
    const point = mercator(lat, lon, zoom);
    return [(point.x - origin.x) * visualScale, (point.y - origin.y) * visualScale];
  };

  if (!options.hideAttribution) {
    const attribution = document.createElement('div');
    attribution.className = 'map-attribution';
    attribution.innerHTML = '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a> <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">© CARTO</a>';
    container.append(attribution);
  }

  return { width, height, zoom, origin, overlay, toLocal };
}

function renderCourse(course, pois) {
  const node = qs('#course-map');
  const detail = qs('#course-poi-detail');
  if (!node || !detail || !pois.length) return;
  const coords = course.features[0].geometry.coordinates;
  const clean = html => {
    const temporary = document.createElement('div');
    temporary.innerHTML = html || '';
    return temporary.textContent.replace(/\s+/g, ' ').trim();
  };
  let selectedIndex = 0;
  let rotationTimer;

  const updateDetail = poi => {
    const title = qs('strong', detail);
    const copy = qs('span', detail);
    const media = qs('.course-poi-media', detail);
    const image = qs('img', media);
    title.textContent = poi.name;
    const description = clean(poi.description);
    copy.textContent = description;
    copy.hidden = !description;
    image.src = poi.image || '/assets/images/landmarks/poi-placeholder.svg';
    image.alt = poi.image && !poi.image.includes('placeholder') ? poi.name : '';
  };

  const selectPoi = (index, restart = true) => {
    selectedIndex = (index + pois.length) % pois.length;
    qsa('.poi-marker', node).forEach((marker, markerIndex) => marker.classList.toggle('selected', markerIndex === selectedIndex));
    updateDetail(pois[selectedIndex]);
    if (restart) startRotation();
  };

  const startRotation = () => {
    clearInterval(rotationTimer);
    rotationTimer = setInterval(() => selectPoi(selectedIndex + 1, false), 12000);
  };

  const draw = () => {
    const map = createTileMap(node, coords, { padding: 8, visualScale: 1.34, hideAttribution: true });
    const points = coords.map(map.toLocal);
    const pathData = points.map((point, index) => `${index ? 'L' : 'M'} ${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(' ');
    map.overlay.append(svg('path', { d: pathData, class: 'route-shadow' }));
    map.overlay.append(svg('path', { d: pathData, class: 'route-line' }));

    const start = points[0];
    const finish = points.at(-1);
    map.overlay.append(svg('circle', { cx: start[0], cy: start[1], r: 7, fill: '#40B07A', stroke: '#fff', 'stroke-width': 2 }));
    map.overlay.append(svg('circle', { cx: finish[0], cy: finish[1], r: 4, fill: '#fff', stroke: '#40B07A', 'stroke-width': 2 }));

    pois.forEach((poi, index) => {
      const [x, y] = map.toLocal([poi.lon, poi.lat]);
      const marker = document.createElement('div');
      marker.className = `poi-marker${index === selectedIndex ? ' selected' : ''}`;
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      marker.innerHTML = `<button type="button" aria-label="${poi.name}"><span class="poi-dot"></span><span class="poi-label">${poi.name}</span></button>`;
      const activate = () => selectPoi(index);
      qs('button', marker).addEventListener('click', activate);
      qs('button', marker).addEventListener('focus', () => selectPoi(index, false));
      node.append(marker);
    });

    node.classList.add('show-landmarks');
  };

  updateDetail(pois[selectedIndex]);
  draw();
  startRotation();
  let resizeTimer;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 150);
  }).observe(node);
}

function renderEurope(cities) {
  const node = qs('#europe-map');
  if (!node) return;
  const coords = cities.map(city => [city.lon, city.lat]);
  renderClassicsSequence('#classics-sequence', cities);

  const draw = () => {
    const map = createTileMap(node, coords, { zoom: 4, center: [10.5, 53], hideAttribution: true });
    const markerMap = new Map();

    cities.forEach(city => {
      const [x, y] = map.toLocal([city.lon, city.lat]);
      const marker = document.createElement('div');
      marker.className = `city-marker${city.candidate ? ' riga' : ''}`;
      marker.style.cssText = `left:${x}px;top:${y}px;--city:${city.colour}`;
      marker.dataset.city = city.city;
      marker.innerHTML = `<span class="city-marker-dot"></span><span class="city-marker-label">${city.city}</span>`;
      node.append(marker);
      markerMap.set(city.city, marker);
    });

    const copenhagen = cities.find(city => city.city === 'Copenhagen');
    const riga = cities.find(city => city.city === 'Riga');
    if (copenhagen && riga) {
      const from = map.toLocal([copenhagen.lon, copenhagen.lat]);
      const to = map.toLocal([riga.lon, riga.lat]);
      const midpointX = (from[0] + to[0]) / 2 + 18;
      const midpointY = Math.min(from[1], to[1]) - 92;
      map.overlay.append(svg('path', { d: `M ${from[0]} ${from[1]} Q ${midpointX} ${midpointY} ${to[0]} ${to[1]}`, class: 'map-arc' }));
    }

    qsa('#classics-sequence .classics-race').forEach(card => {
      const marker = markerMap.get(card.dataset.city);
      const set = active => {
        card.classList.toggle('active', active);
        marker?.classList.toggle('active', active);
      };
      card.addEventListener('mouseenter', () => set(true));
      card.addEventListener('mouseleave', () => set(false));
      marker?.addEventListener('mouseenter', () => set(true));
      marker?.addEventListener('mouseleave', () => set(false));
    });
  };

  draw();
  let timer;
  new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(draw, 150);
  }).observe(node);
}

function renderElevation(data) {
  const node = qs('#elevation-chart');
  if (!node) return;
  const W = 1100;
  const H = 390;
  const padding = { left: 62, right: 26, top: 126, bottom: 54 };
  const MAX = 40;
  const x = value => padding.left + value / 42.195 * (W - padding.left - padding.right);
  const y = value => H - padding.bottom - value / MAX * (H - padding.top - padding.bottom);

  node.innerHTML = '';
  const defs = svg('defs');
  const gradient = svg('linearGradient', { id: 'elevation-gradient', x1: '0', y1: '0', x2: '0', y2: '1' });
  gradient.append(svg('stop', { offset: '0%', 'stop-color': '#ff5475', 'stop-opacity': '.24' }));
  gradient.append(svg('stop', { offset: '100%', 'stop-color': '#ff5475', 'stop-opacity': '0' }));
  defs.append(gradient);
  node.append(defs);

  [0, 20, 40].forEach(value => {
    node.append(svg('line', { x1: padding.left, y1: y(value), x2: W - padding.right, y2: y(value), class: 'elevation-grid' }));
    node.append(svg('text', { x: padding.left - 12, y: y(value) + 4, 'text-anchor': 'end', class: 'elevation-label' }, `${value}m`));
  });

  for (let value = 0; value <= 42; value += 2) {
    node.append(svg('text', { x: x(value), y: H - 20, 'text-anchor': 'middle', class: `elevation-label${value % 4 ? ' elevation-label-minor' : ''}` }, value));
  }

  const points = data.points.map(point => [x(point.km), y(point.m)]);
  const pathData = linePath(points);
  node.append(svg('path', { d: `${pathData} L ${points.at(-1)[0]} ${y(0)} L ${points[0][0]} ${y(0)} Z`, class: 'elevation-fill' }));
  node.append(svg('path', { d: pathData, class: 'elevation-profile-highlight' }));
  const path = svg('path', { d: pathData, class: 'elevation-profile', 'data-draw-path': 'true' });
  node.append(path);

  requestAnimationFrame(() => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
  });

  data.labels.forEach((label, index) => {
    const nearby = data.points.filter(point => Math.abs(point.km - label.km) <= .9);
    const peak = (nearby.length ? nearby : data.points).reduce((highest, point) => point.m > highest.m ? point : highest, (nearby[0] || data.points[0]));
    const xx = x(peak.km);
    const peakY = y(peak.m);
    const labelY = index % 2 ? 126 : 102;
    node.append(svg('line', { x1: xx, y1: labelY + 8, x2: xx, y2: peakY - 5, class: 'elevation-marker' }));
    node.append(svg('circle', { cx: xx, cy: peakY, r: 3, class: 'elevation-marker-dot' }));
    node.append(svg('text', { x: xx + 3, y: labelY, 'text-anchor': 'start', class: 'elevation-marker-label', transform: `rotate(-47 ${xx + 3} ${labelY})` }, label.label));
  });
}

function initStabilityGallery() {
  qsa('.stability-system').forEach(system => {
    const preview = qs('.stability-preview', system);
    const image = qs('img', preview);
    const title = qs('figcaption strong', preview);
    const copy = qs('figcaption span', preview);

    qsa('.stability-hit', system).forEach(button => {
      const activate = () => {
        qsa('.stability-hit', system).forEach(item => item.classList.toggle('active', item === button));
        image.src = button.dataset.stabilityImage;
        image.alt = button.dataset.stabilityAlt;
        title.textContent = button.dataset.stabilityTitle;
        copy.textContent = button.dataset.stabilityCopy;
      };
      button.addEventListener('mouseenter', activate);
      button.addEventListener('focus', activate);
      button.addEventListener('click', activate);
    });
  });
}

async function initData() {
  try {
    const [distances, reach, cities, course, pois, elevation] = await Promise.all([
      load('distances.json'),
      load('reach.json'),
      load('cities.json'),
      load('course.geojson'),
      load('pois.json'),
      load('elevation.json')
    ]);
    renderHeroCalendar(cities);
    renderDistances(distances);
    renderGrowthSwitcher(reach);
    renderGrowthChart(reach);
    renderSimpleLine('#kids-chart', reach, 'kidsDay');
    renderCourse(course, pois);
    renderEurope(cities);
    renderElevation(elevation);
  } catch (error) {
    console.error(error);
  }
}

initMenu();
initScroll();
initReveal();
initCounts();
initHeroRings();
initDigital();
initTilt();
initMedalTilt();
initRecordShowcase();
initLabelPhysics();
initStabilityGallery();
initData();
