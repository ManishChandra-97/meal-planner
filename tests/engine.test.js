import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BASICS,SPICES,STAPLES,defaults,normalizeState,matchDetails,rankRecipes,timeBucket,preferenceScore,summarizePlan,cuisineId} from '../src/engine.js';
import {ingredients,cuisines} from '../src/ingredients.js';
const recipes=JSON.parse(readFileSync(new URL('../src/recipes.json',import.meta.url)));
const ids=ingredients.map(x=>x.id), cuisineIds=cuisines.map(x=>x[0]);
const recipe=id=>recipes.find(r=>r.id===id);
const kitchen=(selected=[],staples=[])=>({...defaults(),selected,staples});

test('every cookbook entry has resolvable ingredients, quantities, attribution and two direct videos',()=>{
 assert.ok(recipes.length>=28);
 assert.equal(new Set(recipes.map(r=>r.id)).size,recipes.length);
 assert.equal(new Set(recipes.map(r=>JSON.stringify([...r.needed].sort()))).size,recipes.length);
 for(const r of recipes){
  assert.ok(r.steps.length>=3);assert.ok(r.time>0);assert.ok(r.servings>0);
  assert.equal(r.needed.length,new Set(r.needed).size);
  for(const id of r.needed){assert.ok(ids.includes(id),`${r.id}: unknown ${id}`);assert.ok(Object.hasOwn(r.amounts,id),`${r.id}: missing amount ${id}`)}
  assert.match(r.source.url,/^https:\/\/en.wikibooks.org\/w\/index.php\?oldid=\d+$/);
  assert.equal(r.source.license,'CC BY-SA 4.0');
  assert.deepEqual(r.videos.map(v=>v.language).sort(),['en','hi']);
  for(const v of r.videos){assert.match(v.url,/^https:\/\/www.youtube.com\/watch\?v=[\w-]{11}$/);assert.ok(v.channel&&v.channel!=='Recipe video');assert.ok(v.title)}
 }
});
test('100% availability wins over cuisine and time preferences, while every partial match remains',()=>{
 const state={...kitchen(['bread','cheddar','butter']),cuisine:['indian'],times:[45]};
 const ranked=rankRecipes(recipes,state);
 assert.equal(ranked.length,recipes.length);
 assert.equal(ranked[0].id,'grilled-cheese');
 assert.equal(matchDetails(ranked[0],state).percent,100);
 assert.ok(ranked.some(r=>matchDetails(r,state).missing.length>0));
 for(let i=1;i<ranked.length;i++)assert.ok(matchDetails(ranked[i-1],state).coverage>=matchDetails(ranked[i],state).coverage);
});
test('each basic and spice is available only when its own switch is on',()=>{
 for(const id of STAPLES){const r={needed:[id]};assert.deepEqual(matchDetails(r,kitchen()).missing,[id]);assert.equal(matchDetails(r,kitchen([],[id])).percent,100)}
 const r=recipe('scrambled-eggs');
 assert.equal(matchDetails(r,kitchen(['eggs','butter'],['salt','black-pepper'])).percent,100);
 assert.deepEqual(matchDetails(r,kitchen(['eggs','butter'],['salt'])).missing,['black-pepper']);
 assert.equal(BASICS.length,4);assert.equal(SPICES.length,7);
});
test('coriander powder does not count as fresh coriander, and raw rice is not cooked rice',()=>{
 assert.ok(matchDetails(recipe('masala-omelette'),kitchen([],['coriander-powder'])).missing.includes('coriander'));
 assert.ok(matchDetails(recipe('lemon-rice'),kitchen(['rice'],STAPLES)).missing.includes('cooked-rice'));
});
test('time options have no gaps and multiple selected bands affect preference',()=>{
 assert.deepEqual([1,15,16,30,31,45,120].map(timeBucket),[15,15,30,30,45,45,45]);
 const state={...kitchen(),times:[15,45]};
 const r={cuisine:'Indian',time:10};
 assert.equal(preferenceScore(r,state),7);assert.equal(preferenceScore({...r,time:60},state),7);assert.equal(preferenceScore({...r,time:20},state),4);
});
test('all cuisines, times and plan horizons survive persistence normalization',()=>{
 const state=normalizeState({cuisine:cuisineIds,times:[15,30,45],lengths:['one-meal','today','three-days','week']},ids,cuisineIds);
 assert.equal(state.cuisine.length,cuisineIds.length);assert.equal(state.times.length,3);assert.equal(state.lengths.length,4);
 assert.equal(rankRecipes(recipes,state).length,recipes.length);
});
test('legacy pantry state moves existing basics and spices to switches without assuming sugar',()=>{
 const state=normalizeState({selected:['tomato','salt','turmeric','coriander','water'],basics:true,cuisine:['indian'],time:30,length:'week',servings:4},ids,cuisineIds);
 assert.deepEqual(state.selected,['tomato','coriander']);
 assert.ok(state.staples.includes('turmeric'));assert.ok(state.staples.includes('neutral-oil'));assert.ok(!state.staples.includes('sugar'));
 assert.deepEqual(state.times,[30]);assert.deepEqual(state.lengths,['week']);assert.equal(state.servings,4);
});
test('malformed saved state is sanitized and empty selections stay empty',()=>{
 for(const input of [null,[],{selected:'salt',cuisine:123,staples:['fake'],servings:'8'}])assert.doesNotThrow(()=>normalizeState(input,ids,cuisineIds));
 const s=normalizeState({selected:['tomato','tomato','bad'],times:[],lengths:[],servings:99},ids,cuisineIds);
 assert.deepEqual(s.selected,['tomato']);assert.deepEqual(s.times,[]);assert.deepEqual(s.lengths,[]);assert.equal(s.servings,8);
});
test('empty kitchen shows the whole catalogue with honest zero coverage',()=>{
 const plan=summarizePlan(recipes,kitchen());assert.equal(plan.meals.length,recipes.length);assert.equal(plan.score,0);assert.equal(plan.complete,0);
 assert.ok(plan.meals.every(r=>matchDetails(r,kitchen()).percent===0));
});
test('longer plans favour batch cooking without hiding recipes or inventing availability',()=>{
 const a={id:'a',name:'A',needed:['tomato'],time:20,cuisine:'Indian',difficulty:'Easy',batchFriendly:false};
 const b={...a,id:'b',name:'B',batchFriendly:true};
 assert.equal(rankRecipes([a,b],{...kitchen(['tomato']),lengths:['today','week']})[0].id,'b');
});

test('every selectable cuisine has a sourced recipe',()=>{
 for(const id of cuisineIds.filter(id=>id!=='surprise'))assert.ok(recipes.some(r=>cuisineId(r.cuisine)===id),id);
 const state={...kitchen(),cuisine:['healthy'],times:[]};
 assert.equal(preferenceScore(recipe('quinoa-peanut-salad'),state),7);
});
