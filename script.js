(() => {
  document.documentElement.classList.add('js');
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Mobile navigation
  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');
  const setMenuOpen = open => {
    if (!menuToggle || !mainNav) return;
    mainNav.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
  };
  menuToggle?.addEventListener('click', () => {
    setMenuOpen(!mainNav?.classList.contains('open'));
  });
  $$('#mainNav a').forEach(link => link.addEventListener('click', () => {
    setMenuOpen(false);
  }));
  document.addEventListener('click', event => {
    if (mainNav?.classList.contains('open') && !event.target.closest('.header-inner')) setMenuOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mainNav?.classList.contains('open')) {
      setMenuOpen(false);
      menuToggle?.focus();
    }
  });

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(el => revealObserver.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('visible'));
  }

  // Active navigation
  const sections = ['research', 'context', 'method', 'gallery', 'application', 'contribution', 'sources']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = $$('#mainNav a');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Hero boundary slider
  const boundaryRange = $('#boundaryRange');
  const privateZone = $('#privateZone');
  const publicZone = $('#publicZone');
  const plotLine = $('#plotLine');
  const boundaryOutput = $('#boundaryOutput');
  const updateBoundary = () => {
    if (!boundaryRange || !privateZone || !publicZone || !plotLine || !boundaryOutput) return;
    const value = Number(boundaryRange.value);
    privateZone.style.width = `${value}%`;
    publicZone.style.width = `${100 - value}%`;
    plotLine.style.left = `${value}%`;
    boundaryOutput.textContent = `${value}% פרטי · ${100 - value}% ציבורי`;
  };
  boundaryRange?.addEventListener('input', updateBoundary);
  updateBoundary();

  // Accessible tab behavior, including roving focus and arrow-key navigation
  function wireTabs(buttonSelector, panelSelector, buttonData, panelData) {
    const buttons = $$(buttonSelector);
    const panels = $$(panelSelector);
    if (!buttons.length) return;

    const activate = (button, moveFocus = false) => {
      const value = button.dataset[buttonData];
      buttons.forEach(btn => {
        const selected = btn === button;
        btn.classList.toggle('active', selected);
        btn.setAttribute('aria-selected', String(selected));
        btn.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(panel => {
        const selected = panel.dataset[panelData] === value;
        panel.classList.toggle('active', selected);
        panel.hidden = !selected;
        panel.tabIndex = selected ? 0 : -1;
      });
      if (moveFocus) button.focus();
    };

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(button));
      button.addEventListener('keydown', event => {
        const rtl = getComputedStyle(button.closest('[role="tablist"]')).direction === 'rtl';
        let nextIndex = null;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = buttons.length - 1;
        if (event.key === 'ArrowDown') nextIndex = (index + 1) % buttons.length;
        if (event.key === 'ArrowUp') nextIndex = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'ArrowRight') nextIndex = (index + (rtl ? -1 : 1) + buttons.length) % buttons.length;
        if (event.key === 'ArrowLeft') nextIndex = (index + (rtl ? 1 : -1) + buttons.length) % buttons.length;
        if (nextIndex === null) return;
        event.preventDefault();
        activate(buttons[nextIndex], true);
      });
    });

    activate(buttons.find(button => button.classList.contains('active')) || buttons[0]);
  }
  wireTabs('.tab-btn', '.problem-panel', 'problem', 'problemPanel');
  wireTabs('.theory-tab', '.theory-panel', 'theory', 'theoryPanel');
  wireTabs('.interview-btn', '.interview-panel', 'interview', 'interviewPanel');

  // Tool filter
  $$('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.toolFilter;
      $$('.filter-btn').forEach(btn => {
        const selected = btn === button;
        btn.classList.toggle('active', selected);
        btn.setAttribute('aria-pressed', String(selected));
      });
      $$('.tool-card').forEach(card => {
        const visible = filter === 'all' || card.dataset.tool === filter;
        card.classList.toggle('hidden', !visible);
        card.hidden = !visible;
      });
    });
  });

  // Historical timeline
  const timelineData = {
    1941: {
      image: 'assets/historic-1941.webp',
      alt: 'מפה היסטורית של כפר יאסיף משנת 1941',
      title: 'רחוב 103 כמסלול הליכה היסטורי',
      text: 'במיפוי ההיסטורי רחוב 103 מופיע כ־Track / Footpath, כחלק ממערכת דרכים שמקשרת בין הכפר, השדות והצירים האזוריים.'
    },
    1947: {
      image: 'assets/historic-1947.webp',
      alt: 'מפה היסטורית של כפר יאסיף משנת 1947',
      title: 'מעבר הדרגתי לרחוב מוטה רכב',
      text: 'בשלב זה רחוב 103 כבר מתואר במחקר כרחוב מוטה רכב, בעוד רשת הדרכים ההיסטורית ממשיכה לארגן את הקשרים אל מרכז הכפר.'
    },
    2026: {
      image: 'assets/historic-2026.webp',
      alt: 'תצלום אוויר עכשווי של כפר יאסיף עם סימון רשת הדרכים',
      title: 'כביש 70 משנה את המבנה המרחבי',
      text: 'כיום תוואי כביש 70 עובר דרך השטחים החקלאיים ההיסטוריים ומחלק את הכפר לשניים, לצד דרכים היסטוריות שנותרו כחלק מרשת הרחובות.'
    }
  };
  $$('.timeline-btn').forEach(button => {
    button.addEventListener('click', () => {
      const year = button.dataset.year;
      const item = timelineData[year];
      if (!item) return;
      $$('.timeline-btn').forEach(btn => {
        const selected = btn === button;
        btn.classList.toggle('active', selected);
        btn.setAttribute('aria-pressed', String(selected));
      });
      const image = $('#timelineImage');
      if (!image) return;
      image.style.opacity = '0';
      setTimeout(() => {
        image.src = item.image;
        image.alt = item.alt;
        image.style.opacity = '1';
      }, 140);
      const heading = $('#timelineHeading');
      const description = $('#timelineText');
      if (heading) heading.textContent = item.title;
      if (description) description.textContent = item.text;
    });
  });

  // Count-up dashboard
  let countsDone = false;
  const dashboard = $('.data-dashboard');
  if (dashboard && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver(entries => {
      if (!entries[0]?.isIntersecting || countsDone) return;
      countsDone = true;
      $$('[data-count]', dashboard).forEach(node => {
        const target = Number(node.dataset.count);
        const decimal = !Number.isInteger(target);
        const duration = 900;
        const start = performance.now();
        node.textContent = '0';
        const tick = now => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          const value = target * eased;
          node.textContent = decimal ? value.toFixed(1) : Math.round(value).toString();
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      countObserver.disconnect();
    }, { threshold: 0.3 });
    countObserver.observe(dashboard);
  }

  // Street builder prototype
  const streetState = {
    sidewalk: true,
    trees: true,
    benches: true,
    water: false,
    permeable: false,
    market: false,
    shade: false,
    heritage: false
  };
  const streetSvg = $('#streetSvg');
  const streetWidth = $('#streetWidth');
  const streetWidthOutput = $('#streetWidthOutput');

  function svgTree(x, ground) {
    return `
      <g transform="translate(${x} ${ground})">
        <rect x="-5" y="-72" width="10" height="72" rx="3" fill="#76533c"/>
        <circle cx="0" cy="-93" r="35" fill="#62e1a2" opacity=".95"/>
        <circle cx="-22" cy="-82" r="21" fill="#50c88d"/>
        <circle cx="21" cy="-81" r="22" fill="#49b77f"/>
      </g>`;
  }

  function svgBench(x, ground) {
    return `
      <g transform="translate(${x} ${ground})" stroke="#d3b27a" stroke-width="7" stroke-linecap="round">
        <line x1="-24" y1="-24" x2="24" y2="-24"/>
        <line x1="-18" y1="-15" x2="-18" y2="0"/>
        <line x1="18" y1="-15" x2="18" y2="0"/>
      </g>`;
  }

  function renderStreet() {
    if (!streetSvg) return;
    const width = Number(streetWidth.value);
    streetWidthOutput.textContent = `${width} מ׳`;

    const ground = 286;
    const buildingW = 165;
    const available = 1000 - buildingW * 2;
    const sidewalkW = streetState.sidewalk ? Math.max(82, 150 - (width - 10) * 5) : 34;
    const roadW = available - sidewalkW * 2;
    const leftSidewalkX = buildingW;
    const roadX = buildingW + sidewalkW;
    const rightSidewalkX = roadX + roadW;

    const stonePattern = streetState.heritage
      ? `<pattern id="stone" width="30" height="18" patternUnits="userSpaceOnUse"><rect width="30" height="18" fill="#b99f7b"/><path d="M0 9H30M15 0V9M5 9V18M25 9V18" stroke="#8f7656" stroke-width="1"/></pattern>`
      : '';
    const permeablePattern = streetState.permeable
      ? `<pattern id="pavers" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#707978"/><circle cx="4" cy="4" r="1.5" fill="#9bc8a9"/><circle cx="13" cy="13" r="1.5" fill="#9bc8a9"/></pattern>`
      : '';

    let content = `
      <defs>${stonePattern}${permeablePattern}</defs>
      <rect x="0" y="0" width="1000" height="360" fill="#0b1016"/>
      <rect x="0" y="${ground}" width="1000" height="74" fill="#191b1d"/>
      <rect x="0" y="85" width="${buildingW}" height="${ground - 85}" fill="${streetState.heritage ? 'url(#stone)' : '#2f3540'}"/>
      <rect x="${1000-buildingW}" y="105" width="${buildingW}" height="${ground - 105}" fill="${streetState.heritage ? 'url(#stone)' : '#343943'}"/>
      <rect x="42" y="155" width="54" height="82" fill="#0b1016" stroke="#77808d"/>
      <rect x="${1000-buildingW+52}" y="168" width="58" height="70" fill="#0b1016" stroke="#77808d"/>
      <path d="M0 ${ground}H1000" stroke="#cfd5db" stroke-opacity=".25"/>
      <rect x="${leftSidewalkX}" y="${ground-18}" width="${sidewalkW}" height="18" fill="${streetState.permeable ? 'url(#pavers)' : '#6b6d70'}"/>
      <rect x="${rightSidewalkX}" y="${ground-18}" width="${sidewalkW}" height="18" fill="${streetState.permeable ? 'url(#pavers)' : '#6b6d70'}"/>
      <rect x="${roadX}" y="${ground-10}" width="${roadW}" height="10" fill="#3a3c40"/>
      <line x1="${roadX + roadW/2}" y1="${ground-6}" x2="${roadX + roadW/2}" y2="${ground+58}" stroke="#f3e6a8" stroke-width="3" stroke-dasharray="18 14" opacity=".7"/>
      <text x="500" y="335" text-anchor="middle" fill="#8d95a0" font-size="18">רחוב ${width} מ׳</text>
    `;

    if (streetState.water) {
      content += `<rect x="${roadX-9}" y="${ground-18}" width="18" height="18" rx="4" fill="#45b9ff" opacity=".9"/><rect x="${rightSidewalkX-9}" y="${ground-18}" width="18" height="18" rx="4" fill="#45b9ff" opacity=".9"/>`;
    }
    if (streetState.trees) {
      content += svgTree(leftSidewalkX + sidewalkW * .52, ground - 18);
      content += svgTree(rightSidewalkX + sidewalkW * .48, ground - 18);
    }
    if (streetState.benches) {
      content += svgBench(leftSidewalkX + sidewalkW * .25, ground - 18);
      content += svgBench(rightSidewalkX + sidewalkW * .75, ground - 18);
    }
    if (streetState.market) {
      const x = rightSidewalkX + sidewalkW * .5;
      content += `
        <g transform="translate(${x} ${ground-18})">
          <path d="M-52 -70H52L38 -45H-38Z" fill="#ff9f43"/>
          <rect x="-42" y="-45" width="84" height="45" fill="#c86d2e"/>
          <path d="M-42 -22H42" stroke="#ffe1bd" stroke-width="4"/>
        </g>`;
    }
    if (streetState.shade) {
      const left = leftSidewalkX - 8;
      const right = rightSidewalkX + sidewalkW + 8;
      content += `
        <g opacity=".95">
          <line x1="${left}" y1="${ground-138}" x2="${right}" y2="${ground-138}" stroke="#e0c386" stroke-width="8"/>
          <line x1="${left}" y1="${ground-138}" x2="${left}" y2="${ground-18}" stroke="#e0c386" stroke-width="6"/>
          <line x1="${right}" y1="${ground-138}" x2="${right}" y2="${ground-18}" stroke="#e0c386" stroke-width="6"/>
          <rect x="${left}" y="${ground-141}" width="${right-left}" height="16" fill="#e0c386" opacity=".22"/>
        </g>`;
    }

    streetSvg.innerHTML = content;

    const shadeScore = (streetState.trees ? 2 : 0) + (streetState.shade ? 3 : 0);
    const drainScore = (streetState.water ? 2 : 0) + (streetState.permeable ? 2 : 0) + (streetState.trees ? 1 : 0);
    const activityScore = (streetState.benches ? 2 : 0) + (streetState.market ? 3 : 0) + (streetState.shade ? 1 : 0);
    const label = score => score >= 4 ? 'גבוהה' : score >= 2 ? 'בינונית' : 'נמוכה';
    $('#shadeMetric').textContent = label(shadeScore);
    $('#drainMetric').textContent = label(drainScore);
    $('#activityMetric').textContent = label(activityScore);
  }

  $$('.element-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.element;
      streetState[key] = !streetState[key];
      button.classList.toggle('active', streetState[key]);
      button.setAttribute('aria-pressed', String(streetState[key]));
      renderStreet();
    });
  });
  streetWidth?.addEventListener('input', renderStreet);
  renderStreet();

  // Open element library filter
  $$('.library-filter').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.libraryFilter;
      $$('.library-filter').forEach(btn => {
        const selected = btn === button;
        btn.classList.toggle('active', selected);
        btn.setAttribute('aria-pressed', String(selected));
      });
      $$('#libraryGrid article').forEach(card => {
        const visible = filter === 'all' || card.dataset.library === filter;
        card.classList.toggle('hidden', !visible);
        card.hidden = !visible;
      });
    });
  });

  // Participation map markers
  const markerColors = {
    good: '#57d887',
    problem: '#ff5d6c',
    shade: '#b6e45d',
    flood: '#45b9ff',
    sit: '#ffb45c'
  };
  let markerType = 'good';
  const markerButtons = $$('.marker-type');
  const selectMarkerType = (button, moveFocus = false) => {
    if (!button) return;
    markerType = button.dataset.marker;
    markerButtons.forEach(btn => {
      const selected = btn === button;
      btn.classList.toggle('active', selected);
      btn.setAttribute('aria-checked', String(selected));
      btn.tabIndex = selected ? 0 : -1;
    });
    if (moveFocus) button.focus();
  };
  markerButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectMarkerType(button));
    button.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const forward = event.key === 'ArrowLeft' || event.key === 'ArrowDown';
      const nextIndex = (index + (forward ? 1 : -1) + markerButtons.length) % markerButtons.length;
      selectMarkerType(markerButtons[nextIndex], true);
    });
  });
  selectMarkerType(markerButtons.find(button => button.classList.contains('active')) || markerButtons[0]);

  const map = $('#participationMap');
  const overlay = $('#mapOverlay');
  const mapCursor = $('#mapKeyboardCursor');
  const mapStatus = $('#mapStatus');
  const keyboardPosition = { x: 50, y: 50 };

  const markerLabel = () => $(`.marker-type[data-marker="${markerType}"]`)?.textContent.trim() || markerType;
  const updateMapCursor = () => {
    if (!mapCursor) return;
    mapCursor.style.left = `${keyboardPosition.x}%`;
    mapCursor.style.top = `${keyboardPosition.y}%`;
  };
  const addMapMarker = (x, y) => {
    if (!overlay) return;
    const marker = document.createElement('span');
    marker.className = 'map-marker';
    marker.style.left = `${x}%`;
    marker.style.top = `${y}%`;
    marker.style.setProperty('--marker', markerColors[markerType]);
    marker.setAttribute('title', markerLabel());
    marker.setAttribute('aria-hidden', 'true');
    overlay.appendChild(marker);
    if (mapStatus) {
      const total = overlay.childElementCount;
      mapStatus.textContent = total === 1
        ? `נוסף סימון: ${markerLabel()}. סך הכול סימון אחד.`
        : `נוסף סימון: ${markerLabel()}. סך הכול ${total} סימונים.`;
    }
  };

  map?.addEventListener('click', event => {
    const rect = map.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    addMapMarker(x, y);
  });
  map?.addEventListener('keydown', event => {
    const movements = {
      ArrowLeft: [-2, 0],
      ArrowRight: [2, 0],
      ArrowUp: [0, -2],
      ArrowDown: [0, 2]
    };
    if (movements[event.key]) {
      event.preventDefault();
      const multiplier = event.shiftKey ? 5 : 1;
      keyboardPosition.x = Math.max(2, Math.min(98, keyboardPosition.x + movements[event.key][0] * multiplier));
      keyboardPosition.y = Math.max(2, Math.min(98, keyboardPosition.y + movements[event.key][1] * multiplier));
      updateMapCursor();
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      addMapMarker(keyboardPosition.x, keyboardPosition.y);
    }
  });
  updateMapCursor();

  $('#clearMarkers')?.addEventListener('click', () => {
    overlay?.replaceChildren();
    if (mapStatus) mapStatus.textContent = 'כל הסימונים נמחקו.';
  });


  // PDF research gallery filters
  $$('.gallery-filter').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.galleryFilter;

      $$('.gallery-filter').forEach(btn => {
        const selected = btn === button;
        btn.classList.toggle('active', selected);
        btn.setAttribute('aria-pressed', String(selected));
      });

      $$('.gallery-card').forEach(card => {
        const visible = filter === 'all' || card.dataset.galleryCategory === filter;
        card.classList.toggle('hidden', !visible);
        card.hidden = !visible;
      });
    });
  });

  // Image lightbox for pictures extracted from the PDF
  const lightbox = $('#imageLightbox');
  const lightboxImage = $('#lightboxImage');
  const lightboxCaption = $('#lightboxCaption');
  const lightboxClose = $('#lightboxClose');
  const lightboxBackdrop = $('#lightboxBackdrop');
  const backgroundRegions = $$('body > header, body > main, body > footer');
  let lastLightboxTrigger = null;
  let lightboxFocusTimer = null;

  function openLightbox(trigger) {
    if (!lightbox || !lightboxImage) return;

    lastLightboxTrigger = trigger;
    const src = trigger.dataset.lightboxSrc;
    const caption = trigger.dataset.lightboxCaption || '';
    const thumb = $('img', trigger);

    lightboxImage.src = src;
    lightboxImage.alt = thumb?.alt || caption;
    if (lightboxCaption) lightboxCaption.textContent = caption;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-lock');
    backgroundRegions.forEach(region => { region.inert = true; });
    window.clearTimeout(lightboxFocusTimer);
    lightboxFocusTimer = window.setTimeout(() => {
      if (lightbox.classList.contains('open')) lightboxClose?.focus();
    }, 220);
  }

  function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-lock');
    window.clearTimeout(lightboxFocusTimer);
    backgroundRegions.forEach(region => { region.inert = false; });
    lightboxImage?.removeAttribute('src');
    lastLightboxTrigger?.focus();
  }

  $$('.gallery-open').forEach(button => {
    button.setAttribute('aria-haspopup', 'dialog');
    button.addEventListener('click', () => openLightbox(button));
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxBackdrop?.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', event => {
    if (!lightbox?.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key !== 'Tab') return;

    const focusable = $$('button:not([disabled]):not([tabindex="-1"]), [href], [tabindex]:not([tabindex="-1"])', lightbox)
      .filter(element => !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

})();
