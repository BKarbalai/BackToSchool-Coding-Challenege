/**
 * Horizon — Stanford Grades & Deadlines
 * Stanford University
 * Pure Vanilla JavaScript — Apple.com Design System
 * Built for Codédex Monthly Challenge — September 2026
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
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
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
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 4;
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
        return new Date(a.dueDate + 'T' + a.dueTime) - new Date(b.dueDate + 'T' + b.dueTime);
      });
      var rem = getDeadlineTimeRemaining(uncompleted[0].dueDate, uncompleted[0].dueTime);
      nextText = uncompleted[0].title + ' in ' + rem.text;
    }

    var summary = 'Horizon — Fall Status\n' +
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

  var THEMES = ['dark', 'light', 'indie', 'moss', 'ghost'];

  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    return THEMES.indexOf(t) >= 0 ? t : 'dark';
  }

  function applyThemeIcon() {
    var btn = document.getElementById('btnThemeToggle');
    if (!btn) return;
    var t = currentTheme();
    btn.innerHTML = (t === 'light' || t === 'indie' || t === 'moss') ? ICON_MOON : ICON_SUN;
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
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    } else {
      setTheme('dark');
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

  // Shrink long quotes to fit 2 lines instead of growing taller
  function fitQuote() {
    var el = document.getElementById('quoteText');
    if (!el) return;
    var size = 17;
    el.style.fontSize = size + 'px';
    while (el.scrollHeight > el.clientHeight + 1 && size > 12) {
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

  // Morse code easter eggs — decode them yourself
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
        '<button class="btn-card-glyph btn-whatif-course" data-id="' + course.id + '" title="What-if simulator" aria-label="What-if simulator"><span style="font-size:13px;font-weight:700">?</span></button>' +
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

    if (!container.dataset.whatifBound) {
      container.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.btn-whatif-course') : null;
        if (btn && btn.dataset.id) openWhatifModal(btn.dataset.id);
      });
      container.dataset.whatifBound = '1';
    }
    container.querySelectorAll('.btn-edit-course').forEach(function (btn) {
      btn.addEventListener('click', function () { openCourseModal(btn.dataset.id); });
    });
    container.querySelectorAll('.btn-delete-course').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (confirm('Delete this course and associated deadlines?')) deleteCourse(btn.dataset.id);
      });
    });

    updateOverallKPIs();
    populateCourseDropdowns();
  }

  // =========================================================================
  // 12. Deadline Rendering (with Urgency Progress Bars)
  // =========================================================================

  function getDeadlineTimeRemaining(dueDateStr, dueTimeStr) {
    var target = new Date(dueDateStr + 'T' + dueTimeStr + ':00');
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
      return new Date(a.dueDate + 'T' + a.dueTime + ':00') - new Date(b.dueDate + 'T' + b.dueTime + ':00');
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
      var courseCode = course ? course.code : 'SU';
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
        '<span class="timer-digits-main ' + (rem.urgency === 'danger' && !item.completed ? 'timer-digits-urgent' : '') + '">' +
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
      var diff = new Date(d.dueDate + 'T' + d.dueTime + ':00') - now;
      if (diff > 0 && diff <= 2 * 60 * 60 * 1000) {
        notifiedIds[d.id] = true;
        var rem = getDeadlineTimeRemaining(d.dueDate, d.dueTime);
        try { new Notification('Deadline in ' + rem.text, { body: d.title }); } catch (e) {}
      }
    });
  }

  // =========================================================================
  // 12c. Command Palette
  // =========================================================================

  var cmdActiveIdx = 0;
  var cmdFiltered = [];

  function scrollFlash(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('flash-highlight');
    setTimeout(function () { el.classList.remove('flash-highlight'); }, 1600);
  }

  function cmdCommands() {
    var cmds = [
      { label: 'Go to Grades', hint: 'jump', run: function () { scrollFlash('radar'); } },
      { label: 'Go to Deadlines', hint: 'jump', run: function () { scrollFlash('deadlines'); } },
      { label: 'Go to Focus', hint: 'jump', run: function () { scrollFlash('focus'); } },
      { label: 'Back to top', hint: 'jump', run: function () { window.scrollTo({ top: 0, behavior: 'smooth' }); } },
      { label: 'New deadline', hint: 'N', run: function () { openDeadlineModal(); } },
      { label: 'New course', hint: 'C', run: function () { openCourseModal(); } },
      { label: 'Go to Notes', hint: 'jump', run: function () { scrollFlash('notes'); } },
      { label: 'Start / pause sprint', hint: 'Space', run: function () { if (pomodoroState.isRunning) pausePomodoro(); else startPomodoro(); } },
      { label: 'Export calendar (.ics)', hint: 'file', run: function () { exportIcsCalendar(); } },
      { label: 'Export data (JSON)', hint: 'file', run: function () { exportJsonData(); } },
      { label: 'Copy status summary', hint: 'clipboard', run: function () { copySummary(); } },
      { label: 'Enable reminders', hint: 'bell', run: function () { enableReminders(); } },
      { label: 'Open credits', hint: 'modal', run: function () { openCreditsModal(); } },
      { label: 'Theme: Dark', hint: 'theme', run: function () { setTheme('dark'); } },
      { label: 'Theme: Light', hint: 'theme', run: function () { setTheme('light'); } },
      { label: 'Theme: NYC', hint: 'theme', run: function () { setTheme('nyc'); } },
      { label: 'Theme: Indie', hint: 'theme', run: function () { setTheme('indie'); } }
    ];
    state.courses.forEach(function (c) {
      cmds.push({ label: c.code + ' — ' + c.name, hint: 'course', run: (function (id) { return function () { scrollFlash('course-' + id); }; })(c.id) });
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
        showToast('Reminders on — 2h before each cutoff', 'success');
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
    if (state.deadlines.length === 0) { showToast('No deadlines to export.', 'warn'); return; }

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
      lines.push('DTSTART:' + fmtIcs(dl.dueDate, '23:00'));
      lines.push('DTEND:' + fmtIcs(dl.dueDate, dl.dueTime));
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:Deadline reminder: ' + code);
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
        if (pomodoroState.phase === 'focus') {
          recordSprint();
          pomodoroState.phase = 'break';
          pomodoroState.durationMinutes = 5;
          showToast('Sprint banked. 5-minute break queued.', 'success');
        } else {
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

  function syncTimerPhaseUI() {
    var pill = document.getElementById('timerPhasePill');
    if (pill) pill.textContent = pomodoroState.phase === 'focus' ? 'FOCUS SPRINT' : 'COFFEE BREAK';
    document.querySelectorAll('.chip-btn').forEach(function (c) {
      var match = parseInt(c.dataset.duration, 10) === pomodoroState.durationMinutes && c.dataset.phase === pomodoroState.phase;
      c.classList.toggle('active', match);
    });
  }

  var SPRINT_KEY = 'tue_pass_sprints_v1';
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
    try { localStorage.setItem(SPRINT_KEY, JSON.stringify({ date: k, count: h[k] })); } catch (e) {}
    renderSprintCount();
    renderHeatmap();
  }
  function renderSprintCount() {
    var el = document.getElementById('sprintCount');
    if (!el) return;
    var n = sprintsToday();
    el.textContent = n === 0 ? 'No sprints yet today' : n + (n === 1 ? ' sprint' : ' sprints') + ' today';
    updateDash();
  }
  function renderHeatmap() {
    var grid = document.getElementById('heatGrid');
    if (!grid) return;
    var h = getSprintHist();
    grid.innerHTML = '';
    var today = new Date();
    for (var i = 83; i >= 0; i--) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      var c = h[todayKey(d)] || 0;
      var cell = document.createElement('div');
      cell.className = 'heat-cell' + (c >= 4 ? ' lv4' : c === 3 ? ' lv3' : c === 2 ? ' lv2' : c === 1 ? ' lv1' : '');
      cell.title = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' — ' + c + (c === 1 ? ' sprint' : ' sprints');
      grid.appendChild(cell);
    }
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
    var avgStatus = document.getElementById('kpiGradeStatus');
    if (avgEl && totalScoreWeight > 0) {
      var avg = totalWeightedScore / totalScoreWeight;
      avgEl.textContent = avg.toFixed(1);
      if (avgStatus) {
        if (state.scale === 'gpa') {
          if (avg >= 3.7) avgStatus.textContent = 'Excellent';
          else if (avg >= 2.0) avgStatus.textContent = 'Passing';
          else avgStatus.textContent = 'Below passing';
        } else {
          avgStatus.textContent = avg >= 60 ? 'Passing' : 'Action Required';
        }
      }
    }

    var uncompleted = state.deadlines.filter(function (d) { return !d.completed; });
    var nextDlEl = document.getElementById('kpiNextDeadline');
    var pillEl = document.getElementById('kpiUrgencyPill');

    if (uncompleted.length === 0) {
      if (nextDlEl) nextDlEl.textContent = 'All Done';
      if (pillEl) pillEl.textContent = 'Free Time';
      return;
    }

    uncompleted.sort(function (a, b) { return new Date(a.dueDate + 'T' + a.dueTime + ':00') - new Date(b.dueDate + 'T' + b.dueTime + ':00'); });
    var rem = getDeadlineTimeRemaining(uncompleted[0].dueDate, uncompleted[0].dueTime);
    if (nextDlEl) nextDlEl.textContent = rem.text;
    if (pillEl) pillEl.textContent = rem.urgency === 'danger' ? 'Urgent (< 24h)' : rem.urgency === 'warning' ? 'Approaching' : 'On Track';
    updateGradeInsights();
    updateDash();
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

  function updateDash() {
    var c = document.getElementById('dashCourses');
    if (c) c.textContent = state.courses.length + (state.courses.length === 1 ? ' course' : ' courses');
    var d = document.getElementById('dashDeadlines');
    if (d) {
      var n = state.deadlines.filter(function (x) { return !x.completed; }).length;
      d.textContent = n === 0 ? 'all clear' : n + ' due';
    }
    var s = document.getElementById('dashSprints');
    if (s) s.textContent = sprintsToday() + ' today';
    var k = document.getElementById('dashNotes');
    if (k) k.textContent = keepNotes.length + (keepNotes.length === 1 ? ' note' : ' notes');
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
    open.sort(function (a, b) { return new Date(a.dueDate + 'T' + a.dueTime + ':00') - new Date(b.dueDate + 'T' + b.dueTime + ':00'); });
    var next = open[0];
    var diff = new Date(next.dueDate + 'T' + next.dueTime + ':00') - now;
    if (titleEl) titleEl.textContent = next.title;
    if (diff <= 0) {
      digits.textContent = '00:00:00';
      if (subEl) subEl.textContent = 'Cutoff passed — submit now if the portal still allows it.';
      if (wrap) wrap.className = 'panic-widget danger';
      return;
    }
    var s = Math.floor(diff / 1000);
    var dd = Math.floor(s / 86400);
    var hh = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
    var mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    var ss = String(s % 60).padStart(2, '0');
    digits.textContent = (dd > 0 ? dd + 'd ' : '') + hh + ':' + mm + ':' + ss;
    var hours = diff / 3600000;
    if (wrap) wrap.className = 'panic-widget ' + (hours < 24 ? 'danger' : hours < 48 ? 'warn' : 'calm');
    var crunch = open.filter(function (x) { return new Date(x.dueDate + 'T' + x.dueTime + ':00') - now < 48 * 3600000; }).length;
    var parts = [];
    if (crunch >= 2) parts.push(crunch + ' cutoffs land within 48h — heaviest stretch');
    if (!sprintsToday() && open.length) parts.push('No sprints yet today — start one below');
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
      '<input type="text" class="comp-name-input" placeholder="Component Name" value="' + escapeHtml(name || '') + '" required>' +
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
    var code = document.getElementById('courseCodeInput').value.trim().toUpperCase();
    var name = document.getElementById('courseNameInput').value.trim();
    var ects = parseFloat(document.getElementById('courseEctsInput').value) || 5;
    var quartile = document.getElementById('courseQuartileInput').value;
    var compRows = document.querySelectorAll('.component-edit-row');
    var components = [], totalWeight = 0;

    compRows.forEach(function (row) {
      var cName = row.querySelector('.comp-name-input').value.trim();
      var cWeight = parseFloat(row.querySelector('.comp-weight-input').value) || 0;
      var cScoreVal = row.querySelector('.comp-score-input').value.trim();
      var cScore = cScoreVal !== '' && !isNaN(cScoreVal) ? parseFloat(cScoreVal) : null;
      if (cName) { components.push({ name: cName, weight: cWeight, score: cScore }); totalWeight += cWeight; }
    });

    if (totalWeight !== 100) {
      if (!confirm('Notice: Components sum to ' + totalWeight + '%, not 100%. Proceed?')) return;
    }

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
    if (selectDeadline) selectDeadline.innerHTML = state.courses.map(function (c) { return '<option value="' + c.id + '">[' + c.code + '] ' + escapeHtml(c.name) + '</option>'; }).join('');
    if (filterCourse) {
      var cur = state.filterCourse;
      filterCourse.innerHTML = '<option value="all">All Enrolled Courses</option>' + state.courses.map(function (c) { return '<option value="' + c.id + '" ' + (c.id === cur ? 'selected' : '') + '>' + c.code + ' - ' + escapeHtml(c.name) + '</option>'; }).join('');
    }
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
    document.getElementById('deadlineEditId').value = '';
    modal.classList.add('active');
  }

  function closeDeadlineModal() { document.getElementById('deadlineModal').classList.remove('active'); }

  function saveDeadlineFromModal(e) {
    e.preventDefault();
    state.deadlines.push({
      id: 'dl-' + Date.now(),
      courseId: document.getElementById('deadlineCourseSelect').value,
      title: document.getElementById('deadlineTitleInput').value.trim(),
      dueDate: document.getElementById('deadlineDateInput').value,
      dueTime: document.getElementById('deadlineTimeInput').value || '23:59',
      weight: parseFloat(document.getElementById('deadlineWeightInput').value) || 0,
      portal: document.getElementById('deadlineLocationInput').value.trim() || 'Canvas',
      completed: false
    });
    saveState();
    closeDeadlineModal();
    renderDeadlines();
    updateOverallKPIs();
    showToast('Deadline added', 'success');
  }

  // =========================================================================
  // 19. Syllabus Parser
  // =========================================================================

  function openImportModal() { document.getElementById('importModal').classList.add('active'); document.getElementById('importPreview').style.display = 'none'; }
  function closeImportModal() { document.getElementById('importModal').classList.remove('active'); }

  function loadSampleSyllabusText() {
    var sample = 'CS106A Programming Methodology\nLectures: Mon/Wed Gates Hall\nAssignment 4 (10%) - 2026-09-22 23:59\nHomework 5: Karel (15%) - 2026-10-02 23:59\nMidterm Exam (25%) - 2026-10-14 14:00\nFinal Examination (50%) - 2026-10-29 23:59';
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
      previewList.innerHTML = '<p><strong>Code:</strong> ' + detectedCode + ' (' + escapeHtml(detectedName) + ')</p><p><strong>Modules:</strong> ' + components.map(function (c) { return c.name + ' [' + c.weight + '%]'; }).join(', ') + '</p><p><strong>Deadlines:</strong> ' + deadlines.length + ' items</p>';
    }
    return { detectedCode: detectedCode, detectedName: detectedName, components: components, deadlines: deadlines };
  }

  function executeSyllabusImport() {
    var raw = document.getElementById('importRawText').value;
    var result = parseSyllabusText(raw);
    if (!result || result.components.length === 0) { showToast('No valid syllabus modules detected.', 'warn'); return; }

    var newCourseId = 'c-' + Date.now();
    state.courses.push({ id: newCourseId, code: result.detectedCode, name: result.detectedName, ects: 5, quartile: 'Fall', components: result.components, targetGrade: state.scale === 'gpa' ? 3.0 : 60 });
    result.deadlines.forEach(function (dl, idx) {
      state.deadlines.push({ id: 'dl-import-' + Date.now() + '-' + idx, courseId: newCourseId, title: dl.title, dueDate: dl.dueDate, dueTime: dl.dueTime, weight: dl.weight,         portal: 'Canvas', completed: false });
    });

    saveState();
    closeImportModal();
    renderCourses();
    renderDeadlines();
    confetti.fire(0.5, 0.4);
    showToast('Course imported: ' + result.detectedCode, 'success');
  }

  // =========================================================================
  // 20. Utility
  // =========================================================================

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
  // 18b. Keep-Style Notes + Todo Lists (modal only — zero page bloat)
  // =========================================================================

  var KEEP_KEY = 'tue_pass_keep_v1';
  var keepNotes = [];
  var keepEditingId = null;

  function persistKeep() {
    try { localStorage.setItem(KEEP_KEY, JSON.stringify(keepNotes)); } catch (e) {}
  }

  function loadKeep() {
    try {
      var raw = localStorage.getItem(KEEP_KEY);
      if (raw) { keepNotes = JSON.parse(raw); normalizeTodos(); ensureNoteOrder(); return; }
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

  var TOPIC_KEY = 'tue_pass_topics_v1';

  function getTopics() {
    try {
      var raw = localStorage.getItem(TOPIC_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  function saveTopics(t) {
    try { localStorage.setItem(TOPIC_KEY, JSON.stringify(t)); } catch (e) {}
  }

  function topicName(id) {
    var t = getTopics().find(function (x) { return x.id === id; });
    return t ? t.name : 'Topic';
  }

  function keepScopeLabel(scope) {
    if (!scope || scope === 'general') return 'General';
    var c = state.courses.find(function (x) { return x.id === scope; });
    if (c) return c.code;
    if (scope.indexOf('topic:') === 0) return topicName(scope.slice(6));
    return 'General';
  }

  function populateKeepScopes(selected) {
    var sel = document.getElementById('keepScope');
    var html = '<option value="general">General</option>' + state.courses.map(function (c) {
      return '<option value="' + c.id + '">' + c.code + ' — ' + escapeHtml(c.name) + '</option>';
    }).join('');
    getTopics().forEach(function (t) {
      html += '<option value="topic:' + t.id + '">' + escapeHtml(t.name) + '</option>';
    });
    sel.innerHTML = html;
    sel.value = selected || 'general';
    refreshTopicUI();
  }

  function refreshTopicUI() {
    var scope = document.getElementById('keepScope').value;
    var isCustom = scope && scope.indexOf('topic:') === 0;
    document.getElementById('btnDelTopic').style.display = isCustom ? '' : 'none';
  }

  function resetComposer() {
    keepEditingId = null;
    document.getElementById('keepTitle').value = '';
    document.getElementById('keepBody').value = '';
    document.getElementById('btnKeepSave').textContent = 'Add note';
  }

  function renderKeepList() {
    var list = document.getElementById('keepList');
    list.innerHTML = '';
    if (!keepNotes.length) {
      list.innerHTML = '<div class="keep-empty">No notes yet. Jot one above.</div>';
      return;
    }
    var sorted = keepNotes.filter(function (n) { return n.type !== 'todo'; });
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
        keepNotes = keepNotes.filter(function (x) { return x.id !== n.id; });
        if (keepEditingId === n.id) resetComposer();
        persistKeep();
        renderKeepList();
        showToast('Note deleted', 'info');
      });
      top.appendChild(chip);
      top.appendChild(del);
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
        body.textContent = n.body;
        card.appendChild(body);
      }

      card.addEventListener('click', function () { loadKeepIntoComposer(n.id); });
      enableCardDrag(card, n.id);
      list.appendChild(card);
    });
    updateDash();
  }

  function enableCardDrag(card, id) {
    card.draggable = true;
    card.addEventListener('dragstart', function (e) {
      card.classList.add('dragging');
      try {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
      } catch (err) {}
    });
    card.addEventListener('dragend', function () {
      card.classList.remove('dragging');
      persistKeepOrder();
    });
  }

  function gridDragAfter(container, x, y, sel) {
    var els = Array.prototype.slice.call(container.querySelectorAll((sel || '.keep-card') + ':not(.dragging)'));
    var best = null, bestScore = Infinity;
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var after = (cy > y + 8) || (Math.abs(cy - y) <= r.height / 2 + 8 && cx > x);
      if (!after) return;
      var score = Math.hypot(cx - x, cy - y);
      if (score < bestScore) { bestScore = score; best = el; }
    });
    return best;
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
    if (!n) return;
    keepEditingId = id;
    document.getElementById('keepTitle').value = n.title || '';
    document.getElementById('keepScope').value = n.scope || 'general';
    document.getElementById('keepBody').value = n.body || '';
    document.getElementById('btnKeepSave').textContent = 'Save changes';
  }

  function saveKeepComposer() {
    var title = document.getElementById('keepTitle').value.trim();
    var scope = document.getElementById('keepScope').value;
    var body = document.getElementById('keepBody').value.trim();
    if (!title && !body) {
      showToast('Write something first', 'warn');
      return;
    }
    if (keepEditingId) {
      var n = keepNotes.find(function (x) { return x.id === keepEditingId; });
      if (n) {
        n.title = title;
        n.body = body;
        n.scope = scope;
        n.updated = Date.now();
      }
    } else {
      keepNotes.unshift({
        id: 'k' + Date.now(),
        title: title,
        body: body,
        type: 'note',
        items: [],
        scope: scope,
        updated: Date.now()
      });
    }
    persistKeep();
    resetComposer();
    document.getElementById('keepScope').value = scope;
    renderKeepList();
    showToast('Note saved', 'success');
  }

  function switchKeepTab(which) {
    document.getElementById('keepTabNotes').classList.toggle('active', which === 'notes');
    document.getElementById('keepTabTodo').classList.toggle('active', which === 'todo');
    document.getElementById('notesTabPane').style.display = which === 'notes' ? '' : 'none';
    document.getElementById('todoTabPane').style.display = which === 'todo' ? '' : 'none';
    if (which === 'todo') renderTodoPane();
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
    var scope = document.getElementById('keepScope').value || 'general';
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
    prog.textContent = items.length ? done + ' of ' + items.length + ' done' : 'Nothing here yet — add your first task above';
    items.map(function (it, i) { return { it: it, i: i }; })
      .sort(function (a, b) { return (a.it.done - b.it.done) || (a.i - b.i); })
      .forEach(function (entry) {
        var row = document.createElement('div');
        row.className = 'todo-row';
        row.dataset.id = entry.it.id;
        row.draggable = true;
        row.addEventListener('dragstart', function (e) {
          row.classList.add('dragging');
          try {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', entry.it.id);
          } catch (err) {}
        });
        row.addEventListener('dragend', function () {
          row.classList.remove('dragging');
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
          renderTodoPane();
        });
        var text = document.createElement('span');
        text.className = 'todo-text' + (entry.it.done ? ' done' : '');
        text.textContent = entry.it.t;
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
    var scope = document.getElementById('keepScope').value || 'general';
    var note = getTaskNote(scope, false);
    var box = document.getElementById('todoList');
    if (!note || !box) return;
    var order = [];
    box.querySelectorAll('[data-id]').forEach(function (el) { order.push(el.dataset.id); });
    if (!order.length) return;
    note.items.sort(function (a, b) { return order.indexOf(a.id) - order.indexOf(b.id); });
    persistKeep();
  }

  function addTodoQuick() {
    var inp = document.getElementById('todoQuickInput');
    var v = inp.value.trim();
    if (!v) return;
    var scope = document.getElementById('keepScope').value || 'general';
    var note = getTaskNote(scope, true);
    note.items.push({ t: v, done: false, id: 'i' + Date.now() });
    note.updated = Date.now();
    persistKeep();
    inp.value = '';
    inp.focus();
    renderTodoPane();
  }
  var whatifCourseId = null;
  function openWhatifModal(courseId) {
    var course = state.courses.find(function (c) { return c.id === courseId; });
    if (!course) return;
    whatifCourseId = courseId;
    var m = calculateCourseGradeMetrics(course);
    var isGpa = state.scale === 'gpa';
    document.getElementById('whatifTitle').textContent = 'What if? (' + course.code + ')';
    document.getElementById('whatifWeight').textContent = '(' + m.pendingWeight + '% pending)';
    var range = document.getElementById('whatifRange');
    range.min = 0;
    range.max = isGpa ? 4 : 100;
    range.step = isGpa ? 0.1 : 1;
    range.value = isGpa ? 3.0 : 60;
    updateWhatifResult();
    document.getElementById('whatifModal').classList.add('active');
  }
  function closeWhatifModal() { document.getElementById('whatifModal').classList.remove('active'); }
  function updateWhatifResult() {
    var course = state.courses.find(function (c) { return c.id === whatifCourseId; });
    var el = document.getElementById('whatifResult');
    if (!course || !el) return;
    var m = calculateCourseGradeMetrics(course);
    var isGpa = state.scale === 'gpa';
    if (m.pendingWeight === 0) {
      el.textContent = 'Locked at ' + m.securedPoints.toFixed(1);
      el.className = 'sim-badge-val grade-secured';
      return;
    }
    var hypo = parseFloat(document.getElementById('whatifRange').value) || 0;
    var proj = m.securedPoints + hypo * (m.pendingWeight / 100);
    var pass = isGpa ? 2.0 : 55;
    el.textContent = proj.toFixed(1);
    el.className = 'sim-badge-val ' + (proj >= (isGpa ? 3.7 : 80) ? 'grade-secured' : proj >= pass ? 'grade-pass' : 'grade-fail');
  }
  function closeCreditsModal() { document.getElementById('creditsModal').classList.remove('active'); }

  function resetAllData() {
    if (confirm('Restore default Stanford demo courses?')) {
      localStorage.removeItem(STORAGE_KEY_COURSES);
      localStorage.removeItem(STORAGE_KEY_DEADLINES);
      loadState();
      renderCourses();
      renderDeadlines();
      updateOverallKPIs();
      showToast('Demo data restored', 'info');
    }
  }

  // =========================================================================
  // 21. Initialization
  // =========================================================================

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    loadState();
    setScale(state.scale);
    renderCourses();
    renderDeadlines();
    updateOverallKPIs();
    updateTimerDisplay();
    renderSprintCount();

    setInterval(function () { updateStanfordClock(); updateOverallKPIs(); updatePanicMeter(); }, 1000);
    updateStanfordClock();
    updatePanicMeter();
    renderHeatmap();

    // Quote of the day + hidden morse eggs
    renderDailyQuote();
    renderYearProgress();
    morseEggs();
    syncReminderBtn();
    setInterval(checkReminders, 60000);
    document.getElementById('btnShuffleQuote').addEventListener('click', shuffleQuote);
    window.addEventListener('resize', fitQuote);

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
    document.addEventListener('click', function (e) {
      var menu = document.getElementById('themeMenu');
      if (menu && menu.classList.contains('open') && !e.target.closest('.theme-picker')) closeThemeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeThemeMenu();
    });
    document.getElementById('btnOpenCredits').addEventListener('click', openCreditsModal);
    var keepListEl = document.getElementById('keepList');
    keepListEl.addEventListener('dragover', function (e) {
      e.preventDefault();
      var dragging = keepListEl.querySelector('.dragging');
      if (!dragging) return;
      var after = gridDragAfter(keepListEl, e.clientX, e.clientY, '.keep-card');
      if (!after) keepListEl.appendChild(dragging);
      else keepListEl.insertBefore(dragging, after);
    });
    keepListEl.addEventListener('drop', function (e) { e.preventDefault(); persistKeepOrder(); });
    var todoListEl = document.getElementById('todoList');
    todoListEl.addEventListener('dragover', function (e) {
      e.preventDefault();
      var dragging = todoListEl.querySelector('.dragging');
      if (!dragging) return;
      var after = gridDragAfter(todoListEl, e.clientX, e.clientY, '.todo-row');
      if (!after) todoListEl.appendChild(dragging);
      else todoListEl.insertBefore(dragging, after);
    });
    todoListEl.addEventListener('drop', function (e) { e.preventDefault(); persistTodoOrder(); });
    document.getElementById('keepTabNotes').addEventListener('click', function () { switchKeepTab('notes'); });
    document.getElementById('keepTabTodo').addEventListener('click', function () { switchKeepTab('todo'); });
    document.getElementById('btnKeepSave').addEventListener('click', saveKeepComposer);
    document.getElementById('btnTodoAdd').addEventListener('click', addTodoQuick);
    document.getElementById('todoQuickInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addTodoQuick(); }
    });
    document.getElementById('keepScope').addEventListener('change', function () { refreshTopicUI(); renderTodoPane(); });
    document.getElementById('btnAddTopic').addEventListener('click', function () {
      var ad = document.getElementById('topicAdder');
      var show = ad.style.display === 'none';
      ad.style.display = show ? '' : 'none';
      if (show) document.getElementById('topicNameInput').focus();
    });
    document.getElementById('btnTopicAdd').addEventListener('click', function () {
      var inp = document.getElementById('topicNameInput');
      var name = inp.value.trim().slice(0, 30);
      if (!name) { showToast('Name the topic first', 'warn'); return; }
      var topics = getTopics();
      var t = { id: 't' + Date.now(), name: name };
      topics.push(t);
      saveTopics(topics);
      inp.value = '';
      document.getElementById('topicAdder').style.display = 'none';
      populateKeepScopes('topic:' + t.id);
      showToast('Topic added', 'success');
    });
    document.getElementById('btnDelTopic').addEventListener('click', function () {
      var scope = document.getElementById('keepScope').value;
      if (!scope || scope.indexOf('topic:') !== 0) return;
      var id = scope.slice(6);
      saveTopics(getTopics().filter(function (t) { return t.id !== id; }));
      keepNotes.forEach(function (n) { if (n.scope === scope) n.scope = 'general'; });
      persistKeep();
      populateKeepScopes('general');
      renderKeepList();
      showToast('Topic deleted — notes moved to General', 'info');
    });
    document.getElementById('btnCloseWhatifModal').addEventListener('click', closeWhatifModal);
    document.getElementById('btnWhatifDone').addEventListener('click', closeWhatifModal);
    document.getElementById('whatifRange').addEventListener('input', updateWhatifResult);
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
      var chips = Array.prototype.slice.call(document.querySelectorAll('.chip-btn'));
      var idx = -1;
      chips.forEach(function (c, i) {
        if (parseInt(c.dataset.duration, 10) === pomodoroState.durationMinutes && c.dataset.phase === pomodoroState.phase) idx = i;
      });
      var next = chips[(idx + 1) % chips.length];
      pomodoroState.durationMinutes = parseInt(next.dataset.duration, 10);
      pomodoroState.phase = next.dataset.phase;
      showToast((pomodoroState.phase === 'focus' ? 'Focus' : 'Break') + ' queued — ' + next.textContent.trim(), 'info');
      syncTimerPhaseUI();
      resetPomodoro();
    });

    document.querySelectorAll('.chip-btn').forEach(function (chip) {
      chip.addEventListener('click', function () {
        pomodoroState.durationMinutes = parseInt(chip.dataset.duration, 10);
        pomodoroState.phase = chip.dataset.phase;
        syncTimerPhaseUI();
        resetPomodoro();
      });
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

    // Mobile nav active state
    var mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    if (mobileNavItems.length) {
      var navObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            mobileNavItems.forEach(function (item) {
              item.classList.toggle('active', item.getAttribute('href') === '#' + id);
            });
          }
        });
      }, { threshold: 0.3 });

      ['radar', 'deadlines', 'focus', 'notes'].forEach(function (id) {
        var section = document.getElementById(id);
        if (section) navObserver.observe(section);
      });
    }
  });
})();
