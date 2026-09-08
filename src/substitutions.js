// Ordered by preference, scoped to dishes where the ingredient serves the same role.
// These are home-cooking adaptations, not claims that ingredients are identical.
const rules = [];
function add(required, replacement, recipes, note, options = {}) {
  rules.push({required, replacement, recipes: recipes.split(' '), ratio: 1, note, ...options});
}
const panRecipes = 'kanda-poha vegetable-upma masala-omelette aloo-gobi moong-dal matar-paneer chickpea-curry aloo-masala fluffy-pancakes vegetable-fried-rice spinach-quesadilla kerala-vegetable-stew egg-rice teriyaki-chicken tofu-pad-thai vegetable-bibimbap';
add('neutral-oil', 'olive-oil', panRecipes, 'Use the same amount for pan cooking. Olive oil adds a little flavour; keep the heat moderate.');
add('neutral-oil', 'ghee', panRecipes, 'Use the same amount, melted. Ghee adds a buttery flavour.');
add('neutral-oil', 'coconut-oil', panRecipes, 'Use the same amount, melted. Coconut oil may add a coconut flavour.');
add('butter', 'ghee', 'scrambled-eggs grilled-cheese french-toast', 'Use the same amount of ghee instead of butter, including for coating the bread or pan. The flavour will be richer.');
add('butter', 'olive-oil', 'scrambled-eggs french-toast', 'Use the same amount of oil. Warm it gently instead of melting butter; the result will taste less buttery.');
add('butter', 'neutral-oil', 'scrambled-eggs french-toast', 'Use the same amount of oil. Warm it gently instead of melting butter; the result will taste less buttery.');
add('cheddar', 'mozzarella', 'grilled-cheese spinach-quesadilla', 'Use the same amount, grated or thinly sliced. Drain and pat dry fresh mozzarella first; it melts well but tastes milder.');
add('lemon', 'lime', 'aloo-gobi lemon-rice', 'Use lime juice in place of lemon juice. Start with the listed fruit quantity, then adjust to taste because size and acidity vary.', {unit: 'lime'});
add('lime', 'lemon', 'guacamole quinoa-peanut-salad', 'Use lemon juice in place of lime juice. Start with the listed fruit quantity, then adjust to taste because size and acidity vary.', {unit: 'lemon'});
add('coriander', 'parsley', 'kanda-poha masala-omelette cucumber-raita quick-hummus quinoa-peanut-salad', 'Use the same amount of chopped fresh parsley. It adds freshness but has a different flavour from coriander.');
add('parsley', 'coriander', 'aglio-e-olio', 'Use the same amount of chopped fresh coriander at the end. This changes the herb flavour of the pasta.');
add('paneer', 'tofu', 'matar-paneer', 'Use the same weight of firm tofu. Drain, pat dry and cube it; fold it in gently where the method adds paneer.');
add('peanuts', 'cashews', 'vegetable-upma lemon-rice tofu-pad-thai quinoa-peanut-salad', 'Use the same amount of cashews, chopped if large. Toast or fry where the method calls for peanuts; the result is sweeter and less peanut-flavoured.');
add('cashews', 'peanuts', 'vegetable-upma', 'Use the same amount of peanuts and fry until golden where the method calls for cashews. This is in addition to the peanuts already in the recipe.');
add('chickpeas', 'kidney-beans', 'chickpea-curry', 'Use the same amount of already cooked or canned kidney beans, drained and rinsed. This makes a bean curry with a softer texture.');
add('peas', 'frozen-veg', 'vegetable-fried-rice matar-paneer kerala-vegetable-stew', 'Use the same volume of small-cut frozen vegetables. Cook until tender where the method adds peas; the mix changes the flavour and texture.');
add('onion', 'spring-onion', 'vegetable-fried-rice', 'Use the same measured volume, chopped. Cook the white parts where the method adds onion and stir the green parts in at the end.');
add('chilli-powder', 'paprika', 'masala-omelette aloo-gobi matar-paneer chickpea-curry tofu-pad-thai', 'Use the same amount of paprika in place of red chilli powder. Sweet paprika makes the dish much milder; smoked paprika adds a smoky flavour.');

export const SUBSTITUTIONS = rules;
export function findSubstitution(recipe, required, available) {
  return SUBSTITUTIONS.find(rule => rule.required === required && rule.recipes.includes(recipe.id) && available.has(rule.replacement));
}
export function replacementAmount(recipe, swap) {
  const amount = recipe.amounts?.[swap.required];
  return Array.isArray(amount) ? [amount[0] * swap.ratio, swap.unit || amount[1]] : amount;
}
