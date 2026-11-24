/*
 * ItoShiyou cross promotion (official LINE + latest app) for web / Capacitor.
 * Source of truth: https://itoshiyou.github.io/hub/promo.js  Rules: hub/README.md
 *
 * Web pages:   <script src="https://itoshiyou.github.io/hub/promo.js" data-app="my_app" defer></script>
 * Store apps:  copy this file into the app (do not load remote code) and add
 *              the same tag with a local src.
 *
 * - Launch notice: every Nth visit (launch_notice.every), never the first
 *   ones, slides down from the top and hides by itself. Not a modal.
 * - Settings / about: put <div data-ito-promo></div> where the links go.
 * - data-wait="ready": the app calls ItoPromo.ready() after its own startup
 *   dialogs (ads consent / ATT); the notice waits for it (10 s at most).
 * - data-notice="off" disables the notice; data-lang="ja" (default) only
 *   shows it when the page language / browser is Japanese.
 */
(function () {
  'use strict';
  var script = document.currentScript;
  var APP = (script && script.getAttribute('data-app')) || location.hostname;
  var CONFIG_URL =
    (script && script.getAttribute('data-config')) ||
    'https://itoshiyou.github.io/hub/promo.json';
  var NOTICE_OFF = script && script.getAttribute('data-notice') === 'off';
  var WAIT_READY = script && script.getAttribute('data-wait') === 'ready';
  var markReady;
  var appReady = new Promise(function (r) { markReady = r; });
  var CACHE_KEY = 'ito_promo_json';
  var COUNT_KEY = 'ito_promo_launches_' + APP;
  var LINE_GREEN = '#06C755';

  var FALLBACK = {
    enabled: true,
    line_url: 'https://line.me/R/ti/p/@400kkcxl',
    line_copy: '新作やお知らせを LINE でおとどけします',
    apps: [
      {
        id: 'english_lesson',
        name: 'Mimi English',
        copy: 'AI英会話・医学英語をオフラインで',
        url: 'https://englishlesson-eight.vercel.app/',
        icon: 'https://itoshiyou.github.io/hub/icons/english_lesson.png',
      },
    ],
    launch_notice: { every: 3, skip_first: 1, seconds: 6 },
  };

  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) {}
    return null;
  }

  function parse(text) {
    try {
      var j = JSON.parse(text);
      return j && typeof j === 'object' && !Array.isArray(j) ? j : null;
    } catch (e) {
      return null;
    }
  }

  var config = parse(store(CACHE_KEY) || '') || FALLBACK;

  function lineUrl(c) {
    var by = c.line_url_by_app || {};
    return by[APP] || c.line_url || '';
  }

  function latest(c) {
    var apps = Array.isArray(c.apps) ? c.apps : [];
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      if (a && a.id !== APP && a.url && a.name) return a;
    }
    return null;
  }

  function tracked(url) {
    try {
      var u = new URL(url);
      if (u.hostname === 'apps.apple.com') {
        if (!u.searchParams.has('ct')) u.searchParams.set('ct', APP);
      } else {
        if (!u.searchParams.has('utm_source')) u.searchParams.set('utm_source', APP);
        if (!u.searchParams.has('utm_medium')) u.searchParams.set('utm_medium', 'web');
        if (!u.searchParams.has('utm_campaign')) u.searchParams.set('utm_campaign', 'cross_promo');
      }
      return u.toString();
    } catch (e) {
      return url;
    }
  }

  function open(url) {
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function japanese() {
    if (script && script.getAttribute('data-lang') === 'any') return true;
    var lang = (document.documentElement.lang || navigator.language || 'ja').toLowerCase();
    return lang.indexOf('ja') === 0;
  }

  function el(tag, css, text) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text) e.textContent = text;
    return e;
  }

  function icon(app, size) {
    var box = el(
      'span',
      'flex:none;display:inline-block;width:' + size + 'px;height:' + size + 'px;border-radius:' +
        Math.round(size * 0.22) + 'px;overflow:hidden;background:rgba(127,127,127,.2)'
    );
    if (app.icon) {
      var img = el('img', 'width:100%;height:100%;display:block');
      img.src = app.icon;
      img.alt = '';
      img.onerror = function () { img.remove(); };
      box.appendChild(img);
    }
    return box;
  }

  function lineBadge(size) {
    var b = el(
      'span',
      'flex:none;display:inline-flex;align-items:center;justify-content:center;width:' + size +
        'px;height:' + size + 'px;border-radius:' + Math.round(size * 0.3) + 'px;background:' +
        LINE_GREEN + ';color:#fff;font:700 ' + Math.round(size * 0.3) + 'px/1 sans-serif',
      'LINE'
    );
    return b;
  }

  /* ---------- settings / about block ---------- */
  function renderPanels(force) {
    var nodes = document.querySelectorAll(force ? '[data-ito-promo]' : '[data-ito-promo]:not([data-ito-promo-done])');
    if (!nodes.length) return;
    var c = config;
    var line = lineUrl(c);
    var app = latest(c);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.setAttribute('data-ito-promo-done', '');
      n.textContent = '';
      if (c.enabled === false || !japanese() || (!line && !app)) continue;
      if (line) n.appendChild(row(lineBadge(32), '公式LINE', c.line_copy || '', function () { open(tracked(lineUrl(config))); }));
      if (app) n.appendChild(row(icon(app, 32), '最新アプリ「' + app.name + '」', app.copy || '', function () {
        var a = latest(config); if (a) open(tracked(a.url));
      }));
    }
  }

  function row(left, title, sub, onClick) {
    var b = el(
      'button',
      'display:flex;align-items:center;gap:12px;width:100%;padding:10px 4px;background:none;border:0;' +
        'color:inherit;font:inherit;text-align:left;cursor:pointer'
    );
    b.type = 'button';
    var t = el('span', 'flex:1;min-width:0;display:flex;flex-direction:column');
    t.appendChild(el('span', 'font-weight:600', title));
    if (sub) t.appendChild(el('span', 'font-size:.8em;opacity:.7', sub));
    b.appendChild(left);
    b.appendChild(t);
    b.appendChild(el('span', 'opacity:.5', '›'));
    b.addEventListener('click', onClick);
    return b;
  }

  /* ---------- launch notice ---------- */
  function noticeDue(c) {
    var n = c.launch_notice || {};
    var every = typeof n.every === 'number' ? n.every : 3;
    var skip = typeof n.skip_first === 'number' ? n.skip_first : 1;
    var count = (parseInt(store(COUNT_KEY) || '0', 10) || 0) + 1;
    store(COUNT_KEY, String(count));
    return {
      due: c.enabled !== false && every > 0 && count > skip && count % every === 0,
      index: every > 0 ? Math.floor(count / every) : 0,
    };
  }

  function showNotice(index) {
    var c = config;
    if (c.enabled === false || !japanese()) return;
    var line = lineUrl(c);
    var app = latest(c);
    if (!line && !app) return;
    var isLine = !!line && (!app || index % 2 === 0);
    var seconds = (c.launch_notice && c.launch_notice.seconds) || 6;

    var card = el(
      'div',
      'position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top, 0px) + 8px);' +
        'max-width:520px;margin:0 auto;z-index:2147483000;display:flex;align-items:center;gap:12px;' +
        'padding:10px 6px 10px 14px;border-radius:16px;background:#fff;color:#222;' +
        'box-shadow:0 8px 24px rgba(0,0,0,.18);font-family:inherit;cursor:pointer;' +
        'transform:translateY(-160%);transition:transform .38s cubic-bezier(.2,1.4,.4,1)'
    );
    card.setAttribute('role', 'status');
    if (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) {
      card.style.background = '#2b2b2f';
      card.style.color = '#f2f2f2';
    }
    card.appendChild(isLine ? lineBadge(34) : icon(app, 36));
    var t = el('div', 'flex:1;min-width:0');
    t.appendChild(el('div', 'font-weight:600;font-size:14px', isLine ? '公式LINEはじめました' : '新作「' + app.name + '」'));
    t.appendChild(
      el('div', 'font-size:11px;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis',
        isLine ? c.line_copy || '' : app.copy || '')
    );
    card.appendChild(t);
    var x = el('button', 'flex:none;width:40px;height:40px;border:0;background:none;color:inherit;font-size:20px;cursor:pointer', '×');
    x.type = 'button';
    x.setAttribute('aria-label', '閉じる');
    card.appendChild(x);

    function hide() {
      card.style.transform = 'translateY(-160%)';
      setTimeout(function () { card.remove(); }, 450);
    }
    x.addEventListener('click', function (e) { e.stopPropagation(); hide(); });
    card.addEventListener('click', function () {
      hide();
      open(tracked(isLine ? line : app.url));
    });
    document.body.appendChild(card);
    card.getBoundingClientRect(); // commit the start position so the slide animates
    card.style.transform = 'translateY(0)';
    setTimeout(hide, seconds * 1000);
  }

  /* ---------- boot ---------- */
  var refreshed = fetch(CONFIG_URL, { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.text() : null; })
    .then(function (text) {
      var j = text && parse(text);
      if (j) {
        config = j;
        store(CACHE_KEY, text);
        renderPanels(true);
      }
    })
    .catch(function () {});

  function start() {
    renderPanels();
    // SPAs (React etc.) add the placeholder later: fill it when it appears.
    if (window.MutationObserver) {
      var pending = false;
      new MutationObserver(function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () { pending = false; renderPanels(); });
      }).observe(document.body, { childList: true, subtree: true });
    }
    if (NOTICE_OFF) return;
    var d = noticeDue(config);
    if (!d.due) return;
    var gate = WAIT_READY
      ? Promise.race([appReady, new Promise(function (r) { setTimeout(r, 10000); })])
      : Promise.resolve();
    gate.then(function () {
      var wait = new Promise(function (r) { setTimeout(r, 3000); });
      return Promise.race([refreshed, wait]);
    }).then(function () {
      setTimeout(function () { showNotice(d.index); }, 1200);
    });
  }

  window.ItoPromo = {
    render: function () { renderPanels(true); },
    ready: function () { markReady(); },
    openLine: function () { var u = lineUrl(config); if (u) open(tracked(u)); },
    get config() { return config; },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
