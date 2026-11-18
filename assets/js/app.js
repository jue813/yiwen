/* 译问 · 公共脚本：导航、实时钟、搜索、显现动画、滚动轨、视差 */

(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------------- 导航 ---------------- */
  const nav = $('#nav');
  const toTop = $('#toTop');
  const subHero = document.querySelector('.sub-hero');
  const navThreshold = () => (subHero ? subHero.offsetHeight - 56 : window.innerHeight * 0.72);
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-solid', y > navThreshold());
    if (toTop) toTop.classList.toggle('is-on', y > 600);
    parallax(y);
    railFill(y);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


  /* ---------------- 移动端菜单 ---------------- */
  const navToggle = $('#navToggle');
  const navLinks = document.querySelector('.nav__links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open');
    });
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
      }
    });
  }

  /* ---------------- 首屏视差 ---------------- */
  const layers = $('#heroLayers');
  function parallax(y) {
    if (!layers) return;
    const h = window.innerHeight;
    if (y > h) return;
    layers.style.transform = `translate3d(0, ${y * 0.42}px, 0)`;
  }

  /* ---------------- 左侧进度轨 ---------------- */
  const railFillEl = $('#railFill');
  function railFill(y) {
    if (!railFillEl) return;
    const total = document.body.scrollHeight - window.innerHeight;
    railFillEl.style.height = Math.min(100, (y / total) * 100) + '%';
    const dots = $$('.rail__dot');
    if (!dots.length) return;
    const sectionEls = $$('[data-r]');
    let idx = 0;
    sectionEls.forEach((el, i) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.55) idx = i;
    });
    dots.forEach(d => d.classList.toggle('is-on', +d.dataset.dot === idx));
  }

  /* ---------------- 实时钟 ---------------- */
  const tickG = $('#tickMarks');
  if (tickG) {
    let html = '';
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const r1 = i % 5 === 0 ? 34 : 37, r2 = 41;
      const x1 = 50 + Math.cos(a) * r1, y1 = 50 + Math.sin(a) * r1;
      const x2 = 50 + Math.cos(a) * r2, y2 = 50 + Math.sin(a) * r2;
      html += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="rgba(255,255,255,${i % 5 === 0 ? 0.55 : 0.22})" stroke-width="${i % 5 === 0 ? 1 : 0.5}"/>`;
    }
    tickG.innerHTML = html;
  }

  const hh = $('#handHour'), mm = $('#handMin'), ss = $('#handSec');
  const hubNow = $('#hubNow');
  const heroNow = $('#heroNow');
  function clockTick() {
    const d = new Date();
    const s = d.getSeconds(), mi = d.getMinutes(), h = d.getHours() % 12;
    if (ss) ss.setAttribute('transform', `rotate(${s * 6} 50 50)`);
    if (mm) mm.setAttribute('transform', `rotate(${mi * 6 + s * 0.1} 50 50)`);
    if (hh) hh.setAttribute('transform', `rotate(${h * 30 + mi * 0.5} 50 50)`);
    const t = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    if (hubNow) hubNow.textContent = t;
    if (heroNow) {
      const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
      heroNow.textContent = `${t} · 周${week}`;
    }
  }
  clockTick();
  setInterval(clockTick, 1000);

  /* ---------------- 首屏光尘 ---------------- */
  const dust = $('#heroDust');
  if (dust) {
    let html = '';
    for (let i = 0; i < 16; i++) {
      const size = 2 + Math.random() * 4;
      html += `<i style="left:${Math.random() * 100}%;top:${35 + Math.random() * 62}%;width:${size}px;height:${size}px;animation-duration:${9 + Math.random() * 12}s;animation-delay:${-Math.random() * 15}s;opacity:${0.3 + Math.random() * 0.5}"></i>`;
    }
    dust.innerHTML = html;
  }

  /* ---------------- 元素显现 ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach(el => io.observe(el));

  /* ---------------- 全局搜索 ---------------- */
  const input = $('#searchInput');
  const pop = $('#searchPop');
  if (input && pop && typeof YW !== 'undefined') {
    const pool = [];
    YW.notices.forEach(n => pool.push({ cat: '通知', t: n.title, url: 'page-notice.html' }));
    YW.competitions.forEach(c => pool.push({ cat: '竞赛', t: c.name, url: 'page-competition.html' }));
    YW.activities.forEach(a => pool.push({ cat: '活动', t: a.name, url: 'page-activity.html' }));
    YW.clubs.forEach(c => pool.push({ cat: '社团', t: c.name, url: 'page-club.html' }));

    const render = (q) => {
      q = q.trim().toLowerCase();
      if (!q) { pop.classList.remove('is-open'); pop.innerHTML = ''; return; }
      const res = pool.filter(p => p.t.toLowerCase().includes(q)).slice(0, 8);
      pop.innerHTML = res.length
        ? res.map(r => `<a class="search-pop__item" href="${r.url}"><span class="search-pop__cat">${r.cat}</span><span>${r.t}</span></a>`).join('')
        : '<div class="search-pop__empty">没有匹配的内容，换个说法试试</div>';
      pop.classList.add('is-open');
    };
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('focus', () => render(input.value));
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav__search') && !e.target.closest('#searchPop')) pop.classList.remove('is-open');
    });
  }

  /* ---------------- 四时换天色 ---------------- */
  const themes = {
    dawn:  { paper: '#eef1f0', paper2: '#e4e9e6', seal: '#b53232' },
    day:   { paper: '#f2f3ee', paper2: '#e9ece6', seal: '#b53232' },
    dusk:  { paper: '#f3efea', paper2: '#eae4dc', seal: '#b0472f' },
    night: { paper: '#e9ecec', paper2: '#dfe4e4', seal: '#a83a3a' }
  };
  window.ywTheme = function (key) {
    const t = themes[key] || themes.dawn;
    const r = document.documentElement.style;
    r.setProperty('--paper', t.paper);
    r.setProperty('--paper-2', t.paper2);
    r.setProperty('--seal', t.seal);
    document.documentElement.dataset.light = key;
  };

  onScroll();
})();
