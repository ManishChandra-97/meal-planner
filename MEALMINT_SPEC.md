# MealMint — Web V1 Product & Engineering Specification

> **Dinner, from what you've got.**

MealMint is a responsive web application that creates meal plans based primarily on ingredients a user already has at home.

The primary V1 flow is:

```text
Ingredients
    ↓
Cuisine / preferences
    ↓
Generate meal plan
    ↓
Recipe
    ↓
Cook
```

The user should be able to go from landing on the website to receiving useful meal recommendations in approximately 60 seconds.

---

# 1. PRODUCT GOAL

Build a delightful V1 that answers:

> "What can I cook with the food I already have?"

The application should prioritize:

1. Pantry utilization
2. Low friction
3. Useful meal recommendations
4. Great mobile UX
5. Fast interactions
6. Delightful but restrained personality

Do not optimize V1 for:

- social functionality
- authentication
- payments
- grocery delivery
- calorie tracking
- complex nutrition tracking
- user profiles

These can come later.

---

# 2. BRAND

## Name

MealMint

## Tagline

> Dinner, from what you've got.

## Voice

Warm, playful and concise.

Examples:

```text
What's hanging around your kitchen?
```

```text
What are we craving?
```

```text
Look what your kitchen can do.
```

```text
Your lonely capsicum finally has plans tonight.
```

Humour should appear occasionally.

Never turn every interface element into a joke.

---

# 3. DESIGN SYSTEM

## Font

Use Google Font:

```text
Lato
```

Weights:

```text
400
600
700
900
```

---

## CSS variables

```css
:root {
  --background: #F7F1E7;
  --surface: #FFFDF8;

  --green-900: #26352D;
  --green-700: #2F6B4F;
  --green-400: #9BCB9A;
  --green-100: #DCE8D5;

  --saffron: #E7A45B;
  --tomato: #D9735A;

  --text-primary: #26352D;
  --text-secondary: #70766F;

  --border: rgba(38, 53, 45, 0.12);
}
```

Never use pure `#000000` as the primary text color.

---

# 4. UI STYLE

Use:

- rounded cards
- tactile buttons
- ingredient pills
- gentle borders
- large typography
- generous spacing
- food icons / illustrations
- subtle shadows

Approximate radius:

```text
Small controls: 12px
Ingredient pills: 9999px
Cards: 20px
Large containers: 28px
```

Avoid:

- SaaS dashboard styling
- excessive gradients
- glassmorphism everywhere
- neon colors
- tiny typography
- cluttered interfaces

---

# 5. TECH STACK

Preferred:

```text
Next.js
React
TypeScript
Tailwind CSS
Lucide React
Framer Motion
Zod
```

Use the current stable compatible versions.

Use:

```text
npm
```

unless the existing repository uses another package manager.

---

# 6. APPLICATION ARCHITECTURE

Suggested structure:

```text
src/
  app/
    page.tsx

    plan/
      page.tsx

    recipe/
      [id]/
        page.tsx

    api/
      meal-plan/
        route.ts

  components/
    layout/
      Header.tsx
      PageContainer.tsx

    ingredients/
      IngredientSearch.tsx
      IngredientCategory.tsx
      IngredientChip.tsx
      IngredientTray.tsx
      IngredientFact.tsx

    preferences/
      CuisineCard.tsx
      CuisineSelector.tsx
      TimeSelector.tsx
      ServingStepper.tsx
      PlanLengthSelector.tsx

    meals/
      MealPlanSummary.tsx
      MealCard.tsx
      PantryScore.tsx
      MissingIngredients.tsx

    recipe/
      RecipeHeader.tsx
      RecipeIngredientList.tsx
      RecipeStep.tsx
      CookingMode.tsx

    ui/
      Button.tsx
      Card.tsx
      Chip.tsx
      Sticker.tsx
      Progress.tsx

  data/
    ingredients.ts
    cuisines.ts
    ingredientFacts.ts
    mockRecipes.ts

  lib/
    mealPlanner/
      scoreRecipe.ts
      rankRecipes.ts
      createPlan.ts

    storage.ts
    ingredientMatching.ts

  types/
    ingredient.ts
    meal.ts
    preference.ts
```

Adapt structure where necessary.

Keep concerns separated.

---

# 7. PAGE STRUCTURE

## `/`

Contains:

```text
Hero
↓
Step 1: ingredients
↓
Step 2: preferences
↓
Generate CTA
```

Do not require separate pages for each onboarding step.

The input journey should scroll naturally.

---

# 8. HERO

Headline:

```text
Your fridge already knows what's for dinner.
```

Body:

```text
Tell MealMint what you've got. Pick what you're craving.
We'll turn it into meals.
```

CTA:

```text
Raid my fridge →
```

Clicking it smoothly scrolls to:

```text
#ingredients
```

Decorative food stickers can gently float around the hero.

Use CSS/SVG/emoji assets for V1.

---

# 9. INGREDIENT DATA MODEL

```ts
type IngredientCategory =
  | "vegetables"
  | "fruits"
  | "meat"
  | "seafood"
  | "dairy"
  | "grains"
  | "legumes"
  | "spices"
  | "oils"
  | "sauces"
  | "other";

interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;

  aliases?: string[];

  emoji?: string;
}
```

---

# 10. INGREDIENT CATEGORIES

Populate V1 with at least 100 common ingredients.

Categories:

```text
Vegetables
Fruits
Meat & Poultry
Seafood
Eggs & Dairy
Grains & Staples
Lentils & Legumes
Spices & Herbs
Oils & Fats
Sauces & Condiments
Pantry & Other
```

---

# 11. INGREDIENT SEARCH

Search must match:

```text
name
aliases
```

Search should be:

- client-side
- instantaneous
- typo tolerant where reasonably simple
- case insensitive

Examples:

```text
"capsicum" → Capsicum
"bell pepper" → Capsicum
"coriander" → Fresh coriander
"cilantro" → Fresh coriander
```

---

# 12. INGREDIENT SELECTION

Ingredient chips must support:

```text
default
hover
selected
focus
```

Selected state should contain:

```text
✓
```

Click again to deselect.

Apply a small spring animation on selection.

---

# 13. PANTRY BASICS

Provide:

```text
I have the basics
```

Selecting this adds:

```text
Salt
Black pepper
Water
Neutral cooking oil
```

Display these ingredients.

Do not silently assume pantry staples.

---

# 14. SELECTED INGREDIENT TRAY

Desktop:

Sticky card/sidebar.

Mobile:

Sticky/collapsible bottom tray.

Example:

```text
Your kitchen

14 ingredients
```

Expanded:

```text
Tomato ×
Onion ×
Garlic ×
Paneer ×
Rice ×
...
```

---

# 15. CUISINE MODEL

```ts
interface Cuisine {
  id: string;
  name: string;
  emoji: string;
}
```

V1 cuisines:

```text
Indian
Chinese
Italian
Mexican
Thai
Japanese
Korean
Mediterranean
Middle Eastern
American
Healthy-ish
Surprise me
```

Allow multiple selection.

Recommended UX:

```text
maximum 3
```

---

# 16. OTHER PREFERENCES

## Cooking time

Values:

```ts
15
30
45
```

Labels:

```text
15 min — I have places to be
30 min — Normal human dinner
45+ min — Let's cook properly
```

---

## Servings

Range:

```text
1–8
```

Default:

```text
2
```

---

## Plan length

```ts
type PlanLength =
  | "one-meal"
  | "today"
  | "three-days"
  | "week";
```

Default:

```text
today
```

---

# 17. STATE MODEL

```ts
interface MealMintPreferences {
  ingredientIds: string[];

  cuisineIds: string[];

  maxCookingTime?: number;

  servings: number;

  planLength: PlanLength;
}
```

Persist current selections to:

```text
localStorage
```

V1 does not require authentication.

---

# 18. GENERATION CTA

Button:

```text
Make my meals ✨
```

Disable only when zero ingredients have been selected.

Do not unnecessarily block users because they selected only two or three ingredients.

---

# 19. MEAL MODEL

```ts
interface RecipeIngredient {
  name: string;

  quantity?: string;

  pantryIngredientId?: string;

  required: boolean;
}

interface RecipeStep {
  number: number;

  instruction: string;
}

interface Meal {
  id: string;

  name: string;

  description: string;

  cuisine: string;

  mealType:
    | "breakfast"
    | "lunch"
    | "dinner"
    | "snack";

  cookingTimeMinutes: number;

  difficulty:
    | "Easy"
    | "Medium"
    | "Ambitious";

  servings: number;

  ingredients: RecipeIngredient[];

  steps: RecipeStep[];

  substitutions?: string[];

  explanation?: string;
}
```

---

# 20. MEAL PLANNER

Create a clear abstraction:

```ts
generateMealPlan(
  preferences: MealMintPreferences
): Promise<MealPlan>
```

The frontend should not care whether recommendations come from:

```text
local recipe data
or
an AI API
```

---

# 21. V1 FALLBACK

Include at least:

```text
30–50 seed recipes
```

in local recipe data.

This ensures the UI works without an external API.

Include recipes from several cuisines.

---

# 22. OPTIONAL AI PROVIDER

Design `/api/meal-plan` so an AI provider can later generate recipes.

Never expose an API secret to the browser.

Use:

```text
server-side environment variables
```

Example:

```text
MEAL_PLANNER_API_KEY
```

Validate AI responses using:

```text
Zod
```

before returning data to the frontend.

If validation fails:

```text
fall back to local planner
```

---

# 23. IMPORTANT AI CONSTRAINT

When generating recipes, distinguish between:

```text
AVAILABLE INGREDIENTS
```

and:

```text
MISSING INGREDIENTS
```

Never pretend that the user owns an ingredient they did not select.

Pantry basics can only be considered available if:

```text
"I have the basics"
```

was enabled.

---

# 24. RECIPE SCORING

Rank candidate recipes.

Suggested model:

```ts
score =
  ingredientCoverage * 0.55 +
  cuisineMatch       * 0.20 +
  timeMatch          * 0.10 +
  pantryUtilization  * 0.10 +
  varietyScore       * 0.05;
```

Each component should return:

```text
0–1
```

---

## Ingredient coverage

```ts
ingredientCoverage =
  availableRequiredIngredients /
  totalRequiredIngredients;
```

---

## Pantry utilization

```ts
pantryUtilization =
  selectedIngredientsUsed /
  selectedIngredientsTotal;
```

---

# 25. FULL PLAN OPTIMIZATION

Do not independently pick the highest-ranked recipe repeatedly.

Across a multi-meal plan, favor:

- cuisine diversity
- ingredient utilization
- minimal missing ingredients
- avoiding repeated identical meals

Keep algorithm understandable.

No need for sophisticated ML.

---

# 26. MISSING INGREDIENTS

Meal cards must explicitly show:

```text
You have 9 / 10 ingredients
```

Then:

```text
You'll need

+ Fresh coriander
```

If a recipe requires many missing ingredients, rank it lower.

---

# 27. RESULTS PAGE

Route:

```text
/plan
```

Header:

```text
Look what your kitchen can do.
```

Summary:

```text
18 ingredients
4 meals
2 extras needed
```

Display:

```text
Pantry Score: 82%
```

Explanation:

```text
82% of the ingredients you selected appear somewhere in your meal plan.
```

---

# 28. MEAL CARD

Each meal card should show:

```text
Recipe name

Cuisine · time · difficulty

ingredient coverage

ingredients being used

missing ingredients
```

Actions:

```text
Cook this
Swap
```

Example:

```text
Creamy Tomato Paneer

Indian · 28 min · Easy

You have 9/10 ingredients

█████████░ 90%

Need:
+ Fresh coriander
```

---

# 29. SWAP

Swap must replace a meal with the next appropriate candidate without regenerating the entire plan.

Animation:

```text
current card exits
replacement card enters
```

Possible microcopy:

```text
Paneer has been benched.
```

```text
Pasta enters the chat.
```

Use jokes sparingly.

---

# 30. RECIPE PAGE

Route:

```text
/recipe/[id]
```

Sections:

```text
Recipe header
Available ingredients
Missing ingredients
Steps
Substitutions
Cooking mode
```

---

# 31. COOKING MODE

Cooking Mode is particularly important on phones.

When enabled:

```text
one step per screen
large typography
large Next button
large Previous button
progress indicator
```

Example:

```text
Step 3 of 7

Add tomato, cumin and turmeric.

[ Previous ]       [ Next ]
```

Avoid distractions.

---

# 32. FUN FACT MODEL

Ingredient facts must NOT be dynamically hallucinated.

Use a curated dataset.

```ts
interface IngredientFact {
  id: string;

  ingredientId: string;

  fact: string;

  sourceName: string;

  sourceUrl: string;

  verifiedAt: string;
}
```

---

# 33. FACT SOURCING

Facts should come from credible sources such as:

```text
USDA FoodData Central
FAO
government agriculture agencies
universities
recognized scientific institutions
```

Every fact displayed in the UI must have:

```text
Source ↗
```

Do not include a fact if no credible source is attached.

Avoid health claims unless they are directly supported by the source and accurately represented.

---

# 34. FACT UI

Facts should interrupt the ingredient list occasionally.

Example:

```text
┌─────────────────────────────────┐
│ 🍅 Tiny tomato trivia           │
│                                 │
│ Botanically, tomatoes are       │
│ fruits.                         │
│                                 │
│ Source ↗                        │
└─────────────────────────────────┘
```

Do not show a fact after every ingredient.

Aim approximately:

```text
one fact every 1–2 category sections
```

---

# 35. LOADING EXPERIENCE

Avoid generic:

```text
Loading...
```

Rotate messages such as:

```text
Raiding the pantry…
```

```text
Negotiating with your onions…
```

```text
Giving yesterday's vegetables a second chance…
```

```text
Matching dinner to your cravings…
```

Do not artificially delay responses just to display animations.

---

# 36. STICKERS

Create a simple reusable:

```tsx
<Sticker />
```

component.

Possible sticker assets:

```text
🍅
🥕
🌶️
🧄
🥑
🥦
🍋
🍜
🍛
```

Use subtle:

```text
rotate
scale
float
```

animations.

Respect:

```css
prefers-reduced-motion
```

---

# 37. EMPTY STATES

## No ingredients

```text
Even we can't cook with air.

Add some ingredients →
```

## Few ingredients

```text
Minimalist kitchen. We respect it.
```

Still generate possible options.

## Weak cuisine match

Never show:

```text
No results
```

Instead:

```text
Your pantry has other ideas.

Here are the closest matches we could make.
```

---

# 38. RESPONSIVE DESIGN

Mobile-first implementation.

Breakpoints:

```text
<640px mobile

640–1024px tablet

>1024px desktop
```

---

# 39. MOBILE REQUIREMENTS

Ingredient category navigation:

```text
horizontal scrolling
```

Cuisine grid:

```text
2 columns
```

Ingredient chips:

```text
natural wrapping
```

Selected pantry tray:

```text
sticky bottom sheet
```

Primary CTA:

```text
easy thumb reach
```

Minimum interactive target:

```text
44px
```

No horizontal page overflow.

---

# 40. DESKTOP

Use maximum content width around:

```text
1180–1280px
```

Ingredient selection may use:

```text
main content + sticky selected ingredient sidebar
```

Cuisine cards:

```text
3–4 columns
```

---

# 41. SCROLLING

Use smooth scrolling.

Do not implement aggressive scroll snapping.

Use:

```text
IntersectionObserver
```

for reveal animations.

Animations should generally take:

```text
150–400ms
```

Avoid long transitions.

Scrolling must remain user-controlled.

---

# 42. ACCESSIBILITY

Implement:

- semantic HTML
- keyboard accessibility
- focus rings
- ARIA labels where appropriate
- sufficient contrast
- descriptive buttons
- reduced motion support

Selection cannot be communicated by green color alone.

Use:

```text
✓ + color
```

---

# 43. PERFORMANCE

Target good Lighthouse results.

Optimize for:

```text
fast initial load
minimal layout shift
small client bundle
responsive interaction
```

Lazy-load noncritical illustrations.

Avoid unnecessarily large food photography in V1.

---

# 44. LOCAL STORAGE

Persist:

```text
selected ingredients
selected cuisines
serving count
cooking time
plan length
latest generated plan
```

Provide:

```text
Start over
```

to clear session data.

---

# 45. ERROR HANDLING

If meal generation fails:

```text
Our chef got distracted.

Trying the pantry again…
```

Automatically attempt local fallback.

Do not expose API/internal errors to end users.

Log them in development.

---

# 46. SECURITY

Never expose:

```text
API keys
server environment variables
internal prompts
```

to the frontend.

Any future AI API call must happen server-side.

Validate:

```text
request payloads
AI responses
route inputs
```

Do not render arbitrary generated HTML.

Render recipe content as structured text.

---

# 47. ANALYTICS INTERFACE

Do not require analytics in V1, but structure actions so analytics can later be attached easily.

Important future events:

```text
ingredient_selected

ingredient_removed

cuisine_selected

plan_generated

meal_opened

meal_swapped

cooking_mode_started

meal_completed
```

---

# 48. CORE COMPONENTS TO COMPLETE

The V1 is not complete until these work:

- [ ] Hero
- [ ] Ingredient search
- [ ] Ingredient categories
- [ ] Ingredient selection
- [ ] Pantry basics
- [ ] Selected ingredient tray
- [ ] Verified ingredient fact cards
- [ ] Cuisine selection
- [ ] Cooking time selector
- [ ] Serving selector
- [ ] Plan length selector
- [ ] Meal generation
- [ ] Recipe scoring
- [ ] Results page
- [ ] Pantry score
- [ ] Missing ingredient display
- [ ] Meal swap
- [ ] Recipe page
- [ ] Cooking mode
- [ ] Local storage persistence
- [ ] Mobile UX
- [ ] Tablet UX
- [ ] Desktop UX
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Reduced-motion accessibility

---

# 49. SEED DATA

Create realistic seed data.

Minimum:

```text
100 ingredients
12 cuisines
30 recipes
10 verified ingredient facts
```

Do not invent citations for facts.

If verified facts cannot be sourced during implementation:

```text
leave facts disabled
```

rather than adding fabricated facts.

---

# 50. DEFINITION OF DONE

A user should be able to:

1. Open MealMint.
2. Select ingredients.
3. Search for additional ingredients.
4. Select cuisine preferences.
5. Choose servings/time if desired.
6. Generate a meal plan.
7. Understand which ingredients they already have.
8. Understand what they need to buy.
9. Swap an unwanted meal.
10. Open a recipe.
11. Follow recipe instructions.
12. Use Cooking Mode comfortably on a phone.
13. Refresh the browser without immediately losing their selections.

The app must work without authentication.

The app must work without a paid external service by using its local recipe fallback.

---

# 51. UX NORTH STAR

For every implementation decision, ask:

> Does this help someone decide what to cook faster?

Do not add features simply because they are technically interesting.

MealMint should feel less like recipe software and more like:

> **a clever friend standing in front of your fridge with you.**