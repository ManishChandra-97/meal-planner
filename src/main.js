import './style.css';
import {ingredients, categories, cuisines, byId} from './ingredients.js';
import recipes from './recipes.json';
import {BASICS, SPICES, STAPLES, TIME_OPTIONS, PLAN_OPTIONS, defaults, normalizeState, availableIds, matchDetails as getMatch, summarizePlan, timeBucket} from './engine.js';

const STORAGE_KEY = 'mealmint-pantry-v2';
const LEGACY_KEY = 'mealmint-pantry-v1';
const app = document.querySelector('#app');
let state = normalizeState(loadState(), ingredients.map(x => x.id), cuisines.map(x => x[0]));
let currentPlan = null;
let resultQuery = '';
function loadState() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY) || '{}'); } catch { return {}; } }
function saveState() { currentPlan = null; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* The app also works without persistent browser storage. */ } }
function escape(s) { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function ingredient(id) { return byId[id] || {name:id, emoji:''}; }
function matchDetails(recipe) { return getMatch(recipe, state); }
function toggle(values, id) { return values.includes(id) ? values.filter(x => x !== id) : [...values, id]; }
function nav() { return `<header class="topbar"><a href="#/" class="logo" aria-label="MealMint home"><span>✦</span> meal<span>mint</span></a><div class="nav-links"><a href="#ingredients" data-scroll="ingredients">My kitchen</a><a href="#preferences" data-scroll="preferences">Preferences</a></div><button class="text-button" data-action="start-over">Start over</button></header>`; }
function footer() { return `<footer>Made for hungry people with very normal fridges. <span>✦</span> MealMint</footer>`; }
function renderToggle(id) { const checked = state.staples.includes(id); return `<button class="staple-toggle ${checked?'on':''}" data-staple="${id}" role="switch" aria-checked="${checked}" aria-label="${ingredient(id).name}"><span>${ingredient(id).name}</span><span class="switch-track" aria-hidden="true"><i></i></span></button>`; }
function pickerIngredients() {
 const q = state.query.trim().toLowerCase();
 return ingredients.filter(i => i.id !== 'water' &&
   (state.category === 'all' || i.category === state.category) && (!state.selectedOnly || availableIds(state).has(i.id)) &&
   (!q || [i.name, ...i.aliases].some(name => name.toLowerCase().includes(q)) || (q.length > 3 && levenshtein(q, i.name.toLowerCase()) <= 1)));
}
function renderIngredient(i) { const selected = availableIds(state).has(i.id); return `<button class="ingredient-chip ${selected?'selected':''}" data-ingredient="${i.id}" aria-pressed="${selected}"><span aria-hidden="true">${i.emoji || '+'}</span>${i.name}<b aria-hidden="true">${selected?'✓':''}</b></button>`; }
function renderPicker() { const shown = pickerIngredients(); return `<div class="picker-toolbar"><span role="status">${shown.length} ingredients · ${availableIds(state).size} selected</span><button data-action="selected-only" aria-pressed="${state.selectedOnly}" class="text-button">${state.selectedOnly?'Show all':'Selected only'}</button></div><div class="chips">${shown.map(renderIngredient).join('') || '<p class="no-search">No ingredients here. Try another category or a shorter search.</p>'}</div>`; }
function renderTray() {
 const total = availableIds(state).size;
 return `<div class="kitchen-tray"><div class="tray-top"><div><p>Your kitchen</p><b>${total} ingredients</b></div><button data-action="clear-all">Clear all</button></div>${total ? `<div class="tray-chips">${[...availableIds(state)].map(id => `<button data-ingredient="${id}" aria-label="Remove ${ingredient(id).name}">${ingredient(id).name} ×</button>`).join('')}</div><p class="staple-count">${state.staples.filter(id => BASICS.includes(id)).length}/4 basics · ${state.staples.filter(id => SPICES.includes(id)).length}/7 spices</p>` : '<div class="empty-tray"><span>🍽️</span><p>Start with what you have.</p><small>Every ingredient helps.</small></div>'}</div>`;
}
function renderHome() {
 document.title = "MealMint — Dinner, from what you've got.";
 app.innerHTML = `${nav()}<main>
 <section class="hero"><div class="hero-copy"><p class="eyebrow">Dinner, from what you've got.</p><h1>Your fridge already knows <em>what's for dinner.</em></h1><p class="hero-text">A few ingredients. A little inspiration. Easy recipes for a very normal kitchen.</p><a href="#ingredients" data-scroll="ingredients" class="button primary hero-cta">Raid my fridge <b>→</b></a><p class="tiny-proof"><span>✦</span> ${recipes.length} cookbook recipes. No sign-up.</p></div><div class="hero-art" aria-hidden="true"><div class="plate"><span>🍜</span></div><span class="sticker s1">🍅</span><span class="sticker s2">🥕</span><span class="sticker s3">🧄</span><span class="sticker s4">🌶️</span></div></section>
 <section id="ingredients" class="selection-section"><div class="section-heading"><p class="eyebrow">Step 1 — The cupboard</p><h2>Got the everyday essentials?</h2><p>Switch each item on if you have it. Off means you don't.</p></div><div class="staple-groups"><fieldset><legend>Basics <span>The everyday four</span></legend><div class="staple-grid">${BASICS.map(renderToggle).join('')}</div></fieldset><fieldset><legend>Spices <span>A little goes a long way</span></legend><div class="staple-grid">${SPICES.map(renderToggle).join('')}</div></fieldset></div></section>
 <section id="fresh-ingredients" class="selection-section pantry-step"><div class="section-heading"><p class="eyebrow">Step 2 — The rest of your kitchen</p><h2>What else have you got?</h2><p>Search or browse, then tap to add. Basics and spices count only when selected; you can also find them here.</p></div><div class="ingredient-layout"><div class="ingredient-main"><div class="search-wrap"><span aria-hidden="true">⌕</span><input data-input="query" value="${escape(state.query)}" placeholder="Try paneer, curd, poha…" aria-label="Search ingredients" autocomplete="off"><button class="clear-search ${state.query?'':'hidden'}" data-action="clear-search" aria-label="Clear search">×</button></div><nav class="category-nav" aria-label="Ingredient categories">${categories.map(([id,name]) => `<button data-category="${id}" aria-pressed="${state.category===id}" class="${state.category===id?'active':''}">${name}</button>`).join('')}</nav><div id="ingredient-results">${renderPicker()}</div></div><aside id="kitchen-tray">${renderTray()}</aside></div></section>
 <section id="preferences" class="selection-section preferences"><div class="section-heading"><p class="eyebrow">Make it yours</p><h2>What are we craving?</h2><p>Select as many cuisines as you like. Easy home cooking comes first.</p></div><div class="cuisine-grid">${cuisines.map(([id,name,emoji]) => `<button class="cuisine ${state.cuisine.includes(id)?'selected':''}" data-cuisine="${id}" aria-pressed="${state.cuisine.includes(id)}"><span>${emoji}</span><b>${name}</b>${state.cuisine.includes(id)?'<i>✓</i>':''}</button>`).join('')}</div>
 <div class="preference-grid"><section class="preference-card"><span class="pref-number">01</span><h3>How much time?</h3><div class="time-options">${TIME_OPTIONS.map(([v,title]) => `<button class="time-option ${state.times.includes(v)?'selected':''}" data-time="${v}" aria-pressed="${state.times.includes(v)}"><b>${title}</b><span>${v===15?'Quick & simple':v===30?'Everyday cooking':'Time to simmer'}</span></button>`).join('')}</div><p class="helper">Choose several. None selected means any time.</p></section>
 <section class="preference-card"><span class="pref-number">02</span><h3>Who's eating?</h3><div class="stepper"><button data-action="serve-down" aria-label="Decrease servings" ${state.servings===1?'disabled':''}>−</button><div><strong>${state.servings}</strong><span>${state.servings===1?'person':'people'}</span></div><button data-action="serve-up" aria-label="Increase servings" ${state.servings===8?'disabled':''}>+</button></div><p class="helper">Recipe quantities adjust with you.</p></section>
 <section class="preference-card plan-card"><span class="pref-number">03</span><h3>Plan for…</h3><div class="plan-options">${PLAN_OPTIONS.map(([id,label]) => `<button class="${state.lengths.includes(id)?'selected':''}" data-length="${id}" aria-pressed="${state.lengths.includes(id)}">${label}</button>`).join('')}</div><p class="helper">Pick any combination. See every recipe.</p></section></div></section>
 <section class="generate"><div><span class="round-icon">✦</span><div><p class="eyebrow">Ready when you are</p><h2>Let’s make something good.</h2><p id="generate-count">${availableIds(state).size} ingredients in your kitchen. All ${recipes.length} recipes to explore.</p></div></div><button class="button primary make-button" data-action="generate">Find my recipes <b>✦</b></button></section></main>${footer()}`;
}
function refreshPantry() {
 const scrollTop = document.querySelector('.chips')?.scrollTop || 0;
 const focusedIngredient = document.activeElement?.dataset.ingredient;
 const focusedAction = document.activeElement?.dataset.action;
 document.querySelectorAll('[data-staple]').forEach(el => { const on = state.staples.includes(el.dataset.staple); el.classList.toggle('on', on); el.setAttribute('aria-checked', on); });
 document.querySelector('#ingredient-results').innerHTML = renderPicker();
 document.querySelector('.chips').scrollTop = scrollTop;
 document.querySelector('#kitchen-tray').innerHTML = renderTray();
 document.querySelector('#generate-count').textContent = `${availableIds(state).size} ingredients in your kitchen. All ${recipes.length} recipes to explore.`;
 document.querySelector('.clear-search').classList.toggle('hidden', !state.query);
 if (focusedIngredient) document.querySelector(`[data-ingredient="${focusedIngredient}"]`)?.focus({preventScroll:true});
 else if (focusedAction === 'selected-only') document.querySelector('[data-action="selected-only"]')?.focus({preventScroll:true});
}
function tags(m) { return `<div class="recipe-tags"><span>◷ ${m.time} min</span><span>${TIME_OPTIONS.find(([v])=>v===timeBucket(m.time))[1]}</span>${PLAN_OPTIONS.filter(([id])=>state.lengths.includes(id)).map(([,label])=>`<span class="plan-tag">Plan: ${label}</span>`).join('')}${m.batchFriendly?'<span>Batch friendly</span>':''}</div>`; }
function videoLinks(m, compact=false) { return `<div class="video-links ${compact?'compact-links':''}">${m.videos.map(v => `<a href="${escape(v.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(m.name)} video in ${v.language==='hi'?'Hindi':'English'} by ${escape(v.channel)}">▶ ${v.language==='hi'?'Hindi':'English'}${compact?'':` <small>${escape(v.channel)}${v.format==='on-screen'?' · on-screen instructions':''}</small>`} ↗</a>`).join('')}</div>`; }
function renderMeal(m,index) {
 const {have,missing,percent} = matchDetails(m);
 const mainHave = have.filter(id => !STAPLES.includes(id));
 return `<article class="meal-card" data-meal="${m.id}"><div class="meal-count">${String(index+1).padStart(2,'0')}</div><div class="meal-main"><div class="meal-title"><div><p>${m.mealType} · ${m.cuisine}</p><h3>${escape(m.name)}</h3><span>${m.difficulty} · ${m.needed.length} ingredients</span></div><span class="match-badge ${missing.length?'':'complete'}">${percent}% available</span></div>${tags(m)}<div class="coverage"><div><b>You have ${have.length}/${m.needed.length} ingredients</b><span>${missing.length?`${missing.length} missing`:'Ready to cook'}</span></div><div class="progress"><i style="width:${percent}%"></i></div></div><div class="meal-ingredients"><p>Using <span>${mainHave.map(id=>ingredient(id).name).join(' · ') || (have.length?'Your cupboard essentials':'Nothing from your kitchen yet')}</span></p>${missing.length?`<p class="missing">Need <span>${missing.map(id=>ingredient(id).name).join(' · ')}</span></p>`:'<p class="all-set">✓ You have everything</p>'}</div>${videoLinks(m,true)}</div><div class="meal-actions"><a class="cook-button" href="#/recipe/${m.id}">View recipe →</a></div></article>`;
}
function visibleMeals() { const q=resultQuery.trim().toLowerCase(); return currentPlan.meals.filter(m => `${m.name} ${m.cuisine} ${m.mealType}`.toLowerCase().includes(q)); }
function renderResults() {
 const meals=visibleMeals();
 const ready=meals.filter(m=>!matchDetails(m).missing.length);
 const partial=meals.filter(m=>matchDetails(m).missing.length);
 return `<p class="result-count" role="status">Showing ${meals.length} of ${recipes.length} recipes · ${ready.length} exact matches</p>${meals.length ? `<section class="match-section" aria-label="100% matches"><h3>Ready to cook · ${ready.length}</h3><p>Every listed ingredient is in your kitchen, including basics and spices.</p>${ready.length?`<div class="meal-list">${ready.map(renderMeal).join('')}</div>`:`<div class="no-matches"><h3>${resultQuery.trim()?'No exact matches for this search':'No 100% matches yet'}</h3><p>${resultQuery.trim()?'Clear your search to see other ready-to-cook recipes.':'Check your cupboard above, or review the missing ingredients below. Only items you select count as available.'}</p></div>`}</section>${partial.length?`<section class="match-section" aria-label="Recipes with missing ingredients"><h3>Needs more ingredients · ${partial.length}</h3><p>These recipes are not ready to cook yet. Each card lists what is missing.</p><div class="meal-list">${partial.map((m,i)=>renderMeal(m,ready.length+i)).join('')}</div></section>`:''}`:'<div class="no-matches"><h3>No recipes match that search</h3><p>Try a dish, cuisine, or meal type.</p></div>'}`;
}
function renderCupboardCheck() {
 const almost=currentPlan.meals.filter(m=>{const {missing}=matchDetails(m);return missing.length && missing.every(id=>STAPLES.includes(id));});
 return `<section class="cupboard-check" aria-label="Check your cupboard"><h2>Check your cupboard</h2><p>${almost.length?`${almost.length} ${almost.length===1?"recipe has":"recipes have"} all main ingredients and only ${almost.length===1?"needs":"need"} basics or spices confirmed. `:''}Switch on only what you have. Matches update immediately.</p>${almost.length?`<ul class="cupboard-blockers">${almost.map(m=>`<li><b>${escape(m.name)}</b> — confirm ${matchDetails(m).missing.map(id=>ingredient(id).name).join(', ')}</li>`).join('')}</ul>`:''}<details ${almost.length || !state.staples.length?'open':''}><summary>${state.staples.length}/${STAPLES.length} basics & spices selected · edit</summary><div class="staple-grid">${STAPLES.map(renderToggle).join('')}</div></details></section>`;
}
function renderPlan() {
 currentPlan=summarizePlan(recipes,state); document.title='Recipes for your kitchen — MealMint';
 app.innerHTML=`${nav()}<main class="plan-page"><a href="#/" class="back-link">← Back to my kitchen</a><section class="plan-hero"><div><p class="eyebrow">Recipes for your kitchen</p><h1>Good food, <em>within reach.</em></h1><p>100% available comes first, followed by recipes that need a few more ingredients. All ${recipes.length} recipes are here.</p></div><div class="plan-illustration">🍛<span>✦</span></div></section><section class="plan-summary"><div class="summary-stat"><b>${availableIds(state).size}</b><span>ingredients you have</span></div><div class="summary-stat"><b>${currentPlan.complete}</b><span>ready to cook</span></div><div class="summary-stat"><b>${recipes.length-currentPlan.complete}</b><span>more ideas</span></div><div class="pantry-score"><div class="score-ring" style="--score:${currentPlan.score}"><span>${currentPlan.usedCount}/${availableIds(state).size}</span></div><div><b>Ingredients in the catalogue</b><p>Your selected ingredients used across all recipes.</p></div></div></section>${renderCupboardCheck()}<div class="plan-content"><section><div class="meal-heading"><div><p class="eyebrow">From open cookbooks to your kitchen</p><h2>Find your next favourite.</h2></div></div><div class="search-wrap"><span>⌕</span><input data-input="recipes" value="${escape(resultQuery)}" placeholder="Search dishes or cuisines…" aria-label="Search recipes"></div><div id="recipe-results">${renderResults()}</div></section><aside class="plan-side"><div class="side-card"><span>✦</span><h3>A little help choosing</h3><p>Ingredient availability sets the order. For equal matches, we favour easy recipes and your cuisine and time selections.</p><p>Longer plans give batch-friendly recipes a nudge. Plan tags reflect your selections, not storage life.</p></div><div class="side-card"><h3>Cookbook roots</h3><p>Adapted from the openly licensed Wikibooks Cookbook. Each recipe includes its source and two video guides.</p><p>Videos show the same dish; their ingredients may vary.</p></div><a class="outline-button" href="#/">Edit my kitchen</a></aside></div></main>${footer()}`;
}
function quantity(m,id) {
 const amount=m.amounts[id]; if (!amount) return 'to taste';
 if (typeof amount==='string') return amount;
 const n=Math.round(amount[0]*state.servings/m.servings*100)/100;
 return `${n} ${amount[1]}`.trim();
}
function ingredientRows(m,ids) { return ids.map(id=>`<li><span aria-hidden="true">${ingredient(id).emoji||'•'}</span>${ingredient(id).name}<b>${escape(quantity(m,id))}</b></li>`).join(''); }
function renderRecipe(id) {
 const m=recipes.find(x=>x.id===id); if(!m) {location.hash='/plan';return;}
 const {have,missing}=matchDetails(m); const mainHave=have.filter(id=>!STAPLES.includes(id)); const cupboard=have.filter(id=>STAPLES.includes(id));
 document.title=`${m.name} — MealMint`;
 app.innerHTML=`${nav()}<main class="recipe-page"><a href="#/plan" class="back-link">← Back to recipes</a><section class="recipe-hero"><div><p class="eyebrow">${m.cuisine} · ${m.mealType}</p><h1>${escape(m.name)}</h1><p>${escape(m.description)}</p>${tags(m)}<div class="recipe-meta"><span>♨ ${m.difficulty}</span><div class="recipe-servings"><button data-action="serve-down" aria-label="Decrease servings" ${state.servings===1?'disabled':''}>−</button><span>${state.servings} servings</span><button data-action="serve-up" aria-label="Increase servings" ${state.servings===8?'disabled':''}>+</button></div></div></div><div class="recipe-art">🍲</div></section><div class="recipe-layout"><div class="recipe-content"><section class="recipe-section"><div class="recipe-section-title"><p class="eyebrow">Get ready</p><h2>Ingredients</h2></div><div class="ingredient-columns"><div><h3>✓ In your kitchen <span>${mainHave.length}</span></h3><ul class="recipe-list">${ingredientRows(m,mainHave)||'<li>No main ingredients selected yet.</li>'}</ul>${cupboard.length?`<details class="cupboard-details"><summary>From your basics & spices (${cupboard.length})</summary><ul class="recipe-list">${ingredientRows(m,cupboard)}</ul></details>`:''}</div><div class="missing-box"><h3>+ You'll need <span>${missing.length}</span></h3>${missing.length?`<ul class="recipe-list">${ingredientRows(m,missing)}</ul>`:'<p>Nothing extra. You have everything.</p>'}</div></div>${m.water?`<p class="water-note">Also use ${Math.round(m.water*state.servings/m.servings*100)/100} cups water${m.waterNote?` ${escape(m.waterNote)}`:''}.</p>`:''}<p class="water-note">${escape(m.prepNote||'Measure the quantities above before you start.')}</p></section><section class="recipe-section steps-section"><div class="recipe-section-title"><p class="eyebrow">Let’s cook</p><h2>Method</h2><button class="button small-primary" data-action="cooking" data-recipe="${m.id}">Cooking mode →</button></div><ol class="steps">${m.steps.map((s,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><p>${escape(s)}</p></li>`).join('')}</ol></section><section class="recipe-section"><p class="eyebrow">Cook along</p><h2>Two ways to watch.</h2><p class="video-note">The same dish, from other home cooks. Their ingredients and quantities may differ.</p>${videoLinks(m)}</section><section class="source-credit"><b>Recipe source</b><p>Adapted from <a href="${escape(m.source.url)}" target="_blank" rel="noopener noreferrer">${escape(m.source.title)} ↗</a> by <a href="${escape(m.source.history)}" target="_blank" rel="noopener noreferrer">Wikibooks contributors</a>.</p><p>Recipe adaptation: <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>. ${escape(m.source.changes)}</p></section></div><aside class="recipe-sidebar"><div class="tip-card"><span>⌁</span><h3>${missing.length?'Before you start':'Ready when you are'}</h3><p>${missing.length?`Pick up the ${missing.length} missing ingredients listed here before cooking.`:'Measure your ingredients and read through the steps once.'}</p><p>Time includes the preparation described here. Larger batches may take longer.</p></div><button class="big-cook" data-action="cooking" data-recipe="${m.id}">Start cooking <span>→</span></button></aside></div></main>${footer()}`;
}
function renderCooking(id,step=0) {
 const m=recipes.find(x=>x.id===id);if(!m)return;
 step=Math.max(0,Math.min(step,m.steps.length-1));const last=step===m.steps.length-1;
 app.innerHTML=`<main class="cooking-mode"><a class="exit-cooking" href="#/recipe/${id}" data-action="exit-cooking" data-recipe="${id}">× Exit cooking mode</a><div class="cooking-top"><span class="logo">✦ mealmint</span><span>${escape(m.name)} · ${state.servings} servings</span></div><div class="cook-progress"><span>Step ${step+1} of ${m.steps.length}</span><div><i style="width:${(step+1)/m.steps.length*100}%"></i></div></div><section class="cook-step"><span class="step-number">${String(step+1).padStart(2,'0')}</span><h1>${escape(m.steps[step])}</h1><details class="cooking-quantities"><summary>Ingredient quantities for ${state.servings} servings</summary><ul class="recipe-list">${ingredientRows(m,m.needed)}</ul>${m.water?`<p>${Math.round(m.water*state.servings/m.servings*100)/100} cups water</p>`:''}</details></section><div class="cook-nav"><button ${step===0?'disabled':''} data-cook-step="${step-1}" data-recipe="${id}">← Previous</button><button class="button primary" ${last?'data-action="exit-cooking"':`data-cook-step="${step+1}"`} data-recipe="${id}">${last?'Done!':'Next step'} →</button></div></main>`;
}
function levenshtein(a,b){let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0]++;for(let j=1;j<=b.length;j++){const cur=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]!==b[j-1]));prev=row[j];row[j]=cur}}return row[b.length]}
function route(){const path=location.hash.slice(1)||'/';if(path==='/plan')renderPlan();else if(path.startsWith('/recipe/'))renderRecipe(path.split('/').pop());else renderHome();}
window.addEventListener('hashchange',()=>{route();window.scrollTo(0,0);});
document.addEventListener('click',e=>{
 const b=e.target.closest('button,a[data-action],a[data-scroll]');if(!b)return;
 if(b.dataset.scroll){e.preventDefault();const scroll=()=>document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:'smooth'});if(location.hash!=='#/'){location.hash='/';setTimeout(scroll,0)}else scroll();return;}
 if(b.dataset.ingredient || b.dataset.staple){
  const id=b.dataset.ingredient || b.dataset.staple;
  const field=STAPLES.includes(id)?'staples':'selected';
  state[field]=toggle(state[field],id);saveState();
  if(location.hash==='#/plan'){
   const open=document.querySelector('.cupboard-check details').open;
   renderPlan();document.querySelector('.cupboard-check details').open=open;
   document.querySelector(`[data-staple="${id}"]`)?.focus({preventScroll:true});
  }else refreshPantry();
  return;
 }
 if(b.dataset.category){state.category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',el===b)});refreshPantry();return;}
 for(const [key,field,numeric] of [['cuisine','cuisine',false],['time','times',true],['length','lengths',false]]){
  if(b.dataset[key]){const id=numeric?Number(b.dataset[key]):b.dataset[key];state[field]=toggle(state[field],id);saveState();b.classList.toggle('selected',state[field].includes(id));b.setAttribute('aria-pressed',state[field].includes(id));if(key==='cuisine'){b.querySelector('i')?.remove();if(state[field].includes(id))b.insertAdjacentHTML('beforeend','<i>✓</i>')}return;}
 }
 if(b.dataset.cookStep!==undefined){renderCooking(b.dataset.recipe,Number(b.dataset.cookStep));return;}
 switch(b.dataset.action){
  case 'selected-only':state.selectedOnly=!state.selectedOnly;refreshPantry();break;
  case 'clear-search':state.query='';document.querySelector('[data-input="query"]').value='';refreshPantry();document.querySelector('[data-input="query"]').focus();break;
  case 'clear-all':state.selected=[];state.staples=[];saveState();document.querySelectorAll('[data-staple]').forEach(el=>{el.classList.remove('on');el.setAttribute('aria-checked','false')});refreshPantry();break;
  case 'serve-down':case 'serve-up':state.servings=Math.max(1,Math.min(8,state.servings+(b.dataset.action==='serve-up'?1:-1)));saveState();route();break;
  case 'generate':resultQuery='';currentPlan=summarizePlan(recipes,state);location.hash='/plan';break;
  case 'start-over':try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_KEY)}catch{}state=defaults();currentPlan=null;resultQuery='';location.hash='/';route();break;
  case 'cooking':renderCooking(b.dataset.recipe);break;
  case 'exit-cooking':e.preventDefault();renderRecipe(b.dataset.recipe);break;
 }
});
document.addEventListener('input',e=>{if(e.target.dataset.input==='query'){state.query=e.target.value;refreshPantry()}if(e.target.dataset.input==='recipes'){resultQuery=e.target.value;document.querySelector('#recipe-results').innerHTML=renderResults()}});
route();
