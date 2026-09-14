import { s as questions, d as dimensions, c as calculateCityScore } from './assets/calculateCityScore-LwzFX5Cg.js';
import { a as cityMap } from './assets/cities-B4qaspau.js';

const app = document.querySelector('#app');
const STORAGE_KEY = 'city-match-test-state-v1';
const HISTORY_KEY = 'city-match-test-history-v1';
const state = loadState();

function loadState() {
  try {
    return { page: 'home', index: 0, answers: {}, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch { return { page: 'home', index: 0, answers: {} }; }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(value = '') { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function setPage(page) { state.page = page; saveState(); window.scrollTo({ top: 0, behavior: 'smooth' }); render(); }
function iconFor(code) { return dimensions[code]?.icon || '✦'; }

function header(back = false) {
  return `<header class="topbar"><button class="brand" data-home aria-label="返回首页"><span class="brand-mark">⌖</span><span>城市匹配测试</span></button>${back ? '<button class="report-btn" data-back>← 返回</button>' : '<button class="report-btn" data-history>▱ 我的报告</button>'}</header>`;
}

function home() {
  const hasProgress = Object.keys(state.answers).length > 0 && Object.keys(state.answers).length < questions.length;
  const cityGroups=[['🏙️','一线城市',['北京','上海','广州','深圳'],'国际视野 · 无限机遇 · 追梦之地'],['◫','新一线城市',['成都','杭州','武汉','南京','+4'],'品质生活 · 发展潜力 · 宜居宜业'],['⌂','宜居二线',['苏州','厦门','青岛','珠海','+4'],'舒适节奏 · 幸福指数 · 安居乐业'],['〰','特色风情',['大理','三亚','拉萨','丽江','+4'],'诗和远方 · 心灵净土 · 自在生活']];
  const dimCopy={A:'快节奏拼搏 vs 慢生活惬意',B:'四季分明 vs 四季如春',C:'历史文化 vs 现代时尚',D:'麻辣重口 vs 清淡养生',E:'热情外向 vs 独立自我',F:'稳定体制 vs 创业挑战',G:'山景高原 vs 海滨风光',H:'品质消费 vs 性价比优先',I:'方言氛围 vs 普通话为主',J:'超大城市 vs 小城安逸',K:'潮流娱乐 vs 传统文化'};
  app.innerHTML = `${header()}<section class="home-hero"><div class="hero shell">
    <div class="hero-copy"><p class="mini-pill">✦ 45道测评 · 11大维度 · 24座城市</p><h1>发现你的<br><em>命定城市</em></h1><p class="lead">每个人心中都有一座城，等待被发现<br>测一测，哪座城市最能成为你的灵魂栖息地</p><button class="primary hero-start" data-start>${hasProgress ? `继续探索（${Object.keys(state.answers).length}/45）` : '◉　开始探索'} </button><div class="facts"><span><b>6–10</b>分钟</span><span><b>45</b>题目</span><span><b>24</b>城市</span><span><b>100%</b>隐私</span></div></div>
    <div class="hero-art" aria-hidden="true"><div class="sun"></div><div class="pin">⌖</div><div class="skyline"></div></div>
  </div><div class="city-marquee"><div>${['北京','上海','广州','深圳','成都','杭州','武汉','南京','苏州','厦门','青岛','珠海','大理','三亚','拉萨','丽江','北京','上海','广州','深圳'].map(x=>`<span>●　${x}</span>`).join('')}</div></div></section>
  <section class="catalog shell"><p class="section-kicker">🏙️ 城市图谱</p><h2>四大类型 <em>各有精彩</em></h2><p class="section-sub">从繁华都市到诗意远方，总有一座与你心灵共振</p><div class="city-groups">${cityGroups.map((g,i)=>`<article><span class="group-icon g${i}">${g[0]}</span><h3><i></i>${g[1]}</h3><div class="city-names">${g[2].map(x=>`<b>${x}</b>`).join('')}</div><p>${g[3]}</p></article>`).join('')}</div></section>
  <section class="dimension-section"><div class="shell"><p class="section-kicker">✧ 科学测评</p><h2>11项维度 <em>精准匹配</em></h2><p class="section-sub">从生活方式到价值追求，全方位解读你的城市偏好</p><div class="dimension-grid">${Object.entries(dimensions).map(([k,v],i) => `<article><small>${String(i+1).padStart(2,'0')}</small><span>${v.icon}</span><div><h3>${esc(v.name)}</h3><p>${dimCopy[k]}</p></div></article>`).join('')}</div></div></section>
  <section class="final-cta shell"><div class="cta-pin">⌖</div><h2>准备好发现你的<em>理想城市</em>了吗？</h2><p>只需几分钟，跟随直觉作答，开启你的城市探索之旅</p><button class="primary" data-start>立即开始　→</button><ul><li>科学算法</li><li>隐私保护</li><li>详细报告</li></ul></section>
  <footer>© 2026 性格城市匹配测试 · City Match Test</footer>`;
  app.querySelector('[data-start]').onclick = () => { state.page='quiz'; state.index = firstUnanswered(); saveState(); render(); };
  app.querySelector('[data-history]').onclick = showHistory;
  app.querySelectorAll('[data-start]').forEach(x=>x.onclick = () => { state.page='quiz'; state.index = firstUnanswered(); saveState(); render(); });
  bindHome();
}

function firstUnanswered() { const idx = questions.findIndex(q => !state.answers[q.id]); return idx < 0 ? 0 : idx; }
function quiz() {
  const q = questions[state.index];
  const selected = state.answers[q.id];
  const pct = Math.round(((state.index + (selected ? 1 : 0)) / questions.length) * 100);
  app.innerHTML = `${header(true)}<section class="quiz-wrap shell">
    <div class="quiz-meta"><div><span class="dim-badge">${iconFor(q.dimension)} ${esc(q.dimensionName)}</span><strong>第 ${state.index + 1} / ${questions.length} 题</strong></div><div class="progress"><i style="width:${pct}%"></i></div></div>
    <article class="question-card"><div class="question-no">${String(state.index + 1).padStart(2,'0')}</div><p class="question-hint">请选择最接近你真实想法的一项</p><h1>${esc(q.text)}</h1><div class="options">${q.options.map((o,i) => `<button class="option ${selected===o.value?'selected':''}" data-value="${o.value}"><span>${String.fromCharCode(65+i)}</span><b>${esc(o.label)}</b><i>✓</i></button>`).join('')}</div></article>
    <nav class="quiz-nav"><button class="secondary" data-prev ${state.index===0?'disabled':''}>← 上一题</button><button class="primary" data-next ${selected?'':'disabled'}>${state.index===questions.length-1?'查看结果':'下一题 →'}</button></nav>
  </section>`;
  app.querySelectorAll('.option').forEach(btn => btn.onclick = () => { state.answers[q.id]=btn.dataset.value; saveState(); render(); });
  app.querySelector('[data-prev]').onclick = () => { if(state.index>0){state.index--;saveState();render();} };
  app.querySelector('[data-next]').onclick = () => { if(!state.answers[q.id]) return; if(state.index < questions.length-1){state.index++;saveState();render();} else finish(); };
  app.querySelector('[data-back]').onclick = () => setPage('home'); bindHome();
}

function finish() {
  if (Object.keys(state.answers).length !== questions.length) { state.index=firstUnanswered(); saveState(); render(); return; }
  state.result = calculateCityScore(state.answers);
  state.page = 'result';
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  history.unshift({ date: new Date().toISOString(), topCities: state.result.topCities });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0,10)));
  syncReport(state.result);
  saveState(); render();
}

async function syncReport(result) {
  if (location.hostname.endsWith('github.io') || location.protocol === 'file:') return;
  try {
    const token = localStorage.getItem('city-match-auth-token');
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(result)
    });
  } catch { /* 静态预览时继续保留本地结果 */ }
}

function result() {
  const r = state.result || calculateCityScore(state.answers);
  const top = r.topCities[0]; const city = cityMap[top.code];
  app.innerHTML = `${header(true)}<section class="result-wrap shell">
    <div class="result-hero"><p class="eyebrow"><span></span> YOUR CITY MATCH</p><p>最适合你的城市是</p><h1>${esc(top.name)}</h1><div class="match-ring" style="--score:${top.percentage}"><b>${top.percentage}<small>%</small></b><span>综合契合度</span></div><div class="tags">${(city.tags||[]).slice(0,5).map(t=>`<span>${esc(t)}</span>`).join('')}</div><p class="city-desc">${esc(city.description)}</p></div>
    <section class="top-three"><p class="section-label">TOP MATCHES</p><h2>你的城市契合榜</h2><div class="rank-grid">${r.topCities.map((x,i)=>{const c=cityMap[x.code];return `<article><span class="rank">0${i+1}</span><h3>${esc(x.name)}</h3><strong>${x.percentage}%</strong><p>${esc(c.lifestyle)}</p></article>`}).join('')}</div></section>
    <section class="analysis"><p class="section-label">LIFE PROFILE</p><h2>你的生活偏好图谱</h2><div>${r.dimensionAnalysis.map(x=>`<article><span>${iconFor(x.dimension)}</span><p>${esc(x.name)}</p><b>${esc(x.preference)}</b></article>`).join('')}</div></section>
    <section class="details"><div><p class="section-label">WHY THIS CITY</p><h2>为什么是${esc(top.name)}？</h2><p>${esc(city.recommendation?.whyThisCity || city.description)}</p></div><div><h3>适合你的理由</h3><ul>${(city.recommendation?.idealFor||city.suitableFor||[]).slice(0,4).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></section>
    <div class="result-actions"><button class="primary" data-restart>重新测试</button><button class="secondary" data-home>返回首页</button></div>
  </section><footer>结果仅供娱乐与自我探索参考</footer>`;
  app.querySelector('[data-restart]').onclick = () => { state.answers={};state.index=0;state.result=null;state.page='quiz';saveState();render(); };
  app.querySelector('[data-back]').onclick = () => setPage('home'); bindHome();
}

function showHistory() {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  app.innerHTML = `${header(true)}<section class="history shell"><p class="section-label">LOCAL HISTORY</p><h1>我的测试记录</h1><p>这些记录只保存在当前浏览器中。</p><div class="history-list">${history.length ? history.map((h,i)=>`<article><span>#${String(i+1).padStart(2,'0')}</span><div><h2>${esc(h.topCities[0].name)}</h2><p>${new Date(h.date).toLocaleString('zh-CN')}</p></div><strong>${h.topCities[0].percentage}%</strong></article>`).join('') : '<div class="empty">还没有历史结果，完成一次测试后会显示在这里。</div>'}</div><button class="primary" data-start>开始测试</button></section>`;
  app.querySelector('[data-start]').onclick = () => { state.page='quiz';state.index=firstUnanswered();saveState();render(); };
  app.querySelector('[data-back]').onclick = () => setPage('home'); bindHome();
}
function bindHome(){ app.querySelectorAll('[data-home]').forEach(x=>x.onclick=()=>setPage('home')); }
function render(){ if(state.page==='quiz') quiz(); else if(state.page==='result' && state.result) result(); else home(); }
render();
