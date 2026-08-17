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

  // BaladCanvas planning application
  const baladApp = $('#baladApp');
  if (baladApp) {
    const baladTranslations = {
      he: {
        projectLabel: 'רחוב 70 · כפר יאסיף', simLive: 'סימולציה פעילה', libraryKicker: 'ספרייה פתוחה',
        libraryTitle: 'אלמנטים לרחוב', libraryDesc: 'לחצו כדי להוסיף עד שמונה אלמנטים לחתך.',
        elTree: 'עץ צל', elBench: 'ספסל ישיבה', elBike: 'שביל אופניים', elSidewalk: 'מדרכה',
        elCar: 'נתיב רכב', elTransit: 'תחבורה ציבורית', elParking: 'חניה', elCommercial: 'רחבה מסחרית',
        studioKicker: 'שכבה 1 + 2', simTitle: 'לוח תכנון דינמי',
        simInstruct: 'בחרו אסטרטגיית התערבות ובחנו מיד את חתך הרחוב ואת מדדי ההשפעה.',
        demoLabel: 'מודל המחשה', mapCaption: 'מפה אינטראקטיבית', mapPlace: 'רחוב 70 · כפר יאסיף',
        mapAlt: 'מפה אינטראקטיבית של רחוב 70 בכפר יאסיף', canvasTitle: 'חתך רחוב דינמי',
        customHelp: 'הוסיפו אלמנטים מהספרייה; לחצו על מקטע בחתך כדי להסיר אותו.',
        strategyTitle: 'בחרו אסטרטגיית עיצוב', btnDefault: 'ציר תנועה סטנדרטי', btnBike: 'נתיב אופניים מוגן',
        btnParklet: 'פארקלט קהילתי', btnTransit: 'נתיב תחבורה ציבורית', btnPedestrian: 'מדרחוב מלא',
        btnCustom: 'בנו הצעה משלכם', metricsKicker: 'שכבה 4', metricsTitle: 'מדדי השפעה',
        metricsDesc: 'השוואה סימולטיבית בין חלופות התכנון.', contextLabel: 'החלופה הנוכחית',
        labelPedestrian: 'הולכי רגל', labelNoise: 'רעש סביבתי', labelAirQuality: 'איכות אוויר',
        labelGreenSpace: 'שטח ירוק', labelSafety: 'בטיחות', labelEconomic: 'עסקים מקומיים',
        voteKicker: 'קונצנזוס קהילתי', voteText: 'האם להעביר את החלופה לבחינה רשמית מול גורמי התכנון?',
        voteButton: 'הצביעו בעד', votedButton: 'ההצבעה נקלטה',
        voteNote: 'נדרשות 100 הצבעות קהילתיות כדי להניע בחינה רשמית.',
        disclaimer: 'המדדים הם נתוני דמו לצורך המחשה והשוואה בלבד — לא חישוב הנדסי.',
        progressLabel: 'התקדמות להצבעה קהילתית', pedestrianUnit: 'אנשים / שעה',
        streetSidewalk: 'מדרכה', streetParking: 'חניה', streetCar: 'נסיעה', streetBike: 'אופניים',
        streetParklet: 'פארקלט', streetTransit: 'נת״צ', streetPedestrian: 'נתיב הליכה',
        streetCommercial: 'רחבה מסחרית', streetTrees: 'עצים וצמחייה', streetSeating: 'ספסלים וישיבה',
        streetEmpty: 'רחוב ריק — התחילו לעצב', removeSegment: 'הסרת',
        added: 'נוסף לחתך:', removed: 'הוסר מהחתך:', maxReached: 'ניתן להוסיף עד שמונה אלמנטים.',
        voteRecorded: 'הצבעתכם נקלטה.', languageButton: 'العربية', languageLabel: 'החלפת שפת הממשק לערבית',
        contexts: {
          default: 'עורק מסחרי בצפיפות גבוהה', bike: 'ציר תנועה פעילה ואופניים',
          parklet: 'אזור עירוניות טקטית ירוקה', transit: 'ציר מתעדף תחבורה ציבורית',
          pedestrian: 'מרחב שהייה מבוסס הולכי רגל', custom: 'עיצוב קהילתי בהתאמה אישית'
        }
      },
      ar: {
        projectLabel: 'شارع 70 · كفر ياسيف', simLive: 'المحاكاة نشطة', libraryKicker: 'مكتبة مفتوحة',
        libraryTitle: 'عناصر الشارع', libraryDesc: 'اضغطوا لإضافة حتى ثمانية عناصر إلى المقطع.',
        elTree: 'شجرة ظل', elBench: 'مقعد جلوس', elBike: 'مسار دراجات', elSidewalk: 'رصيف',
        elCar: 'مسار سيارات', elTransit: 'نقل عام', elParking: 'موقف سيارات', elCommercial: 'ساحة تجارية',
        studioKicker: 'الطبقة 1 + 2', simTitle: 'لوحة تخطيط ديناميكية',
        simInstruct: 'اختاروا استراتيجية تدخل وشاهدوا فوراً مقطع الشارع ومؤشرات التأثير.',
        demoLabel: 'نموذج توضيحي', mapCaption: 'خريطة تفاعلية', mapPlace: 'شارع 70 · كفر ياسيف',
        mapAlt: 'خريطة تفاعلية لشارع 70 في كفر ياسيف', canvasTitle: 'مقطع شارع ديناميكي',
        customHelp: 'أضيفوا عناصر من المكتبة؛ اضغطوا على مقطع في الشارع لإزالته.',
        strategyTitle: 'اختاروا استراتيجية التصميم', btnDefault: 'محور حركة اعتيادي', btnBike: 'مسار دراجات محمي',
        btnParklet: 'باركليت مجتمعي', btnTransit: 'مسار نقل عام', btnPedestrian: 'شارع للمشاة',
        btnCustom: 'ابنوا اقتراحكم', metricsKicker: 'الطبقة 4', metricsTitle: 'مؤشرات التأثير',
        metricsDesc: 'مقارنة محاكاة بين بدائل التخطيط.', contextLabel: 'البديل الحالي',
        labelPedestrian: 'حركة المشاة', labelNoise: 'الضوضاء', labelAirQuality: 'جودة الهواء',
        labelGreenSpace: 'مساحة خضراء', labelSafety: 'السلامة', labelEconomic: 'الأعمال المحلية',
        voteKicker: 'توافق مجتمعي', voteText: 'هل ننقل البديل إلى تقييم رسمي مع جهات التخطيط؟',
        voteButton: 'صوّتوا مع', votedButton: 'تم تسجيل التصويت',
        voteNote: 'مطلوب 100 صوت مجتمعي لبدء مراجعة رسمية.',
        disclaimer: 'المؤشرات هي بيانات تجريبية للتوضيح والمقارنة فقط — وليست حساباً هندسياً.',
        progressLabel: 'التقدم نحو تصويت مجتمعي', pedestrianUnit: 'شخص / ساعة',
        streetSidewalk: 'رصيف', streetParking: 'موقف', streetCar: 'سيارات', streetBike: 'دراجات',
        streetParklet: 'باركليت', streetTransit: 'نقل عام', streetPedestrian: 'مسار مشاة',
        streetCommercial: 'ساحة تجارية', streetTrees: 'أشجار ونباتات', streetSeating: 'مقاعد وجلوس',
        streetEmpty: 'شارع فارغ — ابدأوا التصميم', removeSegment: 'إزالة',
        added: 'تمت الإضافة:', removed: 'تمت الإزالة:', maxReached: 'يمكن إضافة ثمانية عناصر كحد أقصى.',
        voteRecorded: 'تم تسجيل تصويتكم.', languageButton: 'עברית', languageLabel: 'החלפת שפת הממשק לעברית',
        contexts: {
          default: 'محور تجاري عالي الكثافة', bike: 'محور للحركة النشطة والدراجات',
          parklet: 'منطقة حضرية تكتيكية خضراء', transit: 'محور يعطي أولوية للنقل العام',
          pedestrian: 'مساحة إقامة للمشاة', custom: 'تصميم مجتمعي مخصص'
        }
      }
    };

    const baladElementData = {
      trees: { type: 'trees', key: 'streetTrees', icon: '🌳', effects: { ped: 10, noise: -2, aqi: -5, green: 15, safety: 1, econ: 2 } },
      seating: { type: 'seating', key: 'streetSeating', icon: '🪑', effects: { ped: 25, noise: 0, aqi: 0, green: 0, safety: 1, econ: 5 } },
      bike: { type: 'bike', key: 'streetBike', icon: '🚲', effects: { ped: 30, noise: -1, aqi: -2, green: 0, safety: 2, econ: 5 } },
      sidewalk: { type: 'sidewalk', key: 'streetSidewalk', icon: '🚶', effects: { ped: 40, noise: -1, aqi: 0, green: 0, safety: 2, econ: 8 } },
      car: { type: 'car', key: 'streetCar', icon: '🚗', effects: { ped: -15, noise: 12, aqi: 15, green: 0, safety: -2, econ: 4 } },
      transit: { type: 'transit', key: 'streetTransit', icon: '🚌', effects: { ped: 35, noise: 4, aqi: 4, green: 0, safety: 1, econ: 8 } },
      parking: { type: 'parking', key: 'streetParking', icon: '🅿️', effects: { ped: -5, noise: 2, aqi: 3, green: 0, safety: -1, econ: 7 } },
      commercial: { type: 'commercial', key: 'streetCommercial', icon: '☕', effects: { ped: 50, noise: 5, aqi: 2, green: 0, safety: 0, econ: 20 } }
    };

    const baladLayouts = {
      default: [
        { type: 'sidewalk', width: 20, key: 'streetSidewalk', icon: '🚶' },
        { type: 'parking', width: 15, key: 'streetParking', icon: '🅿️' },
        { type: 'car', width: 30, key: 'streetCar', icon: '🚗' },
        { type: 'parking', width: 15, key: 'streetParking', icon: '🅿️' },
        { type: 'sidewalk', width: 20, key: 'streetSidewalk', icon: '🚶' }
      ],
      bike: [
        { type: 'sidewalk', width: 15, key: 'streetSidewalk', icon: '🚶' },
        { type: 'bike', width: 15, key: 'streetBike', icon: '🚲' },
        { type: 'car', width: 35, key: 'streetCar', icon: '🚗' },
        { type: 'parking', width: 15, key: 'streetParking', icon: '🅿️' },
        { type: 'sidewalk', width: 20, key: 'streetSidewalk', icon: '🚶' }
      ],
      parklet: [
        { type: 'sidewalk', width: 20, key: 'streetSidewalk', icon: '🚶' },
        { type: 'parklet', width: 20, key: 'streetParklet', icon: '🌳' },
        { type: 'car', width: 30, key: 'streetCar', icon: '🚗' },
        { type: 'parking', width: 10, key: 'streetParking', icon: '🅿️' },
        { type: 'sidewalk', width: 20, key: 'streetSidewalk', icon: '🚶' }
      ],
      transit: [
        { type: 'sidewalk', width: 15, key: 'streetSidewalk', icon: '🚶' },
        { type: 'transit', width: 20, key: 'streetTransit', icon: '🚌' },
        { type: 'car', width: 30, key: 'streetCar', icon: '🚗' },
        { type: 'transit', width: 20, key: 'streetTransit', icon: '🚌' },
        { type: 'sidewalk', width: 15, key: 'streetSidewalk', icon: '🚶' }
      ],
      pedestrian: [
        { type: 'commercial', width: 15, key: 'streetCommercial', icon: '☕' },
        { type: 'seating', width: 15, key: 'streetSeating', icon: '🪑' },
        { type: 'pedestrian', width: 40, key: 'streetPedestrian', icon: '🚶' },
        { type: 'trees', width: 15, key: 'streetTrees', icon: '🌳' },
        { type: 'commercial', width: 15, key: 'streetCommercial', icon: '☕' }
      ],
      custom: []
    };

    const baladMetricsData = {
      default: { pedestrian: 60, noise: 85, air: 75, green: 5, safety: 4, economic: 0 },
      bike: { pedestrian: 140, noise: 62, air: 45, green: 15, safety: 7, economic: 5 },
      parklet: { pedestrian: 210, noise: 54, air: 35, green: 40, safety: 8, economic: 12 },
      transit: { pedestrian: 180, noise: 70, air: 55, green: 10, safety: 6, economic: 8 },
      pedestrian: { pedestrian: 350, noise: 45, air: 25, green: 25, safety: 9, economic: 20 },
      custom: { pedestrian: 0, noise: 40, air: 30, green: 0, safety: 5, economic: 0 }
    };
    const baladVotes = {
      default: { voted: false, count: 42 }, bike: { voted: false, count: 89 },
      parklet: { voted: false, count: 95 }, transit: { voted: false, count: 76 },
      pedestrian: { voted: false, count: 112 }
    };

    let baladLanguage = 'he';
    let baladStrategy = 'default';
    const baladGrid = $('#baladGrid');
    const baladLibrary = $('#baladLibrary');
    const baladStreet = $('#baladStreet');
    const baladCustomHelp = $('#baladCustomHelp');
    const baladVote = $('#baladVote');
    const baladLanguageButton = $('#baladLanguage');
    const baladStatus = $('#baladStatus');
    const baladMetricNodes = {
      context: $('#baladMetricContext'), pedestrian: $('#baladMetricPedestrian'), noise: $('#baladMetricNoise'),
      air: $('#baladMetricAirQuality'), green: $('#baladMetricGreenSpace'), safety: $('#baladMetricSafety'),
      economic: $('#baladMetricEconomic')
    };

    const calculateBaladCustomMetrics = () => {
      const value = { pedestrian: 10, noise: 40, air: 30, green: 0, safety: 5, economic: 0 };
      baladLayouts.custom.forEach(item => {
        const effects = baladElementData[item.element].effects;
        value.pedestrian += effects.ped;
        value.noise += effects.noise;
        value.air += effects.aqi;
        value.green += effects.green;
        value.safety += effects.safety;
        value.economic += effects.econ;
      });
      baladMetricsData.custom = {
        pedestrian: Math.max(0, value.pedestrian), noise: Math.max(30, Math.min(100, value.noise)),
        air: Math.max(10, Math.min(150, value.air)), green: Math.min(100, value.green),
        safety: Math.max(1, Math.min(10, value.safety)), economic: value.economic
      };
    };

    const applyBaladTranslation = () => {
      const lang = baladTranslations[baladLanguage];
      $$('[data-balad-i18n]', baladApp).forEach(node => {
        const value = lang[node.dataset.baladI18n];
        if (typeof value === 'string') node.textContent = value;
      });
      baladApp.lang = baladLanguage;
      baladLanguageButton.textContent = lang.languageButton;
      baladLanguageButton.setAttribute('aria-label', lang.languageLabel);
      const mapFrame = $('.balad-location iframe', baladApp);
      if (mapFrame) mapFrame.title = lang.mapAlt;
      const progress = $('.balad-progress', baladApp);
      if (progress) progress.setAttribute('aria-label', lang.progressLabel);
    };

    const renderBaladStreet = () => {
      const lang = baladTranslations[baladLanguage];
      const layout = baladLayouts[baladStrategy];
      baladStreet.innerHTML = '';
      if (!layout.length) {
        const empty = document.createElement('div');
        empty.className = 'balad-segment balad-segment-empty';
        empty.innerHTML = `<span class="balad-segment-icon" aria-hidden="true">✦</span><span class="balad-segment-label">${lang.streetEmpty}</span>`;
        baladStreet.appendChild(empty);
        return;
      }
      layout.forEach((segment, index) => {
        const removable = baladStrategy === 'custom';
        const node = document.createElement(removable ? 'button' : 'div');
        node.className = `balad-segment balad-segment-${segment.type}`;
        node.style.width = `${removable ? 100 / layout.length : segment.width}%`;
        node.innerHTML = `<span class="balad-segment-icon" aria-hidden="true">${segment.icon}</span><span class="balad-segment-label">${lang[segment.key]}</span>`;
        if (removable) {
          node.type = 'button';
          node.setAttribute('aria-label', `${lang.removeSegment} ${lang[segment.key]}`);
          node.addEventListener('click', () => {
            const removed = baladLayouts.custom.splice(index, 1)[0];
            baladStatus.textContent = `${lang.removed} ${lang[removed.key]}`;
            updateBaladDashboard();
          });
        }
        baladStreet.appendChild(node);
      });
    };

    const updateBaladDashboard = () => {
      const lang = baladTranslations[baladLanguage];
      const custom = baladStrategy === 'custom';
      baladGrid.classList.toggle('custom-active', custom);
      baladLibrary.hidden = !custom;
      baladCustomHelp.hidden = !custom;
      baladVote.hidden = custom;
      if (custom) calculateBaladCustomMetrics();
      applyBaladTranslation();
      renderBaladStreet();

      const metric = baladMetricsData[baladStrategy];
      baladMetricNodes.context.textContent = lang.contexts[baladStrategy];
      baladMetricNodes.pedestrian.textContent = `${metric.pedestrian} ${lang.pedestrianUnit}`;
      baladMetricNodes.noise.textContent = `${metric.noise} dB`;
      baladMetricNodes.air.textContent = `${metric.air} AQI`;
      baladMetricNodes.green.textContent = `${metric.green}%`;
      baladMetricNodes.safety.textContent = `${metric.safety}/10`;
      baladMetricNodes.economic.textContent = `${metric.economic > 0 ? '+' : ''}${metric.economic}%`;
      Object.values(baladMetricNodes).forEach((node, index) => {
        if (index > 0) node.classList.toggle('positive', baladStrategy !== 'default' && baladLayouts[baladStrategy].length > 0);
      });

      if (!custom) {
        const vote = baladVotes[baladStrategy];
        const percent = Math.min(vote.count, 100);
        $('#baladVoteTotal').textContent = `${vote.count} / 100`;
        $('#baladVotePercent').textContent = `${percent}%`;
        $('#baladVoteProgress').style.width = `${percent}%`;
        const progress = $('.balad-progress', baladApp);
        progress.setAttribute('aria-valuenow', String(percent));
        const voteButton = $('#baladVoteButton');
        voteButton.disabled = vote.voted;
        $('[data-balad-i18n="voteButton"]', voteButton).textContent = vote.voted ? lang.votedButton : lang.voteButton;
      }
    };

    const baladStrategyButtons = $$('.balad-strategy-btn', baladApp);
    baladStrategyButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        baladStrategy = button.dataset.baladStrategy;
        baladStrategyButtons.forEach(item => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        updateBaladDashboard();
      });
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const forward = event.key === 'ArrowLeft' || event.key === 'ArrowDown';
        const next = baladStrategyButtons[(index + (forward ? 1 : -1) + baladStrategyButtons.length) % baladStrategyButtons.length];
        next.focus();
        next.click();
      });
    });

    $$('[data-balad-element]', baladApp).forEach(button => {
      button.addEventListener('click', () => {
        if (baladStrategy !== 'custom') return;
        const lang = baladTranslations[baladLanguage];
        if (baladLayouts.custom.length >= 8) {
          baladStatus.textContent = lang.maxReached;
          return;
        }
        const element = button.dataset.baladElement;
        const data = baladElementData[element];
        baladLayouts.custom.push({ type: data.type, element, key: data.key, icon: data.icon });
        baladStatus.textContent = `${lang.added} ${lang[data.key]}`;
        updateBaladDashboard();
      });
    });

    baladLanguageButton.addEventListener('click', () => {
      baladLanguage = baladLanguage === 'he' ? 'ar' : 'he';
      updateBaladDashboard();
    });

    $('#baladVoteButton').addEventListener('click', () => {
      if (baladStrategy === 'custom') return;
      const vote = baladVotes[baladStrategy];
      if (vote.voted) return;
      vote.count += 1;
      vote.voted = true;
      baladStatus.textContent = baladTranslations[baladLanguage].voteRecorded;
      updateBaladDashboard();
    });

    updateBaladDashboard();
  }

  // Participation map markers
  const markerColors = {
    good: '#57d887',
    problem: '#ff5d6c',
    shade: '#b6e45d',
    flood: '#45b9ff',
    sit: '#ffb45c'
  };
  let markerType = 'good';
  let markerMode = false;
  const markerButtons = $$('.marker-type');
  const map = $('#participationMap');
  const mapCapture = $('#mapCapture');
  const overlay = $('#mapOverlay');
  const mapCursor = $('#mapKeyboardCursor');
  const mapStatus = $('#mapStatus');
  const mapHint = $('#mapInstructions');
  const navigateModeButton = $('#mapNavigateMode');
  const markModeButton = $('#mapMarkMode');
  const keyboardPosition = { x: 50, y: 50 };

  const setMapMode = (marking, focusMap = false) => {
    markerMode = marking;
    map?.classList.toggle('marking', marking);
    if (map) map.tabIndex = marking ? 0 : -1;
    navigateModeButton?.classList.toggle('active', !marking);
    navigateModeButton?.setAttribute('aria-pressed', String(!marking));
    markModeButton?.classList.toggle('active', marking);
    markModeButton?.setAttribute('aria-pressed', String(marking));
    if (mapHint) {
      mapHint.textContent = marking
        ? 'לחצו כדי לסמן · במקלדת הזיזו עם החצים ואשרו ב־Enter'
        : 'גררו או הגדילו את המפה · עברו למצב סימון כדי להוסיף ידע מקומי';
    }
    if (mapStatus) {
      mapStatus.textContent = marking
        ? `מצב הוספת סימונים פעיל. סוג הסימון: ${markerLabel()}.`
        : 'מצב ניווט במפה פעיל.';
    }
    if (marking && focusMap) map?.focus();
  };

  const selectMarkerType = (button, moveFocus = false) => {
    if (!button) return;
    markerType = button.dataset.marker;
    markerButtons.forEach(btn => {
      const selected = btn === button;
      btn.classList.toggle('active', selected);
      btn.setAttribute('aria-checked', String(selected));
      btn.tabIndex = selected ? 0 : -1;
    });
    setMapMode(true);
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
  const initialMarker = markerButtons.find(button => button.classList.contains('active')) || markerButtons[0];
  if (initialMarker) {
    markerType = initialMarker.dataset.marker;
    markerButtons.forEach(button => button.tabIndex = button === initialMarker ? 0 : -1);
  }

  navigateModeButton?.addEventListener('click', () => setMapMode(false));
  markModeButton?.addEventListener('click', () => setMapMode(true, true));
  setMapMode(false);

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

  mapCapture?.addEventListener('click', event => {
    const rect = mapCapture.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    addMapMarker(x, y);
  });
  map?.addEventListener('keydown', event => {
    if (!markerMode) return;
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
