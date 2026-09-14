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
  return `<header class="topbar"><button class="brand" data-home aria-label="返回首页"><span class="brand-mark">⌁</span><span>城市匹配</span></button>${back ? '<button class="ghost-btn" data-back>← 返回</button>' : '<span class="privacy">本地测试 · 不上传答案</span>'}</header>`;
}

function home() {
  const hasProgress = Object.keys(state.answers).length > 0 && Object.keys(state.answers).length < questions.length;
  app.innerHTML = `${header()}<section class="hero shell">
    <div class="hero-copy">
      <p class="eyebrow"><span></span> CITY MATCH · 城市人格图谱</p>
      <h1>发现你的<br><em>命定城市</em></h1>
      <p class="lead">你真正向往怎样的生活？通过 45 道情境题，从生活节奏、气候、美食、职业与社交等 11 个维度，找到与你最契合的城市。</p>
      <div class="actions"><button class="primary" data-start>${hasProgress ? `继续测试（${Object.keys(state.answers).length}/45）` : '开始城市探索'} <b>↗</b></button><button class="secondary" data-history>查看历史结果</button></div>
      <div class="facts"><span><b>45</b> 道情境题</span><span><b>11</b> 个生活维度</span><span><b>28</b> 座候选城市</span><span><b>6–10</b> 分钟</span></div>
    </div>
    <div class="orbit" aria-hidden="true"><div class="globe"><span>你会在哪里<br><b>找到归属感？</b></span></div><div class="city-chip c1">成都<br><small>松弛烟火</small></div><div class="city-chip c2">上海<br><small>摩登效率</small></div><div class="city-chip c3">大理<br><small>山海自由</small></div><div class="city-chip c4">北京<br><small>理想舞台</small></div></div>
  </section><section class="dimension-section shell"><p class="section-label">ELEVEN DIMENSIONS</p><h2>一座城，也是一种生活答案</h2><div class="dimension-grid">${Object.entries(dimensions).map(([k,v]) => `<article><span>${v.icon}</span><div><h3>${esc(v.name)}</h3><p>${esc(v.description)}</p></div></article>`).join('')}</div></section>
  <footer>独立静态备份 · 所有计算均在你的浏览器中完成</footer>`;
  app.querySelector('[data-start]').onclick = () => { state.page='quiz'; state.index = firstUnanswered(); saveState(); render(); };
  app.querySelector('[data-history]').onclick = showHistory;
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
  saveState(); render();
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
