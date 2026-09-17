/**
 * Horizon - Stanford Grades & Deadlines
 * Stanford University
 * Pure Vanilla JavaScript - Apple.com Design System
 * Built for Codédex Monthly Challenge - September 2026
 */
(function () {
  'use strict';

  // =========================================================================
  // 1. Canvas Confetti Engine (Refined: Fewer particles, gradient shapes)
  // =========================================================================

  class CanvasConfettiEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.animationFrame = null;
      this.colors = ['#0071e3', '#30d158', '#ffd60a', '#ffffff', '#5e5ce6'];
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    fire(originX, originY) {
      if (!this.canvas) return;
      this.resize();
      const oX = (originX || 0.5) * this.canvas.width;
      const oY = (originY || 0.6) * this.canvas.height;
      const count = 40;
      const _th = document.documentElement.getAttribute('data-theme');
      const isLight = _th === 'light' || (_th && /light|indie|moss|marigold|blind/.test(_th));
      const palette = isLight ? ['#0071e3', '#34c759', '#ff9f0a', '#1d1d1f', '#5e5ce6'] : this.colors;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 6;
        this.particles.push({
          x: oX, y: oY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: 4 + Math.random() * 5,
          color: palette[Math.floor(Math.random() * palette.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          opacity: 1,
          decay: 0.014 + Math.random() * 0.01,
          gravity: 0.16,
          wobble: Math.random() * Math.PI * 2
        });
      }
      if (!this.animationFrame) this.loop();
    }

    loop() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx + Math.sin(p.wobble) * 0.3;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.wobble += 0.04;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0 || p.y > this.canvas.height) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.opacity;
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        this.animationFrame = requestAnimationFrame(() => this.loop());
      } else {
        this.animationFrame = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  const confetti = new CanvasConfettiEngine('confettiCanvas');

  // =========================================================================
  // 2. Toast Notification System
  // =========================================================================

  function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var iconPaths = {
      success: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8.5l3 3 7-7"/></svg>',
      info: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 10.5v.5"/></svg>',
      warn: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2l6 12H2z"/><path d="M8 7v2M8 11v.5"/></svg>'
    };

    var toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML =
      '<span class="toast-icon ' + type + '">' + (iconPaths[type] || iconPaths.info) + '</span>' +
      '<span>' + escapeHtml(message) + '</span>';

    container.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('removing');
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  // =========================================================================
  // 3. Custom confirm dialog (no native confirm()/prompt() anywhere)
  // =========================================================================

  var confirmResolve = null;
  var confirmHasInput = false;

  function openConfirm(opts) {
    opts = opts || {};
    var modal = document.getElementById('confirmModal');
    if (!modal) {
      // No native dialogs anywhere: if the custom modal is missing, cancel instead of deleting.
      showToast(opts.message || 'Action cancelled', 'warn');
      return Promise.resolve(false);
    }
    document.getElementById('confirmTitle').textContent = opts.title || 'Are you sure?';
    document.getElementById('confirmMessage').textContent = opts.message || '';
    var okBtn = document.getElementById('btnConfirmOk');
    okBtn.textContent = opts.confirmText || 'Delete';
    okBtn.classList.toggle('danger', opts.danger !== false);
    confirmHasInput = !!opts.input;
    var wrap = document.getElementById('confirmInputWrap');
    var inp = document.getElementById('confirmInput');
    if (opts.input) {
      wrap.style.display = '';
      document.getElementById('confirmInputLabel').textContent = opts.inputLabel || 'Value';
      inp.value = opts.inputValue || '';
      inp.placeholder = opts.inputPlaceholder || '';
    } else {
      wrap.style.display = 'none';
      inp.value = '';
    }
    modal.classList.add('active');
    setTimeout(function () { if (opts.input) inp.focus(); else okBtn.focus(); }, 60);
    return new Promise(function (resolve) { confirmResolve = resolve; });
  }

  function closeConfirm(result) {
    var modal = document.getElementById('confirmModal');
    if (modal) modal.classList.remove('active');
    if (confirmResolve) {
      var r = confirmResolve;
      confirmResolve = null;
      if (confirmHasInput) {
        var v = document.getElementById('confirmInput').value;
        r({ ok: !!result, value: v });
      } else {
        r(!!result);
      }
    }
    confirmHasInput = false;
  }

  function askConfirm(title, message, confirmText) {
    return openConfirm({ title: title, message: message, confirmText: confirmText || 'Delete', danger: true });
  }

  // =========================================================================
  // 3b. Page router - one focused page at a time, footer on every page
  // =========================================================================

  var PAGES = {
    home: ['quote', 'hero', 'homePages', 'homeToday'],
    grades: ['radar'],
    deadlines: ['deadlines'],
    calendar: ['calendar'],
    study: ['study'],
    money: ['money'],
    focus: ['focus'],
    notes: ['notes']
  };

  var LEGACY_HASH = {
    hero: 'home', quote: 'home', radar: 'grades', deadlines: 'deadlines',
    calendar: 'calendar', study: 'study',
    money: 'money', focus: 'focus', notes: 'notes', top: 'home'
  };

  var currentPage = 'home';

  function pageFromHash() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    if (PAGES[h]) return h;
    if (LEGACY_HASH[h]) return LEGACY_HASH[h];
    return 'home';
  }

  function syncPageLinks() {
    document.querySelectorAll('[data-page-link]').forEach(function (a) {
      a.classList.toggle('active', a.dataset.pageLink === currentPage);
    });
  }

  function closeNavMore() {
    var m = document.getElementById('navMoreMenu');
    var b = document.getElementById('btnNavMore');
    if (m) m.classList.remove('open');
    if (b) { b.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); }
  }

  function showPage(page, skipHash) {
    if (!PAGES[page]) page = 'home';
    currentPage = page;
    Object.keys(PAGES).forEach(function (p) {
      PAGES[p].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.toggle('page-hidden', p !== page);
      });
    });
    syncPageLinks();
    closeNavMore();
    if (!skipHash) {
      try {
        if (('' + location.hash) !== '#/' + page) history.pushState(null, '', '#/' + page);
      } catch (e) { location.hash = '#/' + page; }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    // Lazy per-page refresh so each page is always correct when opened
    try {
      if (page === 'home' && typeof renderHomeDigest === 'function') renderHomeDigest();
      if (page === 'calendar' && typeof renderCalendar === 'function') renderCalendar();
      if (page === 'money' && typeof renderFinance === 'function') renderFinance();
      if (page === 'study' && typeof renderStudy === 'function') renderStudy();
      if (page === 'focus' && typeof flLeafRefresh === 'function') {
        flLeafRefresh();
        setTimeout(function () { try { flLeafRefresh(); } catch (e2) {} }, 300);
      }
    } catch (e) {}
  }

  // Element id prefix → page, so cross-page jumps open the right page first
  function pageForElement(id) {
    if (!id) return null;
    if (/^(quote|hero|homePages|homeToday)/.test(id)) return 'home';
    if (/^(course-|grade)/.test(id)) return 'grades';
    if (/^deadline-/.test(id)) return 'deadlines';
    if (/^study-/.test(id)) return 'study';
    if (/^cal|calendar/.test(id)) return 'calendar';
    if (PAGES[id]) return id;
    return null;
  }

  function initRouter() {
    showPage(pageFromHash(), true);
    window.addEventListener('hashchange', function () { showPage(pageFromHash(), true); });
    document.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('[data-page-link]') : null;
      if (link) {
        var p = link.dataset.pageLink;
        if (p && PAGES[p]) {
          e.preventDefault();
          showPage(p, false);
          return;
        }
      }
      var moreBtn = e.target.closest ? e.target.closest('#btnNavMore') : null;
      if (moreBtn) {
        e.stopPropagation();
        var m = document.getElementById('navMoreMenu');
        var open = m && m.classList.toggle('open');
        moreBtn.classList.toggle('open', !!open);
        moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        return;
      }
      if (!e.target.closest || !e.target.closest('.nav-more')) closeNavMore();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNavMore(); });
  }

  // =========================================================================
  // 4. Keyboard Shortcuts
  // =========================================================================

  var shortcutBarVisible = false;

  function toggleShortcutBar() {
    shortcutBarVisible = !shortcutBarVisible;
    var bar = document.getElementById('shortcutBar');
    if (bar) bar.classList.toggle('visible', shortcutBarVisible);
  }

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      var isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (document.getElementById('cmdPalette').classList.contains('active')) closePalette();
        else openPalette();
        return;
      }

      if (isInput) return;

      switch (e.key) {
        case 'n':
        case 'N':
          openDeadlineModal();
          break;
        case 'e':
        case 'E':
          openCalEventModal(calSelected);
          break;
        case 'c':
        case 'C':
          openCourseModal();
          break;
        case 'm':
        case 'M':
          toggleMuteAll();
          break;
        case 't':
        case 'T':
          toggleTheme();
          break;
        case ' ':
          if (tag === 'button' || tag === 'a') return;
          e.preventDefault();
          if (document.querySelector('.modal-backdrop.active')) return;
          if (pomodoroState.isRunning) pausePomodoro(); else startPomodoro();
          break;
        case '?':
          toggleShortcutBar();
          break;
      }
    });
  }

  // =========================================================================
  // 5. Copy Summary to Clipboard
  // =========================================================================

  function copySummary() {
    var totalEcts = state.courses.reduce(function (a, c) { return a + (parseFloat(c.ects) || 0); }, 0);
    var uncompleted = state.deadlines.filter(function (d) { return !d.completed; });
    var nextText = 'None';

    if (uncompleted.length > 0) {
      uncompleted.sort(function (a, b) {
        return deadlineInstant(a.dueDate, a.dueTime) - deadlineInstant(b.dueDate, b.dueTime);
      });
      var rem = getDeadlineTimeRemaining(uncompleted[0].dueDate, uncompleted[0].dueTime);
      nextText = uncompleted[0].title + ' in ' + rem.text;
    }

    var summary = 'Horizon - Fall Status\n' +
      'Courses: ' + state.courses.length + ' | Units: ' + totalEcts + ' units\n' +
      'Deadlines: ' + state.deadlines.length + ' total, ' + uncompleted.length + ' pending\n' +
      'Next: ' + nextText;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary).then(function () {
        showToast('Status summary copied to clipboard', 'success');
      });
    } else {
      showToast('Clipboard API not available', 'warn');
    }
  }

  // =========================================================================
  // 6. Export All Data as JSON
  // =========================================================================

  function exportJsonData() {
    var data = {
      courses: state.courses,
      deadlines: state.deadlines,
      reminders: calEvents,
      studyBlocks: (typeof studyBlocks !== 'undefined' ? studyBlocks : []),
      studyDone: (typeof studyDone !== 'undefined' ? studyDone : {}),
      transactions: (typeof transactions !== 'undefined' ? transactions : []),
      dues: (typeof dues !== 'undefined' ? dues : []),
      wishlist: (typeof wishlist !== 'undefined' ? wishlist : []),
      budget: (typeof finBudget !== 'undefined' ? finBudget : 400),
      flashcards: (typeof fcCards !== 'undefined' ? fcCards : []),
      settings: { scale: state.scale },
      exportedAt: new Date().toISOString()
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'Stanford_Horizon_Backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Data exported as JSON', 'success');
  }

  // =========================================================================
  // 7. Mute All Audio Helper
  // =========================================================================

  function toggleMuteAll() {
    stopRainSound();
    stopSynthSound();
    stopWhiteNoise();
    var btnRain = document.getElementById('btnSoundRain');
    var btnSynth = document.getElementById('btnSoundSynth');
    var btnWhite = document.getElementById('btnSoundWhite');
    if (btnRain) btnRain.textContent = 'Play';
    if (btnSynth) btnSynth.textContent = 'Play';
    if (btnWhite) btnWhite.textContent = 'Play';
    showToast('All audio muted', 'info');
  }

  // =========================================================================
  // 7b. Light / Dark Theme
  // =========================================================================

  var THEME_KEY = 'tue_radar_theme_v1';

  var ICON_SUN = '<svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="8" r="3.2"/><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"/></svg>';
  var ICON_MOON = '<svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z"/></svg>';

  var THEMES = ['dark', 'light', 'ghost', 'indie', 'moss', 'marigold', 'colorblind', 'colorblind-light', 'marigold-blind', 'tritan'];
  var LIGHT_THEMES = ['light', 'indie', 'moss', 'marigold', 'colorblind-light', 'marigold-blind'];

  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    return THEMES.indexOf(t) >= 0 ? t : 'dark';
  }

  function applyThemeIcon() {
    var btn = document.getElementById('btnThemeToggle');
    if (!btn) return;
    var t = currentTheme();
    btn.innerHTML = (LIGHT_THEMES.indexOf(t) >= 0) ? ICON_MOON : ICON_SUN;
  }

  function syncThemeMenu() {
    var cur = currentTheme();
    document.querySelectorAll('.theme-option').forEach(function (b) {
      b.classList.toggle('active', b.dataset.themeValue === cur);
    });
  }

  function closeThemeMenu() {
    var menu = document.getElementById('themeMenu');
    if (menu) menu.classList.remove('open');
  }

  function setTheme(theme) {
    if (THEMES.indexOf(theme) < 0) theme = 'dark';
    var root = document.documentElement;
    root.classList.add('theme-anim');
    if (theme === 'dark') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    applyThemeIcon();
    syncThemeMenu();
    setTimeout(function () { root.classList.remove('theme-anim'); }, 500);
  }

  function toggleTheme() {
    var next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
    setTheme(next);
  }

  function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (stored && THEMES.indexOf(stored) >= 0) {
      setTheme(stored);
    } else {
      setTheme('light');
    }
  }

  // =========================================================================
  // 8. State & Data
  // =========================================================================

  var STORAGE_KEY_COURSES = 'horizon_courses_v1';
  var STORAGE_KEY_DEADLINES = 'horizon_deadlines_v1';
  var STORAGE_KEY_SETTINGS = 'horizon_settings_v1';

  var DEFAULT_COURSES = [
    {
      id: 'c-cs106a', code: 'CS 106A', name: 'Programming Methodology', ects: 5, quartile: 'Fall',
      components: [
        { name: 'Programming Assignments', weight: 40, score: 3.7 },
        { name: 'Midterm Exam', weight: 25, score: 3.3 },
        { name: 'Final Exam', weight: 35, score: null }
      ],
      targetGrade: 3.7
    },
    {
      id: 'c-math51', code: 'MATH 51', name: 'Linear Algebra & Multivariable Calculus', ects: 5, quartile: 'Fall',
      components: [
        { name: 'Homework Sets', weight: 20, score: 3.5 },
        { name: 'Midterm Exam', weight: 30, score: 3.0 },
        { name: 'Final Exam', weight: 50, score: null }
      ],
      targetGrade: 3.3
    },
    {
      id: 'c-phys41', code: 'PHYSICS 41', name: 'Mechanics', ects: 4, quartile: 'Fall',
      components: [
        { name: 'Lab Reports', weight: 30, score: 3.2 },
        { name: 'Problem Sets', weight: 20, score: 3.4 },
        { name: 'Final Exam', weight: 50, score: null }
      ],
      targetGrade: 3.3
    }
  ];

  function generateDefaultDeadlines() {
    var now = new Date();
    function addDays(d, n) { var r = new Date(d); r.setDate(r.getDate() + n); return r.toISOString().split('T')[0]; }
    return [
      { id: 'dl-1', courseId: 'c-cs106a', title: 'Assignment 4: Arrays & Strings', dueDate: addDays(now, 1), dueTime: '23:59', weight: 10, portal: 'Canvas', completed: false },
      { id: 'dl-2', courseId: 'c-math51', title: 'Problem Set 5: Eigenvalues', dueDate: addDays(now, 3), dueTime: '23:59', weight: 10, portal: 'Gradescope', completed: false },
      { id: 'dl-3', courseId: 'c-phys41', title: 'Lab 4: Rotational Dynamics', dueDate: addDays(now, 6), dueTime: '23:59', weight: 15, portal: 'Canvas', completed: false },
      { id: 'dl-4', courseId: 'c-cs106a', title: 'Midterm Review Session', dueDate: addDays(now, 10), dueTime: '23:59', weight: 5, portal: 'Canvas', completed: false }
    ];
  }

  var state = {
    courses: [],
    deadlines: [],
    scale: 'gpa',
    filterCourse: 'all',
    filterUrgency: 'all'
  };

  // =========================================================================
  // 9. Storage
  // =========================================================================

  function loadState() {
    loadKeep();
    try {
      var sc = localStorage.getItem(STORAGE_KEY_COURSES);
      var sd = localStorage.getItem(STORAGE_KEY_DEADLINES);
      var ss = localStorage.getItem(STORAGE_KEY_SETTINGS);
      state.courses = sc ? JSON.parse(sc) : JSON.parse(JSON.stringify(DEFAULT_COURSES));
      state.deadlines = sd ? JSON.parse(sd) : generateDefaultDeadlines();
      if (ss) { var s = JSON.parse(ss); state.scale = s.scale || 'gpa'; }
    } catch (e) {
      state.courses = JSON.parse(JSON.stringify(DEFAULT_COURSES));
      state.deadlines = generateDefaultDeadlines();
    }
    if (state.scale === 'dutch') {
      // One-time migration: Dutch 1–10 → US GPA 4.0
      state.courses.forEach(function (c) {
        c.components.forEach(function (comp) {
          if (comp.score !== null && comp.score !== '' && !isNaN(comp.score)) {
            comp.score = Math.round(parseFloat(comp.score) * 4) / 10;
          }
        });
        var t = parseFloat(c.targetGrade);
        if (!isNaN(t)) c.targetGrade = Math.round(t * 4) / 10;
      });
      state.scale = 'gpa';
      saveState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(state.courses));
      localStorage.setItem(STORAGE_KEY_DEADLINES, JSON.stringify(state.deadlines));
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({ scale: state.scale }));
    } catch (e) { console.error('Storage error', e); }
  }

  // =========================================================================
  // 10. Grade Math Engine
  // =========================================================================

  function calculateCourseGradeMetrics(course) {
    var completedWeight = 0, securedPoints = 0, pendingWeight = 0;

    course.components.forEach(function (comp) {
      var w = parseFloat(comp.weight) || 0;
      if (comp.score !== null && comp.score !== '' && !isNaN(comp.score)) {
        completedWeight += w;
        securedPoints += (parseFloat(comp.score) * (w / 100));
      } else {
        pendingWeight += w;
      }
    });

    var currentWeightedAvg = completedWeight > 0 ? (securedPoints / (completedWeight / 100)) : null;
    var target = parseFloat(course.targetGrade) || (state.scale === 'gpa' ? 3.0 : 60);
    var neededScoreOnPending = null;
    var statusText = '', statusType = 'normal';

    if (pendingWeight === 0) {
      statusText = 'Completed';
      statusType = securedPoints >= (state.scale === 'gpa' ? 2.0 : 55) ? 'secured' : 'fail';
    } else {
      neededScoreOnPending = (target - securedPoints) / (pendingWeight / 100);
      var maxScale = state.scale === 'gpa' ? 4.0 : 100.0;
      var minScale = state.scale === 'gpa' ? 0.0 : 0.0;
      var passThreshold = state.scale === 'gpa' ? 2.0 : 55.0;

      if (neededScoreOnPending <= minScale) {
        statusText = 'Secured';
        statusType = 'secured';
      } else if (neededScoreOnPending > maxScale) {
        var maxPossible = (securedPoints + (maxScale * (pendingWeight / 100))).toFixed(1);
        statusText = 'Out of reach (max ' + maxPossible + (state.scale === 'gpa' ? '' : '%') + ')';
        statusType = 'fail';
      } else {
        if (neededScoreOnPending <= passThreshold) {
          statusText = 'Need ' + neededScoreOnPending.toFixed(1);
          statusType = 'pass';
        } else if (neededScoreOnPending <= (state.scale === 'gpa' ? 3.0 : 75)) {
          statusText = 'Need ' + neededScoreOnPending.toFixed(1);
          statusType = 'warn';
        } else {
          statusText = 'Need ' + neededScoreOnPending.toFixed(1);
          statusType = 'fail';
        }
      }
    }

    return { completedWeight: completedWeight, pendingWeight: pendingWeight, securedPoints: securedPoints, currentWeightedAvg: currentWeightedAvg, neededScoreOnPending: neededScoreOnPending, statusText: statusText, statusType: statusType };
  }

  // =========================================================================
  // 10b. Quote of the Day
  // =========================================================================

  var QUOTES = [
    { t: "Anybody can do my job, but no one can be me.", a: "Harvey Specter" },
    { t: "I don't have dreams, I have goals.", a: "Harvey Specter" },
    { t: "Win a no-win situation by rewriting the rules.", a: "Harvey Specter" },
    { t: "Work until you no longer have to introduce yourself.", a: "Harvey Specter" },
    { t: "It's not bragging if it's true.", a: "Harvey Specter" },
    { t: "I don't pave the way for people. People pave the way for me.", a: "Harvey Specter" },
    { t: "That's the difference between you and me. You wanna lose small, I wanna win big.", a: "Harvey Specter" },
    { t: "Don't raise your voice, improve your argument.", a: "Harvey Specter" },
    { t: "Winners don't make excuses.", a: "Harvey Specter" },
    { t: "Ever loved someone so much, you would do anything for them? Yeah, well, make that someone yourself and do whatever the hell you want.", a: "Harvey Specter" },
    { t: "Sometimes you have difficult moments, and then you try to work hard, and you keep working hard, and you overcome the situation.", a: "Max Verstappen" },
    { t: "That's what I enjoy: always driving on the limit of what you can do.", a: "Max Verstappen" },
    { t: "You always have to believe in yourself, and I had that from karting.", a: "Max Verstappen" },
    { t: "I always try to get the best result out of it.", a: "Max Verstappen" },
    { t: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'", a: "Muhammad Ali" },
    { t: "Float like a butterfly, sting like a bee.", a: "Muhammad Ali" },
    { t: "He who is not courageous enough to take risks will accomplish nothing in life.", a: "Muhammad Ali" },
    { t: "I am the greatest. I said that even before I knew I was.", a: "Muhammad Ali" },
    { t: "It isn't the mountains ahead to climb that wear you out; it's the pebble in your shoe.", a: "Muhammad Ali" },
    { t: "Service to others is the rent you pay for your room here on earth.", a: "Muhammad Ali" },
    { t: "Mistakes happen to the best of us.", a: "Max Verstappen" },
    { t: "I'm a winner, and I want to win.", a: "Max Verstappen" },
    { t: "You can improve on everything; you're never perfect.", a: "Max Verstappen" },
    { t: "I don't focus on what I can't do, but rather what I can achieve.", a: "Max Verstappen" },
    { t: "You miss 100% of the shots you don't take.", a: "Wayne Gretzky" },
    { t: "I can accept failure, but I can't accept not trying.", a: "Michael Jordan" },
    { t: "Don't count the days, make the days count.", a: "Muhammad Ali" },
    { t: "The moment you give up, is the moment you let someone else win.", a: "Kobe Bryant" },
    { t: "A champion is defined not by their wins, but by how they recover when they fall.", a: "Serena Williams" },
    { t: "Dreams are free. Goals have a cost.", a: "Usain Bolt" },
    { t: "It's not whether you get knocked down, it's whether you get up.", a: "Vince Lombardi" },
    { t: "Champions keep playing until they get it right.", a: "Billie Jean King" },
    { t: "Never let the fear of striking out keep you from playing.", a: "Babe Ruth" },
    { t: "Make each day your masterpiece.", a: "John Wooden" },
    { t: "There is no substitute for hard work.", a: "Thomas Edison" },
    { t: "Action is the foundational key to all success.", a: "Pablo Picasso" },
    { t: "Stay hungry, stay foolish.", a: "Steve Jobs" },
    { t: "Discipline equals freedom.", a: "Jocko Willink" },
    { t: "Be so good they can't ignore you.", a: "Steve Martin" },
    { t: "Everything seems impossible until it's done.", a: "Nelson Mandela" },
    { t: "Hard work beats talent when talent doesn't work hard.", a: "Tim Notke" },
    { t: "Clear mind, full heart, can't lose.", a: "" },
    { t: "Prove them wrong.", a: "" },
    { t: "Push yourself to the limit.", a: "" },
    { t: "Fall seven times, stand up eight.", a: "" },
    { t: "Small steps every day.", a: "" },
    { t: "Do it with passion or not at all.", a: "" },
    { t: "Doubt kills more dreams than failure ever will.", a: "" },
    { t: "Don't stop until you're proud.", a: "" },
    { t: "The best way to predict the future is to create it.", a: "" },
    { t: "Believe you can and you're halfway there.", a: "" },
    { t: "Focus on the process, not the outcome.", a: "" },
    { t: "Start where you are. Use what you have. Do what you can.", a: "" },
    { t: "Energy flows where attention goes.", a: "" },
    { t: "Great things never came from comfort zones.", a: "" },
    { t: "Everything you want is on the other side of fear.", a: "" },
    { t: "Turn your obstacles into opportunities.", a: "" },
    { t: "Your only limit is you.", a: "" },
    { t: "Continuous effort, not strength or intelligence, is the key.", a: "" },
    { t: "Build in silence, let success make the noise.", a: "" },
    { t: "Pain is temporary. Quitting lasts forever.", a: "" },
    { t: "Be better than yesterday.", a: "" },
    { t: "Success is a series of small wins.", a: "" },
    { t: "Overnight success takes 10 years.", a: "" },
    { t: "Consistency is key.", a: "" },
    { t: "Trust the process.", a: "" },
    { t: "Focus on solutions, not problems.", a: "" },
    { t: "Keep moving forward!", a: "" },
  ];

  var currentQuoteIdx = -1;

  function renderQuote(idx) {
    var textEl = document.getElementById('quoteText');
    var authorEl = document.getElementById('quoteAuthor');
    var labelEl = document.getElementById('quoteDateLabel');
    if (!textEl || !QUOTES.length) return;
    currentQuoteIdx = ((idx % QUOTES.length) + QUOTES.length) % QUOTES.length;
    var q = QUOTES[currentQuoteIdx];
    textEl.textContent = '\u201C' + q.t + '\u201D';
    textEl.title = q.t;
    if (authorEl) authorEl.textContent = q.a ? '\u2014 ' + q.a : '';
    if (labelEl) labelEl.textContent = 'Quote of the day';
    fitQuote();
  }

  // Long quotes render smaller, short quotes render bigger - the strip
  // never exceeds 2 lines no matter the length.
  function fitQuote() {
    var el = document.getElementById('quoteText');
    if (!el) return;
    var len = (el.textContent || '').length;
    var size = len > 140 ? 11 : len > 100 ? 12 : len > 60 ? 13 : 14.5;
    el.style.fontSize = size + 'px';
    while (el.scrollHeight > el.clientHeight + 1 && size > 10) {
      size -= 0.5;
      el.style.fontSize = size + 'px';
    }
  }

  function renderDailyQuote() {
    var dayNum = Math.floor(Date.now() / 86400000);
    renderQuote(dayNum);
  }

  var shuffleCount = 0;

  function shuffleQuote() {
    var btn = document.getElementById('btnShuffleQuote');
    if (btn) {
      btn.classList.remove('spin');
      void btn.offsetWidth;
      btn.classList.add('spin');
    }
    shuffleCount++;
    if (shuffleCount % 2 === 1) {
      // Odd clicks: Harvey Specter or Max Verstappen only
      var pool = [];
      QUOTES.forEach(function (q, i) {
        if (q.a === 'Harvey Specter' || q.a === 'Max Verstappen') pool.push(i);
      });
      if (!pool.length) return;
      var idx = pool[Math.floor(Math.random() * pool.length)];
      if (idx === currentQuoteIdx && pool.length > 1) idx = pool[(pool.indexOf(idx) + 1) % pool.length];
      renderQuote(idx);
    } else {
      // Even clicks: anything goes
      if (QUOTES.length < 2) { renderQuote(0); return; }
      var r = Math.floor(Math.random() * QUOTES.length);
      if (r === currentQuoteIdx) r = (r + 1) % QUOTES.length;
      renderQuote(r);
    }
  }

  // Year progress widget
  function renderYearProgress() {
    var now = new Date();
    var year = now.getFullYear();
    var start = new Date(year, 0, 1);
    var end = new Date(year + 1, 0, 1);
    var pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    var shown = pct.toFixed(1);
    var bar = document.getElementById('yearBar');
    var pctEl = document.getElementById('yearPct');
    var label = document.getElementById('yearLabel');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) {
      pctEl.textContent = shown;
      pctEl.title = shown + '% of ' + year + ' finished';
    }
    if (label) label.textContent = shown + '% of ' + year + ' is over';
  }

  // Morse code easter eggs - decode them yourself
  function morseEggs() {
    try {
      var mono = 'font-family:monospace;color:#0071e3';
      console.log('%c.... . .-.. .-.. ---  \u2192  Hello', mono);
      console.log('%c.... ..  \u2192  Hi', mono);
      console.log('%c... --- ...  \u2192  SOS', 'font-family:monospace;color:#ff3b30');
      console.log('%c- . ... -  \u2192  Test', mono);
      console.log('%c-- .- -.. .  .-- .. - ....  .-.. --- ...- .  \u2192  Made with love', 'font-family:monospace;color:#30d158');
    } catch (e) {}
  }

  // =========================================================================
  // 11. Course Rendering (with Progress Bars)
  // =========================================================================

  function renderCourses() {
    var container = document.getElementById('coursesContainer');
    if (!container) return;
    container.innerHTML = '';

    if (state.courses.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
        '<svg class="empty-state-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="10" width="36" height="28" rx="3"/><path d="M6 18h36"/><circle cx="24" cy="30" r="4"/><path d="M20 30h8"/></svg>' +
        '<p class="empty-state-text">No courses yet.</p>' +
        '</div>';
      return;
    }

    state.courses.forEach(function (course) {
      var metrics = calculateCourseGradeMetrics(course);
      var isGpa = state.scale === 'gpa';
      var card = document.createElement('div');
      card.className = 'apple-course-card';
      card.id = 'course-' + course.id;

      // Progress bar
      var progressPct = metrics.completedWeight;
      var progressHtml = '<div class="course-progress-bar"><div class="course-progress-filled" style="width:' + progressPct + '%"></div></div>';

      var componentsHtml = '';
      course.components.forEach(function (comp) {
        var hasScore = comp.score !== null && comp.score !== '' && !isNaN(comp.score);
        var scoreDisplay = hasScore ? parseFloat(comp.score).toFixed(1) : 'Pending';
        var scoreClass = hasScore ? 'scored' : 'pending';
        componentsHtml +=
          '<div class="component-item-row">' +
          '<span class="comp-name-label">' + escapeHtml(comp.name) +
          ' <span class="comp-weight-label">' + comp.weight + '%</span></span>' +
          '<span class="comp-score-label ' + scoreClass + '">' + scoreDisplay + '</span>' +
          '</div>';
      });

      var minSlider = isGpa ? 2.0 : 50;
      var maxSlider = isGpa ? 4.0 : 100;
      var stepSlider = isGpa ? 0.1 : 1;
      var currentTarget = parseFloat(course.targetGrade) || (isGpa ? 3.0 : 60);

      var badgeClass = 'grade-pass';
      if (metrics.statusType === 'warn') badgeClass = 'grade-warn';
      if (metrics.statusType === 'fail') badgeClass = 'grade-fail';
      if (metrics.statusType === 'secured') badgeClass = 'grade-secured';

      card.innerHTML =
        '<div class="course-card-top">' +
        '<div>' +
        '<div class="course-code-tag">' + escapeHtml(course.code) + '</div>' +
        '<h3 class="course-card-title">' + escapeHtml(course.name) + '</h3>' +
        '<div class="course-meta-tags">' +
        '<span class="meta-chip">' + course.ects + ' units</span>' +
        '<span class="meta-chip">' + (course.quartile || 'Fall') + '</span>' +
        '</div></div>' +
        '<div class="card-icon-actions">' +
        '<button class="btn-card-glyph btn-edit-course" data-id="' + course.id + '" title="Edit Course" aria-label="Edit Course">' +
        '<svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 2l3 3-9 9H2v-3l9-9z"></path></svg></button>' +
        '<button class="btn-card-glyph btn-delete-course" data-id="' + course.id + '" title="Delete Course" aria-label="Delete Course">' +
        '<svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 4h10M6 4V2.5h4V4M5 4v9h6V4"></path></svg></button>' +
        '</div></div>' +
        progressHtml +
        '<div class="components-overview">' + componentsHtml + '</div>' +
        '<div class="grade-simulator-unit">' +
        '<div class="sim-labels-row"><span class="sim-title">Target Goal</span><span class="sim-target-number" id="simVal-' + course.id + '">' + currentTarget.toFixed(1) + '</span></div>' +
        '<input type="range" class="apple-slider sim-slider" data-id="' + course.id + '" min="' + minSlider + '" max="' + maxSlider + '" step="' + stepSlider + '" value="' + currentTarget + '" aria-label="Target Grade Slider">' +
        '<div class="sim-output-badge"><span class="sim-badge-label">Need:</span><span class="sim-badge-val ' + badgeClass + '" id="simNeeded-' + course.id + '">' + metrics.statusText + '</span></div>' +
        '</div>';

      container.appendChild(card);
    });

    // Slider listeners
    container.querySelectorAll('.sim-slider').forEach(function (slider) {
      slider.addEventListener('input', function (e) {
        var cId = e.target.dataset.id;
        var val = parseFloat(e.target.value);
        var course = state.courses.find(function (c) { return c.id === cId; });
        if (course) {
          course.targetGrade = val;
          var label = document.getElementById('simVal-' + cId);
          if (label) label.textContent = val.toFixed(1);
          var m = calculateCourseGradeMetrics(course);
          var badge = document.getElementById('simNeeded-' + cId);
          if (badge) {
            badge.textContent = m.statusText;
            badge.className = 'sim-badge-val ' +
              (m.statusType === 'warn' ? 'grade-warn' : m.statusType === 'fail' ? 'grade-fail' : m.statusType === 'secured' ? 'grade-secured' : 'grade-pass');
          }
          saveState();
        }
      });
    });

    container.querySelectorAll('.btn-edit-course').forEach(function (btn) {
      btn.addEventListener('click', function () { openCourseModal(btn.dataset.id); });
    });
    container.querySelectorAll('.btn-delete-course').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var course = state.courses.find(function (c) { return c.id === btn.dataset.id; });
        askConfirm('Delete course?', 'Delete "' + (course ? course.code + ' - ' + course.name : 'this course') + '" and its deadlines? This cannot be undone.').then(function (ok) {
          if (ok) deleteCourse(btn.dataset.id);
        });
      });
    });

    updateOverallKPIs();
    populateCourseDropdowns();
  }

  // =========================================================================
  // 12. Deadline Rendering (with Urgency Progress Bars)
  // =========================================================================

  var PT_TZ = 'America/Los_Angeles';

  // Interpret a deadline's wall-clock date+time in Stanford (PT) instead of
  // browser-local time, so cutoffs don't shift when the site is opened
  // outside California (or during DST transitions).
  function deadlineInstant(dueDateStr, dueTimeStr) {
    var asUtc = new Date(dueDateStr + 'T' + (dueTimeStr || '23:59') + ':00Z');
    if (isNaN(asUtc)) return new Date(NaN);
    try {
      var fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: PT_TZ, hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      var parts = {};
      fmt.formatToParts(asUtc).forEach(function (p) { parts[p.type] = p.value; });
      var asTz = Date.UTC(
        parseInt(parts.year, 10), parseInt(parts.month, 10) - 1, parseInt(parts.day, 10),
        parseInt(parts.hour, 10), parseInt(parts.minute, 10), parseInt(parts.second, 10)
      );
      return new Date(asUtc.getTime() - (asTz - asUtc.getTime()));
    } catch (e) {
      return new Date(dueDateStr + 'T' + (dueTimeStr || '23:59') + ':00');
    }
  }

  function getDeadlineTimeRemaining(dueDateStr, dueTimeStr) {
    var target = deadlineInstant(dueDateStr, dueTimeStr);
    var now = new Date();
    var diffMs = target - now;

    if (diffMs <= 0) return { expired: true, diffMs: 0, text: 'Passed', hours: 0, urgency: 'expired', vibe: 'Locked', totalHours: 0 };

    var totalHours = diffMs / (1000 * 60 * 60);
    var days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    var text = days > 0 ? days + 'd ' + hours + 'h ' + minutes + 'm' : hours + 'h ' + minutes + 'm ' + seconds + 's';
    var urgency = 'chill', vibe = 'On Track';

    if (totalHours < 2) { urgency = 'danger'; vibe = 'Urgent'; }
    else if (totalHours < 24) { urgency = 'danger'; vibe = 'Today'; }
    else if (totalHours < 48) { urgency = 'warning'; vibe = 'Soon'; }

    return { expired: false, diffMs: diffMs, text: text, totalHours: totalHours, urgency: urgency, vibe: vibe };
  }

  // Live tick: refresh visible countdown digits/vibes/bars every second
  // without a full list re-render (cheap textContent-only updates).
  function tickDeadlineTimers() {
    var container = document.getElementById('deadlinesContainer');
    if (!container) return;
    var digits = container.querySelectorAll('.timer-digits-main');
    if (!digits.length) return;
    var windowMs = 14 * 24 * 60 * 60 * 1000;
    digits.forEach(function (el) {
      if (el.dataset.done) return;
      var rem = getDeadlineTimeRemaining(el.dataset.dueDate, el.dataset.dueTime);
      var txt = rem.expired ? 'Passed' : rem.text;
      if (el.textContent !== txt) el.textContent = txt;
      el.classList.toggle('timer-digits-urgent', !rem.expired && rem.urgency === 'danger');
      var vibe = el.parentElement ? el.parentElement.querySelector('.timer-vibe-sub') : null;
      if (vibe) {
        var vibeTxt = rem.expired ? 'Passed' : rem.vibe;
        if (vibe.textContent !== vibeTxt) vibe.textContent = vibeTxt;
      }
      var row = el.closest ? el.closest('.deadline-row-item') : null;
      var bar = row ? row.querySelector('.deadline-urgency-bar') : null;
      if (bar) {
        if (rem.expired) {
          bar.className = 'deadline-urgency-bar expired';
        } else {
          bar.className = 'deadline-urgency-bar ' + rem.urgency;
          bar.style.width = Math.min(100, Math.max(0, (rem.diffMs / windowMs) * 100)) + '%';
        }
      }
    });
  }

  function renderDeadlines() {
    var container = document.getElementById('deadlinesContainer');
    if (!container) return;
    container.innerHTML = '';

    var filtered = state.deadlines.filter(function (d) {
      if (state.filterCourse !== 'all' && d.courseId !== state.filterCourse) return false;
      if (state.filterUrgency === 'completed' && !d.completed) return false;
      if (state.filterUrgency === 'pending' && d.completed) return false;
      if (state.filterUrgency === 'urgent') {
        if (d.completed) return false;
        var rem = getDeadlineTimeRemaining(d.dueDate, d.dueTime);
        if (rem.expired || rem.totalHours > 48) return false;
      }
      return true;
    });

    filtered.sort(function (a, b) {
      return deadlineInstant(a.dueDate, a.dueTime) - deadlineInstant(b.dueDate, b.dueTime);
    });

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
        '<svg class="empty-state-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="24" cy="24" r="18"/><path d="M24 14v10l7 4"/></svg>' +
        '<p class="empty-state-text">No deadlines.</p>' +
        '</div>';
      return;
    }

    filtered.forEach(function (item) {
      var course = state.courses.find(function (c) { return c.id === item.courseId; });
      var courseCode = course ? shorten(course.code, 14) : 'SU';
      var rem = getDeadlineTimeRemaining(item.dueDate, item.dueTime);

      // Urgency progress bar width (100% at creation, shrinks with time)
      var barWidth = 0;
      var barClass = 'expired';
      if (!item.completed && !rem.expired) {
        var totalWindowMs = 14 * 24 * 60 * 60 * 1000; // assume 14 day window
        barWidth = Math.min(100, Math.max(0, (rem.diffMs / totalWindowMs) * 100));
        barClass = rem.urgency;
      }

      var row = document.createElement('div');
      row.className = 'deadline-row-item';
      row.id = 'deadline-' + item.id;
      row.innerHTML =
        '<div class="deadline-left-col">' +
        '<input type="checkbox" class="apple-checkbox dl-check" data-id="' + item.id + '" ' + (item.completed ? 'checked' : '') + ' aria-label="Mark completed">' +
        '<div class="deadline-info-block">' +
        '<span class="deadline-eyebrow-tag">' + escapeHtml(courseCode) + ' &bull; ' + (item.weight || 0) + '%</span>' +
        '<span class="deadline-title-text" style="' + (item.completed ? 'text-decoration:line-through;opacity:0.5;' : '') + '">' + escapeHtml(item.title) + '</span>' +
        '<div class="deadline-meta-text"><span>' + item.dueDate + ' · ' + item.dueTime + '</span></div>' +
        '</div></div>' +
        '<div class="deadline-right-col">' +
        '<div class="deadline-timer-stack">' +
        '<span class="timer-digits-main ' + (rem.urgency === 'danger' && !item.completed ? 'timer-digits-urgent' : '') + '"' +
        ' data-due-date="' + item.dueDate + '" data-due-time="' + item.dueTime + '"' + (item.completed ? ' data-done="1"' : '') + '>' +
        (item.completed ? 'Submitted' : rem.text) + '</span>' +
        '<span class="timer-vibe-sub">' + (item.completed ? 'Done' : rem.vibe) + '</span>' +
        '</div>' +
        '<button class="btn-card-glyph btn-delete-deadline" data-id="' + item.id + '" title="Delete Deadline" aria-label="Delete Deadline">' +
        '<svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 4h10M6 4V2.5h4V4M5 4v9h6V4"></path></svg></button>' +
        '</div>' +
        '<div class="deadline-urgency-bar ' + barClass + '" style="width:' + barWidth + '%"></div>';

      container.appendChild(row);
    });

    // Checkbox with confetti
    container.querySelectorAll('.dl-check').forEach(function (chk) {
      chk.addEventListener('change', function (e) {
        var id = e.target.dataset.id;
        var dl = state.deadlines.find(function (d) { return d.id === id; });
        if (dl) {
          dl.completed = e.target.checked;
          if (dl.completed) {
            var rect = e.target.getBoundingClientRect();
            confetti.fire((rect.left + rect.width / 2) / window.innerWidth, (rect.top + rect.height / 2) / window.innerHeight);
            playSprintCompletionChime();
            showToast('Deadline submitted! Well done.', 'success');
          }
          saveState();
          renderDeadlines();
          updateOverallKPIs();
          renderCalendar();
        }
      });
    });

    container.querySelectorAll('.btn-delete-deadline').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.id;
        state.deadlines = state.deadlines.filter(function (d) { return d.id !== id; });
        saveState();
        renderDeadlines();
        updateOverallKPIs();
        renderCalendar();
        showToast('Deadline removed', 'info');
      });
    });
  }

  // =========================================================================
  // 12b. In-Tab Deadline Reminders (Notification API, opt-in only)
  // =========================================================================

  var REM_KEY = 'tue_pass_reminders_v1';
  var notifiedIds = {};

  function remindersEnabled() {
    try { return localStorage.getItem(REM_KEY) === '1'; } catch (e) { return false; }
  }

  function syncReminderBtn() {
    var btn = document.getElementById('btnReminders');
    if (!btn) return;
    btn.textContent = (remindersEnabled() && 'Notification' in window && Notification.permission === 'granted') ? 'Reminders on' : 'Enable reminders';
  }

  function checkReminders() {
    if (!('Notification' in window) || Notification.permission !== 'granted' || !remindersEnabled()) return;
    var now = new Date();
    state.deadlines.forEach(function (d) {
      if (d.completed || notifiedIds[d.id]) return;
      var diff = deadlineInstant(d.dueDate, d.dueTime) - now;
      if (diff > 0 && diff <= 2 * 60 * 60 * 1000) {
        notifiedIds[d.id] = true;
        var rem = getDeadlineTimeRemaining(d.dueDate, d.dueTime);
        try { new Notification('Deadline in ' + rem.text, { body: d.title }); } catch (e) {}
      }
    });
    calEvents.forEach(function (c) {
      var key = 'cal-' + c.id;
      if (notifiedIds[key]) return;
      var when = new Date(c.date + 'T' + (c.time || '09:00') + ':00');
      var diff = when - now;
      if (diff > 0 && diff <= 2 * 60 * 60 * 1000) {
        notifiedIds[key] = true;
        try { new Notification('Reminder: ' + c.title, { body: (c.time || '') + ' · ' + (c.notes || c.date) }); } catch (e) {}
      }
    });
    if (typeof keepNotes !== 'undefined') {
      var dirty = false;
      keepNotes.forEach(function (n) {
        if (!n.reminder || n.reminded || n.deletedAt || n.type === 'todo') return;
        if (new Date(n.reminder).getTime() <= now.getTime()) {
          n.reminded = true;
          dirty = true;
          try { new Notification('Note reminder', { body: (n.title || 'Untitled') + (n.body ? ' - ' + String(n.body).slice(0, 80) : '') }); } catch (e) {}
          showToast('Reminder: ' + (n.title || 'Untitled note'), 'info');
          try { playSprintCompletionChime(); } catch (e2) {}
        }
      });
      if (dirty) {
        persistKeep();
        if (typeof renderKeepList === 'function') renderKeepList();
      }
    }
  }

  // =========================================================================
  // 12c. Command Palette
  // =========================================================================

  var cmdActiveIdx = 0;
  var cmdFiltered = [];

  function scrollFlash(id) {
    // Open the right page first, then scroll - pages hide inactive sections.
    try {
      var pg = typeof pageForElement === 'function' ? pageForElement(id) : null;
      if (pg && typeof showPage === 'function' && pg !== currentPage) showPage(pg, false);
    } catch (e) {}
    var el = document.getElementById(id);
    if (!el) return;
    setTimeout(function () {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('flash-highlight');
      setTimeout(function () { el.classList.remove('flash-highlight'); }, 1600);
    }, 60);
  }

  function cmdCommands() {
    var cmds = [
      { label: 'Go to Home', hint: 'jump', run: function () { showPage('home', false); } },
      { label: 'Go to Grades', hint: 'jump', run: function () { showPage('grades', false); } },
      { label: 'Go to Deadlines', hint: 'jump', run: function () { showPage('deadlines', false); } },
      { label: 'Go to Calendar', hint: 'jump', run: function () { showPage('calendar', false); } },
      { label: 'Go to Study planner', hint: 'jump', run: function () { showPage('study', false); } },

      { label: 'Go to Finances', hint: 'jump', run: function () { showPage('money', false); } },
      { label: 'Go to Focus', hint: 'jump', run: function () { showPage('focus', false); } },
      { label: 'Go to Airplane mode', hint: 'jump', run: function () { showPage('focus', false); setTimeout(function () { scrollFlash('flightSim'); }, 120); } },
      { label: 'Back to top', hint: 'jump', run: function () { window.scrollTo({ top: 0, behavior: 'smooth' }); } },
      { label: 'New deadline', hint: 'N', run: function () { openDeadlineModal(); } },
      { label: 'New calendar reminder', hint: 'E', run: function () { openCalEventModal(calSelected); } },
      { label: 'New course', hint: 'C', run: function () { openCourseModal(); } },
      { label: 'New study block', hint: 'study', run: function () { openStudyModal(); } },
      { label: 'New transaction', hint: 'finances', run: function () { openFinModal(); } },
      { label: 'New due', hint: 'finances', run: function () { openDueModal(); } },

      { label: 'Go to Notes', hint: 'jump', run: function () { showPage('notes', false); } },
      { label: 'Start / pause sprint', hint: 'Space', run: function () { if (pomodoroState.isRunning) pausePomodoro(); else startPomodoro(); } },
      { label: 'Export calendar (.ics)', hint: 'file', run: function () { exportIcsCalendar(); } },
      { label: 'Export data (JSON)', hint: 'file', run: function () { exportJsonData(); } },
      { label: 'Copy status summary', hint: 'clipboard', run: function () { copySummary(); } },
      { label: 'Enable reminders', hint: 'bell', run: function () { enableReminders(); } },
      { label: 'Open credits', hint: 'modal', run: function () { openCreditsModal(); } },
      { label: 'Party time', hint: 'easter egg', run: function () { confetti.fire(0.5, 0.4); showToast('You found the secret menu item. Shhh.', 'success'); } },
      { label: 'Theme: Dark', hint: 'theme', run: function () { setTheme('dark'); } },
      { label: 'Theme: Light', hint: 'theme', run: function () { setTheme('light'); } },
      { label: 'Theme: Ghost (dark)', hint: 'theme', run: function () { setTheme('ghost'); } },
      { label: 'Theme: Marigold', hint: 'theme', run: function () { setTheme('marigold'); } },
      { label: 'Theme: Colorblind', hint: 'theme', run: function () { setTheme('colorblind'); } },
      { label: 'Theme: Colorblind Light', hint: 'theme', run: function () { setTheme('colorblind-light'); } },
      { label: 'Theme: Marigold Safe', hint: 'theme', run: function () { setTheme('marigold-blind'); } },
      { label: 'Theme: Tritan', hint: 'theme', run: function () { setTheme('tritan'); } },
      { label: 'Theme: Indie', hint: 'theme', run: function () { setTheme('indie'); } }
    ];
    state.courses.forEach(function (c) {
      cmds.push({ label: c.code + ' - ' + c.name, hint: 'course', run: (function (id) { return function () { scrollFlash('course-' + id); }; })(c.id) });
    });
    state.deadlines.filter(function (d) { return !d.completed; }).forEach(function (d) {
      cmds.push({ label: d.title, hint: 'deadline', run: (function (id) { return function () { scrollFlash('deadline-' + id); }; })(d.id) });
    });
    return cmds;
  }

  function setCmdActive(i) {
    cmdActiveIdx = i;
    document.querySelectorAll('#cmdList .cmd-item').forEach(function (el, j) {
      el.classList.toggle('active', j === i);
    });
  }

  function renderCmdList(q) {
    var all = cmdCommands();
    q = (q || '').toLowerCase();
    cmdFiltered = all.filter(function (c) { return c.label.toLowerCase().indexOf(q) >= 0; }).slice(0, 9);
    cmdActiveIdx = 0;
    var list = document.getElementById('cmdList');
    list.innerHTML = '';
    if (!cmdFiltered.length) {
      list.innerHTML = '<div class="cmd-empty">No matches</div>';
      return;
    }
    cmdFiltered.forEach(function (c, i) {
      var div = document.createElement('div');
      div.className = 'cmd-item' + (i === 0 ? ' active' : '');
      var label = document.createElement('span');
      label.textContent = c.label;
      div.appendChild(label);
      if (c.hint) {
        var hint = document.createElement('span');
        hint.className = 'cmd-hint';
        hint.textContent = c.hint;
        div.appendChild(hint);
      }
      div.addEventListener('click', function () { closePalette(); c.run(); });
      div.addEventListener('mousemove', function () { setCmdActive(i); });
      list.appendChild(div);
    });
  }

  function openPalette() {
    document.getElementById('cmdPalette').classList.add('active');
    var inp = document.getElementById('cmdInput');
    inp.value = '';
    renderCmdList('');
    setTimeout(function () { inp.focus(); }, 30);
  }

  function closePalette() {
    document.getElementById('cmdPalette').classList.remove('active');
  }

  function enableReminders() {
    if (!('Notification' in window)) { showToast('Notifications not supported here', 'warn'); return; }
    Notification.requestPermission().then(function (p) {
      if (p === 'granted') {
        try { localStorage.setItem(REM_KEY, '1'); } catch (e) {}
        showToast('Reminders on - 2h before each cutoff', 'success');
      } else {
        showToast('Reminders blocked in browser settings', 'warn');
      }
      syncReminderBtn();
    });
  }

  // =========================================================================
  // 13. ICS Export
  // =========================================================================

  function exportIcsCalendar() {
    if (state.deadlines.length === 0 && calEvents.length === 0) { showToast('No deadlines to export.', 'warn'); return; }

    function fmtIcs(dateStr, timeStr) {
      return dateStr.replace(/-/g, '') + 'T' + (timeStr.replace(/:/g, '') || '2359') + '00';
    }

    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//Stanford//Horizon//EN',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'X-WR-CALNAME:Stanford Deadlines', 'X-WR-TIMEZONE:America/Los_Angeles'
    ];

    state.deadlines.forEach(function (dl, idx) {
      var course = state.courses.find(function (c) { return c.id === dl.courseId; });
      var code = course ? course.code : 'SU';
      lines.push('BEGIN:VEVENT');
      lines.push('UID:tue-' + dl.id + '-' + idx + '@tue.nl');
      lines.push('SUMMARY:[' + code + '] ' + dl.title);
      lines.push('DESCRIPTION:Course: ' + code + '\\nPortal: ' + (dl.portal || 'Canvas') + '\\nWeight: ' + (dl.weight || 0) + '%');
      lines.push('LOCATION:' + (dl.portal || 'Canvas'));
      lines.push('DTSTART;TZID=' + PT_TZ + ':' + fmtIcs(dl.dueDate, '23:00'));
      lines.push('DTEND;TZID=' + PT_TZ + ':' + fmtIcs(dl.dueDate, dl.dueTime));
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:Deadline reminder: ' + code);
      lines.push('TRIGGER:-PT2H');
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    });

    if (typeof studyBlocks !== 'undefined') {
      studyBlocks.forEach(function (b) {
        (typeof studyDays === 'function' ? studyDays(b) : []).forEach(function (ds) {
          var hhmm = (b.time || '09:00').replace(/:/g, '');
          lines.push('BEGIN:VEVENT');
          lines.push('UID:study-' + b.id + '-' + ds + '@tue.nl');
          lines.push('SUMMARY:[Study] ' + b.subject);
          lines.push('DESCRIPTION:' + (b.notes || 'Study block').slice(0, 200));
          lines.push('DTSTART:' + ds.replace(/-/g, '') + 'T' + hhmm + '00');
          lines.push('DTEND:' + ds.replace(/-/g, '') + 'T' + hhmm + '00');
          lines.push('BEGIN:VALARM');
          lines.push('ACTION:DISPLAY');
          lines.push('DESCRIPTION:Study: ' + b.subject);
          lines.push('TRIGGER:-PT30M');
          lines.push('END:VALARM');
          lines.push('END:VEVENT');
        });
      });
    }

    calEvents.forEach(function (ev, idx) {
      var hhmm = (ev.time || '09:00').replace(/:/g, '');
      lines.push('BEGIN:VEVENT');
      lines.push('UID:cal-' + ev.id + '-' + idx + '@tue.nl');
      lines.push('SUMMARY:' + ev.title);
      lines.push('DESCRIPTION:' + (ev.notes || 'Reminder'));
      lines.push('DTSTART:' + ev.date.replace(/-/g, '') + 'T' + hhmm + '00');
      lines.push('DTEND:' + ev.date.replace(/-/g, '') + 'T' + hhmm + '00');
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:Reminder: ' + ev.title);
      lines.push('TRIGGER:-PT2H');
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');

    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'Stanford_Deadlines.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Calendar file exported', 'success');
  }

  // =========================================================================
  // 14. Web Audio Engine
  // =========================================================================

  var audioCtx = null;
  var soundNodes = {
    rain: { node: null, gain: null, playing: false },
    synth: { nodes: [], gain: null, timer: null, playing: false },
    white: { node: null, gain: null, playing: false }
  };

  function getAudioContext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function startRainSound(volume) {
    var ctx = getAudioContext();
    var bufferSize = 2 * ctx.sampleRate;
    var noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var output = noiseBuffer.getChannelData(0);
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3200;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    soundNodes.rain = { node: src, gain: gain, playing: true };
  }

  function stopRainSound() {
    if (soundNodes.rain.node) {
      try { soundNodes.rain.node.stop(); soundNodes.rain.node.disconnect(); } catch (e) {}
      soundNodes.rain = { node: null, gain: null, playing: false };
    }
  }

  function startSynthSound(volume) {
    var ctx = getAudioContext();
    var chords = [
      [174.61, 207.65, 261.63, 311.13, 392.00],
      [116.54, 174.61, 233.08, 293.66, 349.23],
      [155.56, 196.00, 233.08, 293.66, 349.23]
    ];
    var masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
    masterGain.connect(ctx.destination);
    var chordIndex = 0;

    function playNextChord() {
      soundNodes.synth.nodes.forEach(function (o) { try { o.stop(ctx.currentTime + 1.2); } catch (e) {} });
      soundNodes.synth.nodes = [];
      chords[chordIndex].forEach(function (freq) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5.5);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        soundNodes.synth.nodes.push(osc);
      });
      chordIndex = (chordIndex + 1) % chords.length;
    }

    playNextChord();
    soundNodes.synth = { nodes: soundNodes.synth.nodes, gain: masterGain, timer: setInterval(playNextChord, 5000), playing: true };
  }

  function stopSynthSound() {
    if (soundNodes.synth.timer) clearInterval(soundNodes.synth.timer);
    soundNodes.synth.nodes.forEach(function (o) { try { o.stop(); o.disconnect(); } catch (e) {} });
    soundNodes.synth = { nodes: [], gain: null, timer: null, playing: false };
  }

  function startWhiteNoise(volume) {
    var ctx = getAudioContext();
    var bufferSize = ctx.sampleRate * 2;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.7;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    soundNodes.white = { node: src, gain: gain, playing: true };
  }

  function stopWhiteNoise() {
    if (soundNodes.white.node) {
      try { soundNodes.white.node.stop(); soundNodes.white.node.disconnect(); } catch (e) {}
      soundNodes.white = { node: null, gain: null, playing: false };
    }
  }

  function playTimerAlarm() {
    try {
      var ctx = getAudioContext();
      var pattern = [0, 0.35, 0.7, 1.4, 1.75, 2.1];
      pattern.forEach(function (at) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, ctx.currentTime + at);
        gain.gain.setValueAtTime(0, ctx.currentTime + at);
        gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + at + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + at);
        osc.stop(ctx.currentTime + at + 0.35);
      });
    } catch (e) {}
  }

  function notifyTimerEnd(title, body) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: body });
      }
    } catch (e) {}
    try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e2) {}
  }

  function playSprintCompletionChime() {
    try {
      var ctx = getAudioContext();
      var notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach(function (freq, idx) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.15 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 1.3);
      });
    } catch (e) {}
  }

  // =========================================================================
  // 15. Pomodoro Timer
  // =========================================================================

  var pomodoroState = { durationMinutes: 25, secondsLeft: 25 * 60, isRunning: false, timerId: null, phase: 'focus' };
  var CIRCLE_CIRCUMFERENCE = 640;

  function updateTimerDisplay() {
    var m = Math.floor(pomodoroState.secondsLeft / 60);
    var s = pomodoroState.secondsLeft % 60;
    var str = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    var displayEl = document.getElementById('timerDisplay');
    if (displayEl) displayEl.textContent = str;

    var totalSec = pomodoroState.durationMinutes * 60;
    var progress = (totalSec - pomodoroState.secondsLeft) / totalSec;
    var dashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);
    var circle = document.getElementById('timerProgressCircle');
    if (circle) circle.style.strokeDashoffset = dashoffset;
  }

  function startPomodoro() {
    if (pomodoroState.isRunning) return;
    try {
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    } catch (e) {}
    pomodoroState.isRunning = true;
    var text = document.getElementById('timerPlayText');
    var icon = document.getElementById('timerPlayIconSvg');
    if (text) text.textContent = 'Pause';
    if (icon) icon.innerHTML = '<rect x="3" y="2" width="3.5" height="12"></rect><rect x="9.5" y="2" width="3.5" height="12"></rect>';

    pomodoroState.timerId = setInterval(function () {
      if (pomodoroState.secondsLeft > 0) {
        pomodoroState.secondsLeft--;
        updateTimerDisplay();
      } else {
        clearInterval(pomodoroState.timerId);
        pomodoroState.isRunning = false;
        if (text) text.textContent = 'Start Sprint';
        if (icon) icon.innerHTML = '<polygon points="4,2 14,8 4,14"></polygon>';
        confetti.fire(0.5, 0.5);
        playSprintCompletionChime();
        playTimerAlarm();
        if (pomodoroState.phase === 'focus') {
          recordSprint();
          notifyTimerEnd('Focus sprint done', 'Nice work. Your 5-minute break starts when you press Start.');
          pomodoroState.phase = 'break';
          pomodoroState.durationMinutes = 5;
          showToast('Sprint banked. 5-minute break queued.', 'success');
        } else {
          notifyTimerEnd('Break over', 'Time to lock back in for 25 minutes.');
          pomodoroState.phase = 'focus';
          pomodoroState.durationMinutes = 25;
          showToast('Break over. 25-minute focus queued.', 'info');
        }
        syncTimerPhaseUI();
        resetPomodoro();
      }
    }, 1000);
  }

  function pausePomodoro() {
    if (!pomodoroState.isRunning) return;
    clearInterval(pomodoroState.timerId);
    pomodoroState.isRunning = false;
    var text = document.getElementById('timerPlayText');
    var icon = document.getElementById('timerPlayIconSvg');
    if (text) text.textContent = 'Resume';
    if (icon) icon.innerHTML = '<polygon points="4,2 14,8 4,14"></polygon>';
  }

  function resetPomodoro() {
    pausePomodoro();
    pomodoroState.secondsLeft = pomodoroState.durationMinutes * 60;
    updateTimerDisplay();
  }

  function setFocusCustom() {
    var inp = document.getElementById('focusCustomMin');
    var n = inp ? Math.round(parseFloat(inp.value)) : NaN;
    if (!(n >= 1)) { showToast('Enter 1 to 180 minutes', 'warn'); return; }
    n = Math.min(180, Math.max(1, n));
    pomodoroState.phase = 'focus';
    pomodoroState.durationMinutes = n;
    syncTimerPhaseUI();
    resetPomodoro();
    showToast(n + '-minute focus ready - press Start', 'success');
  }

  function syncTimerPhaseUI() {
    var pill = document.getElementById('timerPhasePill');
    if (pill) pill.textContent = pomodoroState.phase === 'focus' ? 'FOCUS SPRINT' : 'COFFEE BREAK';
    document.querySelectorAll('.chip-btn').forEach(function (c) {
      var match = parseInt(c.dataset.duration, 10) === pomodoroState.durationMinutes && c.dataset.phase === pomodoroState.phase;
      c.classList.toggle('active', match);
    });
  }

  var SPRINT_HIST_KEY = 'tue_pass_sprint_hist_v1';
  function todayKey(d) {
    var x = d || new Date();
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  }
  function getSprintHist() {
    try {
      var raw = localStorage.getItem(SPRINT_HIST_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }
  function saveSprintHist(h) {
    try { localStorage.setItem(SPRINT_HIST_KEY, JSON.stringify(h)); } catch (e) {}
  }
  function sprintsToday() {
    return getSprintHist()[todayKey()] || 0;
  }
  function recordSprint() {
    var h = getSprintHist();
    var k = todayKey();
    h[k] = (h[k] || 0) + 1;
    saveSprintHist(h);
    renderSprintCount();
  }
  function renderSprintCount() {
    var el = document.getElementById('sprintCount');
    if (!el) return;
    var n = sprintsToday();
    el.textContent = n === 0 ? 'No sprints yet today' : n + (n === 1 ? ' sprint' : ' sprints') + ' today';
  }

  // =========================================================================
  // 16. Clock & KPIs
  // =========================================================================

  function updateStanfordClock() {
    var el = document.getElementById('ptDigits');
    if (!el) return;
    try {
      el.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
    } catch (e) {
      el.textContent = new Date().toTimeString().split(' ')[0];
    }
  }

  function updateOverallKPIs() {
    var totalEcts = state.courses.reduce(function (a, c) { return a + (parseFloat(c.ects) || 0); }, 0);
    var ectsEl = document.getElementById('kpiEcts');
    if (ectsEl) ectsEl.textContent = totalEcts + ' units';

    var totalWeightedScore = 0, totalScoreWeight = 0;
    state.courses.forEach(function (c) {
      var m = calculateCourseGradeMetrics(c);
      if (m.currentWeightedAvg !== null) {
        totalWeightedScore += m.currentWeightedAvg * (c.ects || 5);
        totalScoreWeight += (c.ects || 5);
      }
    });

    var avgEl = document.getElementById('kpiAvgGrade');
    if (avgEl && totalScoreWeight > 0) {
      var avg = totalWeightedScore / totalScoreWeight;
      avgEl.textContent = avg.toFixed(1);
    }

    updateGradeInsights();
  }

  function updateGradeInsights() {
    var el = document.getElementById('gradeInsights');
    if (!el) return;
    var risk = [], secured = [];
    state.courses.forEach(function (c) {
      var m = calculateCourseGradeMetrics(c);
      if (m.statusType === 'fail' && m.pendingWeight > 0) risk.push(c.code);
      else if (m.statusType === 'secured') secured.push(c.code);
    });
    var bits = [];
    if (risk.length) bits.push('At risk: ' + risk.join(', '));
    if (secured.length) bits.push('Secured: ' + secured.join(', '));
    el.textContent = bits.join(' · ');
    el.style.display = bits.length ? '' : 'none';
  }

  function updatePanicMeter() {
    var digits = document.getElementById('panicDigits');
    if (!digits) return;
    var wrap = document.getElementById('panicWidget');
    var titleEl = document.getElementById('panicTitle');
    var subEl = document.getElementById('panicSub');
    var now = new Date();
    var open = state.deadlines.filter(function (d) { return !d.completed; });
    if (!open.length) {
      if (titleEl) titleEl.textContent = 'Inbox zero';
      digits.textContent = 'All clear';
      if (subEl) subEl.textContent = 'No pending cutoffs. Enjoy it.';
      if (wrap) wrap.className = 'panic-widget calm';
      return;
    }
    open.sort(function (a, b) { return deadlineInstant(a.dueDate, a.dueTime) - deadlineInstant(b.dueDate, b.dueTime); });
    var future = open.filter(function (d) { return deadlineInstant(d.dueDate, d.dueTime) - now > 0; });
    var past = open.filter(function (d) { return deadlineInstant(d.dueDate, d.dueTime) - now <= 0; });
    if (!future.length) {
      // Every open cutoff has passed - say so, point at the most recent one.
      var last = past[past.length - 1];
      if (titleEl) titleEl.textContent = last.title;
      digits.textContent = 'Passed';
      if (subEl) subEl.textContent = past.length === 1 ? 'That cutoff passed - tick it off or add the next one.' : past.length + ' cutoffs passed - tick them off or add the next one.';
      if (wrap) wrap.className = 'panic-widget danger';
      return;
    }
    var next = future[0];
    var diff = deadlineInstant(next.dueDate, next.dueTime) - now;
    if (titleEl) titleEl.textContent = next.title;
    var s = Math.floor(diff / 1000);
    var dd = Math.floor(s / 86400);
    var hh = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
    var mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    var ss = String(s % 60).padStart(2, '0');
    digits.textContent = (dd > 0 ? dd + 'd ' : '') + hh + ':' + mm + ':' + ss;
    var hours = diff / 3600000;
    if (wrap) wrap.className = 'panic-widget ' + (hours < 24 ? 'danger' : hours < 48 ? 'warn' : 'calm');
    var crunch = future.filter(function (x) { return deadlineInstant(x.dueDate, x.dueTime) - now < 48 * 3600000; }).length;
    var parts = [];
    if (past.length) parts.push(past.length === 1 ? 'Last cutoff passed - next up' : past.length + ' cutoffs passed - next up');
    if (crunch >= 2) parts.push(crunch + ' cutoffs land within 48h - heaviest stretch');
    if (!sprintsToday() && open.length) parts.push('No sprints yet today - start one below');
    if (subEl) subEl.textContent = parts.join(' · ') || 'On track. Keep it that way.';
  }

  // =========================================================================
  // 17. Modals: Course Editor
  // =========================================================================

  function openCourseModal(editId) {
    var modal = document.getElementById('courseModal');
    var title = document.getElementById('courseModalTitle');
    var form = document.getElementById('courseForm');
    var componentsList = document.getElementById('modalComponentsList');
    form.reset();
    componentsList.innerHTML = '';
    document.getElementById('courseEditId').value = editId || '';

    if (editId) {
      var course = state.courses.find(function (c) { return c.id === editId; });
      if (course) {
        title.textContent = course.code;
        document.getElementById('courseCodeInput').value = course.code;
        document.getElementById('courseNameInput').value = course.name;
        document.getElementById('courseEctsInput').value = course.ects;
        document.getElementById('courseQuartileInput').value = course.quartile || 'Fall';
        course.components.forEach(function (comp) { addComponentRow(comp.name, comp.weight, comp.score); });
      }
    } else {
      title.textContent = 'New course';
      addComponentRow('Homework & Practicals', 30, '');
      addComponentRow('Midterm Interim Exam', 20, '');
      addComponentRow('Final Comprehensive Exam', 50, '');
    }
    updateModalWeightTotal();
    modal.classList.add('active');
  }

  function closeCourseModal() { document.getElementById('courseModal').classList.remove('active'); }

  function addComponentRow(name, weight, score) {
    var list = document.getElementById('modalComponentsList');
    var row = document.createElement('div');
    row.className = 'component-edit-row';
    row.innerHTML =
      '<input type="text" class="comp-name-input" placeholder="Component Name" maxlength="40" value="' + escapeHtml(name || '') + '" required>' +
      '<input type="number" class="comp-weight-input" placeholder="Weight %" min="1" max="100" value="' + (weight || 20) + '" required>' +
      '<input type="number" class="comp-score-input" placeholder="Score" step="0.1" min="0" max="' + (state.scale === 'gpa' ? '4' : '100') + '" value="' + (score !== null && score !== undefined ? score : '') + '">' +
      '<button type="button" class="btn-remove-row" title="Remove" aria-label="Remove">&times;</button>';

    row.querySelector('.btn-remove-row').addEventListener('click', function () { row.remove(); updateModalWeightTotal(); });
    row.querySelector('.comp-weight-input').addEventListener('input', updateModalWeightTotal);
    list.appendChild(row);
    updateModalWeightTotal();
  }

  function updateModalWeightTotal() {
    var inputs = document.querySelectorAll('.comp-weight-input');
    var total = 0;
    inputs.forEach(function (inp) { total += (parseFloat(inp.value) || 0); });
    var el = document.getElementById('modalTotalWeight');
    if (el) { el.textContent = total + '%'; el.style.color = total === 100 ? '#0071e3' : '#ff453a'; }
  }

  function saveCourseFromModal(e) {
    e.preventDefault();
    var editId = document.getElementById('courseEditId').value;
    var code = document.getElementById('courseCodeInput').value.trim().toUpperCase().slice(0, 12).replace(/[<>&"']/g, '');
    var name = document.getElementById('courseNameInput').value.trim().slice(0, 40);
    var ects = parseFloat(document.getElementById('courseEctsInput').value) || 5;
    var quartile = document.getElementById('courseQuartileInput').value;
    var compRows = document.querySelectorAll('.component-edit-row');
    var components = [], totalWeight = 0;

    compRows.forEach(function (row) {
      var cName = row.querySelector('.comp-name-input').value.trim().slice(0, 40);
      var cWeight = parseFloat(row.querySelector('.comp-weight-input').value) || 0;
      var cScoreVal = row.querySelector('.comp-score-input').value.trim();
      var cScore = cScoreVal !== '' && !isNaN(cScoreVal) ? parseFloat(cScoreVal) : null;
      if (cName) { components.push({ name: cName, weight: cWeight, score: cScore }); totalWeight += cWeight; }
    });

    if (totalWeight !== 100) {
      openConfirm({ title: 'Weights sum to ' + totalWeight + '%', message: 'Graded components should sum to 100%. Save anyway?', confirmText: 'Save anyway', danger: false }).then(function (ok) {
        if (ok) finishSaveCourse(editId, code, name, ects, quartile, components);
      });
      return;
    }

    finishSaveCourse(editId, code, name, ects, quartile, components);
  }

  function finishSaveCourse(editId, code, name, ects, quartile, components) {
    if (editId) {
      var existing = state.courses.find(function (c) { return c.id === editId; });
      if (existing) { existing.code = code; existing.name = name; existing.ects = ects; existing.quartile = quartile; existing.components = components; }
      showToast('Course updated: ' + code, 'success');
    } else {
      state.courses.push({ id: 'c-' + Date.now(), code: code, name: name, ects: ects, quartile: quartile, components: components, targetGrade: state.scale === 'gpa' ? 3.0 : 60 });
      showToast('Course added: ' + code, 'success');
    }

    saveState();
    closeCourseModal();
    renderCourses();
    renderDeadlines();
  }

  function deleteCourse(courseId) {
    state.courses = state.courses.filter(function (c) { return c.id !== courseId; });
    state.deadlines = state.deadlines.filter(function (d) { return d.courseId !== courseId; });
    saveState();
    renderCourses();
    renderDeadlines();
    showToast('Course removed', 'info');
  }

  // =========================================================================
  // 18. Modals: Deadline Editor
  // =========================================================================

  function populateCourseDropdowns() {
    var selectDeadline = document.getElementById('deadlineCourseSelect');
    var filterCourse = document.getElementById('filterCourseSelect');
    if (selectDeadline) selectDeadline.innerHTML = state.courses.map(function (c) { return '<option value="' + escapeHtml(c.id) + '" title="' + escapeHtml(c.code + ' - ' + c.name) + '">[' + escapeHtml(shorten(c.code, 14)) + '] ' + escapeHtml(shorten(c.name, 26)) + '</option>'; }).join('');
    if (filterCourse) {
      var cur = state.filterCourse;
      filterCourse.innerHTML = '<option value="all">All Enrolled Courses</option>' + state.courses.map(function (c) { return '<option value="' + escapeHtml(c.id) + '" ' + (c.id === cur ? 'selected' : '') + ' title="' + escapeHtml(c.code + ' - ' + c.name) + '">' + escapeHtml(shorten(c.code, 14)) + ' - ' + escapeHtml(shorten(c.name, 26)) + '</option>'; }).join('');
    }
    if (typeof syncKeepScopeSelect === 'function') { try { syncKeepScopeSelect(true); } catch (e) {} }
    if (typeof renderFcTopics === 'function') { try { renderFcTopics(); } catch (e) {} }
  }

  function openDeadlineModal() {
    if (state.courses.length === 0) { showToast('Add a course first.', 'warn'); openCourseModal(); return; }
    var modal = document.getElementById('deadlineModal');
    var form = document.getElementById('deadlineForm');
    form.reset();
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('deadlineDateInput').min = new Date().toISOString().split('T')[0];
    document.getElementById('deadlineDateInput').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('deadlineTimeInput').value = '23:59';
    modal.classList.add('active');
  }

  function closeDeadlineModal() { document.getElementById('deadlineModal').classList.remove('active'); }

  function saveDeadlineFromModal(e) {
    e.preventDefault();
    state.deadlines.push({
      id: 'dl-' + Date.now(),
      courseId: document.getElementById('deadlineCourseSelect').value,
      title: document.getElementById('deadlineTitleInput').value.trim().slice(0, 80),
      dueDate: document.getElementById('deadlineDateInput').value,
      dueTime: document.getElementById('deadlineTimeInput').value || '23:59',
      weight: parseFloat(document.getElementById('deadlineWeightInput').value) || 0,
      portal: document.getElementById('deadlineLocationInput').value.trim().slice(0, 24) || 'Canvas',
      completed: false
    });
    saveState();
    closeDeadlineModal();
    renderDeadlines();
    updateOverallKPIs();
    renderCalendar();
    showToast('Deadline added', 'success');
  }

  // =========================================================================
  // 19. Syllabus Parser
  // =========================================================================

  function openImportModal() { document.getElementById('importModal').classList.add('active'); document.getElementById('importPreview').style.display = 'none'; }
  function closeImportModal() { document.getElementById('importModal').classList.remove('active'); }

  function plusDaysStr(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return todayKey(d);
  }

  function loadSampleSyllabusText() {
    var sample = 'CS106A Programming Methodology\nLectures: Mon/Wed Gates Hall\n' +
      'Assignment 4 (10%) - ' + plusDaysStr(4) + ' 23:59\n' +
      'Homework 5: Karel (15%) - ' + plusDaysStr(14) + ' 23:59\n' +
      'Midterm Exam (25%) - ' + plusDaysStr(26) + ' 14:00\n' +
      'Final Examination (50%) - ' + plusDaysStr(41) + ' 23:59';
    document.getElementById('importRawText').value = sample;
    parseSyllabusText(sample);
  }

  function parseSyllabusText(text) {
    var lines = text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (lines.length === 0) return null;
    var detectedCode = 'NEW01', detectedName = 'Imported Course';
    var components = [], deadlines = [];

    var firstLine = lines[0];
    var codeMatch = firstLine.match(/([A-Z]{2,4}\s?\d{1,3}[A-Z]?|[0-9][A-Z]{2,4}[0-9]{1,3}|[A-Z]{2,4}[0-9]{3})/i);
    if (codeMatch) { detectedCode = codeMatch[0].toUpperCase(); detectedName = firstLine.replace(codeMatch[0], '').replace(/[-:]/g, '').trim() || 'Imported Course'; }

    lines.forEach(function (line) {
      var weightMatch = line.match(/(.*?)(?:\(|:|\s)(\d{1,3})%(?:\)|)/);
      var dateMatch = line.match(/(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}:\d{2}))?/);
      if (weightMatch) {
        var cName = weightMatch[1].replace(/[-]/g, '').trim();
        var weight = parseInt(weightMatch[2], 10);
        if (cName && weight > 0) {
          components.push({ name: cName, weight: weight, score: null });
          if (dateMatch) deadlines.push({ title: cName, dueDate: dateMatch[1], dueTime: dateMatch[2] || '23:59', weight: weight });
        }
      }
    });

    var previewBox = document.getElementById('importPreview');
    var previewList = document.getElementById('importPreviewList');
    if (components.length > 0) {
      previewBox.style.display = 'block';
      previewList.innerHTML = '<p><strong>Code:</strong> ' + escapeHtml(detectedCode) + ' (' + escapeHtml(detectedName) + ')</p><p><strong>Modules:</strong> ' + components.map(function (c) { return escapeHtml(c.name) + ' [' + (parseInt(c.weight, 10) || 0) + '%]'; }).join(', ') + '</p><p><strong>Deadlines:</strong> ' + deadlines.length + ' items</p>';
    }
    return { detectedCode: detectedCode, detectedName: detectedName, components: components, deadlines: deadlines };
  }

  function executeSyllabusImport() {
    var raw = document.getElementById('importRawText').value;
    var result = parseSyllabusText(raw);
    if (!result || result.components.length === 0) { showToast('No valid syllabus modules detected.', 'warn'); return; }

    var newCourseId = 'c-' + Date.now();
    state.courses.push({ id: newCourseId, code: String(result.detectedCode).slice(0, 12), name: String(result.detectedName).slice(0, 40), ects: 5, quartile: 'Fall', components: result.components.map(function (c) { return { name: String(c.name).slice(0, 40), weight: c.weight, score: null }; }), targetGrade: state.scale === 'gpa' ? 3.0 : 60 });
    result.deadlines.forEach(function (dl, idx) {
      state.deadlines.push({ id: 'dl-import-' + Date.now() + '-' + idx, courseId: newCourseId, title: String(dl.title).slice(0, 80), dueDate: dl.dueDate, dueTime: dl.dueTime, weight: dl.weight,         portal: 'Canvas', completed: false });
    });

    saveState();
    closeImportModal();
    renderCourses();
    renderDeadlines();
    renderCalendar();
    confetti.fire(0.5, 0.4);
    showToast('Course imported: ' + result.detectedCode, 'success');
  }

  // =========================================================================
  // 19b. Calendar - Google-Calendar-style month grid + reminders
  // =========================================================================

  var CAL_KEY = 'horizon_calendar_v1';
  var calEvents = [];
  var calCursor = (function () { var n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; })();
  var calSelected = todayKey(new Date());
  var CAL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function loadCal() {
    try {
      var raw = localStorage.getItem(CAL_KEY);
      if (raw) {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          calEvents = arr.filter(function (e) {
            return e && e.id && /^\d{4}-\d{2}-\d{2}$/.test(e.date || '') && e.title;
          });
          return;
        }
      }
    } catch (e) {}
    calEvents = [];
  }

  function persistCal() {
    try { localStorage.setItem(CAL_KEY, JSON.stringify(calEvents)); } catch (e) {}
  }

  function calPad(n) { return String(n).padStart(2, '0'); }

  function getCalEventsOn(dateStr) {
    return calEvents.filter(function (e) { return e.date === dateStr; })
      .sort(function (a, b) { return (a.time || '') < (b.time || '') ? -1 : 1; });
  }

  function getCalDeadlinesOn(dateStr) {
    return state.deadlines.filter(function (d) { return d.dueDate === dateStr; })
      .sort(function (a, b) { return (a.dueTime || '') < (b.dueTime || '') ? -1 : 1; });
  }

  function calCourseCode(courseId) {
    var c = state.courses.find(function (x) { return x.id === courseId; });
    return c ? c.code : 'SU';
  }

  function renderCalendar() {
    var grid = document.getElementById('calGrid');
    if (!grid) return;
    var title = document.getElementById('calMonthTitle');
    if (title) title.textContent = CAL_MONTHS[calCursor.m] + ' ' + calCursor.y;

    var todayStr = todayKey(new Date());
    var firstDow = new Date(calCursor.y, calCursor.m, 1).getDay();
    var daysInMonth = new Date(calCursor.y, calCursor.m + 1, 0).getDate();
    var daysInPrev = new Date(calCursor.y, calCursor.m, 0).getDate();

    grid.innerHTML = '';
    for (var i = 0; i < 42; i++) {
      var dayNum, dateStr, out = false;
      if (i < firstDow) {
        dayNum = daysInPrev - firstDow + 1 + i;
        var pm = calCursor.m - 1, py = calCursor.y;
        if (pm < 0) { pm = 11; py--; }
        dateStr = py + '-' + calPad(pm + 1) + '-' + calPad(dayNum);
        out = true;
      } else if (i >= firstDow + daysInMonth) {
        dayNum = i - firstDow - daysInMonth + 1;
        var nm = calCursor.m + 1, ny = calCursor.y;
        if (nm > 11) { nm = 0; ny++; }
        dateStr = ny + '-' + calPad(nm + 1) + '-' + calPad(dayNum);
        out = true;
      } else {
        dayNum = i - firstDow + 1;
        dateStr = calCursor.y + '-' + calPad(calCursor.m + 1) + '-' + calPad(dayNum);
      }

      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cal-day' + (out ? ' cal-day-out' : '') +
        (dateStr === todayStr ? ' cal-day-today' : '') +
        (dateStr === calSelected ? ' cal-day-selected' : '');
      cell.dataset.date = dateStr;
      cell.setAttribute('aria-label', dateStr);

      var num = document.createElement('span');
      num.className = 'cal-day-num';
      num.textContent = dayNum;
      cell.appendChild(num);

      var chips = document.createElement('span');
      chips.className = 'cal-chips';
      var evs = getCalEventsOn(dateStr);
      var dls = getCalDeadlinesOn(dateStr);
      var combined = [];
      evs.forEach(function (e) { combined.push({ kind: 'event', time: e.time || '09:00', title: e.title, ref: e }); });
      dls.forEach(function (d) { combined.push({ kind: 'deadline', time: d.dueTime || '23:59', title: d.title, ref: d }); });
      if (typeof getStudyOn === 'function') {
        try {
          getStudyOn(dateStr).forEach(function (s) {
            combined.push({ kind: 'study', time: s.block.time || '09:00', title: s.block.subject, ref: s.block, done: s.done });
          });
        } catch (e) {}
      }
      combined.sort(function (a, b) { return a.time < b.time ? -1 : 1; });

      combined.slice(0, 3).forEach(function (item) {
        var chip = document.createElement('span');
        if (item.kind === 'study') {
          chip.className = 'cal-chip cal-chip-study';
          chip.setAttribute('data-color', (item.ref.color || 'blue'));
          if (item.done) chip.style.textDecoration = 'line-through';
        } else {
          chip.className = 'cal-chip ' + (item.kind === 'event' ? 'cal-chip-event' : 'cal-chip-deadline' + (item.ref.completed ? ' done' : ''));
        }
        chip.textContent = item.title;
        chip.title = (item.time || '') + ' - ' + item.title;
        chip.dataset.kind = item.kind;
        chip.dataset.date = dateStr;
        chip.dataset.id = item.ref.id;
        chips.appendChild(chip);
      });
      if (combined.length > 3) {
        var more = document.createElement('span');
        more.className = 'cal-more';
        more.textContent = '+' + (combined.length - 3) + ' more';
        more.dataset.date = dateStr;
        chips.appendChild(more);
      }
      cell.appendChild(chips);
      grid.appendChild(cell);
    }

    renderCalAgenda();
  }

  function calAgendaLabel(dateStr) {
    var todayStr = todayKey(new Date());
    var tom = new Date(); tom.setDate(tom.getDate() + 1);
    var tomStr = todayKey(tom);
    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomStr) return 'Tomorrow';
    try {
      var d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) { return dateStr; }
  }

  function renderCalAgenda() {
    var box = document.getElementById('calAgenda');
    var titleEl = document.getElementById('calAgendaTitle');
    var countEl = document.getElementById('calAgendaCount');
    if (!box) return;
    if (titleEl) titleEl.textContent = calAgendaLabel(calSelected) + ' · ' + calSelected;
    box.innerHTML = '';

    var items = [];
    getCalEventsOn(calSelected).forEach(function (e) {
      items.push({ kind: 'event', time: e.time || '09:00', title: e.title, sub: e.notes || 'Reminder', ref: e });
    });
    getCalDeadlinesOn(calSelected).forEach(function (d) {
      var code = calCourseCode(d.courseId);
      items.push({ kind: 'deadline', time: d.dueTime || '23:59', title: d.title, sub: code + ' · ' + (d.portal || 'Canvas') + ' · ' + (d.weight || 0) + '%', ref: d });
    });
    if (typeof getStudyOn === 'function') {
      try {
        getStudyOn(calSelected).forEach(function (s) {
          items.push({ kind: 'study', time: s.block.time || '09:00', title: s.block.subject, sub: 'Study block · ' + s.block.start + ' → ' + s.block.end + (s.done ? ' · done' : ''), ref: s.block });
        });
      } catch (e) {}
    }
    items.sort(function (a, b) { return a.time < b.time ? -1 : 1; });

    if (countEl) countEl.textContent = items.length + (items.length === 1 ? ' item' : ' items');
    if (!items.length) {
      box.innerHTML = '<div class="cal-agenda-empty">Nothing scheduled. Enjoy the quiet - or add a reminder.</div>';
      return;
    }
    items.forEach(function (item) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'cal-agenda-row';
      row.dataset.kind = item.kind;
      row.dataset.id = item.ref.id;
      row.dataset.date = calSelected;
      var time = document.createElement('span');
      time.className = 'cal-agenda-time';
      time.textContent = item.time;
      var body = document.createElement('span');
      body.className = 'cal-agenda-body';
      var t = document.createElement('span');
      t.className = 'cal-agenda-title';
      t.textContent = item.title;
      if (item.kind === 'deadline' && item.ref.completed) t.style.textDecoration = 'line-through';
      var s = document.createElement('span');
      s.className = 'cal-agenda-sub';
      s.textContent = item.sub;
      body.appendChild(t);
      body.appendChild(s);
      var tag = document.createElement('span');
      tag.className = 'cal-agenda-tag ' + (item.kind === 'study' ? 'event' : item.kind);
      tag.textContent = item.kind === 'event' ? 'Reminder' : item.kind === 'study' ? 'Study' : 'Deadline';
      row.appendChild(time);
      row.appendChild(body);
      row.appendChild(tag);
      box.appendChild(row);
    });
  }

  function handleCalItemClick(kind, id) {
    if (kind === 'event') {
      var e = calEvents.find(function (x) { return x.id === id; });
      if (e) openCalEventModal(e.date, e.id);
    } else if (kind === 'deadline') {
      scrollFlash('deadline-' + id);
    } else if (kind === 'study') {
      scrollFlash('study-' + id);
    }
  }

  function openCalEventModal(dateStr, eventId) {
    var modal = document.getElementById('calEventModal');
    if (!modal) return;
    var form = document.getElementById('calEventForm');
    if (form) form.reset();
    document.getElementById('calEventEditId').value = eventId || '';
    var delBtn = document.getElementById('btnCalEventDelete');
    if (eventId) {
      var e = calEvents.find(function (x) { return x.id === eventId; });
      if (!e) return;
      document.getElementById('calEventModalTitle').textContent = 'Edit reminder';
      document.getElementById('calEventTitleInput').value = e.title || '';
      document.getElementById('calEventDateInput').value = e.date || '';
      document.getElementById('calEventTimeInput').value = e.time || '09:00';
      document.getElementById('calEventNotesInput').value = e.notes || '';
      if (delBtn) delBtn.style.display = '';
    } else {
      document.getElementById('calEventModalTitle').textContent = 'New reminder';
      document.getElementById('calEventDateInput').value = dateStr || calSelected || todayKey(new Date());
      document.getElementById('calEventTimeInput').value = '09:00';
      if (delBtn) delBtn.style.display = 'none';
    }
    modal.classList.add('active');
    setTimeout(function () {
      var inp = document.getElementById('calEventTitleInput');
      if (inp) inp.focus();
    }, 60);
  }

  function closeCalEventModal() {
    var modal = document.getElementById('calEventModal');
    if (modal) modal.classList.remove('active');
  }

  function saveCalEventFromModal(e) {
    e.preventDefault();
    var editId = document.getElementById('calEventEditId').value;
    var title = document.getElementById('calEventTitleInput').value.trim().slice(0, 80);
    var date = document.getElementById('calEventDateInput').value;
    var time = document.getElementById('calEventTimeInput').value || '09:00';
    var notes = document.getElementById('calEventNotesInput').value.trim().slice(0, 500);
    if (!title || !date) { showToast('Give the reminder a title and date', 'warn'); return; }
    if (editId) {
      var existing = calEvents.find(function (x) { return x.id === editId; });
      if (existing) { existing.title = title; existing.date = date; existing.time = time; existing.notes = notes; }
      showToast('Reminder updated', 'success');
    } else {
      calEvents.push({ id: 'cal-' + Date.now(), title: title, date: date, time: time, notes: notes });
      showToast('Reminder added to ' + date, 'success');
    }
    persistCal();
    closeCalEventModal();
    calSelected = date;
    var d = new Date(date + 'T12:00:00');
    if (!isNaN(d)) calCursor = { y: d.getFullYear(), m: d.getMonth() };
    renderCalendar();
  }

  function deleteCalEvent() {
    var editId = document.getElementById('calEventEditId').value;
    if (!editId) return;
    calEvents = calEvents.filter(function (x) { return x.id !== editId; });
    persistCal();
    closeCalEventModal();
    renderCalendar();
    showToast('Reminder removed', 'info');
  }

  // =========================================================================
  // 19c. Study Planner: syllabus blocks mapped onto the calendar.
  // Maths: 12–26 Sept 2026 · Physics: 13–17 Sept 2026 (requested defaults)
  // =========================================================================

  var STUDY_KEY = 'horizon_study_v1';
  var STUDY_DONE_KEY = 'horizon_study_done_v1';
  var studyBlocks = [];
  var studyDone = {};

  function loadStudy() {
    try {
      var raw = localStorage.getItem(STUDY_KEY);
      if (raw) { studyBlocks = JSON.parse(raw) || []; }
      else { studyBlocks = []; }
      var d = localStorage.getItem(STUDY_DONE_KEY);
      studyDone = d ? (JSON.parse(d) || {}) : {};
    } catch (e) { studyBlocks = []; studyDone = {}; }
    if (!Array.isArray(studyBlocks)) studyBlocks = [];
  }

  function persistStudy() {
    try {
      localStorage.setItem(STUDY_KEY, JSON.stringify(studyBlocks));
      localStorage.setItem(STUDY_DONE_KEY, JSON.stringify(studyDone));
    } catch (e) {}
  }

  function seedStudyPlan(silent) {
    var hasMaths = studyBlocks.some(function (b) { return /math/i.test(b.subject); });
    var hasPhys = studyBlocks.some(function (b) { return /phys/i.test(b.subject); });
    var mStart = plusDaysStr(0), mEnd = plusDaysStr(14), pStart = plusDaysStr(1), pEnd = plusDaysStr(5);
    if (!hasMaths) studyBlocks.push({ id: 'st-maths', subject: 'Maths - Algebra & Calculus', start: mStart, end: mEnd, time: '09:00', color: 'blue', notes: 'Daily drill: 45 min theory + 45 min problem sets. Chapters 1–6 across the 15 days.' });
    if (!hasPhys) studyBlocks.push({ id: 'st-physics', subject: 'Physics - Mechanics', start: pStart, end: pEnd, time: '14:00', color: 'orange', notes: 'Kinematics → dynamics → energy → rotation → mock test. Lab prep each evening.' });
    persistStudy();
    renderStudy();
    renderCalendar();
    if (!silent) { confetti.fire(0.5, 0.4); showToast('Study plan loaded: Maths 15 days · Physics 5 days', 'success'); }
  }

  function studyDays(block) {
    var out = [];
    try {
      var s = new Date(block.start + 'T12:00:00'), e = new Date(block.end + 'T12:00:00');
      if (isNaN(s) || isNaN(e) || e < s) return out;
      for (var d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) out.push(todayKey(d));
    } catch (err) {}
    return out;
  }

  function isStudyDone(blockId, dateStr) {
    return !!(studyDone[blockId] && studyDone[blockId].indexOf(dateStr) >= 0);
  }

  function toggleStudyDone(blockId, dateStr) {
    studyDone[blockId] = studyDone[blockId] || [];
    var i = studyDone[blockId].indexOf(dateStr);
    if (i >= 0) studyDone[blockId].splice(i, 1);
    else studyDone[blockId].push(dateStr);
    persistStudy();
    renderStudy();
    renderCalendar();
  }

  function getStudyOn(dateStr) {
    var out = [];
    studyBlocks.forEach(function (b) {
      var days = studyDays(b);
      if (days.indexOf(dateStr) >= 0) out.push({ block: b, done: isStudyDone(b.id, dateStr) });
    });
    return out.sort(function (a, b) { return (a.block.time || '') < (b.block.time || '') ? -1 : 1; });
  }

  function shortDay(dateStr) {
    try { return new Date(dateStr + 'T12:00:00').getDate(); } catch (e) { return ''; }
  }

  function renderStudy() {
    var grid = document.getElementById('studyGrid');
    var legend = document.getElementById('studyLegend');
    var timeline = document.getElementById('studyTimeline');
    if (!grid || !legend || !timeline) return;
    grid.innerHTML = ''; legend.innerHTML = ''; timeline.innerHTML = '';
    var todayStr = todayKey(new Date());

    if (!studyBlocks.length) {
      grid.innerHTML = '<div class="empty-state"><p class="empty-state-text">No study blocks yet - load the Maths + Physics plan.</p></div>';
      var badge = document.getElementById('studyRangeBadge');
      if (badge) badge.textContent = '0 days';
      return;
    }

    studyBlocks.forEach(function (b) {
      var pill = document.createElement('span');
      pill.className = 'legend-pill';
      pill.innerHTML = '';
      var dot = document.createElement('span');
      dot.className = 'legend-dot'; dot.setAttribute('data-color', b.color || 'blue');
      pill.appendChild(dot);
      var t = document.createElement('span');
      t.textContent = b.subject;
      pill.appendChild(t);
      legend.appendChild(pill);
    });

    // Sprint window follows the blocks (earliest start → latest end)
    var winStart = null, winEnd = null;
    studyBlocks.forEach(function (b) {
      var s = new Date(b.start + 'T12:00:00'), e = new Date(b.end + 'T12:00:00');
      if (isNaN(s) || isNaN(e)) return;
      if (!winStart || s < winStart) winStart = s;
      if (!winEnd || e > winEnd) winEnd = e;
    });
    if (!winStart || !winEnd) { winStart = new Date(); winEnd = new Date(); winEnd.setDate(winEnd.getDate() + 14); }
    var winDays = [];
    for (var d = new Date(winStart); d <= winEnd; d.setDate(d.getDate() + 1)) winDays.push(todayKey(d));
    var badgeEl = document.getElementById('studyRangeBadge');
    if (badgeEl) badgeEl.textContent = winDays.length + ' days';
    var winTitle = document.querySelector('.study-timeline-card .card-title');
    if (winTitle && winDays.length) {
      function shortDs(ds) { try { return new Date(ds + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); } catch (e) { return ds; } }
      winTitle.textContent = 'Sprint · ' + shortDs(winDays[0]) + ' – ' + shortDs(winDays[winDays.length - 1]);
    }

    studyBlocks.forEach(function (b) {
      var days = studyDays(b);
      var row = document.createElement('div');
      row.className = 'timeline-row';
      var lab = document.createElement('span');
      lab.className = 'timeline-label'; lab.textContent = b.subject;
      var track = document.createElement('div');
      track.className = 'timeline-track';
      winDays.forEach(function (ds) {
        if (days.indexOf(ds) < 0) return;
        var p = document.createElement('button');
        p.type = 'button';
        p.className = 'timeline-pill' + (isStudyDone(b.id, ds) ? ' done' : '') + (ds === todayStr ? ' today' : '');
        p.setAttribute('data-color', b.color || 'blue');
        p.textContent = shortDay(ds);
        p.title = b.subject + ' · ' + ds + (isStudyDone(b.id, ds) ? ' (done - click to reopen)' : ' - click to open day, double-click toggles done');
        p.addEventListener('click', function () {
          calSelected = ds;
          var dd = new Date(ds + 'T12:00:00');
          if (!isNaN(dd)) calCursor = { y: dd.getFullYear(), m: dd.getMonth() };
          renderCalendar();
          scrollFlash('calendar');
        });
        p.addEventListener('dblclick', function (e) { e.stopPropagation(); toggleStudyDone(b.id, ds); });
        track.appendChild(p);
      });
      row.appendChild(lab); row.appendChild(track);
      timeline.appendChild(row);
    });

    studyBlocks.forEach(function (b) {
      var days = studyDays(b);
      var doneCount = days.filter(function (ds) { return isStudyDone(b.id, ds); }).length;
      var pct = days.length ? Math.round((doneCount / days.length) * 100) : 0;
      var card = document.createElement('div');
      card.className = 'study-card';
      card.setAttribute('data-color', b.color || 'blue');
      card.id = 'study-' + b.id;
      var top = document.createElement('div');
      top.className = 'study-card-top';
      var left = document.createElement('div');
      var h = document.createElement('div'); h.className = 'study-subject'; h.textContent = b.subject;
      var dates = document.createElement('div'); dates.className = 'study-dates';
      dates.textContent = b.start + ' → ' + b.end + ' · ' + (b.time || '09:00') + ' daily · ' + doneCount + '/' + days.length + ' done';
      left.appendChild(h); left.appendChild(dates);
      var acts = document.createElement('div'); acts.className = 'card-icon-actions';
      acts.innerHTML = '<button class="btn-card-glyph" title="Edit" aria-label="Edit"><svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 2l3 3-9 9H2v-3l9-9z"></path></svg></button><button class="btn-card-glyph" title="Delete" aria-label="Delete"><svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 4h10M6 4V2.5h4V4M5 4v9h6V4"></path></svg></button>';
      var btns = acts.querySelectorAll('button');
      btns[0].addEventListener('click', function () { openStudyModal(b.id); });
      btns[1].addEventListener('click', function () {
        askConfirm('Delete study block?', 'Delete "' + b.subject + '" (' + b.start + ' → ' + b.end + ')? Its daily calendar entries disappear too.').then(function (ok) {
          if (ok) {
            studyBlocks = studyBlocks.filter(function (x) { return x.id !== b.id; });
            delete studyDone[b.id];
            persistStudy(); renderStudy(); renderCalendar();
            showToast('Study block deleted', 'info');
          }
        });
      });
      top.appendChild(left); top.appendChild(acts);
      card.appendChild(top);
      var bar = document.createElement('div'); bar.className = 'study-progress-track';
      var fill = document.createElement('div'); fill.className = 'study-progress-fill'; fill.style.width = pct + '%';
      bar.appendChild(fill); card.appendChild(bar);
      var chips = document.createElement('div'); chips.className = 'study-day-chips';
      days.forEach(function (ds) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'day-chip' + (isStudyDone(b.id, ds) ? ' done' : '') + (ds === todayStr ? ' today' : '');
        c.textContent = ds.slice(5);
        c.title = ds + ' - click to toggle done, shift-click to open day';
        c.addEventListener('click', function (e) {
          if (e.shiftKey) {
            calSelected = ds;
            var dd = new Date(ds + 'T12:00:00');
            if (!isNaN(dd)) calCursor = { y: dd.getFullYear(), m: dd.getMonth() };
            renderCalendar(); scrollFlash('calendar');
          } else toggleStudyDone(b.id, ds);
        });
        chips.appendChild(c);
      });
      card.appendChild(chips);
      if (b.notes) { var n = document.createElement('p'); n.className = 'study-notes'; n.textContent = b.notes; card.appendChild(n); }
      grid.appendChild(card);
    });
  }

  function openStudyModal(editId) {
    var modal = document.getElementById('studyModal');
    if (!modal) return;
    document.getElementById('studyForm').reset();
    document.getElementById('studyEditId').value = editId || '';
    var del = document.getElementById('btnStudyDelete');
    if (editId) {
      var b = studyBlocks.find(function (x) { return x.id === editId; });
      if (!b) return;
      document.getElementById('studyModalTitle').textContent = 'Edit study block';
      document.getElementById('studySubjectInput').value = b.subject || '';
      document.getElementById('studyStartInput').value = b.start || '';
      document.getElementById('studyEndInput').value = b.end || '';
      document.getElementById('studyTimeInput').value = b.time || '09:00';
      document.getElementById('studyColorInput').value = b.color || 'blue';
      document.getElementById('studyNotesInput').value = b.notes || '';
      if (del) del.style.display = '';
    } else {
      document.getElementById('studyModalTitle').textContent = 'New study block';
      if (del) del.style.display = 'none';
    }
    modal.classList.add('active');
  }
  function closeStudyModal() { var m = document.getElementById('studyModal'); if (m) m.classList.remove('active'); }

  function saveStudyFromModal(e) {
    e.preventDefault();
    var editId = document.getElementById('studyEditId').value;
    var subject = document.getElementById('studySubjectInput').value.trim().slice(0, 60);
    var start = document.getElementById('studyStartInput').value;
    var end = document.getElementById('studyEndInput').value;
    var time = document.getElementById('studyTimeInput').value || '09:00';
    var color = document.getElementById('studyColorInput').value || 'blue';
    var notes = document.getElementById('studyNotesInput').value.trim().slice(0, 500);
    if (!subject || !start || !end) { showToast('Subject + date range required', 'warn'); return; }
    if (end < start) { showToast('End date is before start date', 'warn'); return; }
    if (editId) {
      var b = studyBlocks.find(function (x) { return x.id === editId; });
      if (b) { b.subject = subject; b.start = start; b.end = end; b.time = time; b.color = color; b.notes = notes; }
      showToast('Study block updated', 'success');
    } else {
      studyBlocks.push({ id: 'st-' + Date.now(), subject: subject, start: start, end: end, time: time, color: color, notes: notes });
      showToast('Study block added - see calendar', 'success');
    }
    persistStudy(); closeStudyModal(); renderStudy(); renderCalendar();
  }

  // =========================================================================
  // 19d. Flashcards live in the Study tab.
  // Topics come from courses, study blocks, General, or a custom topic.
  // =========================================================================

  var FC_KEY = 'horizon_flashcards_v1';
  var fcCards = [];
  var fcIndex = 0;
  var fcFlipped = false;
  var fcEditingId = null;
  var fcMistakesOnly = false;

  var SYMBOLS = ['π', '√', '∫', 'Σ', 'Δ', 'θ', 'λ', 'μ', '∞', '≠', '≈', '≤', '≥', '×', '÷', '±', '°', '²', '³', 'α', 'β', 'γ', 'φ', 'Ω', '∂', '→', 'sin', 'cos', 'log', 'lim'];
  var symTargetId = 'fcFront';

  function insertSymbol(sym) {
    var el = document.getElementById(symTargetId) || document.getElementById('fcFront');
    if (!el) return;
    if (el.isContentEditable) {
      el.focus();
      try {
        if (!document.execCommand('insertText', false, sym)) {
          var sel = window.getSelection();
          if (sel && sel.rangeCount) {
            var range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(sym));
            range.collapse(false);
          } else {
            el.innerHTML += escapeHtml(sym);
          }
        }
      } catch (err) {}
      return;
    }
    try {
      var s = el.selectionStart !== undefined ? el.selectionStart : el.value.length;
      var e = el.selectionEnd !== undefined ? el.selectionEnd : el.value.length;
      el.value = el.value.slice(0, s) + sym + el.value.slice(e);
      el.focus();
      var pos = s + sym.length;
      try { el.setSelectionRange(pos, pos); } catch (err) {}
    } catch (err) {
      el.value += sym;
      el.focus();
    }
  }

  function buildSymBars() {
    ['fcSymBar', 'studySymBar'].forEach(function (barId) {
      var bar = document.getElementById(barId);
      if (!bar || bar.childNodes.length) return;
      SYMBOLS.forEach(function (sym) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = sym;
        b.title = 'Insert ' + sym;
        b.addEventListener('click', function () { insertSymbol(sym); });
        bar.appendChild(b);
      });
    });
    ['fcFront', 'fcBack', 'studyNotesInput', 'keepBody'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('focus', function () { symTargetId = id; });
    });
    [['btnFcSymToggle', 'fcSymBar'], ['btnStudySymToggle', 'studySymBar']].forEach(function (pair) {
      var btn = document.getElementById(pair[0]);
      var bar = document.getElementById(pair[1]);
      if (!btn || !bar) return;
      btn.addEventListener('click', function () {
        var open = bar.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.classList.toggle('active', open);
      });
    });
  }

  function loadFc() {
    try {
      var raw = localStorage.getItem(FC_KEY);
      fcCards = raw ? (JSON.parse(raw) || []) : [];
    } catch (e) { fcCards = []; }
    if (!Array.isArray(fcCards)) fcCards = [];
    // One-time repair: collapse whitespace + cap stored topics so a pasted
    // 200-char unbroken string can't blow out the <select> ever again.
    // Also backfill wrong/right counters for the mistakes-only deck.
    var dirty = false;
    fcCards.forEach(function (card) {
      if (!card) return;
      var clean = String(card.topic == null ? 'General' : card.topic).replace(/\s+/g, ' ').trim().slice(0, 60) || 'General';
      if (card.topic !== clean) { card.topic = clean; dirty = true; }
      if (typeof card.wrong !== 'number' || !(card.wrong >= 0)) { card.wrong = 0; dirty = true; }
      if (typeof card.right !== 'number' || !(card.right >= 0)) { card.right = 0; dirty = true; }
    });
    if (dirty) persistFc();
    fcIndex = 0;
    fcFlipped = false;
  }

  function persistFc() {
    try { localStorage.setItem(FC_KEY, JSON.stringify(fcCards)); } catch (e) {}
  }

  function fcCourseLabel(c) {
    return (c.code ? c.code + ' ' : '') + (c.name || 'Course');
  }

  function fcAllTopics() {
    var topics = ['General'];
    function pushTopic(raw) {
      var t = fcCleanTopic(raw);
      if (t && topics.indexOf(t) < 0) topics.push(t);
    }
    try {
      (state.courses || []).forEach(function (c) {
        pushTopic(fcCourseLabel(c));
      });
      (typeof studyBlocks !== 'undefined' ? studyBlocks : []).forEach(function (b) {
        if (b && b.subject) pushTopic(b.subject);
      });
      fcCards.forEach(function (card) {
        if (card && card.topic) pushTopic(card.topic);
      });
    } catch (e) {}
    return topics;
  }

  function fcMistakeCount() {
    return fcCards.filter(function (c) { return c && (c.wrong || 0) > 0; }).length;
  }

  function fcDeck() {
    var filterEl = document.getElementById('fcFilterSelect');
    var filter = filterEl ? filterEl.value : 'all';
    var deck = (!filter || filter === 'all')
      ? fcCards.slice()
      : fcCards.filter(function (card) { return card.topic === filter; });
    if (fcMistakesOnly) deck = deck.filter(function (c) { return c && (c.wrong || 0) > 0; });
    return deck;
  }

  function fcSyncMistakesBtn() {
    var btn = document.getElementById('btnFcMistakes');
    if (!btn) return;
    btn.textContent = fcMistakesOnly ? 'Mistakes: On (' + fcMistakeCount() + ')' : 'Mistakes: Off';
    btn.classList.toggle('active', fcMistakesOnly);
  }

  function fcCleanTopic(t) {
    t = String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
    return t.slice(0, 60);
  }

  function fcDisplayTopic(t, max) {
    // Native <select> dropdowns size to the longest <option>, so one
    // unbroken 150-char topic blows out the whole card (Windows Chrome).
    // Keep full value for matching, show a truncated label + title tooltip.
    return shorten(fcCleanTopic(t) || 'General', max || 32);
  }

  function renderFcTopics() {
    var topicEl = document.getElementById('fcTopicSelect');
    var filterEl = document.getElementById('fcFilterSelect');
    if (!topicEl || !filterEl) return;
    var prevTopic = topicEl.value || 'General';
    var prevFilter = filterEl.value || 'all';
    var topics = fcAllTopics().map(fcCleanTopic).filter(Boolean);
    if (topics.indexOf('General') < 0) topics.unshift('General');
    topicEl.innerHTML = topics.map(function (t) {
      return '<option value="' + escapeHtml(t) + '" title="' + escapeHtml(t) + '">' + escapeHtml(fcDisplayTopic(t, 32)) + '</option>';
    }).join('');
    if (topics.indexOf(prevTopic) >= 0) topicEl.value = prevTopic;
    function fcTopicCount(t) {
      if (t === 'all') return fcCards.length;
      return fcCards.filter(function (c) { return c.topic === t; }).length;
    }
    var filterTopics = ['all'].concat(topics);
    filterEl.innerHTML = filterTopics.map(function (t) {
      var full = t === 'all' ? 'All topics' : t;
      var label = t === 'all' ? 'All topics' : fcDisplayTopic(t, 32);
      return '<option value="' + escapeHtml(t) + '" title="' + escapeHtml(full) + '">' + escapeHtml(label) + ' (' + fcTopicCount(t) + ')</option>';
    }).join('');
    if (filterTopics.indexOf(prevFilter) >= 0) filterEl.value = prevFilter;
  }

  function fcCurrentFilterLabel() {
    var filterEl = document.getElementById('fcFilterSelect');
    var filter = filterEl ? filterEl.value : 'all';
    if (!filter || filter === 'all') return 'All topics';
    return filter;
  }

  function renderFcStage() {
    var topicEl = document.getElementById('fcStageTopic');
    var textEl = document.getElementById('fcStageText');
    var hintEl = document.getElementById('fcStageHint');
    var posEl = document.getElementById('fcPos');
    var countEl = document.getElementById('fcCount');
    if (!topicEl || !textEl || !posEl || !countEl) return;
    if (countEl) countEl.textContent = fcCards.length + (fcCards.length === 1 ? ' card' : ' cards');
    var deck = fcDeck();
    var infoEl = document.getElementById('fcDeckInfo');
    if (infoEl) {
      var base = deck.length + ' in this topic';
      if (fcMistakesOnly) base = deck.length + ' mistakes';
      else if (fcMistakeCount() > 0) base += ' · ' + fcMistakeCount() + ' missed';
      infoEl.textContent = base;
    }
    fcSyncMistakesBtn();
    var bigTopic = document.getElementById('fcBigTopic');
    var bigText = document.getElementById('fcBigText');
    var bigHint = document.getElementById('fcBigHint');
    var bigPos = document.getElementById('fcBigPos');
    var bigFilter = document.getElementById('fcBigFilter');
    var bigFlip = document.getElementById('btnFcBigFlip');
    if (bigFilter) bigFilter.textContent = fcCurrentFilterLabel();
    if (!deck.length) {
      topicEl.textContent = 'No cards yet';
      textEl.textContent = 'Add your first card above.';
      if (hintEl) hintEl.textContent = 'Cards save in this browser';
      posEl.textContent = '0 / 0';
      if (bigTopic) bigTopic.textContent = 'No cards yet';
      if (bigText) bigText.textContent = 'Add your first card above.';
      if (bigHint) bigHint.textContent = 'Cards save in this browser';
      if (bigPos) bigPos.textContent = '0 / 0';
      if (bigFlip) bigFlip.textContent = 'Show answer';
      return;
    }
    if (fcIndex < 0) fcIndex = 0;
    if (fcIndex >= deck.length) fcIndex = deck.length - 1;
    var card = deck[fcIndex];
    var missTxt = card && (card.wrong || 0) > 0 ? ' · ✕' + card.wrong : '';
    topicEl.textContent = (card.topic || 'General') + missTxt;
    textEl.textContent = fcFlipped ? (card.back || '') : (card.front || '');
    if (hintEl) hintEl.textContent = fcFlipped ? 'Back - click to see front' : 'Front - click to see back';
    posEl.textContent = (fcIndex + 1) + ' / ' + deck.length;
    if (bigTopic) bigTopic.textContent = (card.topic || 'General') + missTxt;
    if (bigText) bigText.textContent = fcFlipped ? (card.back || '') : (card.front || '');
    if (bigHint) bigHint.textContent = fcFlipped ? 'Answer - click to see question' : 'Question - click to see answer';
    if (bigPos) bigPos.textContent = (fcIndex + 1) + ' / ' + deck.length;
    if (bigFlip) bigFlip.textContent = fcFlipped ? 'Show question' : 'Show answer';
  }

  function renderFcList() {
    var list = document.getElementById('fcList');
    if (!list) return;
    list.innerHTML = '';
    var deck = fcDeck();
    if (!deck.length) {
      list.innerHTML = '<div class="money-empty">No cards for this topic yet.</div>';
      return;
    }
    deck.forEach(function (card) {
      var row = document.createElement('div');
      row.className = 'fc-row';
      var main = document.createElement('div');
      main.className = 'fc-row-main';
      var topic = document.createElement('div');
      topic.className = 'fc-row-topic';
      topic.textContent = card.topic || 'General';
      var front = document.createElement('div');
      front.className = 'fc-row-front';
      front.textContent = card.front || '';
      var back = document.createElement('div');
      back.className = 'fc-row-back';
      back.textContent = card.back || '';
      var wrong = (card.wrong || 0);
      if (wrong > 0) topic.textContent += ' · ✕' + wrong + ' missed';
      main.appendChild(topic);
      main.appendChild(front);
      main.appendChild(back);
      var edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'btn-card-glyph fc-edit';
      edit.title = 'Edit card';
      edit.setAttribute('aria-label', 'Edit card');
      edit.innerHTML = '<svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 2l3 3-9 9H2v-3l9-9z"></path></svg>';
      edit.addEventListener('click', function () { fcStartEdit(card.id); });
      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn-card-glyph';
      del.title = 'Delete card';
      del.setAttribute('aria-label', 'Delete card');
      del.innerHTML = '<svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 4h10M6 4V2.5h4V4M5 4v9h6V4"></path></svg>';
      del.addEventListener('click', function () { fcDeleteCard(card.id); });
      row.appendChild(main);
      row.appendChild(edit);
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  function renderFcAll() {
    renderFcTopics();
    renderFcStage();
    renderFcList();
  }

  function fcResolvedTopic() {
    var customEl = document.getElementById('fcCustomTopic');
    var topicEl = document.getElementById('fcTopicSelect');
    var custom = customEl ? fcCleanTopic(customEl.value) : '';
    if (custom) return custom;
    var base = topicEl && topicEl.value ? topicEl.value : 'General';
    return fcCleanTopic(base) || 'General';
  }

  function fcResetComposer() {
    var frontEl = document.getElementById('fcFront');
    var backEl = document.getElementById('fcBack');
    if (frontEl) frontEl.value = '';
    if (backEl) backEl.value = '';
    fcEditingId = null;
    var addBtn = document.getElementById('btnFcAdd');
    if (addBtn) addBtn.textContent = 'Add card';
    var card = document.getElementById('fcCard');
    if (card) card.classList.remove('fc-editing');
  }

  function fcStartEdit(id) {
    if (fcEditingId === id) { fcResetComposer(); return; }
    var card = null;
    fcCards.forEach(function (c) { if (c.id === id) card = c; });
    if (!card) return;
    fcEditingId = id;
    var topicEl = document.getElementById('fcTopicSelect');
    var customEl = document.getElementById('fcCustomTopic');
    if (customEl) customEl.value = card.topic || '';
    if (topicEl) {
      var topics = fcAllTopics();
      if (topics.indexOf(card.topic) >= 0) topicEl.value = card.topic;
    }
    document.getElementById('fcFront').value = card.front || '';
    document.getElementById('fcBack').value = card.back || '';
    var addBtn = document.getElementById('btnFcAdd');
    if (addBtn) addBtn.textContent = 'Update card';
    var wrap = document.getElementById('fcCard');
    if (wrap) wrap.classList.add('fc-editing');
    showToast('Editing card - Update to save', 'info');
    if (typeof scrollFlash === 'function') scrollFlash('fcCard');
  }

  function fcAddCard() {
    var frontEl = document.getElementById('fcFront');
    var backEl = document.getElementById('fcBack');
    if (!frontEl || !backEl) return;
    var front = frontEl.value.trim().slice(0, 160);
    var back = backEl.value.trim().slice(0, 300);
    if (!front || !back) { showToast('Write both sides of the card', 'warn'); return; }
    var topic = fcResolvedTopic();
    if (fcEditingId) {
      fcCards.forEach(function (c) {
        if (c.id === fcEditingId) { c.topic = topic; c.front = front; c.back = back; }
      });
      persistFc();
      fcResetComposer();
      renderFcAll();
      showToast('Card updated', 'success');
      return;
    }
    fcCards.unshift({ id: 'fc-' + Date.now(), topic: topic, front: front, back: back, wrong: 0, right: 0 });
    persistFc();
    frontEl.value = '';
    backEl.value = '';
    fcIndex = 0;
    fcFlipped = false;
    renderFcAll();
    showToast('Card added to ' + topic, 'success');
  }

  function fcDeleteCard(id) {
    var card = null;
    fcCards.forEach(function (c) { if (c.id === id) card = c; });
    askConfirm('Delete card?', 'Remove this card' + (card ? ' ("' + card.front.slice(0, 60) + '")' : '') + ' from your deck?').then(function (ok) {
      if (!ok) return;
      fcCards = fcCards.filter(function (c) { return c.id !== id; });
      persistFc();
      fcIndex = 0;
      fcFlipped = false;
      renderFcAll();
      showToast('Card deleted', 'info');
    });
  }

  function fcStep(delta) {
    var deck = fcDeck();
    if (!deck.length) return;
    fcIndex = (fcIndex + delta + deck.length) % deck.length;
    fcFlipped = false;
    renderFcStage();
  }

  function fcFlip() {
    if (!fcDeck().length) return;
    fcFlipped = !fcFlipped;
    renderFcStage();
  }

  function openFcModal() {
    var modal = document.getElementById('fcModal');
    if (!modal) return;
    fcFlipped = false;
    renderFcStage();
    modal.classList.add('active');
  }

  function closeFcModal() {
    var modal = document.getElementById('fcModal');
    if (modal) modal.classList.remove('active');
  }

  function fcRevise() {
    renderFcTopics();
    fcIndex = 0;
    fcFlipped = false;
    renderFcStage();
    renderFcList();
    var deck = fcDeck();
    if (!deck.length) { showToast('No cards in this topic yet', 'warn'); return; }
    showToast('Revising ' + fcCurrentFilterLabel() + ': ' + deck.length + (deck.length === 1 ? ' card' : ' cards'), 'success');
    if (typeof scrollFlash === 'function') scrollFlash('fcStage');
  }

  function fcShuffle() {
    var deck = fcDeck();
    if (deck.length < 2) { showToast('Add at least 2 cards to shuffle', 'warn'); return; }
    var ids = deck.map(function (c) { return c.id; });
    for (var i = ids.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = ids[i]; ids[i] = ids[j]; ids[j] = tmp;
    }
    var order = {};
    ids.forEach(function (id, idx) { order[id] = idx; });
    fcCards.sort(function (a, b) {
      var ao = order[a.id], bo = order[b.id];
      if (ao === undefined) return 1;
      if (bo === undefined) return -1;
      return ao - bo;
    });
    persistFc();
    fcIndex = 0;
    fcFlipped = false;
    renderFcStage();
    renderFcList();
    showToast('Deck shuffled', 'success');
  }

  function fcMarkCurrent(got) {
    var deck = fcDeck();
    if (!deck.length) return;
    if (fcIndex < 0) fcIndex = 0;
    if (fcIndex >= deck.length) fcIndex = deck.length - 1;
    var current = deck[fcIndex];
    var target = null;
    fcCards.forEach(function (c) { if (c.id === current.id) target = c; });
    if (!target) return;
    if (got) {
      target.right = (target.right || 0) + 1;
      // Forgive one miss per correct recall so the mistakes deck can clear.
      target.wrong = Math.max(0, (target.wrong || 0) - 1);
    } else target.wrong = (target.wrong || 0) + 1;
    persistFc();
    // Advance so a revise session flows; mistakes-only shrinks as you get them right.
    if (!got) { fcFlipped = false; renderFcStage(); renderFcList(); return; }
    fcIndex = fcIndex + 1;
    if (fcIndex >= fcDeck().length) fcIndex = 0;
    fcFlipped = false;
    renderFcStage();
    renderFcList();
  }

  function fcToggleMistakes() {
    fcMistakesOnly = !fcMistakesOnly;
    fcIndex = 0;
    fcFlipped = false;
    renderFcStage();
    renderFcList();
    var n = fcMistakeCount();
    if (fcMistakesOnly && !fcDeck().length) showToast(n ? 'No missed cards in this topic' : 'No missed cards yet - use ✕ Missed while revising', 'warn');
    else showToast(fcMistakesOnly ? 'Showing missed cards only' : 'Showing full deck', 'info');
  }

  function initFc() {
    loadFc();
    renderFcAll();
    function on(id, evt, fn) {
      var el = document.getElementById(id);
      if (el) el.addEventListener(evt, fn);
    }
    on('btnFcAdd', 'click', fcAddCard);
    on('btnFcShuffle', 'click', fcShuffle);
    on('btnFcMistakes', 'click', fcToggleMistakes);
    on('btnFcGot', 'click', function () { fcMarkCurrent(true); });
    on('btnFcMiss', 'click', function () { fcMarkCurrent(false); });
    on('btnFcBigGot', 'click', function () { fcMarkCurrent(true); });
    on('btnFcBigMiss', 'click', function () { fcMarkCurrent(false); });
    on('btnFcRevise', 'click', fcRevise);
    on('btnFcExpand', 'click', openFcModal);
    on('btnFcBigClose', 'click', closeFcModal);
    on('btnFcBigPrev', 'click', function () { fcStep(-1); });
    on('btnFcBigNext', 'click', function () { fcStep(1); });
    on('btnFcBigFlip', 'click', fcFlip);
    on('fcBigStage', 'click', fcFlip);
    on('btnFcPrev', 'click', function () { fcStep(-1); });
    on('btnFcNext', 'click', function () { fcStep(1); });
    on('btnFcFlip', 'click', fcFlip);
    on('fcStage', 'click', fcFlip);
    on('btnFcDelete', 'click', function () {
      var deck = fcDeck();
      if (!deck.length) return;
      fcDeleteCard(deck[fcIndex].id);
    });
    on('fcFilterSelect', 'change', function () { fcIndex = 0; fcFlipped = false; renderFcStage(); renderFcList(); });
    var fcModal = document.getElementById('fcModal');
    if (fcModal) fcModal.addEventListener('click', function (e) { if (e.target === fcModal) closeFcModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeFcModal(); return; }
      var modal = document.getElementById('fcModal');
      if (!modal || !modal.classList.contains('active')) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); fcStep(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); fcStep(-1); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); fcFlip(); }
    });
    buildSymBars();
    on('fcTopicSelect', 'focus', renderFcTopics);
    on('fcFilterSelect', 'focus', renderFcTopics);
    ['fcFront', 'fcBack'].forEach(function (id) {
      on(id, 'keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); fcAddCard(); } });
    });
  }

  // =========================================================================
  // 19f. Money tab: income, expenses, dues, and wishlist.
  // =========================================================================

  var FIN_KEY = 'horizon_fin_v1';
  var transactions = [];
  var dues = [];
  var wishlist = [];
  var finBudget = 400;
  var finFilter = 'all';
  var finType = 'expense';

  function firstOfNextMonth() {
    var n = new Date();
    var d = new Date(n.getFullYear(), n.getMonth() + 1, 1);
    return todayKey(d);
  }

  function loadFinance() {
    try {
      var raw = localStorage.getItem(FIN_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        transactions = o.tx || []; finBudget = parseFloat(o.budget) || 400;
        dues = o.dues || [];
        wishlist = o.wish || [];
        if (!Array.isArray(transactions)) transactions = [];
        if (!Array.isArray(dues)) dues = [];
        if (!Array.isArray(wishlist)) wishlist = [];
        return;
      }
    } catch (e) {}
    transactions = [
      { id: 'tx-seed-1', type: 'income', title: 'Campus job', amount: 450, cat: 'Job', date: todayKey(new Date()) },
      { id: 'tx-seed-2', type: 'expense', title: 'Dining hall', amount: 24.5, cat: 'Food', date: todayKey(new Date()) },
      { id: 'tx-seed-3', type: 'expense', title: 'Transit pass', amount: 49, cat: 'Transport', date: todayKey(new Date()) }
    ];
    dues = [
      { id: 'due-seed-rent', name: 'Rent', amount: 1200, dueDate: firstOfNextMonth(), recur: 'monthly' }
    ];
    persistFinance();
  }

  function persistFinance() { try { localStorage.setItem(FIN_KEY, JSON.stringify({ tx: transactions, budget: finBudget, dues: dues, wish: wishlist })); } catch (e) {} }

  function usd(n) {
    try { return '$' + parseFloat(n).toFixed(2); }
    catch (e) { return '$0.00'; }
  }

  function monthKey(dateStr) { return String(dateStr || '').slice(0, 7); }
  function currentMonthKey() { return todayKey(new Date()).slice(0, 7); }

  function renderFinance() {
    var balEl = document.getElementById('finBalance');
    if (!balEl) return;
    var mk = currentMonthKey();
    var monthTx = transactions.filter(function (t) { return monthKey(t.date) === mk; });
    var inc = monthTx.filter(function (t) { return t.type === 'income'; }).reduce(function (a, t) { return a + (parseFloat(t.amount) || 0); }, 0);
    var out = monthTx.filter(function (t) { return t.type === 'expense'; }).reduce(function (a, t) { return a + (parseFloat(t.amount) || 0); }, 0);
    var bal = inc - out;
    balEl.textContent = (bal < 0 ? '−' : '') + usd(Math.abs(bal));
    balEl.classList.toggle('negative', bal < 0);
    balEl.classList.toggle('positive', bal >= 0);
    document.getElementById('finIncome').textContent = usd(inc);
    document.getElementById('finExpenses').textContent = usd(out);
    document.getElementById('finSaved').textContent = inc > 0 ? Math.max(0, Math.round((bal / inc) * 100)) + '%' : '-';
    var mb = document.getElementById('moneyMonthBadge');
    if (mb) mb.textContent = mk;
    var bl = document.getElementById('finBudgetLabel');
    if (bl) bl.textContent = usd(finBudget) + ' · ' + usd(out) + ' spent';
    var fill = document.getElementById('finBudgetFill');
    if (fill) {
      var pct = finBudget > 0 ? Math.min(100, (out / finBudget) * 100) : 0;
      fill.style.width = pct + '%';
      fill.classList.toggle('over', out > finBudget);
    }
    var cats = {};
    monthTx.filter(function (t) { return t.type === 'expense'; }).forEach(function (t) {
      cats[t.cat || 'Other'] = (cats[t.cat || 'Other'] || 0) + (parseFloat(t.amount) || 0);
    });
    var catBox = document.getElementById('finCats');
    catBox.innerHTML = '';
    var maxCat = Math.max.apply(null, [0].concat(Object.keys(cats).map(function (k) { return cats[k]; })));
    Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a]; }).slice(0, 6).forEach(function (c) {
      var row = document.createElement('div'); row.className = 'cat-row';
      var nm = document.createElement('span'); nm.className = 'cat-name'; nm.textContent = c;
      var tr = document.createElement('div'); tr.className = 'cat-track';
      var f = document.createElement('div'); f.className = 'cat-fill';
      f.style.width = (maxCat ? (cats[c] / maxCat) * 100 : 0) + '%';
      tr.appendChild(f);
      var v = document.createElement('span'); v.className = 'cat-val'; v.textContent = usd(cats[c]);
      row.appendChild(nm); row.appendChild(tr); row.appendChild(v);
      catBox.appendChild(row);
    });
    if (!Object.keys(cats).length) catBox.innerHTML = '<p class="cal-agenda-hint">No spending this month yet.</p>';

    var list = document.getElementById('finList');
    list.innerHTML = '';
    var items = transactions.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); })
      .filter(function (t) { return finFilter === 'all' || t.type === finFilter; })
      .slice(0, 40);
    if (!items.length) { list.innerHTML = '<div class="money-empty">Nothing here - add your first transaction.</div>'; return; }
    var initials = { Food: 'Fo', Transport: 'Tr', Study: 'St', Rent: 'Re', Fun: 'Fu', Job: 'Jo', Other: 'Ot' };
    items.forEach(function (t) {
      var row = document.createElement('div'); row.className = 'tx-row';
      var ic = document.createElement('span'); ic.className = 'tx-icon ' + t.type; ic.textContent = initials[t.cat] || (t.type === 'income' ? '+' : '-');
      var body = document.createElement('span'); body.className = 'tx-body';
      var ti = document.createElement('span'); ti.className = 'tx-title'; ti.textContent = t.title;
      var su = document.createElement('span'); su.className = 'tx-sub'; su.textContent = t.date + ' · ' + (t.cat || 'Other');
      body.appendChild(ti); body.appendChild(su);
      var amt = document.createElement('span'); amt.className = 'tx-amt ' + t.type;
      amt.textContent = (t.type === 'income' ? '+' : '−') + usd(t.amount);
      row.appendChild(ic); row.appendChild(body); row.appendChild(amt);
      row.addEventListener('click', function () { openFinModal(t.id); });
      list.appendChild(row);
    });
    renderDues();
    renderWishlist();
  }

  function syncFinTypeUI() {
    var e = document.getElementById('finTypeExpense'), i = document.getElementById('finTypeIncome');
    if (e) e.classList.toggle('active', finType === 'expense');
    if (i) i.classList.toggle('active', finType === 'income');
  }

  function resetFinMonth() {
    var mk = currentMonthKey();
    var monthTx = transactions.filter(function (t) { return monthKey(t.date) === mk; });
    if (!monthTx.length) { showToast('Nothing to reset - no transactions this month', 'info'); return; }
    var out = monthTx.filter(function (t) { return t.type === 'expense'; }).reduce(function (a, t) { return a + (parseFloat(t.amount) || 0); }, 0);
    askConfirm('Reset this month?', 'Delete ' + monthTx.length + ' transaction' + (monthTx.length === 1 ? '' : 's') + ' (' + usd(out) + ' spent) from ' + mk + '? Dues and wishlist are kept. This cannot be undone.').then(function (ok) {
      if (!ok) return;
      transactions = transactions.filter(function (t) { return monthKey(t.date) !== mk; });
      persistFinance();
      renderFinance();
      showToast('Cleared ' + monthTx.length + ' transactions for ' + mk, 'success');
    });
  }

  function openFinModal(editId) {
    var modal = document.getElementById('finModal');
    if (!modal) return;
    document.getElementById('finForm').reset();
    document.getElementById('finEditId').value = editId || '';
    document.getElementById('finDateInput').value = todayKey(new Date());
    finType = 'expense'; syncFinTypeUI();
    var del = document.getElementById('btnFinDelete');
    if (editId) {
      var t = transactions.find(function (x) { return x.id === editId; });
      if (!t) return;
      finType = t.type || 'expense'; syncFinTypeUI();
      document.getElementById('finTitleInput').value = t.title || '';
      document.getElementById('finAmountInput').value = t.amount || '';
      document.getElementById('finDateInput').value = t.date || todayKey(new Date());
      document.getElementById('finCatInput').value = t.cat || 'Other';
      if (del) del.style.display = '';
    } else if (del) del.style.display = 'none';
    modal.classList.add('active');
  }
  function closeFinModal() { var m = document.getElementById('finModal'); if (m) m.classList.remove('active'); }

  function saveFinFromModal(e) {
    e.preventDefault();
    var editId = document.getElementById('finEditId').value;
    var title = document.getElementById('finTitleInput').value.trim().slice(0, 60);
    var amount = parseFloat(document.getElementById('finAmountInput').value);
    var date = document.getElementById('finDateInput').value || todayKey(new Date());
    var cat = document.getElementById('finCatInput').value || 'Other';
    if (!title || !(amount > 0)) { showToast('Title + amount required', 'warn'); return; }
    if (editId) {
      var t = transactions.find(function (x) { return x.id === editId; });
      if (t) { t.title = title; t.amount = Math.round(amount * 100) / 100; t.date = date; t.cat = cat; t.type = finType; }
      showToast('Transaction updated', 'success');
    } else {
      transactions.push({ id: 'tx-' + Date.now(), type: finType, title: title, amount: Math.round(amount * 100) / 100, cat: cat, date: date });
      if (finType === 'income') { confetti.fire(0.5, 0.4); }
      showToast((finType === 'income' ? 'Income' : 'Expense') + ' saved: ' + usd(amount), 'success');
    }
    persistFinance(); closeFinModal(); renderFinance();
  }

  // ---- Upcoming dues: rent & co. with amount + exact due date ----

  function dueStatus(d) {
    var today = todayKey(new Date());
    if (!d.dueDate) return { cls: '', label: 'no date' };
    if (d.dueDate < today) {
      var late = Math.round((new Date(today + 'T12:00:00') - new Date(d.dueDate + 'T12:00:00')) / 86400000);
      return { cls: 'overdue', label: 'overdue ' + late + (late === 1 ? ' day' : ' days') };
    }
    if (d.dueDate === today) return { cls: 'today', label: 'due today' };
    var ahead = Math.round((new Date(d.dueDate + 'T12:00:00') - new Date(today + 'T12:00:00')) / 86400000);
    return { cls: ahead <= 7 ? 'soon' : '', label: 'in ' + ahead + (ahead === 1 ? ' day' : ' days') };
  }

  function addMonths(dateStr, n) {
    var d = new Date(dateStr + 'T12:00:00');
    d.setMonth(d.getMonth() + n);
    return todayKey(d);
  }

  function renderDues() {
    var list = document.getElementById('dueList');
    if (!list) return;
    var today0 = todayKey(new Date());
    var overdueN = dues.filter(function (d) { return d.dueDate && d.dueDate <= today0; }).length;
    var overBtn = document.getElementById('btnPostOverdue');
    if (overBtn) {
      overBtn.textContent = overdueN ? 'Post overdue (' + overdueN + ')' : 'Post overdue';
      overBtn.style.display = overdueN ? '' : 'none';
    }
    list.innerHTML = '';
    var items = dues.slice().sort(function (a, b) { return String(a.dueDate).localeCompare(String(b.dueDate)); });
    if (!items.length) {
      list.innerHTML = '<div class="money-empty">No dues tracked - add rent, a subscription or an installment above.</div>';
      return;
    }
    items.forEach(function (d) {
      var st = dueStatus(d);
      var row = document.createElement('div');
      row.className = 'tx-row due-row' + (st.cls ? ' ' + st.cls : '');
      var ic = document.createElement('span');
      ic.className = 'tx-icon expense';
      ic.textContent = String(d.name || '?').trim().slice(0, 2).toUpperCase() || 'Du';
      var body = document.createElement('span');
      body.className = 'tx-body';
      var ti = document.createElement('span');
      ti.className = 'tx-title';
      ti.textContent = d.name + (d.recur === 'monthly' ? ' · monthly' : '');
      var su = document.createElement('span');
      su.className = 'tx-sub';
      su.textContent = (d.dueDate || '-') + ' · ' + st.label;
      body.appendChild(ti);
      body.appendChild(su);
      var amt = document.createElement('span');
      amt.className = 'tx-amt expense';
      amt.textContent = usd(d.amount);
      var paid = document.createElement('button');
      paid.type = 'button';
      paid.className = 'pill-btn pill-btn-secondary pill-sm';
      paid.textContent = 'Paid';
      paid.addEventListener('click', function (e) {
        e.stopPropagation();
        transactions.push({
          id: 'tx-' + Date.now(), type: 'expense', title: (d.name || 'Due') + ' (due)',
          amount: Math.round((parseFloat(d.amount) || 0) * 100) / 100,
          cat: /rent/i.test(d.name || '') ? 'Rent' : 'Other', date: todayKey(new Date())
        });
        if (d.recur === 'monthly') {
          d.dueDate = addMonths(d.dueDate || todayKey(new Date()), 1);
          persistFinance(); renderDues(); renderFinance();
          showToast(d.name + ' paid ' + usd(d.amount) + ' - next due ' + d.dueDate, 'success');
        } else {
          dues = dues.filter(function (x) { return x.id !== d.id; });
          persistFinance(); renderDues(); renderFinance();
          confetti.fire(0.5, 0.4);
          showToast(d.name + ' paid off ' + usd(d.amount) + '. Nicely done.', 'success');
        }
      });
      row.appendChild(ic);
      row.appendChild(body);
      row.appendChild(amt);
      row.appendChild(paid);
      row.addEventListener('click', function () { openDueModal(d.id); });
      list.appendChild(row);
    });
  }

  function postOverdueDues() {
    var today = todayKey(new Date());
    var overdue = dues.filter(function (d) { return d.dueDate && d.dueDate <= today; });
    if (!overdue.length) { showToast('Nothing overdue - all clear', 'info'); return; }
    var total = 0;
    overdue.forEach(function (d) {
      var amt = Math.round((parseFloat(d.amount) || 0) * 100) / 100;
      total += amt;
      transactions.push({
        id: 'tx-' + Date.now() + '-' + d.id, type: 'expense',
        title: (d.name || 'Due') + ' (due)', amount: amt,
        cat: /rent/i.test(d.name || '') ? 'Rent' : 'Other', date: today
      });
      if (d.recur === 'monthly') {
        var next = d.dueDate;
        var guard = 0;
        while (next <= today && guard < 24) { next = addMonths(next, 1); guard++; }
        d.dueDate = next;
      }
    });
    dues = dues.filter(function (d) {
      return !(d.recur !== 'monthly' && d.dueDate && d.dueDate <= today);
    });
    persistFinance(); renderDues(); renderFinance();
    confetti.fire(0.5, 0.4);
    showToast('Posted ' + overdue.length + ' overdue (' + usd(total) + ') as expenses', 'success');
  }

  function openDueModal(editId) {
    var modal = document.getElementById('dueModal');
    if (!modal) return;
    document.getElementById('dueForm').reset();
    document.getElementById('dueEditId').value = editId || '';
    document.getElementById('dueDateInput').value = firstOfNextMonth();
    document.getElementById('dueRecurInput').checked = true;
    var del = document.getElementById('btnDueDelete');
    if (editId) {
      var d = dues.find(function (x) { return x.id === editId; });
      if (!d) return;
      document.getElementById('dueModalTitle').textContent = 'Edit due';
      document.getElementById('dueNameInput').value = d.name || '';
      document.getElementById('dueAmountInput').value = d.amount || '';
      document.getElementById('dueDateInput').value = d.dueDate || firstOfNextMonth();
      document.getElementById('dueRecurInput').checked = d.recur === 'monthly';
      if (del) del.style.display = '';
    } else {
      document.getElementById('dueModalTitle').textContent = 'New due';
      if (del) del.style.display = 'none';
    }
    modal.classList.add('active');
  }

  function closeDueModal() { var m = document.getElementById('dueModal'); if (m) m.classList.remove('active'); }

  function saveDueFromModal(e) {
    e.preventDefault();
    var editId = document.getElementById('dueEditId').value;
    var name = document.getElementById('dueNameInput').value.trim().slice(0, 60);
    var amount = parseFloat(document.getElementById('dueAmountInput').value);
    var date = document.getElementById('dueDateInput').value || firstOfNextMonth();
    var recur = document.getElementById('dueRecurInput').checked ? 'monthly' : 'once';
    if (!name || !(amount > 0)) { showToast('Name + amount required', 'warn'); return; }
    if (editId) {
      var d = dues.find(function (x) { return x.id === editId; });
      if (d) { d.name = name; d.amount = Math.round(amount * 100) / 100; d.dueDate = date; d.recur = recur; }
      showToast('Due updated', 'success');
    } else {
      dues.push({ id: 'due-' + Date.now(), name: name, amount: Math.round(amount * 100) / 100, dueDate: date, recur: recur });
      showToast('Due added: ' + name + ' ' + usd(amount), 'success');
    }
    persistFinance(); closeDueModal(); renderDues(); renderFinance();
  }

  // ---- Wishlist: name it, price it, rank it ----

  var WISH_PRIO = { High: 0, Medium: 1, Low: 2 };

  function wishCat(name) {
    var n = String(name || '').toLowerCase();
    if (/shoe|cloth|jacket|watch|game|gadget|fun|bike|skate/.test(n)) return 'Fun';
    if (/book|study|course|exam|tutor/.test(n)) return 'Study';
    if (/bus|train|bike|ticket|travel|flight/.test(n)) return 'Transport';
    if (/food|snack|coffee|pizza/.test(n)) return 'Food';
    return 'Other';
  }

  function renderWishlist() {
    var list = document.getElementById('wishList');
    if (!list) return;
    list.innerHTML = '';
    function prioRank(p) { return WISH_PRIO[p] !== undefined ? WISH_PRIO[p] : 1; }
    var items = wishlist.slice().sort(function (a, b) {
      return prioRank(a.prio) - prioRank(b.prio) || (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0);
    });
    if (!items.length) {
      list.innerHTML = '<div class="money-empty">Wishlist is empty - add those shoes you keep thinking about.</div>';
      return;
    }
    items.forEach(function (w) {
      var row = document.createElement('div');
      row.className = 'tx-row wish-row';
      var ic = document.createElement('span');
      ic.className = 'tx-icon expense';
      ic.textContent = String(w.name || '?').trim().slice(0, 2).toUpperCase() || 'Wi';
      var body = document.createElement('span');
      body.className = 'tx-body';
      var ti = document.createElement('span');
      ti.className = 'tx-title';
      ti.textContent = w.name;
      var su = document.createElement('span');
      su.className = 'tx-sub';
      su.textContent = (w.prio || 'Medium') + ' priority';
      body.appendChild(ti);
      body.appendChild(su);
      var amt = document.createElement('span');
      amt.className = 'tx-amt expense';
      amt.textContent = usd(w.amount);
      var prio = document.createElement('span');
      prio.className = 'wish-prio wish-' + String(w.prio || 'Medium').toLowerCase();
      prio.textContent = w.prio || 'Medium';
      var bought = document.createElement('button');
      bought.type = 'button';
      bought.className = 'pill-btn pill-btn-secondary pill-sm';
      bought.textContent = 'Bought';
      bought.addEventListener('click', function (e) {
        e.stopPropagation();
        transactions.push({
          id: 'tx-' + Date.now(), type: 'expense', title: (w.name || 'Wish') + ' (wishlist)',
          amount: Math.round((parseFloat(w.amount) || 0) * 100) / 100,
          cat: wishCat(w.name), date: todayKey(new Date())
        });
        wishlist = wishlist.filter(function (x) { return x.id !== w.id; });
        persistFinance(); renderWishlist(); renderFinance();
        confetti.fire(0.5, 0.4);
        showToast('Enjoy your ' + w.name + ' - logged as ' + usd(w.amount), 'success');
      });
      row.appendChild(ic);
      row.appendChild(body);
      row.appendChild(amt);
      row.appendChild(prio);
      row.appendChild(bought);
      row.addEventListener('click', function () { openWishModal(w.id); });
      list.appendChild(row);
    });
  }

  function openWishModal(editId) {
    var modal = document.getElementById('wishModal');
    if (!modal) return;
    document.getElementById('wishForm').reset();
    document.getElementById('wishEditId').value = editId || '';
    var del = document.getElementById('btnWishDelete');
    if (editId) {
      var w = wishlist.find(function (x) { return x.id === editId; });
      if (!w) return;
      document.getElementById('wishModalTitle').textContent = 'Edit wish';
      document.getElementById('wishNameInput').value = w.name || '';
      document.getElementById('wishAmountInput').value = w.amount || '';
      document.getElementById('wishPrioInput').value = w.prio || 'Medium';
      if (del) del.style.display = '';
    } else {
      document.getElementById('wishModalTitle').textContent = 'New wish';
      if (del) del.style.display = 'none';
    }
    modal.classList.add('active');
  }

  function closeWishModal() { var m = document.getElementById('wishModal'); if (m) m.classList.remove('active'); }

  function saveWishFromModal(e) {
    e.preventDefault();
    var editId = document.getElementById('wishEditId').value;
    var name = document.getElementById('wishNameInput').value.trim().slice(0, 60);
    var amount = parseFloat(document.getElementById('wishAmountInput').value);
    var prio = document.getElementById('wishPrioInput').value || 'Medium';
    if (!name || !(amount > 0)) { showToast('Name + amount required', 'warn'); return; }
    if (editId) {
      var w = wishlist.find(function (x) { return x.id === editId; });
      if (w) { w.name = name; w.amount = Math.round(amount * 100) / 100; w.prio = prio; }
      showToast('Wish updated', 'success');
    } else {
      wishlist.push({ id: 'wish-' + Date.now(), name: name, amount: Math.round(amount * 100) / 100, prio: prio });
      showToast('Wish added: ' + name, 'success');
    }
    persistFinance(); closeWishModal(); renderWishlist(); renderFinance();
  }

  // =========================================================================
  // 19g. Flight simulator - fly your focus sessions
  // =========================================================================

  var FLIGHT_KEY = 'horizon_flight_v1';

  var AIRPORTS = [
    { id: 'JFK', city: 'New York', name: 'John F. Kennedy', region: 'North America', lat: 40.64, lon: -73.78, tier: 0 },
    { id: 'LAS', city: 'Las Vegas', name: 'Harry Reid', region: 'North America', lat: 36.08, lon: -115.15, tier: 0 },
    { id: 'LAX', city: 'Los Angeles', name: 'Los Angeles Intl', region: 'North America', lat: 33.94, lon: -118.41, tier: 0 },
    { id: 'ORD', city: 'Chicago', name: "O'Hare", region: 'North America', lat: 41.97, lon: -87.91, tier: 1 },
    { id: 'MIA', city: 'Miami', name: 'Miami Intl', region: 'North America', lat: 25.79, lon: -80.29, tier: 1 },
    { id: 'SFO', city: 'San Francisco', name: 'San Francisco Intl', region: 'North America', lat: 37.62, lon: -122.38, tier: 1 },
    { id: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson', region: 'North America', lat: 33.64, lon: -84.43, tier: 2 },
    { id: 'YYZ', city: 'Toronto', name: 'Pearson', region: 'North America', lat: 43.68, lon: -79.63, tier: 2 },
    { id: 'MEX', city: 'Mexico City', name: 'Benito Juarez', region: 'North America', lat: 19.44, lon: -99.07, tier: 3 },
    { id: 'LHR', city: 'London', name: 'Heathrow', region: 'Europe', lat: 51.47, lon: -0.45, tier: 0 },
    { id: 'CDG', city: 'Paris', name: 'Charles de Gaulle', region: 'Europe', lat: 49.01, lon: 2.55, tier: 0 },
    { id: 'FRA', city: 'Frankfurt', name: 'Frankfurt am Main', region: 'Europe', lat: 50.03, lon: 8.56, tier: 1 },
    { id: 'AMS', city: 'Amsterdam', name: 'Schiphol', region: 'Europe', lat: 52.31, lon: 4.76, tier: 1 },
    { id: 'MAD', city: 'Madrid', name: 'Barajas', region: 'Europe', lat: 40.47, lon: -3.57, tier: 2 },
    { id: 'FCO', city: 'Rome', name: 'Fiumicino', region: 'Europe', lat: 41.80, lon: 12.25, tier: 2 },
    { id: 'ZRH', city: 'Zurich', name: 'Zurich', region: 'Europe', lat: 47.46, lon: 8.55, tier: 3 },
    { id: 'DXB', city: 'Dubai', name: 'Dubai Intl', region: 'Middle East', lat: 25.25, lon: 55.36, tier: 0 },
    { id: 'DOH', city: 'Doha', name: 'Hamad Intl', region: 'Middle East', lat: 25.27, lon: 51.61, tier: 1 },
    { id: 'MCT', city: 'Muscat', name: 'Muscat Intl', region: 'Middle East', lat: 23.59, lon: 58.28, tier: 1 },
    { id: 'RUH', city: 'Riyadh', name: 'King Khalid', region: 'Middle East', lat: 24.96, lon: 46.70, tier: 2 },
    { id: 'JED', city: 'Jeddah', name: 'King Abdulaziz', region: 'Middle East', lat: 21.68, lon: 39.16, tier: 3 },
    { id: 'SIN', city: 'Singapore', name: 'Changi', region: 'Asia', lat: 1.36, lon: 103.99, tier: 0 },
    { id: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji', region: 'Asia', lat: 19.09, lon: 72.87, tier: 1 },
    { id: 'HKG', city: 'Hong Kong', name: 'Hong Kong Intl', region: 'Asia', lat: 22.31, lon: 113.91, tier: 1 },
    { id: 'DEL', city: 'Delhi', name: 'Indira Gandhi', region: 'Asia', lat: 28.57, lon: 77.10, tier: 2 },
    { id: 'NRT', city: 'Tokyo', name: 'Narita', region: 'Asia', lat: 35.77, lon: 140.39, tier: 2 },
    { id: 'ICN', city: 'Seoul', name: 'Incheon', region: 'Asia', lat: 37.46, lon: 126.44, tier: 3 },
    { id: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi', region: 'Asia', lat: 13.69, lon: 100.75, tier: 3 },
    { id: 'SYD', city: 'Sydney', name: 'Kingsford Smith', region: 'Oceania', lat: -33.95, lon: 151.18, tier: 1 },
    { id: 'MEL', city: 'Melbourne', name: 'Melbourne', region: 'Oceania', lat: -37.67, lon: 144.84, tier: 2 },
    { id: 'AKL', city: 'Auckland', name: 'Auckland', region: 'Oceania', lat: -37.01, lon: 174.79, tier: 3 },
    { id: 'CAI', city: 'Cairo', name: 'Cairo Intl', region: 'Africa', lat: 30.12, lon: 31.41, tier: 2 },
    { id: 'ADD', city: 'Addis Ababa', name: 'Bole', region: 'Africa', lat: 8.98, lon: 38.80, tier: 3 },
    { id: 'JNB', city: 'Johannesburg', name: 'O.R. Tambo', region: 'Africa', lat: -26.14, lon: 28.25, tier: 3 },
    { id: 'GRU', city: 'Sao Paulo', name: 'Guarulhos', region: 'South America', lat: -23.44, lon: -46.47, tier: 2 },
    { id: 'EZE', city: 'Buenos Aires', name: 'Ezeiza', region: 'South America', lat: -34.82, lon: -58.54, tier: 3 },
    { id: 'BOG', city: 'Bogota', name: 'El Dorado', region: 'South America', lat: 4.70, lon: -74.14, tier: 3 },
    { id: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth', region: 'North America', lat: 32.90, lon: -97.04, tier: 1 },
    { id: 'DEN', city: 'Denver', name: 'Denver Intl', region: 'North America', lat: 39.86, lon: -104.67, tier: 1 },
    { id: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma', region: 'North America', lat: 47.45, lon: -122.31, tier: 1 },
    { id: 'BOS', city: 'Boston', name: 'Logan', region: 'North America', lat: 42.36, lon: -71.01, tier: 1 },
    { id: 'IAD', city: 'Washington', name: 'Dulles', region: 'North America', lat: 38.95, lon: -77.46, tier: 2 },
    { id: 'BCN', city: 'Barcelona', name: 'El Prat', region: 'Europe', lat: 41.30, lon: 2.08, tier: 1 },
    { id: 'LIS', city: 'Lisbon', name: 'Humberto Delgado', region: 'Europe', lat: 38.77, lon: -9.13, tier: 1 },
    { id: 'VIE', city: 'Vienna', name: 'Vienna Intl', region: 'Europe', lat: 48.11, lon: 16.57, tier: 1 },
    { id: 'ATH', city: 'Athens', name: 'Athens Intl', region: 'Europe', lat: 37.94, lon: 23.94, tier: 2 },
    { id: 'CPH', city: 'Copenhagen', name: 'Kastrup', region: 'Europe', lat: 55.62, lon: 12.66, tier: 2 },
    { id: 'DUB', city: 'Dublin', name: 'Dublin', region: 'Europe', lat: 53.42, lon: -6.27, tier: 2 },
    { id: 'AUH', city: 'Abu Dhabi', name: 'Zayed Intl', region: 'Middle East', lat: 24.43, lon: 54.65, tier: 1 },
    { id: 'KWI', city: 'Kuwait City', name: 'Kuwait Intl', region: 'Middle East', lat: 29.23, lon: 47.97, tier: 2 },
    { id: 'PEK', city: 'Beijing', name: 'Capital Intl', region: 'Asia', lat: 40.08, lon: 116.58, tier: 1 },
    { id: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur Intl', region: 'Asia', lat: 3.14, lon: 101.69, tier: 1 },
    { id: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta', region: 'Asia', lat: -6.13, lon: 106.66, tier: 2 },
    { id: 'IDR', city: 'Indore', name: 'Devi Ahilyabai Holkar', region: 'Asia', lat: 22.72, lon: 75.80, tier: 2 },
    { id: 'SJC', city: 'San Jose', name: 'Norman Y. Mineta', region: 'North America', lat: 37.36, lon: -121.93, tier: 1 },
    { id: 'SAN', city: 'San Diego', name: 'San Diego Intl', region: 'North America', lat: 32.73, lon: -117.19, tier: 1 },
    { id: 'SMF', city: 'Sacramento', name: 'Sacramento Intl', region: 'North America', lat: 38.70, lon: -121.59, tier: 2 },
    { id: 'PRG', city: 'Prague', name: 'Vaclav Havel', region: 'Europe', lat: 50.10, lon: 14.26, tier: 1 },
    { id: 'BRU', city: 'Brussels', name: 'Brussels', region: 'Europe', lat: 50.90, lon: 4.48, tier: 2 },
    { id: 'ARN', city: 'Stockholm', name: 'Arlanda', region: 'Europe', lat: 59.65, lon: 17.92, tier: 2 },
    { id: 'OSL', city: 'Oslo', name: 'Gardermoen', region: 'Europe', lat: 60.19, lon: 11.10, tier: 2 },
    { id: 'NJF', city: 'Najaf', name: 'Al Najaf Intl', region: 'Middle East', lat: 31.99, lon: 44.40, tier: 2 },
    { id: 'NBO', city: 'Nairobi', name: 'Jomo Kenyatta', region: 'Africa', lat: -1.32, lon: 36.93, tier: 2 },
    { id: 'LOS', city: 'Lagos', name: 'Murtala Muhammed', region: 'Africa', lat: 6.52, lon: 3.38, tier: 3 },
    { id: 'SCL', city: 'Santiago', name: 'Arturo Merino Benitez', region: 'South America', lat: -33.39, lon: -70.79, tier: 2 },
    { id: 'LIM', city: 'Lima', name: 'Jorge Chavez', region: 'South America', lat: -12.02, lon: -77.11, tier: 3 }
  ];

  var TIER_MILES = { 1: 2000, 2: 8000, 3: 20000 };
  var CABINS = [
    { id: 'economy', name: 'Economy', mult: 1, flights: 0 },
    { id: 'premium', name: 'Premium', mult: 1.25, flights: 5 },
    { id: 'business', name: 'Business', mult: 1.5, flights: 15 },
    { id: 'first', name: 'First Class', mult: 2, flights: 30 }
  ];

  var PLANES = [
    { id: 'a320', name: 'Airbus A320', cruise: 840, range: 6100, size: 1 },
    { id: 'b737', name: 'Boeing 737', cruise: 820, range: 5600, size: 1 },
    { id: 'b787', name: 'Boeing 787', cruise: 913, range: 14100, size: 1.35 },
    { id: 'a350', name: 'Airbus A350', cruise: 903, range: 15000, size: 1.35 },
    { id: 'b777', name: 'Boeing 777', cruise: 905, range: 14000, size: 1.5 },
    { id: 'a380', name: 'Airbus A380', cruise: 900, range: 14800, size: 1.8 }
  ];

  // Real Earth landmask (Natural Earth 110m, rasterized 144x72, base64 bits)
  var LAND_W = 144, LAND_H = 72;
  var LANDMASK = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/5///gAAAAAAAAAAAAAAAAAz/P//8ABwAAAADAAAAAAAABKZAP//8AAAAA4AH4AAAAAAADwDQAP/8AAAAGAH/4AIAAgEABfG/gH/4AAAAGHf//9/gAB///1Ds4H/gAAf4F6///////8/////w+H8BAB/0/////////AP////UcHwCAD3/////////+A////8BgDgAAPn////////74AeB//+B6AAAAPn///////4CAAIAf//h+AAACFP///////gOAAAAP//7/gAANH////////wMAAAAH////wAAD/////////wAAAAAD///04AAD/////////wAAAAAD///8AAAB//X3/////gAAAAAD///wAAAB6+Dv/////EAAAAAD///gAAAPhvbz////8IAAAAAB///AAAAPAp/z///+IIAAAAAB///AAAAA8Af/////EwAAAAAAf/+AAAAH8AP/////BAAAAAAAX/4AAAAP/uv/////gAAAAAAAP8EAAAAP///v////gAAAAAAAD4EAAAA///3z////AAAAAAAAB4AAAAA///3+H//+gAAAAAAAA4gAAAB///7/D+fgAAAAAAAAA9gYAAA///7+B8PQAAAAAAAAAHgAAAB///94B4HggAAAAAAAAA4AAAB////gAwHwwAAAAAAAAAAoAAA///+QAwFgAAAAAAAAAAF/AAAf///wAAEAIAAAAAAAAAB/gAAPv//wAICAAAAAAAAAAAB/8AAAD//gAAGGAAAAAAAAAAD/8AAAD//AAADOAAAAAAAAAAD//AAAD/+AAADOjAAAAAAAAAD//4AAD/8AAABAg8AAAAAAAAD//8AAB/8AAAAgAeAAAAAAAAD//8AAB/8AAAABoIAAAAAAAAB//4AAB/8AAAAAAAAAAAAAAAB//wAAB/8QAAAADAAAAAAAAAAf/wAAB/8wAAAAfkAAAAAAAAAP/wAAB/wwAAAAf+AAAAAAAAAP/wAAB/xgAAAD//AAAAAAAAAP/AAAA/xgAAAH//AAAAAAAAAP+AAAA/gAAAAH//gAAAAAAAAf8AAAAfgAAAAD//gAAAAAAAAf8AAAAfAAAAAD//gAAAAAAAAf4AAAAcAAAAADw/gAAAAAAAAfgAAAAAAAAAAAAPAAAAAAAAAfAAAAAAAAAAAAACACAAAAAAA8AAAAAAAAAAAAACAEAAAAAAAcAAAAAAAAAAAAAAAIAAAAAAA4AAAAAAAAAAAAAAAQAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAwgAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAACAAAAAAAGAABEAAAAAAAAAAAEAAAAAAR/8f////gAAAAAAAA+AAAF////5//////wAAABAf+/AAB////////////gAAP////wAAP///////////+AAT////+ADj/////////////gAD/////4AH////////////8AAB/////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

  function landAt(col, row) {
    if (col < 0 || col >= LAND_W || row < 0 || row >= LAND_H) return false;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var i = row * LAND_W + col;
    var ch = LANDMASK.charAt(i >> 3);
    var v = chars.indexOf(ch);
    if (v < 0) return false;
    return !!((v >> (7 - (i & 7))) & 1);
  }

  var flightSave = { miles: 0, flights: 0, log: [], from: 'JFK', to: 'LAS', cabin: 'economy', mode: 'real', customMin: 50, airline: 'BA', plane: 'b777', view: 'map', day: 'auto', zoom: 3 };
  var flight = { state: 'idle', totalSec: 0, elapsed: 0, runStart: 0, raf: null, distMi: 0, miles: 0 };
  var flRefs = {};

  function loadFlight() {
    try {
      var raw = localStorage.getItem(FLIGHT_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        ['miles', 'flights', 'from', 'to', 'cabin', 'mode', 'customMin', 'plane', 'view', 'day', 'zoom'].forEach(function (k) {
          if (o[k] !== undefined) flightSave[k] = o[k];
        });
        if (Array.isArray(o.log)) flightSave.log = o.log.slice(0, 20);
      }
    } catch (e) {}
    if (!apById(flightSave.from)) flightSave.from = 'JFK';
    if (!apById(flightSave.to) || flightSave.to === flightSave.from) flightSave.to = 'LAS';
    if (!CABINS.some(function (c) { return c.id === flightSave.cabin; })) flightSave.cabin = 'economy';
    if (!planeById(flightSave.plane)) flightSave.plane = 'b777';
    if (['map', 'follow'].indexOf(flightSave.view) < 0) flightSave.view = 'map';
    if (['day', 'auto', 'night'].indexOf(flightSave.day) < 0) flightSave.day = 'auto';
    flightSave.zoom = Math.min(8, Math.max(1, parseInt(flightSave.zoom, 10) || 3));
  }

  function persistFlight() {
    try { localStorage.setItem(FLIGHT_KEY, JSON.stringify(flightSave)); } catch (e) {}
  }

  function apById(id) {
    for (var i = 0; i < AIRPORTS.length; i++) if (AIRPORTS[i].id === id) return AIRPORTS[i];
    return null;
  }

  function cabinById(id) {
    for (var i = 0; i < CABINS.length; i++) if (CABINS[i].id === id) return CABINS[i];
    return CABINS[0];
  }

  function planeById(id) {
    for (var i = 0; i < PLANES.length; i++) if (PLANES[i].id === id) return PLANES[i];
    return PLANES[4];
  }

  function isApUnlocked(ap) {
    if (!ap) return false;
    if (!ap.tier) return true;
    return flightSave.miles >= (TIER_MILES[ap.tier] || Infinity);
  }

  function unlockedPorts() {
    return AIRPORTS.filter(isApUnlocked).length;
  }

  function isCabinUnlocked(c) {
    return flightSave.flights >= (c.flights || 0);
  }

  function haversineKm(a, b) {
    var R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLon = (b.lon - a.lon) * Math.PI / 180;
    var la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function routeInfo(fromId, toId, planeId) {
    var a = apById(fromId), b = apById(toId);
    if (!a || !b) return null;
    var plane = planeById(planeId || flightSave.plane);
    var km = haversineKm(a, b);
    var mi = Math.round(km * 0.621371);
    var realMin = Math.max(5, Math.round(km / plane.cruise * 60 + 30));
    return { a: a, b: b, km: Math.round(km), mi: mi, realMin: realMin, plane: plane, inRange: km <= plane.range };
  }

  function fmtDur(min) {
    if (!(min > 0)) min = 0;
    if (min < 1) return Math.max(1, Math.round(min * 60)) + 's';
    var h = Math.floor(min / 60), m = Math.round((min % 60) * 10) / 10;
    return h ? h + 'h ' + m + 'm' : m + 'm';
  }

  function clampFlightMin(v, fallback) {
    var n = parseFloat(v);
    if (!(n > 0)) n = fallback || 50;
    return Math.min(600, Math.max(0.1, Math.round(n * 10) / 10));
  }

  function fmtClock(sec) {
    sec = Math.max(0, Math.ceil(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    function p(n) { return String(n).padStart(2, '0'); }
    return h ? h + ':' + p(m) + ':' + p(s) : p(m) + ':' + p(s);
  }

  function fmtNum(n) {
    try { return Number(n).toLocaleString('en-US'); } catch (e) { return String(n); }
  }

  function populateFlightSelects() {
    var from = document.getElementById('flFrom'), to = document.getElementById('flTo'), cab = document.getElementById('flCabin');
    var pl = document.getElementById('flPlane');
    if (!from || !to || !cab) return;
    var regions = [];
    AIRPORTS.forEach(function (a) { if (regions.indexOf(a.region) < 0) regions.push(a.region); });
    function fill(sel, val) {
      sel.innerHTML = '';
      regions.forEach(function (rg) {
        var g = document.createElement('optgroup');
        g.label = rg;
        AIRPORTS.filter(function (a) { return a.region === rg; }).forEach(function (a) {
          var o = document.createElement('option');
          o.value = a.id;
          var locked = !isApUnlocked(a);
          o.textContent = a.id + ' - ' + a.city + (locked ? ' (locked · ' + fmtNum(TIER_MILES[a.tier]) + ' mi)' : '');
          o.disabled = locked;
          if (locked) o.title = 'Locked - earn ' + fmtNum(TIER_MILES[a.tier]) + ' total miles to unlock ' + a.city;
          if (a.id === val) o.selected = true;
          g.appendChild(o);
        });
        sel.appendChild(g);
      });
    }
    fill(from, flightSave.from);
    fill(to, flightSave.to);
    cab.innerHTML = '';
    CABINS.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.id;
      var locked = !isCabinUnlocked(c);
      o.textContent = c.name + ' ×' + c.mult + (locked ? ' (' + c.flights + ' flights)' : '');
      o.disabled = locked;
      if (c.id === flightSave.cabin) o.selected = true;
      cab.appendChild(o);
    });
    if (pl) {
      pl.innerHTML = '';
      PLANES.forEach(function (p) {
        var o = document.createElement('option');
        o.value = p.id;
        o.textContent = p.name + ' · ' + p.cruise + ' km/h · ' + fmtNum(p.range) + ' km range';
        if (p.id === flightSave.plane) o.selected = true;
        pl.appendChild(o);
      });
    }
    var ch = document.getElementById('flCustomH'), cmm = document.getElementById('flCustomM');
    if (ch && !ch.options.length) {
      for (var hh = 0; hh <= 10; hh++) {
        var oh = document.createElement('option');
        oh.value = hh; oh.textContent = hh;
        ch.appendChild(oh);
      }
    }
    if (cmm && !cmm.options.length) {
      for (var mm = 0; mm <= 59; mm++) {
        var om = document.createElement('option');
        om.value = mm; om.textContent = String(mm).padStart(2, '0');
        cmm.appendChild(om);
      }
    }
    if (ch && cmm) {
      var savedMin = clampFlightMin(flightSave.customMin, 50);
      ch.value = Math.min(10, Math.floor(savedMin / 60));
      cmm.value = Math.round(savedMin % 60);
      var hid = document.getElementById('flCustomMin');
      if (hid) hid.value = savedMin;
    }
  }

  function flCustomTotalMin() {
    var ch = document.getElementById('flCustomH'), cmm = document.getElementById('flCustomM');
    var total = (ch ? parseInt(ch.value, 10) || 0 : 0) * 60 + (cmm ? parseInt(cmm.value, 10) || 0 : 0);
    return clampFlightMin(total, 50);
  }

  function nextUnlockInfo() {
    var lockedTiers = AIRPORTS.filter(function (a) { return !isApUnlocked(a); }).map(function (a) { return a.tier; });
    if (!lockedTiers.length) return null;
    var next = Math.min.apply(null, lockedTiers);
    var count = AIRPORTS.filter(function (a) { return a.tier === next; }).length;
    return { tier: next, count: count, need: TIER_MILES[next] - flightSave.miles };
  }

  function flightSpeedKmh(info, mins) {
    if (!info || !mins) return 0;
    return Math.round(info.km / (mins / 60));
  }

  function renderFlightAll() {
    var info = routeInfo(flightSave.from, flightSave.to, flightSave.plane);
    var cab = cabinById(flightSave.cabin);
    var plane = planeById(flightSave.plane);
    var mins = flightSave.mode === 'custom' ? clampFlightMin(flightSave.customMin, 50) : (info ? info.realMin : 50);
    var earn = info ? Math.round(info.mi * cab.mult) : 0;
    var meta = document.getElementById('flRouteMeta');
    if (meta && info) {
      var spd = flightSpeedKmh(info, mins);
      var comp = flightSave.mode === 'custom' && info.realMin !== mins
        ? ' · ' + (info.realMin / mins).toFixed(1) + '× time' : '';
      var rangeWarn = info.inRange ? '' : ' · OUT OF RANGE for ' + plane.name;
      meta.textContent = plane.name + ' · ' + info.a.id + ' → ' + info.b.id + ' · ' +
        fmtNum(info.mi) + ' mi · ' + (flightSave.mode === 'custom' ? 'custom ' + fmtDur(mins) : 'real ' + fmtDur(info.realMin)) +
        ' · ' + fmtNum(spd) + ' km/h' + comp + ' · +' + fmtNum(earn) + ' mi' + rangeWarn;
    }
    syncFlightViewBtns();
    var badge = document.getElementById('flMilesBadge');
    if (badge) badge.textContent = fmtNum(flightSave.miles) + ' mi flown';
    var note = document.getElementById('flUnlockNote');
    if (note) {
      var nx = nextUnlockInfo();
      var nextCab = CABINS.filter(function (c) { return !isCabinUnlocked(c); })[0];
      var bits = [];
      if (nx) bits.push('Next: ' + nx.count + ' airports at ' + fmtNum(TIER_MILES[nx.tier]) + ' mi (' + fmtNum(nx.need) + ' to go)');
      else bits.push('All airports unlocked');
      if (nextCab) bits.push(nextCab.name + ' cabin at ' + nextCab.flights + ' flights');
      note.textContent = bits.join(' · ');
    }
    var cw = document.getElementById('flCustomWrap');
    if (cw) cw.style.display = flightSave.mode === 'custom' ? '' : 'none';
    renderFlightStats();
    renderFlightLog();
    renderDepartures();
    var sim = document.getElementById('flightSim');
    if (sim) sim.classList.toggle('flenight', flightSave.day === 'night');
    buildFlightMap();
    paintFlight(flight.state === 'landed' ? 1 : flightProgress());
  }

  function renderFlightStats() {
    setText('flStatMiles', fmtNum(flightSave.miles));
    setText('flStatFlights', String(flightSave.flights));
    setText('flStatPorts', unlockedPorts() + '/' + AIRPORTS.length);
    setText('flLogCount', flightSave.flights + (flightSave.flights === 1 ? ' stamp' : ' stamps'));
  }

  function renderFlightLog() {
    var box = document.getElementById('flLog');
    if (!box) return;
    box.innerHTML = '';
    if (!flightSave.log.length) {
      box.innerHTML = '<div class="money-empty">Passport is empty - every landed flight earns a stamp here.</div>';
      return;
    }
    flightSave.log.slice(0, 8).forEach(function (f) {
      var row = document.createElement('div');
      row.className = 'tx-row passport-stamp';
      var ic = document.createElement('span');
      ic.className = 'tx-icon expense';
      ic.textContent = f.f;
      var body = document.createElement('span');
      body.className = 'tx-body';
      var ti = document.createElement('span');
      ti.className = 'tx-title';
      ti.textContent = f.f + ' → ' + f.t;
      var su = document.createElement('span');
      su.className = 'tx-sub';
      su.textContent = (f.date || '') + ' · ' + fmtDur(f.min) + ' · ' + (f.cabin || '') + (f.plane ? ' · ' + f.plane : '');
      body.appendChild(ti);
      body.appendChild(su);
      var amt = document.createElement('span');
      amt.className = 'tx-amt income';
      amt.textContent = '+' + fmtNum(f.miles) + ' mi';
      row.appendChild(ic);
      row.appendChild(body);
      row.appendChild(amt);
      box.appendChild(row);
    });
  }

  // ---------- canvas Earth engine (real coastlines, day/night, cameras) ----------

  var flMapDay = null, flMapNight = null;

  function gcPos(a, b, f) {
    function v(ap) {
      var la = ap.lat * Math.PI / 180, lo = ap.lon * Math.PI / 180;
      return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
    }
    var A = v(a), B = v(b);
    var dot = Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
    var th = Math.acos(dot);
    if (th < 1e-6) return { lat: a.lat, lon: a.lon, heading: 0 };
    var s = Math.sin(th);
    var k0 = Math.sin((1 - f) * th) / s, k1 = Math.sin(f * th) / s;
    var x = k0 * A[0] + k1 * B[0], y = k0 * A[1] + k1 * B[1], z = k0 * A[2] + k1 * B[2];
    var lat = Math.asin(Math.max(-1, Math.min(1, z))) * 180 / Math.PI;
    var lon = Math.atan2(y, x) * 180 / Math.PI;
    var e = 0.004;
    var f2 = Math.min(1, f + e);
    var k0b = Math.sin((1 - f2) * th) / s, k1b = Math.sin(f2 * th) / s;
    var xb = k0b * A[0] + k1b * B[0], yb = k0b * A[1] + k1b * B[1], zb = k0b * A[2] + k1b * B[2];
    var lat2 = Math.asin(Math.max(-1, Math.min(1, zb))) * 180 / Math.PI;
    var lon2 = Math.atan2(yb, xb) * 180 / Math.PI;
    var dLon = lon2 - lon;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    var heading = Math.atan2(dLon * Math.cos(lat * Math.PI / 180), lat2 - lat) * 180 / Math.PI;
    return { lat: lat, lon: lon, heading: heading };
  }

  function altProfile(t) {
    t = Math.min(1, Math.max(0, t));
    return Math.pow(Math.sin(Math.PI * t), 0.65);
  }

  function prerenderEarth() {
    if (flMapDay) return;
    var W = 1000, H = 500;
    var day = document.createElement('canvas');
    day.width = W; day.height = H;
    var g = day.getContext('2d');
    var oc = g.createLinearGradient(0, 0, 0, H);
    oc.addColorStop(0, '#0b1a33');
    oc.addColorStop(0.5, '#0a1730');
    oc.addColorStop(1, '#0b1a33');
    g.fillStyle = oc;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(140,170,220,0.10)';
    g.lineWidth = 1;
    for (var gx = 0; gx <= W; gx += 1000 / 12) { g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx, H); g.stroke(); }
    for (var gy = 0; gy <= H; gy += 500 / 6) { g.beginPath(); g.moveTo(0, gy); g.lineTo(W, gy); g.stroke(); }
    var cw = W / LAND_W, ch = H / LAND_H;
    for (var row = 0; row < LAND_H; row++) {
      for (var col = 0; col < LAND_W; col++) {
        if (!landAt(col, row)) continue;
        var shade = 0.75 + 0.25 * ((col * 7 + row * 13) % 5) / 4;
        g.fillStyle = 'rgba(72,138,118,' + shade.toFixed(2) + ')';
        g.beginPath();
        g.arc(col * cw + cw / 2, row * ch + ch / 2, Math.min(cw, ch) * 0.42, 0, Math.PI * 2);
        g.fill();
      }
    }
    flMapDay = day;
    var night = document.createElement('canvas');
    night.width = W; night.height = H;
    var n2 = night.getContext('2d');
    n2.drawImage(day, 0, 0);
    n2.fillStyle = 'rgba(2,6,20,0.78)';
    n2.fillRect(0, 0, W, H);
    flMapNight = night;
  }

  function sunPos(date) {
    var start = Date.UTC(date.getUTCFullYear(), 0, 0);
    var doy = Math.floor((date.getTime() - start) / 86400000);
    var decl = -23.44 * Math.cos(2 * Math.PI * (doy + 10) / 365);
    var utcH = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    var lon = ((12 - utcH) * 15 + 540) % 360 - 180;
    return { lat: decl, lon: lon };
  }

  function terminatorHalf(latDeg, declDeg) {
    var la = latDeg * Math.PI / 180, de = declDeg * Math.PI / 180;
    var c = -Math.tan(la) * Math.tan(de);
    if (c >= 1) return 0;
    if (c <= -1) return 180;
    return Math.acos(c) * 180 / Math.PI;
  }

  function flightCamera(t) {
    if (flightSave.view === 'follow') {
      var info = routeInfo(flightSave.from, flightSave.to, flightSave.plane);
      var pos = info ? gcPos(info.a, info.b, t) : { lat: 20, lon: 0 };
      return { cx: pos.lon, cy: Math.max(-70, Math.min(70, pos.lat)), z: flightSave.zoom, pos: pos };
    }
    return { cx: 0, cy: 12, z: 1, pos: null };
  }

  function camProject(cam, lon, lat, W, H) {
    var dLon = lon - cam.cx;
    while (dLon > 180) dLon -= 360;
    while (dLon < -180) dLon += 360;
    return { x: W / 2 + dLon * (W / 360) * cam.z, y: H / 2 - (lat - cam.cy) * (H / 180) * cam.z };
  }

  function buildFlightMap() {
    prerenderEarth();
    flRefs = {};
    if (leafletActive() && flight.state === 'idle') { flLeafUserHold = false; flLeafFit(); }
    paintFlight(flight.state === 'landed' ? 1 : flightProgress());
  }

  function drawEarthFrame(ctx, W, H, cam, t, routePts, planePos, planeHeading, planeScale, livery) {
    prerenderEarth();
    var span = 360 / cam.z;
    var lon0 = cam.cx - span / 2;
    var lat1 = Math.min(90, cam.cy + 90 / cam.z), lat0 = Math.max(-90, cam.cy - 90 / cam.z);
    // day base, split at antimeridian
    var a = lon0, parts = [];
    function norm(l) { var r = l; while (r < -180) r += 360; while (r > 180) r -= 360; return r; }
    var cur = a;
    for (var k = 0; k < 4 && cur < lon0 + span - 1e-6; k++) {
      var chunkEnd = Math.min(lon0 + span, (Math.floor((cur + 180) / 360) + 1) * 360 - 180 + 360);
      // simpler: cut at next multiple of 360 offset
      var cut = Math.ceil((cur + 180) / 360) * 360 - 180;
      if (cut <= cur + 1e-6) cut = cur + (lon0 + span - cur);
      chunkEnd = Math.min(lon0 + span, cut);
      parts.push([cur, chunkEnd]);
      cur = chunkEnd;
    }
    parts.forEach(function (pr) {
      var p0 = norm(pr[0]), p1 = norm(pr[1]);
      var sx = (p0 + 180) / 360 * 1000, sw = (p1 - p0) / 360 * 1000;
      var dx = (pr[0] - lon0) / span * W, dw = (pr[1] - pr[0]) / span * W;
      var sy = (90 - lat1) / 180 * 500, sh = (lat1 - lat0) / 180 * 500;
      try { ctx.drawImage(flMapDay, sx, sy, sw, sh, dx, 0, dw, H); } catch (e) {}
    });
    // night overlay (per-row terminator spans)
    var sun = sunPos(new Date());
    var nightFull = flightSave.day === 'night';
    var nightSkip = flightSave.day === 'day';
    if (nightFull) {
      ctx.fillStyle = 'rgba(2,6,20,0.62)';
      ctx.fillRect(0, 0, W, H);
    } else if (!nightSkip) {
      ctx.fillStyle = 'rgba(2,6,20,0.62)';
      for (var y = 0; y < H; y += 3) {
        var lat = cam.cy + (H / 2 - y) * 180 / (H * cam.z);
        if (lat > 90 || lat < -90) { ctx.fillRect(0, y, W, 3); continue; }
        var hw = terminatorHalf(lat, sun.lat);
        if (hw >= 180) continue;
        if (hw <= 0) { ctx.fillRect(0, y, W, 3); continue; }
        var n0 = sun.lon + hw, n1 = sun.lon + 360 - hw;
        // intersect [n0,n1] with visible [lon0, lon0+span] in unwrapped frame near lon0
        while (n0 < lon0) { n0 += 360; n1 += 360; }
        while (n0 > lon0 + 360) { n0 -= 360; n1 -= 360; }
        var s0 = Math.max(n0, lon0), s1 = Math.min(n1, lon0 + span);
        if (s1 > s0) ctx.fillRect((s0 - lon0) / span * W, y, (s1 - s0) / span * W + 1, 3);
        // wrapped remainder
        var r0 = Math.max(n0 - 360, lon0), r1 = Math.min(n1 - 360, lon0 + span);
        if (r1 > r0 && r0 < lon0 + span && r1 > lon0) ctx.fillRect((r0 - lon0) / span * W, y, (r1 - r0) / span * W + 1, 3);
      }
    }
    function toScreen(lon, lat) { return camProject(cam, lon, lat, W, H); }
    // airports in view
    AIRPORTS.forEach(function (ap) {
      var unlocked = isApUnlocked(ap);
      var p = toScreen(ap.lon, ap.lat);
      if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) return;
      var isSel = ap.id === flightSave.from || ap.id === flightSave.to;
      ctx.beginPath();
      ctx.arc(p.x, p.y, isSel ? 5 : 3, 0, Math.PI * 2);
      if (unlocked) {
        ctx.fillStyle = isSel ? '#ffffff' : 'rgba(120,190,255,0.85)';
        ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(140,150,170,0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      if (isSel) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '700 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ap.id, p.x, p.y - 12);
        var pr = 8 + ((performance.now() / 900) % 1) * 14;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(120,190,255,' + (0.7 * (1 - pr / 24)).toFixed(2) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    // route polyline with antimeridian splits
    function strokeRoute(upto, style, width, glow) {
      if (!routePts.length) return;
      var n = Math.max(2, Math.floor(routePts.length * upto));
      ctx.strokeStyle = style;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (glow) { ctx.shadowBlur = 0; }
      ctx.beginPath();
      var started = false, prevX = 0;
      for (var i = 0; i < n; i++) {
        var p = toScreen(routePts[i].lon, routePts[i].lat);
        if (!started || Math.abs(p.x - prevX) > W / 2) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
        prevX = p.x;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    strokeRoute(1, 'rgba(140,160,200,0.35)', 2, false);
    if (t > 0.005) strokeRoute(t, '#5eb2ff', 3, true);
    // plane (Google-maps style marker, livery colored)
    if (planePos) {
      var pp = toScreen(planePos.lon, planePos.lat);
      var sc = planeScale * (0.8 + cam.z * 0.22);
      ctx.save();
      ctx.translate(pp.x, pp.y);
      ctx.rotate(planeHeading * Math.PI / 180);
      ctx.scale(sc, sc);
      ctx.shadowBlur = 0;
      ctx.fillStyle = livery;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(-9, 8);
      ctx.lineTo(-4.5, 0);
      ctx.lineTo(-9, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  function flightProgress() {
    if (!flight.totalSec) return 0;
    var el = flight.elapsed;
    if (flight.state === 'flying') el += (performance.now() - flight.runStart) / 1000;
    return Math.min(1, Math.max(0, el / flight.totalSec));
  }

  function sampleRoute(a, b, n) {
    var pts = [];
    for (var i = 0; i <= n; i++) pts.push(gcPos(a, b, i / n));
    return pts;
  }

  // ---------- Leaflet street map (Google-Maps style) + plane ----------

  var flLeaf = null, flLeafTiles = null, flLeafRef = null, flLeafBase = null, flLeafTrail = null, flLeafPlane = null;
  var flLeafTried = false, flLeafShown = false, flLeafUserHold = false;
  var flBaseStyle = '';

  function flIsDarkMap() {
    try {
      var t = document.documentElement.getAttribute('data-theme') || 'dark';
      return ['dark', 'ghost', 'ember', 'colorblind', 'tritan'].indexOf(t) >= 0;
    } catch (e) { return true; }
  }

  function flEsriUrl(style) {
    if (style === 'dark') return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
  }

  function flEsriRefUrl() {
    return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';
  }

  function flAttribution() {
    return 'Tiles &copy; Esri - Source: Esri, Maxar, Earthstar Geographics';
  }

  function flApplyBase() {
    if (!flLeaf) return;
    var style = flightSave.day === 'day' ? 'light' : flightSave.day === 'night' ? 'dark' : (flIsDarkMap() ? 'dark' : 'light');
    if (flLeafTiles && flBaseStyle === style) return;
    var L = window.L;
    try {
      if (flLeafTiles) flLeaf.removeLayer(flLeafTiles);
      if (flLeafRef) { flLeaf.removeLayer(flLeafRef); flLeafRef = null; }
    } catch (e) {}
    flBaseStyle = style;
    flLeafTiles = L.tileLayer(flEsriUrl(style), { maxZoom: 12, attribution: flAttribution() }).addTo(flLeaf);
    if (style === 'dark') {
      try { flLeafRef = L.tileLayer(flEsriRefUrl(), { maxZoom: 12 }).addTo(flLeaf); } catch (e2) {}
    }
    try { flLeafTrail.bringToFront(); flLeafPlane.setZIndexOffset(1000); } catch (e3) {}
  }

  function leafletActive() {
    if (flLeaf) return true;
    if (flLeafTried || typeof window.L === 'undefined') return false;
    flLeafTried = true;
    try {
      var box = document.getElementById('flLeaflet');
      if (!box) return false;
      flLeaf = window.L.map('flLeaflet', { zoomControl: false, worldCopyJump: true, minZoom: 2, maxBounds: [[-90, -540], [90, 540]], maxBoundsViscosity: 1.0 });
      window.L.control.zoom({ position: 'topleft' }).addTo(flLeaf);
      flApplyBase();
      flLeafBase = window.L.polyline([], { color: '#8a93a8', weight: 3, dashArray: '2 7', opacity: 0.85 }).addTo(flLeaf);
      flLeafTrail = window.L.polyline([], { color: '#0071e3', weight: 4, opacity: 0.95 }).addTo(flLeaf);
      var icon = window.L.divIcon({
        className: 'fl-leaf-wrap',
        html: '<div class="fl-leaf-plane" id="flLeafPlaneGlyph"><svg viewBox="0 0 48 28"><path d="M46 14 C34 16.5 20 17 8 17 L8 11 C20 11 34 11.5 46 14 Z M31 13.6 L17 26.5 L12 26.5 L24 13.6 Z M31 14.4 L17 1.5 L12 1.5 L24 14.4 Z M12 13.6 L5 20 L2 20 L8 13.6 Z M12 14.4 L5 8 L2 8 L8 14.4 Z" fill="#1b2f4b" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round" style="paint-order:stroke"/></svg></div>',
        iconSize: [46, 28],
        iconAnchor: [23, 14]
      });
      flLeafPlane = window.L.marker([0, 0], { icon: icon, interactive: false, keyboard: false }).addTo(flLeaf);
      try { flLeafPlane.setZIndexOffset(1000); } catch (e5) {}
      flLeaf.on('dragstart', function () { flLeafUserHold = true; });
      flLeafFit();
      setTimeout(function () { try { flLeaf.invalidateSize(); } catch (e) {} }, 400);
      return true;
    } catch (e) { flLeaf = null; return false; }
  }

  function flLeafFit() {
    if (!flLeaf) return;
    var info = routeInfo(flightSave.from, flightSave.to, flightSave.plane);
    if (!info) return;
    try {
      flLeaf.fitBounds([[info.a.lat, info.a.lon], [info.b.lat, info.b.lon]], { padding: [42, 42], animate: false });
      if (flLeaf.getZoom() < 2) flLeaf.setZoom(2);
    } catch (e) {}
  }

  function paintLeaflet(t, info) {
    if (!info || !flLeaf) return;
    try {
      var pts = sampleRoute(info.a, info.b, 120).map(function (p) { return [p.lat, p.lon]; });
      flLeafBase.setLatLngs(pts);
      var n = Math.max(0, Math.floor(pts.length * t));
      flLeafTrail.setLatLngs(n < 2 ? [] : pts.slice(0, n));
      var pos = gcPos(info.a, info.b, t);
      flLeafPlane.setLatLng([pos.lat, pos.lon]);
      var glyph = document.getElementById('flLeafPlaneGlyph');
      if (glyph) glyph.style.transform = 'rotate(' + (pos.heading - 90) + 'deg)';
      if (flightSave.view === 'follow' && (flight.state === 'flying' || flight.state === 'paused')) {
        try { if (flLeaf.getZoom() < 5) flLeaf.setZoom(5); } catch (e) {}
        flLeaf.panTo([pos.lat, pos.lon], { animate: false });
      }
    } catch (e) {}
  }

  function syncFlightViewBtns() {
    if (flightSave.view === 'cockpit') { flightSave.view = 'map'; persistFlight(); }
    flApplyBase();
    var views = [['flViewMap', 'map'], ['flViewFollow', 'follow']];
    views.forEach(function (p) { var el = document.getElementById(p[0]); if (el) el.classList.toggle('active', flightSave.view === p[1]); });
    var days = [['flDayDay', 'day'], ['flDayAuto', 'auto'], ['flDayNight', 'night']];
    days.forEach(function (p) { var el = document.getElementById(p[0]); if (el) el.classList.toggle('active', flightSave.day === p[1]); });
    var hideMap = false;
    try { hideMap = document.getElementById('flightSim').classList.contains('nomap'); } catch (e) {}
    var useLeaf = !hideMap && leafletActive();
    var lf = document.getElementById('flLeaflet');
    if (lf) {
      var show = !!useLeaf;
      if (show !== flLeafShown) {
        flLeafShown = show;
        lf.style.display = show ? '' : 'none';
        if (show && flLeaf) setTimeout(function () { try { flLeaf.invalidateSize(); } catch (e) {} }, 60);
      } else if (!show) {
        lf.style.display = 'none';
      }
    }
    var mc = document.getElementById('flCanvas');
    if (mc) mc.style.display = (!useLeaf && !hideMap) ? '' : 'none';
    var db = document.getElementById('btnFlDay');
    if (db) db.textContent = flightSave.day.charAt(0).toUpperCase() + flightSave.day.slice(1);
  }

  function flLeafRefresh() {
    if (!flLeaf) return;
    try { flLeaf.invalidateSize(); } catch (e) {}
    flApplyBase();
    if (flight.state === 'idle') flLeafFit();
    else paintFlight(flightProgress());
  }

  // ---------- engine hum (ambient audio while airborne) ----------

  var flHum = { on: true, src: null, drone: null };
  function flHumStart() {
    if (!flHum.on) return;
    try {
      if (flHum.src) return;
      var ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      var len = ctx.sampleRate * 2;
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = buf.getChannelData(0);
      var last = 0;
      for (var i = 0; i < len; i++) {
        var w = Math.random() * 2 - 1;
        last = (last + 0.03 * w) / 1.03;
        d[i] = last * 3.2;
      }
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      var f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 320;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.085, ctx.currentTime + 2.5);
      src.connect(f);
      f.connect(g);
      g.connect(ctx.destination);
      src.start();
      var drone = ctx.createOscillator();
      var dg = ctx.createGain();
      drone.type = 'sine';
      drone.frequency.value = 54;
      dg.gain.setValueAtTime(0.0001, ctx.currentTime);
      dg.gain.exponentialRampToValueAtTime(0.022, ctx.currentTime + 2.5);
      drone.connect(dg);
      dg.connect(ctx.destination);
      drone.start();
      flHum.src = src;
      flHum.drone = drone;
    } catch (e) {}
  }
  function flHumStop() {
    try {
      if (flHum.src) { flHum.src.stop(); flHum.src.disconnect(); }
      if (flHum.drone) { flHum.drone.stop(); flHum.drone.disconnect(); }
    } catch (e) {}
    flHum.src = null;
    flHum.drone = null;
  }

  function flZoom(d) {
    if (leafletActive() && flLeaf) {
      try { if (d > 0) flLeaf.zoomIn(); else flLeaf.zoomOut(); } catch (e) {}
      if (d > 0 && flightSave.view === 'map') { flightSave.view = 'follow'; persistFlight(); renderFlightAll(); }
      return;
    }
    flightSave.zoom = Math.min(8, Math.max(1, flightSave.zoom + d));
    persistFlight();
    if (d > 0 && flightSave.view === 'map') flightSave.view = 'follow';
    renderFlightAll();
  }

  function flightAltFt(t) {
    if (flight.state !== 'flying' && flight.state !== 'paused') return 0;
    return Math.round(38000 * altProfile(t));
  }

  function flightSpdKmh(t) {
    var info = routeInfo(flightSave.from, flightSave.to, flightSave.plane);
    if (!info || !flight.totalSec) return 0;
    return Math.round(info.km / (flight.totalSec / 3600));
  }

  function paintFlight(t) {
    syncFlightViewBtns();
    var info = routeInfo(flightSave.from, flightSave.to, flightSave.plane);
    var W = 1000, H = 500;
    if (leafletActive()) {
      paintLeaflet(t, info);
    } else {
      var cv = document.getElementById('flCanvas');
      if (cv && info) {
        var ctx = cv.getContext('2d');
        var cam = flightCamera(t);
        var pts = sampleRoute(info.a, info.b, 160);
        var pos = gcPos(info.a, info.b, t);
        var pos2 = gcPos(info.a, info.b, Math.min(1, t + 0.004));
        var s0 = camProject(cam, pos.lon, pos.lat, W, H);
        var s1 = camProject(cam, pos2.lon, pos2.lat, W, H);
        var heading = Math.atan2(s1.y - s0.y, s1.x - s0.x) * 180 / Math.PI;
        var plane = planeById(flightSave.plane);
        drawEarthFrame(ctx, W, H, cam, t, pts, pos, heading, plane.size * 1.6, '#5eb2ff');
      }
    }
    var fill = document.getElementById('flProgressFill');
    if (fill) fill.style.width = (t * 100) + '%';
    var remain = flight.totalSec ? flight.totalSec * (1 - t) : 0;
    var rl = document.getElementById('flRemain');
    if (rl) rl.textContent = flight.totalSec ? fmtClock(remain) : '-';
    var dl = document.getElementById('flDistLeft');
    if (dl) dl.textContent = flight.distMi ? fmtNum(Math.round(flight.distMi * (1 - t))) + ' mi' : '-';
    var er = document.getElementById('flEarn');
    if (er) er.textContent = flight.miles ? '+' + fmtNum(flight.miles) + ' mi' : '-';
    var phase = document.getElementById('flPhase');
    var title = document.getElementById('flStatusTitle');
    var label = 'IDLE', sub = 'Ready to board';
    if (flight.state === 'flying') {
      label = t < 0.04 ? 'TAKEOFF' : t < 0.9 ? 'CRUISING' : 'DESCENT';
      sub = flightSave.from + ' → ' + flightSave.to + ' · ' + label.charAt(0) + label.slice(1).toLowerCase() +
        ' · ' + fmtNum(flightAltFt(t)) + ' ft · ' + fmtNum(flightSpdKmh(t)) + ' km/h';
    } else if (flight.state === 'paused') {
      label = 'HELD'; sub = 'Holding pattern - resume to continue';
    } else if (flight.state === 'landed') {
      label = 'LANDED'; sub = 'Welcome to ' + (apById(flightSave.to) || {}).city;
    }
    if (phase) phase.textContent = label;
    if (title) title.textContent = sub;
    // console readout (big timer, plane progress, phase, ETA)
    var big = document.getElementById('flBigTime');
    var pct = Math.round(t * 100);
    var bf = document.getElementById('flBigFill');
    if (bf) bf.style.width = (t * 100) + '%';
    var bp = document.getElementById('flBigPlane');
    if (bp) bp.style.left = (t * 100) + '%';
    var bpct = document.getElementById('flBigPct');
    if (bpct) bpct.textContent = pct + '%';
    var phaseName = 'Pre-takeoff';
    if (flight.state === 'flying') phaseName = t < 0.04 ? 'Takeoff' : t < 0.9 ? 'Cruising' : 'Descent';
    else if (flight.state === 'paused') phaseName = 'Holding';
    else if (flight.state === 'landed') phaseName = 'Landed';
    var ph = document.getElementById('flPhaseName');
    if (ph) ph.textContent = 'Phase: ' + phaseName;
    var etaEl = document.getElementById('flEta');
    if (etaEl) {
      if (flight.state === 'flying' || flight.state === 'paused') {
        var eta = new Date(Date.now() + remain * 1000);
        etaEl.textContent = 'ETA: ' + String(eta.getHours()).padStart(2, '0') + ':' + String(eta.getMinutes()).padStart(2, '0');
      } else if (flight.state === 'landed' && flight.landedAt) {
        var la = new Date(flight.landedAt);
        etaEl.textContent = 'Arrived ' + String(la.getHours()).padStart(2, '0') + ':' + String(la.getMinutes()).padStart(2, '0');
      } else etaEl.textContent = 'ETA: -';
    }
    if (big) {
      if (flight.state === 'flying' || flight.state === 'paused') big.textContent = fmtClock(remain);
      else if (flight.state === 'landed') big.textContent = '00:00';
      else {
        var pInfo = routeInfo(flightSave.from, flightSave.to, flightSave.plane);
        var pm = flightSave.mode === 'custom' ? clampFlightMin(flightSave.customMin, 50) : (pInfo ? pInfo.realMin : 50);
        big.textContent = fmtDur(pm).replace(' ', '');
      }
    }
    var ct = document.getElementById('flConsoleTitle');
    if (ct) {
      ct.textContent = flight.state === 'idle' ? 'Airplane mode' : flightSave.from + ' → ' + flightSave.to;
    }
    syncFlightButtons();
  }

  var flBtnState = '';
  function syncFlightButtons() {
    if (flBtnState === flight.state) return;
    flBtnState = flight.state;
    var main = flight.state === 'flying' ? 'Hold' : flight.state === 'paused' ? 'Resume' : flight.state === 'landed' ? 'Fly again' : 'Take off';
    var con = flight.state === 'flying' ? 'Pause' : flight.state === 'paused' ? 'Resume' : 'Pause';
    var a = document.getElementById('flightPlayText');
    if (a) a.textContent = main;
    var b = document.getElementById('btnFlPause');
    if (b) b.textContent = con;
  }

  function flightLoop() {
    if (flight.state !== 'flying') return;
    var t = flightProgress();
    paintFlight(t);
    if (t >= 1) { landFlight(); return; }
    flight.raf = requestAnimationFrame(flightLoop);
  }

  function resetFlight(silent) {
    if (flight.raf) cancelAnimationFrame(flight.raf);
    flHumStop();
    flLeafUserHold = false;
    flight.state = 'idle';
    flight.elapsed = 0;
    flight.totalSec = 0;
    flight.distMi = 0;
    flight.miles = 0;
    flight.landedAt = 0;
    flight.bonus = false;
    var btn = document.getElementById('flightPlayText');
    if (btn) btn.textContent = 'Take off';
    buildFlightMap();
    paintFlight(0);
    if (!silent) {
      var title = document.getElementById('flStatusTitle');
      if (title) title.textContent = 'Ready to board';
    }
  }

  function startFlight(bonus) {
    var plane = planeById(flightSave.plane);
    var info = routeInfo(flightSave.from, flightSave.to, flightSave.plane);
    if (!info) { showToast('Pick two different airports first', 'warn'); return; }
    if (!isApUnlocked(info.a) || !isApUnlocked(info.b)) { showToast('That airport is still locked - earn more miles', 'warn'); return; }
    if (!info.inRange) { showToast(plane.name + ' cannot fly ' + fmtNum(info.km) + ' km nonstop (range ' + fmtNum(plane.range) + ' km) - pick a bigger jet', 'warn'); return; }
    var cab = cabinById(flightSave.cabin);
    var mins = flightSave.mode === 'custom' ? flCustomTotalMin() : info.realMin;
    if (flightSave.mode === 'custom' && mins < 1) { showToast('Pick at least 1 minute', 'warn'); return; }
    if (flightSave.mode === 'custom') { flightSave.customMin = mins; persistFlight(); }
    if (flight.state === 'landed' || flight.state === 'idle') flight.elapsed = 0;
    flight.totalSec = mins * 60;
    flight.distMi = info.mi;
    flight.bonus = !!bonus;
    flight.miles = Math.round(info.mi * cab.mult * (flight.bonus ? 2 : 1));
    flight.state = 'flying';
    flight.runStart = performance.now();
    flight.landedAt = 0;
    flLeafUserHold = false;
    flHumStart();
    flTakeoffChime();
    var btn = document.getElementById('flightPlayText');
    if (btn) btn.textContent = 'Hold';
    var spd = Math.round(info.km / (mins / 60));
    showToast(info.a.id + ' → ' + info.b.id + ' · wheels up for ' + fmtDur(mins) + ' at ' + fmtNum(spd) + ' km/h', 'success');
    flightLoop();
  }

  function toggleFlight() {
    if (flight.state === 'flying') {
      flight.elapsed += (performance.now() - flight.runStart) / 1000;
      flight.state = 'paused';
      if (flight.raf) cancelAnimationFrame(flight.raf);
      var btn = document.getElementById('flightPlayText');
      if (btn) btn.textContent = 'Resume';
      paintFlight(flightProgress());
    } else if (flight.state === 'paused') {
      flight.state = 'flying';
      flight.runStart = performance.now();
      var btn2 = document.getElementById('flightPlayText');
      if (btn2) btn2.textContent = 'Hold';
      flightLoop();
    } else {
      startFlight();
    }
  }

  function landFlight() {
    if (flight.raf) cancelAnimationFrame(flight.raf);
    flHumStop();
    flight.state = 'landed';
    flight.elapsed = flight.totalSec;
    flight.landedAt = Date.now();
    paintFlight(1);
    var btn = document.getElementById('flightPlayText');
    if (btn) btn.textContent = 'Fly again';
    var beforeIds = {};
    AIRPORTS.forEach(function (a) { if (isApUnlocked(a)) beforeIds[a.id] = true; });
    flightSave.miles += flight.miles;
    flightSave.flights += 1;
    var cab = cabinById(flightSave.cabin);
    var mins = Math.round(flight.totalSec / 60);
    flightSave.log.unshift({ f: flightSave.from, t: flightSave.to, miles: flight.miles, min: mins, cabin: cab.name, date: todayKey(new Date()), plane: planeById(flightSave.plane).name });
    flightSave.log = flightSave.log.slice(0, 20);
    persistFlight();
    try { recordSprint(); } catch (e) {}
    try { renderSprintCount(); } catch (e) {}
    confetti.fire(0.5, 0.4);
    try { playSprintCompletionChime(); } catch (e) {}
    var fresh = AIRPORTS.filter(function (a) { return isApUnlocked(a) && !beforeIds[a.id]; }).map(function (a) { return a.id; });
    var dest = apById(flightSave.to) || { city: flightSave.to, id: flightSave.to, name: '' };
    var msg = 'Landed in ' + dest.city + ' · +' + fmtNum(flight.miles) + ' mi' + (flight.bonus ? ' (double miles!)' : '') + ' · focus session complete';
    if (fresh.length) msg += ' · new airports: ' + fresh.join(', ');
    showToast(msg, 'success');
    flBell();
    openArrival(dest,
      '<div class="arrival-stat"><span>Flight time</span><b>' + escapeHtml(fmtDur(mins)) + '</b></div>' +
      '<div class="arrival-stat"><span>Miles earned</span><b>+' + escapeHtml(fmtNum(flight.miles)) + ' mi' + (flight.bonus ? ' · 2×' : '') + '</b></div>' +
      '<div class="arrival-stat"><span>Cabin</span><b>' + escapeHtml(cab.name) + '</b></div>' +
      '<div class="arrival-stat"><span>Aircraft</span><b>' + escapeHtml(planeById(flightSave.plane).name) + '</b></div>');
    populateFlightSelects();
    renderFlightAll();
  }

  // ---------- airplane sounds: chimes, bells, crew call ----------

  function flTone(freq, at, dur, vol) {
    try {
      var ctx = getAudioContext();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, ctx.currentTime + at);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(vol || 0.12, ctx.currentTime + at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + dur + 0.05);
    } catch (e) {}
  }

  function flBell() {
    flTone(880, 0, 0.7, 0.12);
    flTone(659.25, 0.3, 1.0, 0.12);
  }

  function flTakeoffChime() {
    flTone(523.25, 0, 0.5, 0.1);
    flTone(659.25, 0.14, 0.5, 0.1);
    flTone(783.99, 0.28, 0.8, 0.1);
  }

  function onFlightPlanChange() {
    var next = {
      from: document.getElementById('flFrom').value,
      to: document.getElementById('flTo').value,
      cabin: document.getElementById('flCabin').value,
      mode: document.getElementById('flMode').value,
      plane: document.getElementById('flPlane') ? document.getElementById('flPlane').value : flightSave.plane,
      customMin: flCustomTotalMin()
    };
    if (flight.state === 'flying' || flight.state === 'paused') {
      askConfirm('Discard this flight?', 'Changing the plan ends the current flight with no miles. Continue?').then(function (ok) {
        if (!ok) {
          populateFlightSelects();
          renderFlightAll();
          return;
        }
        flightSave.from = next.from; flightSave.to = next.to; flightSave.cabin = next.cabin;
        flightSave.mode = next.mode; flightSave.plane = next.plane; flightSave.customMin = next.customMin;
        persistFlight();
        resetFlight(true);
        showToast('Flight plan changed - back to the gate', 'info');
        renderFlightAll();
      });
      return;
    }
    flightSave.from = next.from; flightSave.to = next.to; flightSave.cabin = next.cabin;
    flightSave.mode = next.mode; flightSave.plane = next.plane; flightSave.customMin = next.customMin;
    persistFlight();
    renderFlightAll();
  }

  // ---------- departures board (one-tap boarding, 2x on next flight) ----------

  // Real IRL photos - every URL below verified live on Wikimedia Commons
  var CITY_PHOTOS = {
    'New York': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/One_World_Trade_Center_at_Night.jpg/1280px-One_World_Trade_Center_at_Night.jpg',
    'San Diego': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/San_Diego_skyline_at_night_from_Point_Loma_2014.jpg/1280px-San_Diego_skyline_at_night_from_Point_Loma_2014.jpg',
    'Madrid': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Gran_Via%2C_Madrid%2C_at_night.jpg/1280px-Gran_Via%2C_Madrid%2C_at_night.jpg',
    'Toronto': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Toronto_-_ON_-_Skyline_bei_Nacht.jpg/1280px-Toronto_-_ON_-_Skyline_bei_Nacht.jpg',
    'Delhi': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/PXL_20231127_142319433_India_Gate_at_Night_Kartavya_Path%2C_New_Delhi%2C_Delhi_110001_05.jpg/1280px-PXL_20231127_142319433_India_Gate_at_Night_Kartavya_Path%2C_New_Delhi%2C_Delhi_110001_05.jpg',
    'Barcelona': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Barcelona%2C_Sagrada_Familia_by_night%2C_2015.jpg/1280px-Barcelona%2C_Sagrada_Familia_by_night%2C_2015.jpg',
    'Amsterdam': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Amsterdam_Canal_at_Night.JPG/1280px-Amsterdam_Canal_at_Night.JPG',
    'Miami': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/The_Villa_Casa_Casuarina_%281930_%29_in_Miami_Beach%2C_Night_view.jpg/1280px-The_Villa_Casa_Casuarina_%281930_%29_in_Miami_Beach%2C_Night_view.jpg',
    'London': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/London_Eye_Twilight_April_2006.jpg/1280px-London_Eye_Twilight_April_2006.jpg',
    'Paris': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/1280px-Tour_Eiffel_Wikimedia_Commons.jpg',
    'Dubai': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Dubai_Marina_Skyline.jpg/1280px-Dubai_Marina_Skyline.jpg',
    'Singapore': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Marina_Bay_Sands_in_the_evening_-_20101120.jpg/1280px-Marina_Bay_Sands_in_the_evening_-_20101120.jpg',
    'Las Vegas': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Las_Vegas_Strip_at_night.jpg',
    'Tokyo': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Tokyo_Tower_at_night.jpg/1280px-Tokyo_Tower_at_night.jpg',
    'Sydney': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Sydney_Opera_House_-_Dec_2008.jpg/1280px-Sydney_Opera_House_-_Dec_2008.jpg',
    'Rome': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Colosseum_in_Rome%2C_Italy_-_April_2007.jpg/1280px-Colosseum_in_Rome%2C_Italy_-_April_2007.jpg',
    'Mumbai': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Gateway_of_India.jpg/1280px-Gateway_of_India.jpg',
    'Hong Kong': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Hong_Kong_Night_Skyline.jpg/1280px-Hong_Kong_Night_Skyline.jpg',
    'Chicago': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Chicago_Lakefront_Night_Skyline.jpg/1280px-Chicago_Lakefront_Night_Skyline.jpg',
    'San Francisco': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/Golden_Gate_Bridge_as_seen_from_Battery_East.jpg/1280px-Golden_Gate_Bridge_as_seen_from_Battery_East.jpg',
    'Los Angeles': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Downtown_Los_Angeles_at_night.jpg/1280px-Downtown_Los_Angeles_at_night.jpg'
  };

  var depCache = { key: '', list: [] };
  var depExpanded = false;

  function unlockedDests(fromId) {
    return AIRPORTS.filter(function (a) { return a.id !== fromId && isApUnlocked(a); });
  }

  function renderDepartures() {
    var box = document.getElementById('depList');
    var badge = document.getElementById('depFromBadge');
    if (!box) return;
    if (badge) badge.textContent = flightSave.from + ' departures';
    var now = new Date();
    var key = flightSave.from + '|' + todayKey(now) + '-' + now.getHours();
    if (depCache.key !== key) {
      depCache.key = key;
      depCache.list = [];
      var dests = unlockedDests(flightSave.from);
      if (dests.length) {
        var h = 0, i;
        for (i = 0; i < flightSave.from.length; i++) h = (h * 31 + flightSave.from.charCodeAt(i)) >>> 0;
        h = (h + now.getHours() * 97) >>> 0;
        var t = Date.now() + (10 + (h % 25)) * 60000;
        for (var k = 0; k < 6; k++) {
          var d = dests[(h + k * 3) % dests.length];
          var info = routeInfo(flightSave.from, d.id, flightSave.plane);
          depCache.list.push({ to: d.id, time: t, min: info ? info.realMin : 60, no: 100 + (((h >> (k * 2)) % 800) + 800) % 800 });
          t += (38 + ((h >> (k * 3)) % 30 + 30) % 30) * 60000;
        }
      }
    }
    box.innerHTML = '';
    if (!depCache.list.length) {
      box.innerHTML = '<div class="money-empty">Unlock more airports to fill this board.</div>';
      var more0 = document.getElementById('btnDepMore');
      if (more0) more0.style.display = 'none';
      return;
    }
    var rows = depExpanded ? depCache.list : depCache.list.slice(0, 2);
    var more = document.getElementById('btnDepMore');
    if (more) {
      more.style.display = depCache.list.length > 2 ? '' : 'none';
      more.textContent = depExpanded ? 'Show less' : 'Show all ' + depCache.list.length + ' departures';
    }
    rows.forEach(function (dep, i) {
      var d = apById(dep.to);
      if (!d) return;
      var row = document.createElement('div');
      row.className = 'dep-row' + (i === 0 ? ' boarding' : '');
      var tm = new Date(dep.time);
      var hh = String(tm.getHours()).padStart(2, '0'), mm = String(tm.getMinutes()).padStart(2, '0');
      var left = document.createElement('div');
      left.className = 'dep-left';
      var time = document.createElement('div');
      time.className = 'dep-time';
      time.textContent = hh + ':' + mm;
      var no = document.createElement('div');
      no.className = 'dep-no';
      no.textContent = 'HX ' + dep.no;
      left.appendChild(time);
      left.appendChild(no);
      var mid = document.createElement('div');
      mid.className = 'dep-mid';
      var city = document.createElement('div');
      city.className = 'dep-city';
      city.textContent = d.city;
      var sub = document.createElement('div');
      sub.className = 'dep-sub';
      sub.textContent = d.id + ' · ' + fmtDur(dep.min) + (i === 0 ? ' · 2× miles' : '');
      mid.appendChild(city);
      mid.appendChild(sub);
      var right = document.createElement('div');
      right.className = 'dep-right';
      var tag = document.createElement('span');
      tag.className = 'phase-badge';
      tag.textContent = i === 0 ? 'BOARDING' : 'SCHEDULED';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pill-btn pill-btn-secondary pill-sm';
      btn.textContent = 'Board';
      (function (idx) { btn.addEventListener('click', function () { boardDeparture(idx); }); })(i);
      right.appendChild(tag);
      right.appendChild(btn);
      row.appendChild(left);
      row.appendChild(mid);
      row.appendChild(right);
      box.appendChild(row);
    });
  }

  function boardDeparture(i) {
    var dep = depCache.list[i];
    if (!dep) return;
    var d = apById(dep.to);
    if (!d || !isApUnlocked(d)) { showToast('That destination is still locked', 'warn'); return; }
    if (flight.state === 'flying' || flight.state === 'paused') resetFlight(true);
    flightSave.to = dep.to;
    flightSave.mode = 'real';
    document.getElementById('flTo').value = dep.to;
    document.getElementById('flMode').value = 'real';
    persistFlight();
    renderFlightAll();
    startFlight(i === 0);
  }

  function openArrival(dest, statsHtml) {
    var modal = document.getElementById('arrivalModal');
    if (!modal) return;
    document.getElementById('arrivalCity').textContent = dest.city || dest.id;
    document.getElementById('arrivalSub').textContent = flightSave.from + ' → ' + dest.id + (dest.name ? ' · ' + dest.name : '');
    var img = document.getElementById('arrivalPhoto');
    var credit = document.getElementById('arrivalCredit');
    img.style.display = 'none';
    img.removeAttribute('src');
    if (credit) credit.style.display = 'none';
    img.onerror = function () { img.style.display = 'none'; if (credit) credit.style.display = 'none'; };
    var url = CITY_PHOTOS[dest.city];
    if (url) {
      img.onload = function () { img.style.display = ''; if (credit) credit.style.display = ''; };
      img.src = url;
    }
    document.getElementById('arrivalStats').innerHTML = statsHtml;
    modal.classList.add('active');
  }

  function closeArrival() {
    var m = document.getElementById('arrivalModal');
    if (m) m.classList.remove('active');
  }

  // =========================================================================
  // 20. Utility
  // =========================================================================

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function shorten(str, n) {
    str = String(str || '');
    n = n || 26;
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
  }

  function setScale(scale) {
    if (scale !== state.scale) {
      var toPct = scale === 'pct';
      state.courses.forEach(function (c) {
        c.components.forEach(function (comp) {
          if (comp.score !== null && comp.score !== '' && !isNaN(comp.score)) {
            var v = parseFloat(comp.score);
            comp.score = Math.round((toPct ? v * 25 : v / 25) * 10) / 10;
          }
        });
        if (c.targetGrade !== null && c.targetGrade !== '' && !isNaN(c.targetGrade)) {
          var t = parseFloat(c.targetGrade);
          c.targetGrade = Math.round((toPct ? t * 25 : t / 25) * 10) / 10;
        }
      });
    }
    state.scale = scale;
    document.getElementById('scaleDutchBtn').classList.toggle('active', scale === 'gpa');
    document.getElementById('scalePctBtn').classList.toggle('active', scale === 'pct');
    saveState();
    renderCourses();
    updateOverallKPIs();
  }

  function openCreditsModal() {
    document.getElementById('creditsModal').classList.add('active');
  }

  function openFeedbackModal() { document.getElementById('feedbackModal').classList.add('active'); }
  function closeFeedbackModal() { document.getElementById('feedbackModal').classList.remove('active'); }

  // =========================================================================
  // 18b. Keep-Style Notes + Todo Lists (modal only - zero page bloat)
  // =========================================================================

  var KEEP_KEY = 'tue_pass_keep_v1';
  var keepNotes = [];
  var keepEditingId = null;
  var keepFreshId = null;
  var keepImgData = null;
  var noteModalId = null;
  var histNoteId = null;
  var TRASH_MS = 7 * 24 * 60 * 60 * 1000;

  function persistKeep() {
    try { localStorage.setItem(KEEP_KEY, JSON.stringify(keepNotes)); } catch (e) {}
  }

  function renderRich(s) {
    var h = escapeHtml(String(s || ''));
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/__([^_]+)__/g, '<u>$1</u>');
    h = h.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    return h;
  }

  function stripHtml(html) {
    var d = document.createElement('div');
    d.innerHTML = String(html || '');
    return d.textContent || '';
  }

  function sanitizeRich(html) {
    var d = document.createElement('div');
    d.innerHTML = String(html || '');
    var allowed = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, BR: 1, DIV: 1, P: 1 };
    var els = d.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') { el.remove(); continue; }
      while (el.attributes.length) el.removeAttribute(el.attributes[0].name);
      if (!allowed[el.tagName]) {
        var parent = el.parentNode;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      }
    }
    return d.innerHTML;
  }

  function linkifyNoteLinks(html) {
    // [[Course code]] or [[Note title]] -> clickable chip. Runs on already-safe HTML.
    return String(html || '').replace(/\[\[([^\[\]]{1,60})\]\]/g, function (m, name) {
      var label = String(name).trim();
      if (!label) return m;
      return '<button type="button" class="note-link" data-note-link="' + escapeHtml(label) + '">[[' + escapeHtml(label) + ']]</button>';
    });
  }

  function noteBodyHtml(n) {
    if (!n || !n.body) return '';
    var html = n.rich ? sanitizeRich(n.body) : renderRich(n.body);
    return linkifyNoteLinks(html);
  }

  function openLinkedNote(name) {
    var q = String(name || '').trim().toLowerCase();
    if (!q) return;
    // 1) course code / subject match -> jump composer scope there
    var course = (state.courses || []).find(function (c) {
      return (c.code && c.code.toLowerCase() === q) ||
        (c.name && c.name.toLowerCase() === q) ||
        ((c.code + ' ' + c.name).toLowerCase().indexOf(q) >= 0);
    });
    // 2) note title / body match
    var hit = keepNotes.find(function (n) {
      if (n.deletedAt || n.type === 'todo') return false;
      return (n.title && n.title.toLowerCase().indexOf(q) >= 0) ||
        (stripHtml(n.body || '').toLowerCase().indexOf(q) >= 0);
    });
    if (hit) { openNoteModal(hit.id); return; }
    if (course) {
      var sel = document.getElementById('keepScope');
      if (sel) sel.value = course.id;
      showToast('Scope: ' + course.code + ' - no linked note yet', 'info');
      if (typeof scrollFlash === 'function') scrollFlash('keepTitle');
      return;
    }
    showToast('No note found for [[' + name + ']]', 'warn');
  }

  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest ? e.target.closest('.note-link') : null;
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    openLinkedNote(link.getAttribute('data-note-link'));
  });

  function purgeTrash() {
    var now = Date.now();
    var before = keepNotes.length;
    keepNotes = keepNotes.filter(function (n) {
      return !n.deletedAt || (now - n.deletedAt) < TRASH_MS;
    });
    if (keepNotes.length !== before) persistKeep();
  }

  function trashDaysLeft(n) {
    var left = Math.ceil((TRASH_MS - (Date.now() - n.deletedAt)) / (24 * 60 * 60 * 1000));
    return Math.max(0, left);
  }

  function loadKeep() {
    try {
      var raw = localStorage.getItem(KEEP_KEY);
      if (raw) { keepNotes = JSON.parse(raw); purgeTrash(); normalizeTodos(); ensureNoteOrder(); return; }
    } catch (e) {}
    keepNotes = [];
    // One-time migration from the old single-note format
    try {
      var old = localStorage.getItem('tue_pass_notes_v1');
      if (old) {
        var m = JSON.parse(old);
        Object.keys(m).forEach(function (k) {
          if (m[k] && String(m[k]).trim()) {
            var c = state.courses.find(function (x) { return x.id === k; });
            keepNotes.push({
              id: 'k' + Date.now() + Math.floor(Math.random() * 100000),
              title: c ? c.code : 'General note',
              body: String(m[k]),
              type: 'note',
              items: [],
              scope: k === 'general' ? 'general' : k,
              updated: Date.now()
            });
          }
        });
        persistKeep();
        localStorage.removeItem('tue_pass_notes_v1');
      }
    } catch (e) {}
  }

  function keepScopeLabel(scope) {
    if (!scope || scope === 'general') return 'General';
    var c = state.courses.find(function (x) { return x.id === scope; });
    return c ? c.code : 'General';
  }

  function syncKeepScopeSelect(keep) {
    var sel = document.getElementById('keepScope');
    if (!sel) return;
    var cur = keep && sel.value ? sel.value : (sel.value || 'general');
    sel.innerHTML = '<option value="general">General</option>' + state.courses.map(function (c) {
      return '<option value="' + escapeHtml(c.id) + '">[' + escapeHtml(c.code) + '] ' + escapeHtml(c.name) + '</option>';
    }).join('');
    if (!state.courses.some(function (c) { return c.id === cur; })) cur = 'general';
    sel.value = cur;
  }

  function resetComposer() {
    keepEditingId = null;
    keepImgData = null;
    document.getElementById('keepTitle').value = '';
    document.getElementById('keepBody').innerHTML = '';
    var sel = document.getElementById('keepScope');
    if (sel) sel.value = 'general';
    var rem = document.getElementById('keepRemind');
    if (rem) rem.value = '';
    syncKeepRemindUI();
    syncKeepImgPrev();
    closeKeepRemindPop();
    document.getElementById('btnKeepSave').textContent = 'Add note';
  }

  function syncKeepImgPrev() {
    var wrap = document.getElementById('keepImgPrevWrap');
    var img = document.getElementById('keepImgPrev');
    if (!wrap || !img) return;
    if (keepImgData) {
      img.src = keepImgData;
      wrap.style.display = '';
    } else {
      img.removeAttribute('src');
      wrap.style.display = 'none';
    }
  }

  function fmtKeepDoc(cmd) {
    var el = document.getElementById('keepBody');
    if (!el) return;
    el.focus();
    try { document.execCommand(cmd, false, null); } catch (e) {}
  }

  function syncKeepRemindUI() {
    var rem = document.getElementById('keepRemind');
    var chip = document.getElementById('keepRemindChip');
    if (!chip) return;
    if (rem && rem.value) {
      chip.textContent = String(rem.value).replace('T', ' ');
      chip.style.display = '';
    } else {
      chip.textContent = '';
      chip.style.display = 'none';
    }
  }

  function closeKeepRemindPop() {
    var pop = document.getElementById('keepRemindPop');
    if (pop) pop.style.display = 'none';
    var btn = document.getElementById('btnKeepRemind');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function attachKeepImage(file) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) { showToast('Pick an image file', 'warn'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        try {
          var max = 640;
          var w = img.width, h = img.height;
          var scale = Math.min(1, max / Math.max(w, h));
          var cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(w * scale));
          cv.height = Math.max(1, Math.round(h * scale));
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          var url = cv.toDataURL('image/jpeg', 0.72);
          if (url.length > 400000) { showToast('Image is too large even compressed', 'warn'); return; }
          keepImgData = url;
          syncKeepImgPrev();
        } catch (err) { showToast('Could not read that image', 'warn'); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function fmtReminderChip(n) {
    if (!n.reminder) return null;
    var chip = document.createElement('span');
    chip.className = 'todo-chip';
    var when = String(n.reminder).replace('T', ' ');
    var overdue = !n.reminded && new Date(n.reminder).getTime() < Date.now();
    if (overdue) chip.classList.add('overdue');
    chip.textContent = (n.reminded ? 'Done: ' : overdue ? 'Due: ' : 'Remind: ') + when;
    chip.title = String(n.reminder);
    return chip;
  }

  function renderKeepList(animate) {
    var list = document.getElementById('keepList');
    if (!list) return;
    list.innerHTML = '';
    var sorted = keepNotes.filter(function (n) { return n.type !== 'todo' && !n.deletedAt; });
    if (!sorted.length) {
      list.innerHTML = '<div class="keep-empty">No notes yet. Jot one above.</div>';
      return;
    }
    sorted.forEach(function (n) {
      var card = document.createElement('div');
      card.className = 'keep-card';
      card.dataset.id = n.id;

      var top = document.createElement('div');
      top.className = 'keep-card-top';
      var chip = document.createElement('span');
      chip.className = 'meta-chip';
      chip.textContent = keepScopeLabel(n.scope);
      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn-remove-row';
      del.textContent = '\u00D7';
      del.setAttribute('aria-label', 'Delete note');
      del.addEventListener('click', function (e) {
        e.stopPropagation();
        card.classList.add('leaving');
        setTimeout(function () {
          var target = keepNotes.find(function (x) { return x.id === n.id; });
          if (target) target.deletedAt = Date.now();
          if (keepEditingId === n.id) resetComposer();
          persistKeep();
          renderKeepList();
        }, 180);
        showToast('Moved to trash - gone in 7 days', 'info');
      });
      top.appendChild(chip);
      var acts = document.createElement('div');
      acts.className = 'keep-card-actions';
      if (n.history && n.history.length) {
        var hist = document.createElement('button');
        hist.type = 'button';
        hist.className = 'btn-card-glyph';
        hist.title = 'Version history';
        hist.setAttribute('aria-label', 'Version history');
        hist.innerHTML = '<svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="8" r="5.5"></circle><path d="M8 5v3l2 1.5"></path></svg>';
        hist.addEventListener('click', function (e) { e.stopPropagation(); openNoteHist(n.id); });
        acts.appendChild(hist);
      }
      var exp = document.createElement('button');
      exp.type = 'button';
      exp.className = 'btn-card-glyph';
      exp.title = 'Open';
      exp.setAttribute('aria-label', 'Open note');
      exp.innerHTML = '<svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7.5 8.5"></path></svg>';
      exp.addEventListener('click', function (e) { e.stopPropagation(); openNoteModal(n.id); });
      acts.appendChild(exp);
      acts.appendChild(del);
      top.appendChild(acts);
      card.appendChild(top);

      if (n.title) {
        var title = document.createElement('div');
        title.className = 'keep-card-title';
        title.textContent = n.title;
        card.appendChild(title);
      }

      if (n.img) {
        var thumb = document.createElement('img');
        thumb.className = 'keep-card-img';
        thumb.src = n.img;
        thumb.alt = '';
        thumb.loading = 'lazy';
        card.appendChild(thumb);
      }

      if (n.body) {
        var body = document.createElement('div');
        body.className = 'keep-card-body';
        body.innerHTML = noteBodyHtml(n);
        card.appendChild(body);
      }

      var rchip = fmtReminderChip(n);
      if (rchip) {
        var meta = document.createElement('div');
        meta.className = 'keep-card-meta';
        meta.appendChild(rchip);
        card.appendChild(meta);
      }

      card.addEventListener('click', function () { openNoteModal(n.id); });
      enableCardDrag(card, n.id);
      if (n.id === keepFreshId) card.classList.add('fresh');
      list.appendChild(card);
    });
    keepFreshId = null;
    if (animate) {
      list.classList.remove('play');
      void list.offsetWidth;
      list.classList.add('play');
    }
  }

  function renderTrash() {
    var list = document.getElementById('trashList');
    if (!list) return;
    purgeTrash();
    list.innerHTML = '';
    var items = keepNotes.filter(function (n) { return n.type !== 'todo' && n.deletedAt; })
      .sort(function (a, b) { return a.deletedAt - b.deletedAt; });
    if (!items.length) {
      list.innerHTML = '<div class="keep-empty">Trash is empty.</div>';
      return;
    }
    items.forEach(function (n) {
      var card = document.createElement('div');
      card.className = 'keep-card';
      card.dataset.id = n.id;
      var top = document.createElement('div');
      top.className = 'keep-card-top';
      var chip = document.createElement('span');
      chip.className = 'meta-chip';
      chip.textContent = keepScopeLabel(n.scope);
      top.appendChild(chip);
      card.appendChild(top);
      if (n.title) {
        var title = document.createElement('div');
        title.className = 'keep-card-title';
        title.textContent = n.title;
        card.appendChild(title);
      }
      if (n.body) {
        var body = document.createElement('div');
        body.className = 'keep-card-body';
        body.innerHTML = noteBodyHtml(n);
        card.appendChild(body);
      }
      var meta = document.createElement('div');
      meta.className = 'trash-meta';
      var left = trashDaysLeft(n);
      meta.textContent = left + (left === 1 ? ' day left' : ' days left');
      card.appendChild(meta);
      var row = document.createElement('div');
      row.className = 'trash-actions';
      var restore = document.createElement('button');
      restore.type = 'button';
      restore.className = 'pill-btn pill-btn-secondary pill-sm';
      restore.textContent = 'Restore';
      restore.addEventListener('click', function () {
        delete n.deletedAt;
        n.updated = Date.now();
        persistKeep();
        renderTrash();
        renderKeepList();
        showToast('Note restored', 'success');
      });
      var wipe = document.createElement('button');
      wipe.type = 'button';
      wipe.className = 'pill-btn pill-btn-secondary pill-sm';
      wipe.textContent = 'Delete forever';
      wipe.addEventListener('click', function () {
        askConfirm('Delete forever?', 'Permanently delete "' + (n.title || 'this note') + '"? This cannot be undone.').then(function (ok) {
          if (!ok) return;
          keepNotes = keepNotes.filter(function (x) { return x.id !== n.id; });
          if (keepEditingId === n.id) resetComposer();
          persistKeep();
          renderTrash();
          showToast('Note deleted forever', 'info');
        });
      });
      row.appendChild(restore);
      row.appendChild(wipe);
      card.appendChild(row);
      list.appendChild(card);
    });
  }

  function enableCardDrag(card, id) {
    card.draggable = true;
    card.addEventListener('dragstart', function (e) {
      card.classList.add('dragging');
      card.classList.remove('fresh');
      var list = document.getElementById('keepList');
      if (list) list.classList.add('is-reordering');
      try {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
      } catch (err) {}
    });
    card.addEventListener('dragend', function () {
      card.classList.remove('dragging');
      var list = document.getElementById('keepList');
      if (list) list.classList.remove('is-reordering');
      persistKeepOrder();
    });
  }

  // Stable insertion-point lookup: first element whose vertical midpoint is
  // below the pointer (or same row, horizontal midpoint to the right).
  // Deterministic - no distance scoring, so it can't oscillate / flicker.
  function gridDragAfter(container, x, y, sel) {
    var els = Array.prototype.slice.call(container.querySelectorAll((sel || '.keep-card') + ':not(.dragging)'));
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) return els[i];
      if (y <= r.bottom && x < r.left + r.width / 2) return els[i];
    }
    return null;
  }

  // Move only when the DOM would actually change - the old code called
  // insertBefore/appendChild on every dragover tick, which thrashed layout
  // and made cards flicker. Also coalesced via rAF in the dragover handlers.
  function moveDraggedTo(container, dragging, after) {
    if (!container || !dragging) return;
    if (after && (after === dragging || after === dragging.nextSibling)) return;
    if (!after && container.lastElementChild === dragging) return;
    if (after) container.insertBefore(dragging, after);
    else container.appendChild(dragging);
  }

  function makeThrottledReorder(container, sel) {
    var queued = null;
    var scheduled = false;
    function flush() {
      scheduled = false;
      if (!queued || !container.isConnected) { queued = null; return; }
      var dragging = container.querySelector('.dragging');
      if (!dragging) { queued = null; return; }
      var after = gridDragAfter(container, queued.x, queued.y, sel);
      moveDraggedTo(container, dragging, after);
      queued = null;
    }
    return function (e) {
      e.preventDefault();
      try { e.dataTransfer.dropEffect = 'move'; } catch (err) {}
      queued = { x: e.clientX, y: e.clientY };
      if (!scheduled) { scheduled = true; requestAnimationFrame(flush); }
    };
  }

  function persistKeepOrder() {
    var list = document.getElementById('keepList');
    if (!list) return;
    var order = [];
    list.querySelectorAll('[data-id]').forEach(function (el) { order.push(el.dataset.id); });
    if (!order.length) return;
    keepNotes.sort(function (a, b) { return order.indexOf(a.id) - order.indexOf(b.id); });
    persistKeep();
  }

  function ensureNoteOrder() {
    try {
      if (localStorage.getItem('tue_pass_order_v1')) return;
      keepNotes.sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
      persistKeep();
      localStorage.setItem('tue_pass_order_v1', '1');
    } catch (e) {}
  }

  function loadKeepIntoComposer(id) {
    var n = keepNotes.find(function (x) { return x.id === id; });
    if (!n || n.deletedAt) return;
    keepEditingId = id;
    keepImgData = n.img || null;
    document.getElementById('keepTitle').value = n.title || '';
    document.getElementById('keepBody').innerHTML = n.rich ? sanitizeRich(n.body) : renderRich(n.body || '');
    syncKeepScopeSelect(true);
    var sel = document.getElementById('keepScope');
    if (sel) sel.value = (n.scope && (n.scope === 'general' || state.courses.some(function (c) { return c.id === n.scope; }))) ? n.scope : 'general';
    var rem = document.getElementById('keepRemind');
    if (rem) rem.value = n.reminder || '';
    syncKeepRemindUI();
    closeKeepRemindPop();
    syncKeepImgPrev();
    document.getElementById('btnKeepSave').textContent = 'Save changes';
  }

  function saveKeepComposer() {
    var title = document.getElementById('keepTitle').value.trim().slice(0, 80);
    var scopeSel = document.getElementById('keepScope');
    var scope = scopeSel ? scopeSel.value : 'general';
    if (scope !== 'general' && !state.courses.some(function (c) { return c.id === scope; })) scope = 'general';
    var bodyHtml = sanitizeRich(document.getElementById('keepBody').innerHTML);
    var bodyText = stripHtml(bodyHtml).replace(/\s+$/, '');
    if (bodyText.length > 2000) { showToast('Note is too long - keep it under 2000 characters', 'warn'); return; }
    var remEl = document.getElementById('keepRemind');
    var reminder = remEl && remEl.value ? remEl.value : '';
    if (!title && !bodyText && !keepImgData) {
      showToast('Write something first', 'warn');
      return;
    }
    if (keepEditingId) {
      keepFreshId = keepEditingId;
      var n = keepNotes.find(function (x) { return x.id === keepEditingId; });
      if (n) {
        if (n.title !== title || noteBodyHtml(n) !== bodyHtml) {
          n.history = n.history || [];
          n.history.unshift({ title: n.title, body: n.body, rich: !!n.rich, at: n.updated || Date.now() });
          n.history = n.history.slice(0, 10);
        }
        n.title = title;
        n.body = bodyHtml;
        n.rich = true;
        n.scope = scope;
        n.img = keepImgData || '';
        if (reminder !== (n.reminder || '')) { n.reminder = reminder; n.reminded = false; }
        n.updated = Date.now();
      }
    } else {
      var nid = 'k' + Date.now();
      keepFreshId = nid;
      keepNotes.unshift({
        id: nid,
        title: title,
        body: bodyHtml,
        rich: true,
        type: 'note',
        items: [],
        scope: scope,
        img: keepImgData || '',
        reminder: reminder,
        reminded: false,
        history: [],
        updated: Date.now()
      });
    }
    persistKeep();
    resetComposer();
    renderKeepList();
    showToast('Note saved', 'success');
  }

  function switchKeepTab(which) {
    if (which !== 'notes' && which !== 'todo' && which !== 'trash') which = 'notes';
    document.getElementById('keepTabNotes').classList.toggle('active', which === 'notes');
    document.getElementById('keepTabTodo').classList.toggle('active', which === 'todo');
    document.getElementById('keepTabTrash').classList.toggle('active', which === 'trash');
    var panes = { notes: 'notesTabPane', todo: 'todoTabPane', trash: 'trashTabPane' };
    Object.keys(panes).forEach(function (k) {
      var pane = document.getElementById(panes[k]);
      if (!pane) return;
      pane.style.display = k === which ? '' : 'none';
      if (k === which) {
        pane.classList.remove('pane-swap');
        void pane.offsetWidth;
        pane.classList.add('pane-swap');
      }
    });
    if (which === 'todo') renderTodoPane();
    if (which === 'trash') renderTrash();
    if (which === 'notes') renderKeepList(true);
  }

  function openNoteModal(id) {
    var n = keepNotes.find(function (x) { return x.id === id; });
    if (!n || n.deletedAt) return;
    noteModalId = id;
    document.getElementById('noteModalTitle').textContent = n.title || 'Untitled';
    var meta = document.getElementById('noteModalMeta');
    meta.innerHTML = '';
    var chip = document.createElement('span');
    chip.className = 'meta-chip';
    chip.textContent = keepScopeLabel(n.scope);
    meta.appendChild(chip);
    var rc = fmtReminderChip(n);
    if (rc) meta.appendChild(rc);
    var img = document.getElementById('noteModalImg');
    if (n.img) { img.src = n.img; img.style.display = ''; }
    else { img.removeAttribute('src'); img.style.display = 'none'; }
    var readerBody = document.getElementById('noteModalBody');
    readerBody.innerHTML = n.body ? noteBodyHtml(n) : '<span class="trash-meta">Empty note</span>';
    // Swoosh the reader every time a note is opened - incl. note-to-note jumps
    readerBody.classList.remove('swoosh-in');
    void readerBody.offsetWidth;
    readerBody.classList.add('swoosh-in');
    var hb = document.getElementById('btnNoteModalHist');
    if (hb) hb.style.display = (n.history && n.history.length) ? '' : 'none';
    document.getElementById('noteModal').classList.add('active');
  }

  function closeNoteModal() {
    var m = document.getElementById('noteModal');
    if (m) m.classList.remove('active');
    var s = document.getElementById('noteModalSurface');
    if (s) s.classList.remove('note-full');
    var b = document.getElementById('btnNoteModalFull');
    if (b) b.textContent = 'Fullscreen';
    noteModalId = null;
  }

  function openNoteHist(id) {
    var n = keepNotes.find(function (x) { return x.id === id; });
    if (!n) return;
    histNoteId = id;
    var list = document.getElementById('noteHistList');
    list.innerHTML = '';
    var hist = n.history || [];
    if (!hist.length) {
      list.innerHTML = '<div class="money-empty">No earlier versions yet. Edit the note to create one.</div>';
    }
    hist.forEach(function (v, idx) {
      var row = document.createElement('div');
      row.className = 'hist-row';
      var when = document.createElement('div');
      when.className = 'hist-when';
      try { when.textContent = new Date(v.at).toLocaleString(); } catch (e) { when.textContent = ''; }
      var snip = document.createElement('div');
      snip.className = 'hist-snippet';
      snip.textContent = (v.title ? v.title + ' - ' : '') + stripHtml(v.rich ? v.body : renderRich(v.body || '')).slice(0, 220);
      var rb = document.createElement('button');
      rb.type = 'button';
      rb.className = 'pill-btn pill-btn-secondary pill-sm';
      rb.textContent = 'Restore this version';
      rb.addEventListener('click', function () {
        var target = keepNotes.find(function (x) { return x.id === histNoteId; });
        if (!target) return;
        target.history = target.history || [];
        target.history.unshift({ title: target.title, body: target.body, rich: !!target.rich, at: target.updated || Date.now() });
        target.history = target.history.slice(0, 10);
        target.title = v.title || '';
        target.body = v.body || '';
        target.rich = !!v.rich;
        target.updated = Date.now();
        if (keepEditingId === target.id) loadKeepIntoComposer(target.id);
        persistKeep();
        renderKeepList();
        closeNoteHist();
        if (noteModalId === target.id) openNoteModal(target.id);
        showToast('Version restored', 'success');
      });
      row.appendChild(when);
      row.appendChild(snip);
      row.appendChild(rb);
      list.appendChild(row);
    });
    document.getElementById('noteHistModal').classList.add('active');
  }

  function closeNoteHist() {
    var m = document.getElementById('noteHistModal');
    if (m) m.classList.remove('active');
    histNoteId = null;
  }

  function getTaskNote(scope, create) {
    var n = keepNotes.find(function (x) { return x.type === 'todo' && (x.scope || 'general') === scope; });
    if (!n && create) {
      n = { id: 'k' + Date.now(), title: 'Tasks', body: '', type: 'todo', items: [], scope: scope, updated: Date.now() };
      keepNotes.push(n);
      persistKeep();
    }
    return n || null;
  }

  function normalizeTodos() {
    var byScope = {};
    var found = false;
    keepNotes = keepNotes.filter(function (n) {
      if (n.type === 'todo') {
        var scope = n.scope || 'general';
        if (state.courses.find(function (x) { return x.id === scope; }) || scope === 'general' || scope.indexOf('topic:') === 0) {
          (byScope[scope] = byScope[scope] || []).push(n);
          found = true;
        }
        return false;
      }
      return true;
    });
    if (!found) return;
    Object.keys(byScope).forEach(function (scope) {
      var items = [];
      byScope[scope].forEach(function (n) {
        (n.items || []).forEach(function (it) { items.push({ t: it.t, done: !!it.done, id: it.id || ('i' + Date.now() + Math.floor(Math.random() * 100000)) }); });
      });
      keepNotes.push({ id: 'k' + Date.now() + Math.floor(Math.random() * 100000), title: 'Tasks', body: '', type: 'todo', items: items, scope: scope, updated: Date.now() });
    });
    persistKeep();
  }

  function renderTodoPane() {
    var scope = 'general';
    var box = document.getElementById('todoList');
    var prog = document.getElementById('todoProgress');
    box.innerHTML = '';
    var note = getTaskNote(scope, false);
    var items = note ? note.items : [];
    var idDirty = false;
    items.forEach(function (it) {
      if (!it.id) { it.id = 'i' + Date.now() + Math.floor(Math.random() * 100000); idDirty = true; }
    });
    if (idDirty && note) persistKeep();
    var done = items.filter(function (it) { return it.done; }).length;
    prog.textContent = items.length ? done + ' of ' + items.length + ' done' : 'Nothing here yet - add your first task above';
    var todayStr = todayKey(new Date());
    function todoRank(it) { return it.prio && TODO_PRIO_WEIGHT[it.prio] !== undefined ? TODO_PRIO_WEIGHT[it.prio] : 3; }
    items.map(function (it, i) { return { it: it, i: i }; })
      .sort(function (a, b) {
        if ((a.it.done - b.it.done) !== 0) return a.it.done - b.it.done;
        if (todoRank(a.it) !== todoRank(b.it)) return todoRank(a.it) - todoRank(b.it);
        if ((a.it.due || '9999') < (b.it.due || '9999')) return -1;
        if ((a.it.due || '9999') > (b.it.due || '9999')) return 1;
        return a.i - b.i;
      })
      .forEach(function (entry) {
        var row = document.createElement('div');
        row.className = 'todo-row';
        row.dataset.id = entry.it.id;
        row.draggable = true;
        row.addEventListener('dragstart', function (e) {
          row.classList.add('dragging');
          var box = document.getElementById('todoList');
          if (box) box.classList.add('is-reordering');
          try {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', entry.it.id);
          } catch (err) {}
        });
        row.addEventListener('dragend', function () {
          row.classList.remove('dragging');
          var box = document.getElementById('todoList');
          if (box) box.classList.remove('is-reordering');
          persistTodoOrder();
        });
        var circle = document.createElement('button');
        circle.type = 'button';
        circle.className = 'todo-circle' + (entry.it.done ? ' done' : '');
        circle.setAttribute('aria-label', entry.it.done ? 'Mark as not done' : 'Mark as done');
        circle.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M4 8.5l3 3 7-7"></path></svg>';
        circle.addEventListener('click', function () {
          entry.it.done = !entry.it.done;
          note.updated = Date.now();
          persistKeep();
          circle.classList.toggle('done', entry.it.done);
          circle.setAttribute('aria-label', entry.it.done ? 'Mark as not done' : 'Mark as done');
          text.classList.toggle('done', entry.it.done);
          var doneCount = note.items.filter(function (x) { return x.done; }).length;
          prog.textContent = note.items.length ? doneCount + ' of ' + note.items.length + ' done' : 'Nothing here yet - add your first task above';
          setTimeout(renderTodoPane, 450);
        });
        var text = document.createElement('span');
        text.className = 'todo-text' + (entry.it.done ? ' done' : '');
        text.textContent = entry.it.t;
        if (entry.it.due || entry.it.prio) {
          var chips = document.createElement('span');
          chips.className = 'todo-chips';
          if (entry.it.due) {
            var due = document.createElement('span');
            due.className = 'todo-chip' + (!entry.it.done && entry.it.due < todayStr ? ' overdue' : '');
            due.textContent = entry.it.due + (!entry.it.done && entry.it.due < todayStr ? ' overdue' : '');
            chips.appendChild(due);
          }
          if (entry.it.prio) {
            var pr = document.createElement('span');
            pr.className = 'todo-chip prio-' + entry.it.prio;
            pr.textContent = entry.it.prio;
            chips.appendChild(pr);
          }
          text.appendChild(chips);
        }
        var del = document.createElement('button');
        del.type = 'button';
        del.className = 'btn-remove-row';
        del.textContent = '\u00D7';
        del.setAttribute('aria-label', 'Delete task');
        del.addEventListener('click', function () {
          note.items.splice(entry.i, 1);
          note.updated = Date.now();
          persistKeep();
          renderTodoPane();
        });
        row.appendChild(circle);
        row.appendChild(text);
        row.appendChild(del);
        box.appendChild(row);
      });
  }

  function persistTodoOrder() {
    var scope = 'general';
    var note = getTaskNote(scope, false);
    var box = document.getElementById('todoList');
    if (!note || !box) return;
    var order = [];
    box.querySelectorAll('[data-id]').forEach(function (el) { order.push(el.dataset.id); });
    if (!order.length) return;
    note.items.sort(function (a, b) { return order.indexOf(a.id) - order.indexOf(b.id); });
    persistKeep();
  }

  var TODO_PRIO_WEIGHT = { High: 0, Medium: 1, Low: 2 };

  function addTodoQuick() {
    var inp = document.getElementById('todoQuickInput');
    var v = inp.value.trim();
    if (!v) return;
    var scope = 'general';
    var note = getTaskNote(scope, true);
    var dueEl = document.getElementById('todoDueInput');
    var prioEl = document.getElementById('todoPrioInput');
    var item = { t: v.slice(0, 120), done: false, id: 'i' + Date.now() };
    if (dueEl && dueEl.value) item.due = dueEl.value;
    if (prioEl && prioEl.value) item.prio = prioEl.value;
    note.items.push(item);
    note.updated = Date.now();
    persistKeep();
    inp.value = '';
    if (dueEl) dueEl.value = '';
    if (prioEl) prioEl.value = '';
    inp.focus();
    renderTodoPane();
  }
  function closeCreditsModal() { document.getElementById('creditsModal').classList.remove('active'); }

  // =========================================================================
  // 20b. Home front page - stats, today digest, easter eggs
  // =========================================================================

  function setText(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }

  function renderHomeDigest() {
    try {
      var pending = state.deadlines.filter(function (d) { return !d.completed; });
      setText('homeStatGrades', state.courses.length + (state.courses.length === 1 ? ' course' : ' courses'));
      setText('homeStatDeadlines', pending.length + ' pending');
      setText('homeStatCal', calEvents.length + (calEvents.length === 1 ? ' reminder' : ' reminders'));
      setText('homeStatStudy', studyBlocks.length + (studyBlocks.length === 1 ? ' block' : ' blocks'));
      var bal = transactions.reduce(function (a, t) { return a + (t.type === 'income' ? 1 : -1) * (parseFloat(t.amount) || 0); }, 0);
      setText('homeStatMoney', (bal < 0 ? '−' : '') + usd(Math.abs(bal)));
      setText('homeStatFocus', sprintsToday() + (sprintsToday() === 1 ? ' sprint' : ' sprints') + ' today');
      setText('homeStatNotes', keepNotes.filter(function (n) { return n.type !== 'todo'; }).length + ' notes');

      var todayStr = todayKey(new Date());
      var due = pending.filter(function (d) { return d.dueDate === todayStr; });
      var study = getStudyOn(todayStr);
      var rems = getCalEventsOn(todayStr);

      setText('digestDueCount', String(due.length));
      setText('digestStudyCount', String(study.length));
      setText('digestRemCount', String(rems.length));

      function fillList(id, items, emptyTxt) {
        var box = document.getElementById(id);
        if (!box) return;
        box.innerHTML = '';
        if (!items.length) { box.innerHTML = '<div class="digest-empty">' + emptyTxt + '</div>'; return; }
        items.slice(0, 5).forEach(function (it) {
          var div = document.createElement('div');
          div.className = 'digest-item';
          div.textContent = it.label;
          div.title = it.label;
          div.addEventListener('click', function () { it.go(); });
          box.appendChild(div);
        });
      }

      fillList('digestDue', due.map(function (d) {
        return { label: (d.dueTime || '23:59') + ' - ' + d.title, go: function () { scrollFlash('deadline-' + d.id); } };
      }), 'Nothing due today. Enjoy it.');
      fillList('digestStudy', study.map(function (s) {
        return { label: (s.block.time || '09:00') + ' - ' + s.block.subject + (s.done ? ' ✓' : ''), go: function () { scrollFlash('study-' + s.block.id); } };
      }), 'No study blocks today.');
      fillList('digestRem', rems.map(function (e) {
        return { label: (e.time || '09:00') + ' - ' + e.title, go: function () { showPage('calendar', false); calSelected = e.date; renderCalendar(); } };
      }), 'No reminders today.');
    } catch (e) {}
  }

  var konamiSeq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var konamiPos = 0;
  var logoClicks = [];

  function initEasterEggs() {
    try {
      console.log('%cHORIZON%c v42 - psst: try the Konami code, click the logo 5x, or click the coffee heart.', 'font-weight:bold;color:#0071e3', 'color:inherit');
    } catch (e) {}
    document.addEventListener('keydown', function (e) {
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      var want = konamiSeq[konamiPos];
      if (k === want || (want.length === 1 && k === want)) {
        konamiPos++;
        if (konamiPos === konamiSeq.length) {
          konamiPos = 0;
          confetti.fire(0.2, 0.4); confetti.fire(0.8, 0.4); confetti.fire(0.5, 0.2);
          try { playSprintCompletionChime(); } catch (err) {}
          showToast('KONAMI! +30 focus aura for the rest of the day.', 'success');
        }
      } else {
        konamiPos = (k === konamiSeq[0]) ? 1 : 0;
      }
    });
    document.querySelectorAll('.nav-brand-link, .hole-logo').forEach(function (el) {
      el.addEventListener('click', function () {
        var now = Date.now();
        logoClicks = logoClicks.filter(function (t) { return now - t < 3000; });
        logoClicks.push(now);
        if (logoClicks.length === 5) {
          logoClicks = [];
          confetti.fire(0.5, 0.3);
          showToast('You found the hole! The logo is a black hole eating deadlines. Tasty.', 'success');
        }
      });
    });
    var made = document.querySelector('.footer-made');
    if (made) made.addEventListener('click', function () {
      var lines = ['Espresso yourself.', 'Decaf? Never heard of her.', 'Powered by 4 shots and a deadline.', 'Coffee first, calculus later.'];
      showToast(lines[Math.floor(Math.random() * lines.length)], 'info');
    });
  }

  function resetAllData() {
    openConfirm({ title: 'Restore demo data?', message: 'Replace your courses and deadlines with the Stanford demo set? Your other data stays untouched.', confirmText: 'Restore', danger: false }).then(function (ok) {
      if (!ok) return;
      localStorage.removeItem(STORAGE_KEY_COURSES);
      localStorage.removeItem(STORAGE_KEY_DEADLINES);
      loadState();
      renderCourses();
      renderDeadlines();
      if (typeof seedStudyPlan === 'function') seedStudyPlan(true);
      if (typeof renderFinance === 'function') renderFinance();
      renderCalendar();
      updateOverallKPIs();
      showToast('Demo data restored', 'info');
    });
  }

  // =========================================================================
  // 21. Initialization
  // =========================================================================

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    loadState();
    loadCal();
    if (typeof loadStudy === 'function') loadStudy();
    if (typeof loadFinance === 'function') loadFinance();
    if (typeof loadFlight === 'function') loadFlight();
    if (typeof loadFc === 'function') loadFc();
    setScale(state.scale);
    renderCourses();
    renderDeadlines();
    if (typeof renderStudy === 'function') {
      if (!studyBlocks.length) seedStudyPlan(true);
      else renderStudy();
    }
    if (typeof renderFinance === 'function') renderFinance();
    if (typeof renderFlightAll === 'function') { populateFlightSelects(); renderFlightAll(); }
    renderCalendar();
    updateOverallKPIs();
    updateTimerDisplay();
    renderSprintCount();
    renderKeepList();
    if (typeof renderHomeDigest === 'function') renderHomeDigest();
    if (typeof initFc === 'function') { try { initFc(); } catch (e) { console.error('flashcards init', e); } }
    initRouter();
    initEasterEggs();
    window.addEventListener('hashchange', function () {
      if ((location.hash || '').indexOf('study') >= 0 && typeof renderFcAll === 'function') {
        try { renderFcAll(); } catch (e) {}
      }
    });

    setInterval(function () { updateStanfordClock(); updateOverallKPIs(); updatePanicMeter(); tickDeadlineTimers(); }, 1000);
    setInterval(function () { if (currentPage === 'home') renderHomeDigest(); }, 15000);
    updateStanfordClock();
    updatePanicMeter();

    // Quote of the day + hidden morse eggs
    renderDailyQuote();
    renderYearProgress();
    morseEggs();
    syncReminderBtn();
    setInterval(checkReminders, 60000);
    document.getElementById('btnShuffleQuote').addEventListener('click', shuffleQuote);
    window.addEventListener('resize', fitQuote);

    // Nav is always visible now (decluttered: Home + 3 + More menu)
    var navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.add('show');

    // Keyboard shortcuts
    initKeyboardShortcuts();

    // Navigation & buttons
    document.getElementById('scaleDutchBtn').addEventListener('click', function () { setScale('gpa'); });
    document.getElementById('scalePctBtn').addEventListener('click', function () { setScale('pct'); });
    document.getElementById('btnQuickImport').addEventListener('click', openImportModal);
    document.getElementById('btnAddCourseBtn').addEventListener('click', function () { openCourseModal(); });
    document.getElementById('btnAddDeadlineBtn').addEventListener('click', openDeadlineModal);
    document.getElementById('btnExportIcs').addEventListener('click', exportIcsCalendar);
    document.getElementById('btnReminders').addEventListener('click', enableReminders);
    document.getElementById('cmdInput').addEventListener('input', function (e) { renderCmdList(e.target.value); });
    document.getElementById('cmdInput').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (cmdFiltered.length) setCmdActive((cmdActiveIdx + 1) % cmdFiltered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cmdFiltered.length) setCmdActive((cmdActiveIdx - 1 + cmdFiltered.length) % cmdFiltered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (cmdFiltered[cmdActiveIdx]) { closePalette(); cmdFiltered[cmdActiveIdx].run(); }
      } else if (e.key === 'Escape') {
        closePalette();
      }
    });
    document.getElementById('cmdPalette').addEventListener('click', function (e) {
      if (e.target === this) closePalette();
    });
    document.getElementById('btnResetAllData').addEventListener('click', resetAllData);
    document.getElementById('btnExportJsonData').addEventListener('click', exportJsonData);
    document.getElementById('btnOpenFeedback').addEventListener('click', openFeedbackModal);
    document.getElementById('btnCloseFeedbackModal').addEventListener('click', closeFeedbackModal);
    document.getElementById('btnFeedbackDone').addEventListener('click', closeFeedbackModal);
    document.getElementById('btnCopyEmail').addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('karbalai@outlook.in').then(function () {
          showToast('Email copied', 'success');
        });
      } else {
        showToast('Clipboard API not available', 'warn');
      }
    });
    document.getElementById('btnSendFeedback').addEventListener('click', function () {
      var msg = document.getElementById('feedbackText').value.trim();
      if (!msg) { showToast('Write your message first', 'warn'); return; }
      window.location.href = 'mailto:karbalai@outlook.in?subject=' + encodeURIComponent('Horizon feedback') + '&body=' + encodeURIComponent(msg);
      closeFeedbackModal();
    });
    document.getElementById('btnThemeToggle').addEventListener('click', function (e) {
      e.stopPropagation();
      document.getElementById('themeMenu').classList.toggle('open');
    });
    document.querySelectorAll('.theme-option').forEach(function (b) {
      b.addEventListener('click', function () {
        setTheme(b.dataset.themeValue);
        closeThemeMenu();
      });
    });
    try {
      new MutationObserver(function () { if (typeof flApplyBase === 'function') flApplyBase(); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    } catch (e) {}
    document.addEventListener('click', function (e) {
      var menu = document.getElementById('themeMenu');
      if (menu && menu.classList.contains('open') && !e.target.closest('.theme-picker')) closeThemeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var cm = document.getElementById('confirmModal');
        if (cm && cm.classList.contains('active')) closeConfirm(false);
        closeThemeMenu();
        if (typeof closeNoteHist === 'function') closeNoteHist();
        if (typeof closeNoteModal === 'function') closeNoteModal();
      }
    });
    document.getElementById('btnOpenCredits').addEventListener('click', openCreditsModal);
    // Custom confirm dialog wiring
    document.getElementById('btnConfirmOk').addEventListener('click', function () { closeConfirm(true); });
    document.getElementById('btnConfirmCancel').addEventListener('click', function () { closeConfirm(false); });
    document.getElementById('btnConfirmClose').addEventListener('click', function () { closeConfirm(false); });
    document.getElementById('confirmModal').addEventListener('click', function (e) { if (e.target === this) closeConfirm(false); });
    document.getElementById('confirmInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); closeConfirm(true); }
    });
    var keepListEl = document.getElementById('keepList');
    keepListEl.addEventListener('dragover', makeThrottledReorder(keepListEl, '.keep-card'));
    keepListEl.addEventListener('drop', function (e) { e.preventDefault(); keepListEl.classList.remove('is-reordering'); persistKeepOrder(); });
    keepListEl.addEventListener('dragleave', function () { keepListEl.classList.remove('is-reordering'); });
    var todoListEl = document.getElementById('todoList');
    todoListEl.addEventListener('dragover', makeThrottledReorder(todoListEl, '.todo-row'));
    todoListEl.addEventListener('drop', function (e) { e.preventDefault(); todoListEl.classList.remove('is-reordering'); persistTodoOrder(); });
    todoListEl.addEventListener('dragleave', function () { todoListEl.classList.remove('is-reordering'); });
    document.getElementById('keepTabNotes').addEventListener('click', function () { switchKeepTab('notes'); });
    document.getElementById('keepTabTodo').addEventListener('click', function () { switchKeepTab('todo'); });
    document.getElementById('keepTabTrash').addEventListener('click', function () { switchKeepTab('trash'); });
    document.getElementById('btnKeepSave').addEventListener('click', saveKeepComposer);
    document.getElementById('btnFmtBold').addEventListener('click', function () { fmtKeepDoc('bold'); });
    document.getElementById('btnFmtItalic').addEventListener('click', function () { fmtKeepDoc('italic'); });
    document.getElementById('btnFmtUnderline').addEventListener('click', function () { fmtKeepDoc('underline'); });
    document.getElementById('keepBody').addEventListener('input', function () {
      var el = document.getElementById('keepBody');
      if (el && el.textContent === '' && el.innerHTML !== '') el.innerHTML = '';
    });
    document.getElementById('btnKeepImg').addEventListener('click', function () { document.getElementById('keepImgInput').click(); });
    document.getElementById('keepImgInput').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) attachKeepImage(e.target.files[0]);
      e.target.value = '';
    });
    document.getElementById('btnKeepImgRemove').addEventListener('click', function () { keepImgData = null; syncKeepImgPrev(); });
    document.getElementById('btnKeepRemind').addEventListener('click', function (e) {
      e.stopPropagation();
      var pop = document.getElementById('keepRemindPop');
      var open = pop.style.display === 'none';
      pop.style.display = open ? '' : 'none';
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) document.getElementById('keepRemind').focus();
    });
    document.getElementById('keepRemindChip').addEventListener('click', function () {
      var pop = document.getElementById('keepRemindPop');
      pop.style.display = pop.style.display === 'none' ? '' : 'none';
    });
    document.getElementById('btnKeepRemindSet').addEventListener('click', function () {
      syncKeepRemindUI();
      closeKeepRemindPop();
    });
    document.getElementById('btnKeepRemindClear').addEventListener('click', function () {
      document.getElementById('keepRemind').value = '';
      syncKeepRemindUI();
      closeKeepRemindPop();
    });
    document.addEventListener('click', function (e) {
      var pop = document.getElementById('keepRemindPop');
      if (pop && pop.style.display !== 'none' && !e.target.closest('.keep-remind-row')) closeKeepRemindPop();
    });
    document.getElementById('btnCloseNoteModal').addEventListener('click', closeNoteModal);
    document.getElementById('btnNoteModalDone').addEventListener('click', closeNoteModal);
    document.getElementById('noteModal').addEventListener('click', function (e) { if (e.target === this) closeNoteModal(); });
    document.getElementById('btnNoteModalFull').addEventListener('click', function () {
      var s = document.getElementById('noteModalSurface');
      var full = s.classList.toggle('note-full');
      this.textContent = full ? 'Exit fullscreen' : 'Fullscreen';
    });
    document.getElementById('btnNoteModalEdit').addEventListener('click', function () {
      if (noteModalId) {
        loadKeepIntoComposer(noteModalId);
        closeNoteModal();
        scrollFlash('notes');
        setTimeout(function () { document.getElementById('keepBody').focus(); }, 300);
      }
    });
    document.getElementById('btnNoteModalHist').addEventListener('click', function () { if (noteModalId) openNoteHist(noteModalId); });
    document.getElementById('btnCloseNoteHistModal').addEventListener('click', closeNoteHist);
    document.getElementById('btnNoteHistDone').addEventListener('click', closeNoteHist);
    document.getElementById('noteHistModal').addEventListener('click', function (e) { if (e.target === this) closeNoteHist(); });
    document.getElementById('btnTodoAdd').addEventListener('click', addTodoQuick);
    document.getElementById('todoQuickInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addTodoQuick(); }
    });

    document.getElementById('btnCopyDiscord').addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('itzjacksparrow').then(function () {
          showToast('Discord username copied', 'success');
        });
      } else {
        showToast('Clipboard API not available', 'warn');
      }
    });
    document.getElementById('btnCloseCreditsModal').addEventListener('click', closeCreditsModal);
    document.getElementById('btnCreditsDone').addEventListener('click', closeCreditsModal);


    // Calendar
    document.getElementById('btnCalPrev').addEventListener('click', function () {
      calCursor.m--;
      if (calCursor.m < 0) { calCursor.m = 11; calCursor.y--; }
      renderCalendar();
    });
    document.getElementById('btnCalNext').addEventListener('click', function () {
      calCursor.m++;
      if (calCursor.m > 11) { calCursor.m = 0; calCursor.y++; }
      renderCalendar();
    });
    document.getElementById('btnCalToday').addEventListener('click', function () {
      var n = new Date();
      calCursor = { y: n.getFullYear(), m: n.getMonth() };
      calSelected = todayKey(n);
      renderCalendar();
      scrollFlash('calendar');
    });
    document.getElementById('btnCalAdd').addEventListener('click', function () { openCalEventModal(calSelected); });
    // Study / Dues / Code / Money wiring
    try {
      document.getElementById('btnAddStudy').addEventListener('click', function () { openStudyModal(); });
      document.getElementById('btnSeedStudy').addEventListener('click', function () { seedStudyPlan(false); });
      document.getElementById('studyForm').addEventListener('submit', saveStudyFromModal);
      document.getElementById('btnCloseStudyModal').addEventListener('click', closeStudyModal);
      document.getElementById('btnCancelStudyModal').addEventListener('click', closeStudyModal);
      document.getElementById('btnStudyDelete').addEventListener('click', function () {
        var editId = document.getElementById('studyEditId').value;
        if (!editId) return;
        var b = studyBlocks.find(function (x) { return x.id === editId; });
        askConfirm('Delete study block?', 'Delete "' + (b ? b.subject : 'this block') + '" and its daily calendar entries?').then(function (ok) {
          if (ok) {
            studyBlocks = studyBlocks.filter(function (x) { return x.id !== editId; });
            delete studyDone[editId];
            persistStudy(); closeStudyModal(); renderStudy(); renderCalendar();
            showToast('Study block deleted', 'info');
          }
        });
      });
      document.getElementById('btnAddWish').addEventListener('click', function () { openWishModal(); });
      document.getElementById('wishForm').addEventListener('submit', saveWishFromModal);
      document.getElementById('btnCloseWishModal').addEventListener('click', closeWishModal);
      document.getElementById('btnCancelWishModal').addEventListener('click', closeWishModal);
      document.getElementById('btnWishDelete').addEventListener('click', function () {
        var editId = document.getElementById('wishEditId').value;
        if (!editId) return;
        var w = wishlist.find(function (x) { return x.id === editId; });
        askConfirm('Delete wish?', 'Remove "' + (w ? w.name : 'this wish') + '" from your wishlist?').then(function (ok) {
          if (ok) {
            wishlist = wishlist.filter(function (x) { return x.id !== editId; });
            persistFinance(); closeWishModal(); renderWishlist(); renderFinance();
            showToast('Wish removed', 'info');
          }
        });
      });
      document.getElementById('btnAddDue').addEventListener('click', function () { openDueModal(); });
      var btnOverdue = document.getElementById('btnPostOverdue');
      if (btnOverdue) btnOverdue.addEventListener('click', postOverdueDues);
      document.getElementById('dueForm').addEventListener('submit', saveDueFromModal);
      document.getElementById('btnCloseDueModal').addEventListener('click', closeDueModal);
      document.getElementById('btnCancelDueModal').addEventListener('click', closeDueModal);
      document.getElementById('btnDueDelete').addEventListener('click', function () {
        var editId = document.getElementById('dueEditId').value;
        if (!editId) return;
        var d = dues.find(function (x) { return x.id === editId; });
        askConfirm('Delete due?', 'Delete "' + (d ? d.name : 'this due') + '"? This cannot be undone.').then(function (ok) {
          if (ok) {
            dues = dues.filter(function (x) { return x.id !== editId; });
            persistFinance(); closeDueModal(); renderFinance();
            showToast('Due removed', 'info');
          }
        });
      });
      document.getElementById('btnAddTx').addEventListener('click', function () { openFinModal(); });
      document.getElementById('finForm').addEventListener('submit', saveFinFromModal);
      document.getElementById('btnCloseFinModal').addEventListener('click', closeFinModal);
      document.getElementById('btnCancelFinModal').addEventListener('click', closeFinModal);
      document.getElementById('finTypeExpense').addEventListener('click', function () { finType = 'expense'; syncFinTypeUI(); });
      document.getElementById('finTypeIncome').addEventListener('click', function () { finType = 'income'; syncFinTypeUI(); });
      document.getElementById('btnFinDelete').addEventListener('click', function () {
        var editId = document.getElementById('finEditId').value;
        if (!editId) return;
        askConfirm('Delete transaction?', 'Remove this transaction from your records?').then(function (ok) {
          if (ok) {
            transactions = transactions.filter(function (x) { return x.id !== editId; });
            persistFinance(); closeFinModal(); renderFinance();
            showToast('Transaction deleted', 'info');
          }
        });
      });
      document.getElementById('btnEditBudget').addEventListener('click', function () {
        openConfirm({ title: 'Monthly budget', message: 'Set your monthly spending budget in dollars.', confirmText: 'Save budget', danger: false, input: true, inputLabel: 'Budget ($)', inputValue: String(finBudget), inputPlaceholder: 'e.g. 400' }).then(function (res) {
          if (!res || !res.ok) return;
          var n = parseFloat(res.value);
          if (!(n > 0)) { showToast('Enter a valid amount', 'warn'); return; }
          finBudget = Math.round(n * 100) / 100;
          persistFinance(); renderFinance();
          showToast('Budget set to $' + finBudget, 'success');
        });
      });
      document.getElementById('finFilterSelect').addEventListener('change', function (e) { finFilter = e.target.value; renderFinance(); });
      document.getElementById('btnFinResetMonth').addEventListener('click', resetFinMonth);
      document.getElementById('btnHeroTakeoff').addEventListener('click', function () {
        setTimeout(function () { scrollFlash('flightSim'); }, 150);
      });
      document.getElementById('btnFlightToggle').addEventListener('click', toggleFlight);
      document.getElementById('btnFlightReset').addEventListener('click', function () { resetFlight(false); showToast('Back to the gate', 'info'); });
      document.getElementById('btnFlSwap').addEventListener('click', function () {
        var f = document.getElementById('flFrom'), t = document.getElementById('flTo');
        var tmp = f.value; f.value = t.value; t.value = tmp;
        onFlightPlanChange();
      });
      ['flFrom', 'flTo', 'flCabin', 'flMode', 'flPlane'].forEach(function (id) {
        document.getElementById(id).addEventListener('change', onFlightPlanChange);
      });
      document.getElementById('flCustomH').addEventListener('change', onFlightPlanChange);
      document.getElementById('flCustomM').addEventListener('change', onFlightPlanChange);
      [['flViewMap', 'map'], ['flViewFollow', 'follow']].forEach(function (p) {
        document.getElementById(p[0]).addEventListener('click', function () {
          flightSave.view = p[1]; persistFlight(); renderFlightAll();
        });
      });
      [['flDayDay', 'day'], ['flDayAuto', 'auto'], ['flDayNight', 'night']].forEach(function (p) {
        document.getElementById(p[0]).addEventListener('click', function () {
          flightSave.day = p[1]; persistFlight(); renderFlightAll();
        });
      });
      document.getElementById('btnFlZoomIn').addEventListener('click', function () { flZoom(1); });
      document.getElementById('btnFlZoomOut').addEventListener('click', function () { flZoom(-1); });
      document.getElementById('btnFlZoomIn2').addEventListener('click', function () { flZoom(1); });
      document.getElementById('btnFlZoomOut2').addEventListener('click', function () { flZoom(-1); });
      document.getElementById('btnFlPause').addEventListener('click', function () {
        if (flight.state === 'flying' || flight.state === 'paused') toggleFlight();
        else showToast('Take off first - then you can hold the flight', 'info');
      });
      document.getElementById('btnFlEnd').addEventListener('click', function () {
        if (flight.state !== 'flying' && flight.state !== 'paused') { showToast('No active flight to end', 'info'); return; }
        askConfirm('End flight?', 'Cut this flight short? You will not earn miles for it.').then(function (ok) {
          if (ok) { resetFlight(false); showToast('Flight ended', 'info'); }
        });
      });
      document.getElementById('btnFlDay').addEventListener('click', function () {
        flightSave.day = flightSave.day === 'day' ? 'auto' : flightSave.day === 'auto' ? 'night' : 'day';
        persistFlight(); renderFlightAll();
      });
      document.getElementById('btnFlAudio').addEventListener('click', function () {
        flHum.on = !flHum.on;
        this.classList.toggle('active', flHum.on);
        if (flHum.on && flight.state === 'flying') flHumStart();
        if (!flHum.on) flHumStop();
      });
      document.getElementById('btnFlFull').addEventListener('click', function () {
        var el = document.getElementById('flConsole');
        try {
          if (document.fullscreenElement) document.exitFullscreen();
          else if (el && el.requestFullscreen) el.requestFullscreen();
        } catch (e) { showToast('Fullscreen not available here', 'warn'); }
      });
      document.getElementById('btnFlHideMap').addEventListener('click', function () {
        var sim = document.getElementById('flightSim');
        var hidden = sim.classList.toggle('nomap');
        this.classList.toggle('active', !hidden);
        renderFlightAll();
      });
      document.getElementById('btnFlPure').addEventListener('click', function () {
        var sim = document.getElementById('flightSim');
        var on = sim.classList.toggle('pure');
        this.classList.toggle('active', on);
      });
      document.addEventListener('fullscreenchange', function () {
        var con = document.getElementById('flConsole');
        var inFs = document.fullscreenElement === con;
        ['toastContainer', 'confirmModal', 'arrivalModal'].forEach(function (id) {
          var el = document.getElementById(id);
          if (!el || !con) return;
          if (inFs) con.appendChild(el);
          else document.body.appendChild(el);
        });
        if (flLeaf) setTimeout(function () { try { flLeaf.invalidateSize(); } catch (e) {} }, 120);
      });
      document.getElementById('btnFlCrew').addEventListener('click', function () {
        flBell();
        showToast(flight.state === 'flying' ? 'Cabin crew on the way - extra pretzels incoming' : 'Crew standing by for your next flight', 'info');
      });
      document.getElementById('btnDepMore').addEventListener('click', function () {
        depExpanded = !depExpanded;
        renderDepartures();
      });
      document.getElementById('btnArrivalClose').addEventListener('click', closeArrival);
      document.getElementById('btnArrivalContinue').addEventListener('click', closeArrival);
      document.getElementById('btnArrivalAgain').addEventListener('click', function () {
        closeArrival();
        showPage('focus', false);
        setTimeout(function () { scrollFlash('flightSim'); }, 120);
      });
      document.getElementById('arrivalModal').addEventListener('click', function (e) { if (e.target === this) closeArrival(); });
    } catch (err) { console.error('v40 wiring', err); }

    var calGrid = document.getElementById('calGrid');
    calGrid.addEventListener('click', function (e) {
      var chip = e.target.closest ? e.target.closest('.cal-chip') : null;
      if (chip && chip.dataset.id) {
        e.stopPropagation();
        if (chip.dataset.kind === 'event') openCalEventModal(chip.dataset.date, chip.dataset.id);
        else if (chip.dataset.kind === 'study') scrollFlash('study-' + chip.dataset.id);
        else scrollFlash('deadline-' + chip.dataset.id);
        return;
      }
      var more = e.target.closest ? e.target.closest('.cal-more') : null;
      if (more && more.dataset.date) {
        calSelected = more.dataset.date;
        renderCalendar();
        return;
      }
      var day = e.target.closest ? e.target.closest('.cal-day') : null;
      if (day && day.dataset.date) {
        calSelected = day.dataset.date;
        renderCalendar();
      }
    });
    calGrid.addEventListener('dblclick', function (e) {
      var day = e.target.closest ? e.target.closest('.cal-day') : null;
      if (day && day.dataset.date) openCalEventModal(day.dataset.date);
    });
    document.getElementById('calAgenda').addEventListener('click', function (e) {
      var row = e.target.closest ? e.target.closest('.cal-agenda-row') : null;
      if (row && row.dataset.id) handleCalItemClick(row.dataset.kind, row.dataset.id);
    });
    document.getElementById('calEventForm').addEventListener('submit', saveCalEventFromModal);
    document.getElementById('btnCloseCalEventModal').addEventListener('click', closeCalEventModal);
    document.getElementById('btnCancelCalEventModal').addEventListener('click', closeCalEventModal);
    document.getElementById('btnCalEventDelete').addEventListener('click', deleteCalEvent);

    // Modals
    document.getElementById('btnCloseCourseModal').addEventListener('click', closeCourseModal);
    document.getElementById('btnCancelCourseModal').addEventListener('click', closeCourseModal);
    document.getElementById('btnCloseDeadlineModal').addEventListener('click', closeDeadlineModal);
    document.getElementById('btnCancelDeadlineModal').addEventListener('click', closeDeadlineModal);
    document.getElementById('btnCloseImportModal').addEventListener('click', closeImportModal);
    document.getElementById('courseForm').addEventListener('submit', saveCourseFromModal);
    document.getElementById('deadlineForm').addEventListener('submit', saveDeadlineFromModal);
    document.getElementById('btnAddGradedComponent').addEventListener('click', function () { addComponentRow('', 20, ''); });

    // Importer
    document.getElementById('btnLoadExampleSyllabus').addEventListener('click', loadSampleSyllabusText);
    document.getElementById('btnExecuteImport').addEventListener('click', executeSyllabusImport);
    document.getElementById('importRawText').addEventListener('input', function (e) { parseSyllabusText(e.target.value); });

    // Filters
    document.getElementById('filterCourseSelect').addEventListener('change', function (e) { state.filterCourse = e.target.value; renderDeadlines(); });
    document.getElementById('filterUrgencySelect').addEventListener('change', function (e) { state.filterUrgency = e.target.value; renderDeadlines(); });

    // Pomodoro
    document.getElementById('btnTimerToggle').addEventListener('click', function () { if (pomodoroState.isRunning) pausePomodoro(); else startPomodoro(); });
    document.getElementById('btnTimerReset').addEventListener('click', resetPomodoro);
    document.getElementById('btnTimerSkip').addEventListener('click', function () {
      var chips = Array.prototype.slice.call(document.querySelectorAll('.chip-btn[data-duration]'));
      var idx = -1;
      chips.forEach(function (c, i) {
        if (parseInt(c.dataset.duration, 10) === pomodoroState.durationMinutes && c.dataset.phase === pomodoroState.phase) idx = i;
      });
      var next = chips[(idx + 1) % chips.length];
      pomodoroState.durationMinutes = parseInt(next.dataset.duration, 10);
      pomodoroState.phase = next.dataset.phase;
      showToast((pomodoroState.phase === 'focus' ? 'Focus' : 'Break') + ' queued - ' + next.textContent.trim(), 'info');
      syncTimerPhaseUI();
      resetPomodoro();
    });

    document.querySelectorAll('.chip-btn[data-duration]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        pomodoroState.durationMinutes = parseInt(chip.dataset.duration, 10);
        pomodoroState.phase = chip.dataset.phase;
        syncTimerPhaseUI();
        resetPomodoro();
      });
    });
    document.getElementById('btnFocusCustom').addEventListener('click', setFocusCustom);
    document.getElementById('focusCustomMin').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); setFocusCustom(); }
    });

    // Audio controls
    var btnRain = document.getElementById('btnSoundRain');
    btnRain.addEventListener('click', function () {
      if (soundNodes.rain.playing) { stopRainSound(); btnRain.textContent = 'Play'; }
      else { startRainSound(parseFloat(document.getElementById('volRain').value) || 0.5); btnRain.textContent = 'Pause'; }
    });
    document.getElementById('volRain').addEventListener('input', function (e) {
      if (soundNodes.rain.gain) soundNodes.rain.gain.gain.setValueAtTime(parseFloat(e.target.value), audioCtx.currentTime);
    });

    var btnSynth = document.getElementById('btnSoundSynth');
    btnSynth.addEventListener('click', function () {
      if (soundNodes.synth.playing) { stopSynthSound(); btnSynth.textContent = 'Play'; }
      else { startSynthSound(parseFloat(document.getElementById('volSynth').value) || 0.4); btnSynth.textContent = 'Pause'; }
    });
    document.getElementById('volSynth').addEventListener('input', function (e) {
      if (soundNodes.synth.gain) soundNodes.synth.gain.gain.setValueAtTime(parseFloat(e.target.value) * 0.5, audioCtx.currentTime);
    });

    var btnWhite = document.getElementById('btnSoundWhite');
    btnWhite.addEventListener('click', function () {
      if (soundNodes.white.playing) { stopWhiteNoise(); btnWhite.textContent = 'Play'; }
      else { startWhiteNoise(parseFloat(document.getElementById('volWhite').value) || 0.3); btnWhite.textContent = 'Pause'; }
    });
    document.getElementById('volWhite').addEventListener('input', function (e) {
      if (soundNodes.white.gain) soundNodes.white.gain.gain.setValueAtTime(parseFloat(e.target.value) * 0.35, audioCtx.currentTime);
    });

    document.getElementById('btnMuteAllAudio').addEventListener('click', toggleMuteAll);

    // Mobile nav active state follows the page router (syncPageLinks covers it).
    // Keep a lightweight observer for in-page scroll position only.
    (function () {
      var items = document.querySelectorAll('.mobile-nav-item');
      if (!items.length || !('IntersectionObserver' in window)) return;
      var map = { hero: 'home', quote: 'home', radar: 'grades', deadlines: 'deadlines', calendar: 'calendar', study: 'study', money: 'money', focus: 'focus', notes: 'notes' };
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && map[entry.target.id] === currentPage) {
            items.forEach(function (it) {
              it.classList.toggle('active', it.dataset.pageLink === currentPage);
            });
          }
        });
      }, { threshold: 0.2 });
      Object.keys(map).forEach(function (id) {
        var s = document.getElementById(id);
        if (s) obs.observe(s);
      });
    })();
  });
})();
