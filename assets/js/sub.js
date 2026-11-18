/* 译问 · 子页面渲染：通知 / 竞赛 / 活动 / 社团 / 学分 / 问答 */

(function () {
  'use strict';
  const app = document.getElementById('pageApp');
  if (!app || typeof YW === 'undefined') return;

  const page = document.body.dataset.page;
  const days = (d) => {
    const t = new Date(d.replace(/-/g, '/'));
    return Math.max(0, Math.ceil((t - new Date()) / 86400000));
  };
  const uniq = (arr) => Array.from(new Set(arr));

  /* ---------- 通用工具条 ---------- */
  function toolbar(cats, count, label) {
    return `
      <div class="sub-toolbar">
        <div class="chips" id="chips">
          <button class="chip is-on" data-cat="all">全部</button>
          ${cats.map(c => `<button class="chip" data-cat="${c}">${c}</button>`).join('')}
        </div>
        <span class="sub-count">共 ${count} ${label}</span>
      </div>`;
  }
  function bindFilter(listEl, renderFn, items) {
    const chips = document.querySelectorAll('#chips .chip');
    if (!chips.length) return;
    chips.forEach(ch => {
      ch.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('is-on'));
        ch.classList.add('is-on');
        const cat = ch.dataset.cat;
        const filtered = cat === 'all' ? items : items.filter(i => i.cat === cat);
        listEl.innerHTML = renderFn(filtered);
      });
    });
  }

  /* ---------- 通知 ---------- */
  if (page === 'notice') {
    const cats = uniq(YW.notices.map(n => n.cat));
    const row = (n) => `
      <article class="notice-row" data-id="${n.id}">
        <div class="notice-row__date">${n.date}</div>
        <div>
          <h3>${n.title}</h3>
          <p>${n.summary}</p>
          ${n.no ? `<span class="notice-row__no">${n.no}</span>` : ''}
        </div>
        <div class="notice-row__tags">
          <span class="badge">${n.cat}</span>
        </div>
      </article>`;
    const detail = (n) => `
      <div class="notice-detail">
        <div class="notice-detail__head">
          <button class="notice-detail__back" id="detailBack">← 返回</button>
          <div class="notice-detail__t">
            <h2>${n.title}</h2>
            <div class="notice-detail__meta">${n.no || n.cat} · ${n.date}</div>
          </div>
          ${n.pdf ? `<a class="btn btn--seal" href="${n.pdf}" target="_blank" rel="noopener">查看原始文件 PDF ↗</a>` : ''}
        </div>
        <div class="reader">
          <div>
            <div class="reader__col-h"><h3>官方原文</h3><span>${n.no || '教务处'}</span></div>
            <div class="doc-original">
              <div class="doc-no">${n.no || ''}</div>
              <div class="doc-body">${n.original.map(p => `<p>${p}</p>`).join('')}</div>
              <div class="seal-stamp">教务处<br>${n.date}</div>
            </div>
          </div>
          <div>
            <div class="reader__col-h"><h3>译问批注</h3><span>读完约 40 秒 · ${n.brief.length} 条要点</span></div>
            <div class="doc-human is-play">
              <div class="doc-human__head"><span class="who">要点版</span><span class="tm">${n.brief.length} 条要点</span></div>
              <ul class="brief">${n.brief.map(([k, v]) => `<li><span class="k">${k}</span><span class="v">${v}</span></li>`).join('')}</ul>
              <div class="hand-note">${n.note}</div>
            </div>
          </div>
        </div>
      </div>`;
    const renderList = (arr) => {
      app.innerHTML = toolbar(cats, YW.notices.length, '条通知') + `<div class="notice-list" id="list">${arr.map(row).join('')}</div>`;
      document.getElementById('list').addEventListener('click', (e) => {
        const r = e.target.closest('.notice-row');
        if (!r) return;
        const n = YW.notices.find(x => x.id === r.dataset.id);
        if (n) {
          app.innerHTML = detail(n);
          document.getElementById('detailBack').addEventListener('click', () => renderList(YW.notices));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    };
    renderList(YW.notices);
    bindFilter(document.getElementById('list'), (arr) => arr.map(row).join(''), YW.notices);
  }

  /* ---------- 竞赛 ---------- */
  if (page === 'competition') {
    const cats = uniq(YW.competitions.map(c => c.cat));
    const card = (c) => `
      <article class="comp">
        <div class="comp__top">
          <span class="badge">${c.cat}</span>
          <span class="badge badge--mute">${c.status}</span>
        </div>
        <h3>${c.name}</h3>
        <p>${c.intro}</p>
        <p style="color:var(--ink-3);font-size:12px">${c.require}</p>
        <div style="font-size:12px;color:var(--ink-2);margin-top:8px;line-height:1.9">
          ${c.register ? `<div>报名时间：${c.register}</div>` : ''}
          <div>截止时间：${c.deadline.replace(/-/g, '.')}</div>
        </div>
        <div class="comp__foot">
          <div class="comp__cd"><b>${days(c.deadline)}</b><small>天后截止</small></div>
          <div class="comp__meta">${c.org}${c.url ? `<br><a href="${c.url}" target="_blank" rel="noopener" style="color:var(--seal);border-bottom:1px solid rgba(181,50,50,.4)">官方网站 ↗</a>` : ''}${c.pdf ? `<br><a href="${c.pdf}" target="_blank" rel="noopener" style="color:var(--seal);border-bottom:1px solid rgba(181,50,50,.4)">通知原文 ↗</a>` : ''}</div>
        </div>
      </article>`;
    app.innerHTML = toolbar(cats, YW.competitions.length, '项竞赛') + `<div class="grid-2" id="list">${YW.competitions.map(card).join('')}</div>`;
    bindFilter(document.getElementById('list'), (arr) => arr.map(card).join(''), YW.competitions);
  }

  /* ---------- 活动 ---------- */
  if (page === 'activity') {
    const cats = uniq(YW.activities.map(a => a.cat));
    const row = (a) => `
      <article class="notice-row">
        <div class="notice-row__date" style="font-family:var(--serif);font-size:13px;color:var(--ink-2)">${a.date}</div>
        <div>
          <h3>${a.name}</h3>
          <p>${a.intro}</p>
          <p style="color:var(--ink-3);font-size:12px;margin-top:6px">${a.place} · 主办：${a.org}</p>
        </div>
        <div class="notice-row__tags"><span class="badge">${a.cat}</span></div>
      </article>`;
    app.innerHTML = toolbar(cats, YW.activities.length, '场活动') + `<div class="notice-list" id="list">${YW.activities.map(row).join('')}</div>`;
    bindFilter(document.getElementById('list'), (arr) => arr.map(row).join(''), YW.activities);
  }

  /* ---------- 社团 ---------- */
  if (page === 'club') {
    const cats = uniq(YW.clubs.map(c => c.cat));
    const card = (c) => `
      <article class="club-card">
        <div class="club-card__media">
          <img src="assets/img/${c.img}" alt="${c.name} 活动照片" loading="lazy">
          <span class="badge">${c.cat}</span>
        </div>
        <div class="club-card__body">
          <h3>${c.name}</h3>
          <p>${c.line}</p>
          <p style="color:var(--ink-3);font-size:12px;margin-top:8px;line-height:1.8">${c.desc}</p>
        </div>
      </article>`;
    app.innerHTML = toolbar(cats, '42', '个社团（展示 10 个实拍）') + `<div class="club-grid" id="list">${YW.clubs.map(card).join('')}</div>`;
    bindFilter(document.getElementById('list'), (arr) => arr.map(card).join(''), YW.clubs);
  }

  /* ---------- 学分 ---------- */
  if (page === 'credit') {
    const m = YW.credit;
    app.innerHTML = `
      <div class="credit-cards">
        <div class="credit-card">
          <small>TOTAL / 素质拓展</small>
          <b>${m.total}<em>学分（本科）</em></b>
          <p>修满方可毕业，四个模块均需达标</p>
        </div>
        <div class="credit-card">
          <small>DONE / 已完成</small>
          <b style="color:var(--seal)">${m.done}<em>学分</em></b>
          <p>还剩 ${(m.total - m.done).toFixed(1)} 学分，其中实践周为 0</p>
        </div>
        <div class="credit-card">
          <small>MAX / 单次转换上限</small>
          <b>30<em>学分</em></b>
          <p>竞赛、证书、论文等成果可折算课程学分</p>
        </div>
      </div>

      <div class="credit-grid">
        <div>
          <h3 class="panel__title" style="margin-bottom:16px"><span class="num">A</span>四个模块完成度</h3>
          ${m.modules.map(x => {
            const pct = Math.min(100, (x.done / x.need) * 100);
            return `<div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px dashed var(--line)">
              <div style="display:flex;justify-content:space-between;align-items:baseline">
                <span style="font-family:var(--serif);font-size:15px;font-weight:700">${x.name}${x.pdf ? ` <a href="${x.pdf}" target="_blank" rel="noopener" style="font-size:11px;color:var(--seal);border:1px solid rgba(181,50,50,.3);padding:1px 6px;border-radius:2px;margin-left:4px;font-weight:400;font-family:var(--hei)">原文 PDF</a>` : ''}</span>
                <span style="font-family:var(--serif);color:var(--seal);font-size:15px">${x.done} / ${x.need}</span>
              </div>
              <div style="height:5px;background:rgba(29,36,34,.08);margin-top:10px">
                <div style="height:100%;width:${pct}%;background:var(--seal)"></div>
              </div>
            </div>`;
          }).join('')}
          <p style="font-size:12.5px;color:var(--ink-2);line-height:2">
            认定流程：教务系统提交申请 → 辅导员审核材料 → 学院行政副院长审批 → 学院统计。<br>
            每学期期末开放学分认定系统，所有学生均须在系统内提交并上传证明材料。
          </p>
          <p style="font-size:12.5px;color:var(--ink-2);line-height:2;margin-top:12px">
            信息工程学院学生另需完成课外学习活动 <b style="color:var(--seal)">2 学分</b>（至少参加 2 次学科竞赛）。
            <a href="assets/pdf/extra-study.pdf" target="_blank" rel="noopener" style="color:var(--seal);border-bottom:1px solid rgba(181,50,50,.4)">原文 PDF ↗</a>
          </p>
        </div>

        <div>
          <h3 class="panel__title" style="margin-bottom:16px"><span class="num">B</span>常见成果折算</h3>
          <table class="table">
            <thead><tr><th>成果</th><th>可认定学分</th></tr></thead>
            <tbody>
              <tr><td>CET-4 合格</td><td><b>2</b></td></tr>
              <tr><td>CET-6 合格</td><td><b>4</b></td></tr>
              <tr><td>计算机二级及以上</td><td><b>2</b></td></tr>
              <tr><td>一类国家级竞赛一等奖</td><td><b>10</b></td></tr>
              <tr><td>一类省级竞赛一等奖</td><td><b>4</b></td></tr>
              <tr><td>一类市级竞赛一等奖</td><td><b>2</b></td></tr>
              <tr><td>软件著作权</td><td><b>1</b></td></tr>
              <tr><td>实用新型专利</td><td><b>2</b></td></tr>
            </tbody>
          </table>
          <p style="font-size:12px;color:var(--ink-3);margin-top:12px;line-height:1.9">同一成果只认定一次，按就高原则执行；集体项目分值由指导教师与项目负责人商定分配。<br><a href="assets/pdf/credit-bank.pdf" target="_blank" rel="noopener" style="color:var(--seal);border-bottom:1px solid rgba(181,50,50,.4)">查看《学分银行管理办法》原文 PDF ↗</a></p>
        </div>
      </div>`;
  }

  /* ---------- 问答 ---------- */
  if (page === 'ask') {
    const qa = [
      ['补考一般安排在什么时候？', '补考通常安排在新学期开学后第 2—4 周，具体时间由教务处发布，考试违纪者不得补考，只能重修。'],
      ['素质拓展学分差一点怎么办？', '先看四个模块各自的缺口。经典阅读和实践教学活动周不能互相替代，其余模块之间可以互相替换认证。'],
      ['奖学金评定主要看什么？', '学业成绩排名为基础，综合素质测评（含第二课堂、志愿服务、竞赛获奖）为加分项，具体比例以当年学院细则为准。'],
      ['转专业需要什么条件？', '一般要求第一学年无挂科、无违纪记录，并通过转入学院考核，时间窗口通常在大一学年末。'],
      ['竞赛要提前办什么手续？', '赛前填写《学科竞赛参赛申请表》，经指导教师签字、学院审核、教务处批准后才算数，赛后补办通常不予认定。']
    ];
    app.innerHTML = `
      <div class="ask-grid">
        <div>
          <div class="ask-box">
            <textarea id="askInput" placeholder="描述你的问题，例如：这学期的学分认定截止到几号？"></textarea>
            <div class="ask-box__foot">
              <span class="ask-box__hint">回答问题只依据校内公开文件，不编造</span>
              <button class="btn btn--seal" id="askBtn" style="padding:10px 22px">提问</button>
            </div>
          </div>
          <div class="ask-samples">
            ${['补考时间', '学分怎么补', '奖学金比例', '转专业条件'].map(t => `<button data-q="${t}">${t}</button>`).join('')}
          </div>

          <div class="faq" style="margin-top:36px">
            <h3 class="panel__title" style="margin-bottom:8px"><span class="num">Q</span>高频问题</h3>
            ${qa.map(([q, a], i) => `
              <details style="border-bottom:1px solid var(--line);padding:16px 0" ${i === 0 ? 'open' : ''}>
                <summary style="cursor:pointer;font-family:var(--serif);font-size:15px;font-weight:700;list-style:none">${q}</summary>
                <p style="font-size:13.5px;color:var(--ink-2);line-height:1.95;margin-top:10px">${a}</p>
              </details>`).join('')}
          </div>
        </div>

        <div id="about" style="border-left:1px solid var(--line);padding-left:24px">
          <div class="eyebrow" style="margin-bottom:14px">关于译问</div>
          <p style="font-family:var(--serif);font-size:16px;line-height:2;color:var(--ink)">
            这是一个前端课设作品：把西安翻译学院的官方通知，翻译成学生照着就能做的步骤。
          </p>
          <p style="font-size:12.5px;color:var(--ink-2);line-height:2;margin-top:14px">
            技术栈：常规前端技术栈（HTML / CSS / JavaScript）。<br>
            交互重点：钟面导航、原文对照批注、四时换光、社团实拍墙。<br>
            信息以学校官方发布为准，本站只做可读性转译。
          </p>
        </div>
      </div>`;

    const input = document.getElementById('askInput');
    const btn = document.getElementById('askBtn');
    const ask = () => {
      const q = (input.value || '').trim();
      if (!q) { input.focus(); return; }
      const hit = qa.find(([k]) => q.includes(k.slice(0, 3))) || qa[0];
      const box = document.querySelector('.ask-box');
      box.insertAdjacentHTML('afterend', `
        <div style="margin-top:18px;border:1px solid var(--line);border-left:2px solid var(--seal);background:var(--card);padding:20px 22px">
          <div style="font-size:11px;letter-spacing:.2em;color:var(--ink-3);margin-bottom:8px">译问的回答</div>
          <div style="font-family:var(--serif);font-size:15px;line-height:1.9">${hit[1]}</div>
          <div style="font-size:11.5px;color:var(--ink-3);margin-top:10px">依据：西安翻译学院学生手册 · 相关管理办法</div>
        </div>`);
      input.value = '';
    };
    btn.addEventListener('click', ask);
    document.querySelectorAll('.ask-samples button').forEach(b => {
      b.addEventListener('click', () => { input.value = b.dataset.q; input.focus(); });
    });
  }
})();
