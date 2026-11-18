/* 译问 · 首页交互：钟面导航 / 原文对照 / 四时换光 / 社团墙 */

(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);

  /* ================= 钟面 ================= */
  const dial = $('#dial');
  const hand = $('#dialHand');
  const panel = $('#panel');
  const hubLabel = $('#hubLabel');

  if (dial && panel && typeof YW !== 'undefined') {

    /* 刻度 */
    const ticks = $('#dialTicks');
    if (ticks) {
      let html = '';
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const major = i % 5 === 0;
        const r1 = major ? 182 : 186, r2 = 193;
        const x1 = 200 + Math.cos(a) * r1, y1 = 200 + Math.sin(a) * r1;
        const x2 = 200 + Math.cos(a) * r2, y2 = 200 + Math.sin(a) * r2;
        html += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="rgba(29,36,34,${major ? 0.42 : 0.14})" stroke-width="${major ? 1.4 : 0.8}"/>`;
      }
      ticks.innerHTML = html;
    }

    /* 六个扇区（用于高亮） */
    const secG = $('#dialSectors');
    const sectorPaths = {};
    if (secG) {
      YW.tabs.forEach((t) => {
        const a1 = ((t.angle - 29) * Math.PI) / 180;
        const a2 = ((t.angle + 29) * Math.PI) / 180;
        const R1 = 168, R2 = 179;
        const pt = (r, a) => `${(200 + Math.cos(a) * r).toFixed(1)} ${(200 + Math.sin(a) * r).toFixed(1)}`;
        const d = `M${pt(R1, a1)} A${R1} ${R1} 0 0 1 ${pt(R1, a2)} L${pt(R2, a2)} A${R2} ${R2} 0 0 0 ${pt(R2, a1)} Z`;
        sectorPaths[t.key] = `<path d="${d}" fill="rgba(181,50,50,0.16)" stroke="rgba(181,50,50,0.26)" stroke-width="0.8" opacity="0" data-sec="${t.key}" style="transition:opacity .5s"/>`;
      });
      secG.innerHTML = Object.values(sectorPaths).join('');
    }

    /* 标签 */
    const labels = YW.tabs.map((t, i) => {
      const rad = (t.angle * Math.PI) / 180;
      const x = 50 + Math.cos(rad) * 38;
      const y = 50 + Math.sin(rad) * 38;
      return `<button class="dial__label" data-tab="${t.key}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;transform:translate(-50%,-50%)">${t.label}</button>`;
    }).join('');
    dial.insertAdjacentHTML('beforeend', labels);

    /* 面板内容 */
    const cd = (dateStr) => {
      const d = new Date(dateStr.replace(/-/g, '/'));
      const diff = Math.ceil((d - new Date()) / 86400000);
      return diff > 0 ? diff : 0;
    };

    const panes = {
      notice: () => `
        <div class="panel__kicker">NOTICE / 通知精读 · 共 ${YW.notices.length} 条，先看 3 条</div>
        <h3 class="panel__title"><span class="num">01</span>今天要办的事，只有三件</h3>
        <p class="panel__desc">把红头文件拆成「谁、做什么、什么时候、注意什么」，读完就能动手。</p>
        <div class="nlist">
          ${YW.notices.slice(0, 3).map(n => `
            <div class="nitem">
              <span class="nitem__date">${n.date}</span>
              <div>
                <div class="nitem__t">${n.title}</div>
                <div class="nitem__s">${n.summary}</div>
              </div>
              <span class="nitem__tag">${n.cat}</span>
            </div>`).join('')}
        </div>
        <a class="panel__more" href="page-notice.html">全部通知 →</a>`,

      competition: () => `
        <div class="panel__kicker">COMPETITION / 竞赛 · 共 ${YW.competitions.length} 项</div>
        <h3 class="panel__title"><span class="num">02</span>别让截止日期先到</h3>
        <p class="panel__desc">国、省、市、校四级赛事统一收口，倒计时按天算。</p>
        <div class="nlist">
          ${YW.competitions.slice(0, 3).map(c => `
            <div class="nitem" style="grid-template-columns:1fr auto auto">
              <div>
                <div class="nitem__t">${c.name}</div>
                <div class="nitem__s">${c.cat} · ${c.org}</div>
              </div>
              <span class="nitem__date" style="font-size:11px">${c.deadline}</span>
              <span class="nitem__tag">${cd(c.deadline)} 天</span>
            </div>`).join('')}
        </div>
        <a class="panel__more" href="page-competition.html">全部竞赛 →</a>`,

      activity: () => `
        <div class="panel__kicker">ACTIVITY / 活动 · 本周 ${YW.activities.length} 场</div>
        <h3 class="panel__title"><span class="num">03</span>本周校园里正在发生什么</h3>
        <p class="panel__desc">讲座、演出、志愿、实践，按类型筛，按时间排。</p>
        <div class="nlist">
          ${YW.activities.slice(0, 3).map(a => `
            <div class="nitem">
              <span class="nitem__date" style="width:auto">${a.date}</span>
              <div>
                <div class="nitem__t">${a.name}</div>
                <div class="nitem__s">${a.place} · ${a.org}</div>
              </div>
              <span class="nitem__tag">${a.cat}</span>
            </div>`).join('')}
        </div>
        <a class="panel__more" href="page-activity.html">全部活动 →</a>`,

      club: () => `
        <div class="panel__kicker">CLUB / 社团 · 全校 42 个</div>
        <h3 class="panel__title"><span class="num">04</span>四十二个社团，先看照片再决定</h3>
        <p class="panel__desc">真实活动照片与招新信息，不用在群里问“这个社怎么样”。</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px">
          ${YW.clubs.slice(0, 4).map(c => `
            <a href="page-club.html" style="border:1px solid var(--line);overflow:hidden;background:var(--card)">
              <div style="aspect-ratio:16/10;overflow:hidden">
                <img src="assets/img/${c.img}" alt="${c.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover">
              </div>
              <div style="padding:9px 10px">
                <div style="font-family:var(--serif);font-size:13.5px;font-weight:700">${c.name}</div>
                <div style="font-size:11px;color:var(--ink-3);margin-top:2px">${c.line}</div>
              </div>
            </a>`).join('')}
        </div>
        <a class="panel__more" href="page-club.html">全部社团 →</a>`,

      credit: () => `
        <div class="panel__kicker">CREDIT / 学分 · 素质拓展 8 学分</div>
        <h3 class="panel__title"><span class="num">05</span>毕业还差多少，一眼看到</h3>
        <p class="panel__desc">素质拓展 8 学分四个模块的完成度，缺口和补法都写清楚。</p>
        <div style="margin-top:24px">
          ${YW.credit.modules.map(m => {
            const pct = Math.min(100, (m.done / m.need) * 100);
            return `<div style="margin-bottom:16px">
              <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px">
                <span>${m.name}</span><span style="font-family:var(--serif);color:var(--seal)">${m.done} / ${m.need}</span>
              </div>
              <div style="height:4px;background:rgba(29,36,34,.08)">
                <div style="height:100%;width:${pct}%;background:var(--seal);transition:width 1s var(--ease)"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
        <a class="panel__more" href="page-credit.html">学分详情 →</a>`,

      ask: () => `
        <div class="panel__kicker">ASK / 问答 · 已收录 5 条常见问题</div>
        <h3 class="panel__title"><span class="num">06</span>问得明白，答得清楚</h3>
        <p class="panel__desc">“奖学金怎么评”“补考什么时候”，不用翻十份文件。</p>
        <div style="margin-top:20px">
          ${['补考一般在什么时候？', '素质拓展学分怎么补？', '转专业还来得及吗？', '奖学金评定看哪些指标？'].map(q => `
            <a href="page-ask.html" style="display:block;padding:12px 0;border-bottom:1px dashed var(--line);font-size:13.5px;color:var(--ink-2)">
              <span style="color:var(--seal);font-family:var(--serif);margin-right:8px">Q</span>${q}
            </a>`).join('')}
        </div>
        <a class="panel__more" href="page-ask.html">去提问 →</a>`
    };

    let current = null;
    function select(key, animate = true) {
      if (key === current) return;
      current = key;
      const tab = YW.tabs.find(t => t.key === key);

      // 指针
      hand.style.transform = `translate(-50%, -100%) rotate(${tab.angle + 90}deg)`;

      // 扇区
      document.querySelectorAll('[data-sec]').forEach(p => {
        p.setAttribute('opacity', p.dataset.sec === key ? '1' : '0');
      });

      // 标签
      document.querySelectorAll('.dial__label').forEach(l => {
        l.classList.toggle('is-on', l.dataset.tab === key);
      });
      if (hubLabel) hubLabel.textContent = tab.label;

      // 面板
      panel.innerHTML = `<div class="panel__pane is-on">${panes[key]()}</div>`;
    }

    document.querySelectorAll('.dial__label').forEach(l => {
      l.addEventListener('click', () => select(l.dataset.tab));
      l.addEventListener('mouseenter', () => {
        hand.style.transform = `translate(-50%, -100%) rotate(${YW.tabs.find(t => t.key === l.dataset.tab).angle + 90}deg)`;
      });
    });
    dial.addEventListener('mouseleave', () => {
      const t = YW.tabs.find(t => t.key === current);
      if (t) hand.style.transform = `translate(-50%, -100%) rotate(${t.angle + 90}deg)`;
    });

    select('notice', false);
  }

  /* ================= 原文 → 行动 ================= */
  const docOriginal = $('#docOriginal');
  if (docOriginal && typeof YW !== 'undefined') {
    const n = YW.notices[2];
    docOriginal.innerHTML = `
      <div class="doc-no">西译教发〔2022〕17号</div>
      <div class="doc-body">
        ${n.original.map(p => `<p>${p.replace(/本科 8 学分/g, '<span class="hl">本科 8 学分</span>').replace(/未完成 2 学分者不予毕业/g, '<span class="hl">未完成 2 学分者不予毕业</span>')}</p>`).join('')}
      </div>
      <div class="seal-stamp">教务处<br>2022.09</div>`;

    $('#briefList').innerHTML = n.brief.map(([k, v]) => `<li><span class="k">${k}</span><span class="v">${v}</span></li>`).join('');
    $('#handNote').textContent = n.note;

    $('#factsRow').innerHTML = `
      <div class="fact"><small>毕业门槛</small><b>8 学分</b><span>本科素质拓展必修</span></div>
      <div class="fact"><small>经典阅读</small><b>≥ 2 学分</b><span>四个模块里不能替代</span></div>
      <div class="fact"><small>模块数量</small><b>4 个</b><span>创新创业 / 文体志愿 / 阅读 / 实践周</span></div>`;

    // 播放批注动画
    const human = $('#docHuman');
    const doPlay = () => {
      human.classList.remove('is-play');
      void human.offsetWidth;
      human.classList.add('is-play');
    };
    const io2 = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { doPlay(); io2.disconnect(); } });
    }, { threshold: 0.3 });
    io2.observe(human);
  }

  /* ================= 四时 ================= */
  const lightView = $('#lightView');
  if (lightView && typeof YW !== 'undefined') {
    const capEl = $('#lightCap');
    const descEl = $('#lightDesc');
    const tabsEl = $('#lightTabs');

    // 图片层
    const imgs = YW.light.map((l, i) =>
      `<img src="assets/img/${l.img}" alt="${l.cap}" class="${i === 0 ? 'is-on' : ''}" data-light="${l.key}">`).join('');
    lightView.insertAdjacentHTML('afterbegin', imgs);

    tabsEl.innerHTML = YW.light.map((l, i) => `
      <li>
        <button class="light__tab ${i === 0 ? 'is-on' : ''}" data-light="${l.key}">
          <span class="t">${l.name}</span>
          <span style="font-size:12px;color:var(--ink-3);flex:1;text-align:left;padding-left:8px">${l.desc.split('，')[0]}</span>
          <span class="d">${l.time}</span>
        </button>
      </li>`).join('');

    function setLight(key) {
      document.querySelectorAll('#lightView img').forEach(im => {
        im.classList.toggle('is-on', im.dataset.light === key);
      });
      document.querySelectorAll('.light__tab').forEach(t => {
        t.classList.toggle('is-on', t.dataset.light === key);
      });
      const l = YW.light.find(x => x.key === key);
      capEl.textContent = l.cap;
      descEl.textContent = l.desc;
      if (window.ywTheme) window.ywTheme(key);
    }

    tabsEl.querySelectorAll('.light__tab').forEach(t => {
      t.addEventListener('click', () => setLight(t.dataset.light));
      t.addEventListener('mouseenter', () => {
        document.querySelectorAll('#lightView img').forEach(im => {
          im.classList.toggle('is-on', im.dataset.light === t.dataset.light);
        });
      });
    });
    setLight('dawn');
  }

  /* ================= 社团墙 ================= */
  const wall = $('#clubWall');
  if (wall && typeof YW !== 'undefined') {
    wall.innerHTML = YW.clubs.slice(0, 6).map(c => `
      <a class="club" href="page-club.html">
        <div class="club__img">
          <img src="assets/img/${c.img}" alt="${c.name}" loading="lazy">
          <span class="club__cat">${c.cat}</span>
        </div>
        <div class="club__cap">
          <div class="club__name">${c.name}</div>
          <div class="club__line">${c.line}</div>
        </div>
      </a>`).join('');
  }

  /* ================= 学分环 ================= */
  const ring = $('#creditRing');
  if (ring && typeof YW !== 'undefined') {
    const pct = YW.credit.done / YW.credit.total;
    const dash = 2 * Math.PI * 42;
    ring.setAttribute('stroke-dasharray', dash.toFixed(1));
    ring.setAttribute('stroke-dashoffset', dash.toFixed(1));
    const io3 = new IntersectionObserver((es) => {
      es.forEach(e => {
        if (e.isIntersecting) {
          ring.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.22,.61,.36,1)';
          ring.setAttribute('stroke-dashoffset', (dash * (1 - pct)).toFixed(1));
          io3.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io3.observe(ring);
  }
})();
