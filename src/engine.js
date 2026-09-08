export const BASICS = ['salt', 'sugar', 'neutral-oil', 'black-pepper'];
export const SPICES = ['turmeric', 'cumin', 'coriander-powder', 'garam-masala', 'rajma-masala', 'chaat-masala', 'chilli-powder'];
export const STAPLES = [...BASICS, ...SPICES];
export const TIME_OPTIONS = [[15, 'Up to 15 min'], [30, '16–30 min'], [45, '30+ min']];
export const PLAN_OPTIONS = [['one-meal', 'One meal'], ['today', 'Today'], ['three-days', '3 days'], ['week', 'The week']];
export const defaults = () => ({selected: [], staples: [], cuisine: [], times: [30], lengths: ['today'], servings: 2, category: 'all', query: '', selectedOnly: false});

export function normalizeState(saved, ingredientIds, cuisineIds) {
  const value = saved && typeof saved === 'object' ? saved : {};
  const valid = (items, allowed) => [...new Set(Array.isArray(items) ? items.filter(x => allowed.includes(x)) : [])];
  const selected = valid(value.selected, ingredientIds);
  const legacyBasics = value.basics === true ? ['salt', 'black-pepper', 'neutral-oil'] : [];
  return {...defaults(),
    selected: selected.filter(id => !STAPLES.includes(id) && id !== 'water'),
    staples: valid(Array.isArray(value.staples) ? value.staples : [...selected.filter(id => STAPLES.includes(id)), ...legacyBasics], STAPLES),
    cuisine: valid(value.cuisine, cuisineIds),
    times: valid(value.times ?? (value.time ? [value.time] : [30]), TIME_OPTIONS.map(x => x[0])),
    lengths: valid(value.lengths ?? (value.length ? [value.length] : ['today']), PLAN_OPTIONS.map(x => x[0])),
    servings: Number.isFinite(value.servings) ? Math.max(1, Math.min(8, Math.round(value.servings))) : 2
  };
}
export function availableIds(state) { return new Set([...state.selected, ...state.staples]); }
export function matchDetails(recipe, state) {
  const available = availableIds(state);
  const have = recipe.needed.filter(id => available.has(id));
  const missing = recipe.needed.filter(id => !available.has(id));
  const coverage = recipe.needed.length ? have.length / recipe.needed.length : 0;
  // A missing item must never round up to a misleading 100% badge.
  return {have, missing, coverage, percent: missing.length ? Math.min(99, Math.round(coverage * 100)) : 100};
}
export function timeBucket(minutes) { return minutes <= 15 ? 15 : minutes <= 30 ? 30 : 45; }
export function cuisineId(name) { return name === 'Healthy-ish' ? 'healthy' : name.toLowerCase().replaceAll(' ', '-'); }
export function preferenceScore(recipe, state) {
  const cuisine = cuisineId(recipe.cuisine);
  const cuisineMatch = !state.cuisine.length || state.cuisine.includes('surprise') || state.cuisine.includes(cuisine);
  const timeMatch = !state.times.length || state.times.includes(timeBucket(recipe.time));
  const batchMatch = state.lengths.some(x => ['three-days', 'week'].includes(x)) && recipe.batchFriendly;
  return Number(cuisineMatch) * 4 + Number(timeMatch) * 3 + Number(batchMatch);
}
export function rankRecipes(recipes, state) {
  const ranked = recipes.map(recipe => ({recipe, coverage: matchDetails(recipe, state).coverage, preference: preferenceScore(recipe, state)}));
  ranked.sort((a, b) => b.coverage - a.coverage ||
    Number(a.recipe.difficulty !== 'Easy') - Number(b.recipe.difficulty !== 'Easy') ||
    b.preference - a.preference || a.recipe.time - b.recipe.time ||
    a.recipe.needed.length - b.recipe.needed.length || a.recipe.name.localeCompare(b.recipe.name));
  return ranked.map(x => x.recipe);
}
export function summarizePlan(recipes, state) {
  const meals = rankRecipes(recipes, state);
  const available = availableIds(state);
  const used = new Set(meals.flatMap(r => r.needed).filter(id => available.has(id)));
  return {meals, score: available.size ? Math.round(used.size / available.size * 100) : 0,
    complete: meals.filter(r => matchDetails(r, state).missing.length === 0).length};
}
