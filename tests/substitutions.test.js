import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaults, matchDetails, rankRecipes, summarizePlan, STAPLES} from '../src/engine.js';
import {SUBSTITUTIONS, replacementAmount} from '../src/substitutions.js';
import {ingredients} from '../src/ingredients.js';
const recipes=JSON.parse(readFileSync(new URL('../src/recipes.json',import.meta.url)));
const recipe=id=>recipes.find(r=>r.id===id);
const kitchen=(selected=[])=>({...defaults(),selected:selected.filter(id=>!STAPLES.includes(id)),staples:selected.filter(id=>STAPLES.includes(id))});

test('mozzarella makes grilled cheese fully covered with a disclosed substitution',()=>{
 const m=matchDetails(recipe('grilled-cheese'),kitchen(['bread','mozzarella','butter']));
 assert.equal(m.percent,100);assert.equal(m.ready,true);assert.equal(m.exact,false);
 assert.deepEqual(m.have,['bread','butter']);assert.deepEqual(m.missing,[]);
 assert.deepEqual(m.substitutions.map(s=>[s.required,s.replacement]),[['cheddar','mozzarella']]);
 assert.deepEqual(replacementAmount(recipe('grilled-cheese'),m.substitutions[0]),[80,'g']);
});
test('the original ingredient wins whenever it is available',()=>{
 const m=matchDetails(recipe('grilled-cheese'),kitchen(['bread','cheddar','mozzarella','butter']));
 assert.equal(m.exact,true);assert.equal(m.substitutions.length,0);
});
test('replacement preference is deterministic and uses only selected ingredients',()=>{
 const r=recipe('masala-omelette');
 for(const selected of [['ghee','olive-oil'],['olive-oil','ghee']]){
  assert.equal(matchDetails(r,kitchen(selected)).substitutions.find(s=>s.required==='neutral-oil').replacement,'olive-oil');
 }
 assert.equal(matchDetails(r,kitchen(['ghee'])).substitutions.find(s=>s.required==='neutral-oil').replacement,'ghee');
 assert.ok(matchDetails(r,kitchen()).missing.includes('neutral-oil'));
});
test('partial substitutions leave unresolved ingredients missing and below 100%',()=>{
 const m=matchDetails(recipe('grilled-cheese'),kitchen(['mozzarella']));
 assert.deepEqual(m.missing,['bread','butter']);assert.equal(m.percent,33);
 assert.equal(m.ready,false);assert.equal(m.substitutions.length,1);
});
test('exact recipes rank before fully substituted recipes, then partial recipes',()=>{
 const base={...recipe('grilled-cheese')};
 const exact={...base,id:'exact',name:'Exact',needed:['bread','mozzarella','butter'],time:120};
 const partial={...base,id:'partial',name:'Partial',needed:['bread','tomato'],time:1};
 const s=kitchen(['bread','mozzarella','butter']);
 assert.deepEqual(rankRecipes([partial,base,exact],s).map(r=>r.id),['exact','grilled-cheese','partial']);
 const plan=summarizePlan([partial,base,exact],s);
 assert.equal(plan.complete,2);assert.equal(plan.exact,1);assert.equal(plan.withSubstitutions,1);
});
test('similar names, unrelated ingredients and unapproved dish contexts never become swaps',()=>{
 assert.ok(matchDetails(recipe('masala-omelette'),kitchen(['coriander-powder'])).missing.includes('coriander'));
 assert.ok(matchDetails(recipe('lemon-rice'),kitchen(['rice'])).missing.includes('cooked-rice'));
 assert.ok(matchDetails(recipe('fluffy-pancakes'),kitchen(['olive-oil'])).missing.includes('butter'));
 assert.ok(matchDetails(recipe('simple-khichdi'),kitchen(['sugar','curry-powder'])).missing.includes('salt'));
 assert.equal(matchDetails({...recipe('grilled-cheese'),id:'unreviewed'},kitchen(['mozzarella'])).substitutions.length,0);
});
test('rules never chain through ingredients the user does not have',()=>{
 const r=recipe('grilled-cheese');
 const m=matchDetails(r,kitchen(['bread','mozzarella','coconut-oil']));
 assert.ok(m.missing.includes('butter'));
 assert.ok(m.substitutions.every(s=>s.replacement==='mozzarella'));
});
test('replacement quantities name the actual fruit and preserve separate required amounts',()=>{
 const r=recipe('guacamole');
 const swap=matchDetails(r,kitchen(['lemon'])).substitutions.find(s=>s.required==='lime');
 assert.deepEqual(replacementAmount(r,swap),[0.5,'lemon']);
 const upma=recipe('vegetable-upma');
 const nuts=matchDetails(upma,kitchen(['peanuts']));
 assert.ok(nuts.have.includes('peanuts'));
 assert.deepEqual(replacementAmount(upma,nuts.substitutions.find(s=>s.required==='cashews')),[1,'tbsp']);
 assert.deepEqual(upma.amounts.peanuts,[1,'tbsp']);
});
test('every substitution references real ingredients and explicitly supported recipes',()=>{
 const ids=new Set(ingredients.map(i=>i.id));
 for(const rule of SUBSTITUTIONS){
  assert.ok(ids.has(rule.required));assert.ok(ids.has(rule.replacement));
  assert.notEqual(rule.required,rule.replacement);assert.ok(rule.note.length>20);assert.ok(rule.ratio>0);
  for(const id of rule.recipes){
   const r=recipe(id);assert.ok(r,`${id} exists`);assert.ok(r.needed.includes(rule.required),`${id} uses ${rule.required}`);
   const s=kitchen([...r.needed.filter(i=>i!==rule.required),rule.replacement]);
   const original=JSON.stringify(r), pantry=JSON.stringify(s);
   const m=matchDetails(r,s);
   assert.equal(m.ready,true,`${id}: ${rule.required}`);
   assert.equal(m.exact,false);assert.ok(m.substitutions.some(s=>s.required===rule.required));
   assert.equal(JSON.stringify(r),original);assert.equal(JSON.stringify(s),pantry);
  }
 }
});
test('an empty recipe is never advertised as ready or 100% covered',()=>{
 const m=matchDetails({needed:[]},kitchen(['salt']));
 assert.equal(m.percent,0);assert.equal(m.ready,false);assert.equal(m.exact,false);
});
