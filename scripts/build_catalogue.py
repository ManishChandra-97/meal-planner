"""Build reviewed, portioned home-cooking adaptations from scraped open cookbook sources."""
import json
from pathlib import Path
from urllib.parse import quote
sources={int(r['file'].split('.')[0]):r for r in json.loads(Path('data/scraped-sources.json').read_text())}
recipes=[]
def add(n,id,name,cuisine,meal,time,items,steps,description,**extra):
    s=sources[n]
    assert s['ingredients'] and s['method'], f'Unextracted source: {id}'
    amounts={}
    for item in items.split(';'):
        fields=item.split('|');key=fields[0]
        amounts[key]=[float(fields[1]),fields[2]] if len(fields)==3 else (fields[1] if len(fields)>1 else 'to taste')
    recipes.append(dict(id=id,name=name,cuisine=cuisine,mealType=meal,time=time,difficulty='Easy',servings=2,needed=list(amounts),amounts=amounts,steps=steps,description=description,batchFriendly=extra.pop('batchFriendly',False),
      source={'title':s['title'].replace('Cookbook:',''),'url':f"https://en.wikibooks.org/w/index.php?oldid={s['revision']}",'history':'https://en.wikibooks.org/w/index.php?title='+quote(s['title'])+'&action=history','license':'CC BY-SA 4.0','retrieved':s['retrieved'],'changes':'Portions standardised; method rewritten for home cooking. Preparation shortcuts and estimated total times are stated.'},**extra))
add(0,'kanda-poha','Kanda Poha','Indian','breakfast',20,'poha|200|g;neutral-oil|2|tbsp;mustard-seeds|1|tsp;turmeric|0.25|tsp;asafoetida|1|pinch;green-chilli|1|chopped;onion|0.5|chopped;coriander|2|sprigs;salt',[
'Briefly rinse the poha in a sieve, drain and leave to soften while you prepare the onion and chilli.',
'Heat the oil in a frying pan. Add mustard seeds; once they pop, briefly stir in turmeric, asafoetida and green chilli.',
'Add the onion and cook gently for 2–3 minutes until soft. Loosen the damp poha with your fingers, then fold it into the pan with salt.',
'Cover and steam on low heat for 5 minutes. Stir, heat for another minute and finish with chopped fresh coriander.'
], 'Soft flattened rice with a simple onion and mustard-seed tempering.')
add(1,'vegetable-upma','Vegetable Upma','Indian','breakfast',25,'semolina|1|cup;onion|0.5|chopped;carrot|0.5|cup diced;green-chilli|1|chopped;ginger|1|tsp minced;neutral-oil|1|tbsp;mustard-seeds|1|tsp;cumin|1|tsp;urad-dal|1|tsp;peanuts|1|tbsp;cashews|1|tbsp;asafoetida|1|pinch;curry-leaves|5|leaves;salt;sugar|0.5|tsp',[
'Dry-roast the semolina over medium-low heat, stirring until fragrant and lightly golden. Tip onto a plate.',
'Heat oil in the same pan. Add mustard, cumin, urad dal, peanuts and cashews; stir until the seeds pop and the nuts are lightly golden.',
'Add asafoetida, curry leaves, ginger, chilli, onion and carrot. Cook for 3 minutes. Add the measured water and salt; cover and simmer until the carrot is tender.',
'Stir in sugar. Lower the heat and gradually pour in the semolina while stirring. Cover and cook gently for 3–5 minutes, until soft; loosen with hot water if needed.'
], 'Toasted semolina with vegetables and a nutty tempering.',water=2.5,prepNote='This adaptation omits the coconut and coriander garnish in the source.')
add(2,'simple-khichdi','Simple Dal Khichdi','Indian','lunch / dinner',40,'rice|0.5|cup;moong-dal|0.5|cup;turmeric|0.5|tsp;salt',[
'Rinse rice and moong dal, then soak together for 15 minutes and drain.',
'Add them to a pressure cooker with the measured water, turmeric and salt. Follow your cooker’s minimum-liquid and fill-limit instructions.',
'Bring to pressure, then cook on low for about 5 minutes. Turn off the heat and let the pressure release naturally before opening.',
'Stir until creamy, adding hot water if needed. If the rice or dal is still firm, simmer uncovered until completely soft.'
], 'A four-ingredient comfort meal, including the seasonings.',water=3,batchFriendly=True,prepNote='Estimated time includes soaking and natural pressure release; cooker times vary.')
add(3,'masala-omelette','Masala Omelette','Indian','breakfast',15,'eggs|4|eggs;onion|1|cup chopped;tomato|0.5|cup chopped;salt;black-pepper|0.25|tsp;cumin|0.5|tsp;coriander|1|tbsp chopped;green-chilli|1|chopped;chilli-powder|0.25|tsp;neutral-oil|2|tsp',[
'Finely chop the onion, tomato, chilli and coriander. Whisk the eggs with the salt, pepper, cumin and chilli powder, then stir in the vegetables.',
'Heat half the oil in a small non-stick pan over medium-low heat and add half the egg mixture.',
'Cook until the underside is lightly golden and the top is mostly set. Flip carefully and cook until no liquid egg remains.',
'Repeat with the remaining oil and mixture. Serve each omelette hot.'
], 'A familiar pan omelette with onion, tomato and everyday spices.')
add(4,'aloo-gobi','Home-style Aloo Gobi','Indian','lunch / dinner',35,'potato|2|medium;cauliflower|300|g;tomato|2|medium;neutral-oil|1.5|tbsp;cumin|0.5|tsp;turmeric|0.25|tsp;coriander-powder|1|tsp;chilli-powder|0.25|tsp;garam-masala|0.5|tsp;lemon|0.5|lemon;salt',[
'Cut potatoes into small cubes, cauliflower into bite-size florets and tomatoes into small pieces.',
'Heat oil and let cumin sizzle. Stir in turmeric, coriander powder, chilli powder and tomatoes; cook until the tomatoes soften.',
'Add potatoes, cauliflower, salt and a small splash of water. Cover and cook gently for 15–20 minutes, stirring occasionally, until both vegetables are tender.',
'Uncover to evaporate excess water. Add garam masala and lemon juice, stir and serve.'
], 'A simple covered-pan potato and cauliflower sabzi.',batchFriendly=True,prepNote='Adaptation uses smaller portions and salt to taste; the source’s unusually high salt quantity is not used. Mint garnish omitted.')
add(5,'cucumber-raita','Cucumber Raita','Indian','side',10,'cucumber|0.5|cup grated;yogurt|1|cup;mint|5|leaves;coriander|1|tsp chopped;cumin|0.25|tsp;salt',[
'Squeeze excess liquid from the grated cucumber. Whisk the yogurt until smooth.',
'Finely chop the mint and fresh coriander, then stir into the yogurt with cucumber and salt.',
'Dry-toast the cumin briefly until fragrant, crush it and sprinkle over the raita. Serve cool.'
], 'A cool yogurt side for rice, roti or a simple curry.',prepNote='Optional onion and chilli from the source are omitted.')
add(6,'chapati','Everyday Chapati','Indian','side',30,'whole-wheat-flour|1.5|cups;salt',[
'Mix flour and salt. Add warm water a little at a time and knead to a smooth, soft dough; stop adding water when the dough holds together without sticking.',
'Cover and rest for 10 minutes. Divide into small equal balls and roll into thin rounds on a lightly floured surface.',
'Heat a dry heavy pan over medium-high heat. Cook each chapati until bubbles form, then flip and cook the other side.',
'Press gently with a spatula to help it puff. Turn as needed until cooked with light brown spots. Keep covered in a clean cloth while cooking the rest.'
], 'Whole-wheat flatbreads made with flour, water and a little salt.',water=0.75,waterNote='approximately; add gradually.',prepNote='Makes about 6 small chapatis for 2 people; optional ghee omitted.')
add(7,'lemon-rice','Lemon Rice','Indian','lunch / dinner',15,'cooked-rice|2|cups;mustard-seeds|0.5|tsp;sesame-oil|1.5|tbsp;split-peas|1|tbsp;peanuts|1|tbsp;asafoetida|0.25|tsp;dried-chilli|2|chillies;curry-leaves|5|leaves;lemon|1|lemon;turmeric|0.5|tsp;salt',[
'Break up any clumps in the cooked rice. Juice the lemon and keep it ready.',
'Heat sesame oil. Fry the split peas and peanuts until golden, then add mustard seeds, asafoetida, curry leaves and dried chillies.',
'When the seeds pop, lower the heat and stir in turmeric, salt and lemon juice.',
'Fold in the cooked rice. Stir over medium heat until thoroughly steaming hot, then serve.'
], 'Bright lemon rice using rice you have already cooked.',prepNote='15 minutes assumes cooked rice is ready. Uncooked rice is a separate pantry item.')
add(8,'moong-dal','Everyday Moong Dal','Indian','lunch / dinner',35,'moong-dal|0.5|cup;green-chilli|1|chilli;turmeric|0.5|tsp;salt;neutral-oil|1|tbsp;curry-leaves|5|leaves;cumin|1|tsp',[
'Rinse the dal. Put it in a pressure cooker with chilli, turmeric and measured water, observing the cooker’s minimum-liquid instructions.',
'Pressure-cook for about 10–15 minutes, then allow pressure to release naturally. Open and mash the dal; add salt and extra hot water if needed.',
'In a small pan, heat oil and add cumin and curry leaves. When fragrant, pour the tempering into the dal.',
'Simmer briefly, stirring, until hot and creamy.'
], 'Soft yellow dal with a quick cumin and curry-leaf tempering.',water=1.5,batchFriendly=True)
add(9,'matar-paneer','Matar Paneer','Indian','lunch / dinner',35,'paneer|200|g;peas|0.5|cup;onion|1|cup chopped;tomato|1|cup chopped;ginger|0.5|tsp minced;garlic|0.5|tsp minced;green-chilli|1|chopped;neutral-oil|1.5|tbsp;cumin|0.5|tsp;turmeric|0.25|tsp;chilli-powder|0.5|tsp;coriander-powder|1|tsp;garam-masala|0.5|tsp;salt',[
'Cut the paneer into cubes. Heat oil in a pan, add cumin, then onion. Cook until softened.',
'Add ginger, garlic and green chilli. Stir briefly, then add tomato, turmeric, chilli powder and coriander powder. Cook until the tomatoes become a thick sauce.',
'Add peas, salt and the measured water. Cover and simmer until the peas are tender.',
'Add paneer and garam masala. Simmer gently for 3–5 minutes, adding a little water if the sauce is too thick.'
], 'Paneer and peas in a simple, unblended tomato gravy.',water=0.75,batchFriendly=True,prepNote='Simplified from the source: no blender, separate paneer frying or final oil tempering.')
add(10,'chickpea-curry','Quick Chickpea Curry','Indian','lunch / dinner',25,'chickpeas|2|cups cooked;neutral-oil|1|tbsp;onion|1|chopped;tomato|1|chopped;chilli-powder|0.5|tsp;curry-powder|1.5|tsp;garam-masala|0.25|tsp;turmeric|0.25|tsp;garlic|1|tsp minced;ginger|1|tsp minced;salt',[
'Drain and rinse the cooked or canned chickpeas. Heat oil in a saucepan and cook the onion until golden.',
'Lower the heat and stir in the spices, followed by tomato, ginger and garlic. Cook for a few minutes until the tomato softens.',
'Add chickpeas, salt and measured water. Simmer for about 10 minutes, stirring occasionally.',
'Mash a spoonful of chickpeas into the sauce to thicken it, stir and serve.'
], 'A weeknight chole adaptation using already cooked chickpeas.',water=0.5,batchFriendly=True,prepNote='Uses cooked/canned chickpeas. The source’s overnight soaking and pressure-cooking are replaced by this shortcut.')
add(11,'aloo-masala','Aloo Masala','Indian','lunch / dinner',30,'potato|2|large;neutral-oil|1|tbsp;mustard-seeds|0.5|tsp;curry-leaves|5|leaves;onion|1|chopped;green-chilli|1|chopped;turmeric|0.25|tsp;salt',[
'Peel and cube the potatoes. Cover with water in a saucepan and boil until just tender, about 12–15 minutes; drain.',
'Meanwhile heat oil in a frying pan. Add mustard seeds; when they pop, add curry leaves, onion and chilli. Cook until the onion softens.',
'Fold in potatoes, turmeric and salt with a small splash of water. Cover and cook for 5 minutes.',
'Lightly crush a few potatoes with the spoon and stir to bring the filling together.'
], 'Soft, lightly spiced potatoes, good alongside roti or as a dosa filling.',batchFriendly=True,prepNote='Time includes boiling raw potatoes; optional chana dal omitted.')
add(12,'french-toast','Simple French Toast','American','breakfast',15,'eggs|2|eggs;milk|0.5|cup;bread|4|slices;butter|1|tbsp;sugar|1|tsp;cinnamon|0.25|tsp',[
'Whisk eggs, milk, sugar and cinnamon until smooth.',
'Heat a little butter in a frying pan over medium-low heat. Dip both sides of each bread slice briefly in the egg mixture without letting it fall apart.',
'Fry in batches for about 2–3 minutes per side, until golden and the egg in the centre is fully cooked. Use the remaining butter between batches.',
'Serve warm.'
], 'Golden eggy bread with a little cinnamon.',prepNote='Optional source toppings, vanilla and savoury seasonings omitted.')
add(13,'fluffy-pancakes','Fluffy Pancakes','American','breakfast',25,'flour|1|cup;sugar|2|tsp;salt;baking-powder|0.5|tsp;baking-soda|0.25|tsp;buttermilk|0.75|cup;milk|0.25|cup;eggs|1|egg;butter|2|tbsp;vanilla|1|tsp;neutral-oil|2|tsp',[
'Mix flour, sugar, salt, baking powder and baking soda in a bowl.',
'Melt the butter and let it cool slightly. Whisk it with buttermilk, milk, egg and vanilla. Stir the wet mixture into the dry ingredients just until combined.',
'Warm a lightly oiled frying pan over medium heat. Add small ladlefuls of batter, leaving room between pancakes.',
'Cook until bubbles appear and the underside is golden, then flip and cook until the second side is golden and the centre is set. Repeat in batches.'
], 'A small batch of soft buttermilk pancakes.')
add(14,'scrambled-eggs','Butter Scrambled Eggs','American','breakfast',10,'eggs|4|eggs;butter|1|tbsp;salt;black-pepper',[
'Crack the eggs into a bowl, add salt and whisk until the yolks and whites combine.',
'Melt butter in a non-stick pan over medium-low heat. Pour in the eggs and stir gently with a spatula, drawing the set edges towards the centre.',
'Keep folding until the eggs form soft curds and no liquid egg remains. Remove from the heat, season with pepper and serve immediately.'
], 'A quick pan of eggs with just butter and seasoning.',prepNote='Optional milk and toast are not required for this version.')
add(15,'grilled-cheese','Grilled Cheese Sandwich','American','lunch',15,'bread|4|slices;cheddar|80|g;butter|1.5|tbsp',[
'Butter one side of each bread slice. Grate or thinly slice the cheese.',
'Put half the bread, butter-side down, in a warm frying pan. Top with cheese and the remaining bread, butter-side up.',
'Cook over medium-low heat until golden underneath. Flip carefully and cook the other side, pressing gently, until the cheese melts.',
'Cut and serve hot.'
], 'Three ingredients and one frying pan.')
add(16,'quick-hummus','Quick Hummus','Middle Eastern','side',10,'chickpeas|2|cups cooked;garlic|1|clove;tahini|3|tbsp;cumin|0.5|tsp;coriander|1|tbsp chopped;salt',[
'Drain and rinse the cooked chickpeas. Crush the garlic.',
'Blend chickpeas, garlic, tahini, cumin and salt in a food processor. Add the measured water gradually until creamy.',
'Taste, adjust the seasoning and stir in the chopped coriander. Spoon into a serving bowl.'
], 'A quick chickpea dip using cooked chickpeas and tahini.',water=0.25,waterNote='approximately; add gradually.',prepNote='Uses cooked/canned chickpeas instead of the source’s overnight soak and long boil. A food processor is needed.')
add(17,'guacamole','Chunky Guacamole','Mexican','side',10,'avocado|2|avocados;tomato|2|tbsp chopped;onion|1|tbsp chopped;lime|0.5|lime;green-chilli|1|chopped;garlic|0.5|tsp minced;olive-oil|1|tsp;black-pepper;salt',[
'Halve the avocados, remove the stones and scoop the flesh into a bowl. Mash half of it with lime juice.',
'Stir in finely chopped tomato, onion, chilli, garlic, olive oil, salt and pepper.',
'Fold in the remaining avocado in small chunks. Taste and serve soon after making.'
], 'A fresh avocado dip with a little crunch.',prepNote='Pico de gallo is represented by tomato, onion and lime; green chilli replaces jalapeño.')
add(18,'aglio-e-olio','Spaghetti Aglio e Olio','Italian','lunch / dinner',20,'pasta|200|g spaghetti;garlic|4|cloves;olive-oil|2|tbsp;black-pepper;parsley|1|tbsp chopped;salt',[
'Bring a pan of water to the boil, season with salt and cook the spaghetti until al dente according to its packet.',
'Meanwhile peel and gently crush the garlic. Heat it slowly in olive oil until lightly golden; do not let it burn.',
'Remove the garlic if you prefer. Drain the spaghetti, reserving a little cooking water, and add it to the oil.',
'Toss with pepper and parsley, adding a spoonful of the reserved water if needed to loosen the pasta.'
], 'Garlic, olive oil and pasta: a small-ingredient dinner.')
add(19,'vegetable-fried-rice','Vegetable Fried Rice','Chinese','lunch / dinner',20,'cooked-rice|2|cups;peas|0.5|cup;carrot|0.5|cup diced;onion|0.5|chopped;garlic|2|cloves;soy-sauce|1|tbsp;neutral-oil|1|tbsp;black-pepper',[
'Break up the cold cooked rice. Finely dice the carrot and onion and mince the garlic.',
'Heat oil in a wide frying pan. Stir-fry onion, carrot and peas until the vegetables are tender-crisp, about 5 minutes.',
'Add garlic, stir briefly, then add rice and soy sauce. Toss over medium-high heat until all the rice is steaming hot.',
'Season with black pepper and serve.'
], 'A simple vegetable stir-fry built around already cooked rice.',prepNote='20 minutes assumes cooked rice is ready. The source’s optional meats and other fillings are omitted.')
add(20,'spinach-quesadilla','Spinach Cheese Quesadillas','Mexican','lunch',15,'tortilla|4|small tortillas;cheddar|0.67|cup grated;spinach|1|cup;neutral-oil|2|tsp',[
'Wash and drain the spinach. Wilt it briefly in a dry pan, then squeeze out excess moisture and chop.',
'Warm a lightly oiled frying pan over medium-low heat. Place a tortilla in the pan and cover half with cheese and spinach.',
'Fold the tortilla over the filling. Cook on both sides until lightly browned and the cheese is fully melted.',
'Repeat with the remaining tortillas, divide into wedges and serve hot.'
], 'Crisp pan tortillas with a simple spinach and cheese filling.')
add(21,'tomato-herb-soup','Tomato & Herb Soup','Mediterranean','lunch / dinner',30,'olive-oil|0.5|tbsp;onion|0.25|cup diced;canned-tomatoes|200|g;stock|0.75|cup;tomato-sauce|225|g;basil|1.5|tsp chopped;thyme|0.5|tsp leaves;black-pepper',[
'Heat olive oil in a saucepan and cook the onion until soft without browning.',
'Add canned tomatoes, prepared stock, tomato sauce, basil, thyme and pepper. Bring to a gentle boil.',
'Lower the heat, cover and simmer for 20 minutes, stirring occasionally. Break up the tomatoes with a spoon.',
'Taste and serve hot.'
], 'An uncomplicated tomato soup with herbs and pantry staples.',batchFriendly=True,prepNote='Use prepared vegetable stock for a vegetarian soup. Optional balsamic vinegar omitted.')
add(22,'kerala-vegetable-stew','Kerala Vegetable Stew','Indian','lunch / dinner',40,'potato|1|medium;carrot|1|medium;green-beans|0.5|cup chopped;peas|0.25|cup;coconut-milk|1|cup;neutral-oil|1|tbsp;onion|1|small;ginger|1|tsp minced;green-chilli|1|chilli;curry-leaves|10|leaves;cloves|2|cloves;cinnamon|1|small stick;cardamom|2|pods;flour|1|tsp;black-pepper;salt;mustard-seeds|0.5|tsp',[
'Chop the potato, carrot and beans into small pieces. Simmer them in water until just tender, then drain.',
'Heat oil in a saucepan. Add mustard seeds, cloves, cinnamon and cardamom, followed by sliced onion, ginger, chilli and curry leaves. Cook until the onion softens.',
'Add the cooked vegetables and peas. Stir in half the coconut milk and the measured water; simmer for 5–7 minutes.',
'Mix flour with a spoonful of cool water, stir it into the stew and simmer until slightly thickened. Add remaining coconut milk, salt and pepper; heat gently without a hard boil.'
], 'A mild vegetable stew with coconut milk.',water=0.5,batchFriendly=True,prepNote='Includes time to cook raw vegetables. Canned coconut milk replaces extracting fresh coconut milk; onion replaces shallot. Vinegar omitted.')
add(23,'egg-rice','Indian Egg Rice','Indian','lunch / dinner',35,'rice|1|cup;onion|1|small;green-chilli|1|chilli;ginger|0.5|tsp minced;garlic|0.5|tsp minced;garam-masala|0.25|tsp;salt;eggs|2|eggs;neutral-oil|1|tbsp',[
'Rinse the rice and cook in water according to the packet; drain if needed and spread out briefly to let excess steam escape.',
'Heat oil in a wide pan. Cook the chopped onion and chilli until soft, then stir in ginger and garlic.',
'Push the onion to one side. Add beaten eggs and stir until fully set.',
'Add rice, garam masala and salt. Toss gently over medium heat until steaming hot throughout.'
], 'Spiced rice and scrambled egg, cooked from uncooked rice.',prepNote='Time includes cooking rice. Oil is explicitly included; garam masala replaces the source’s whole-spice blend.')
add(24,'teriyaki-chicken','Quick Teriyaki Chicken','Japanese','lunch / dinner',25,'chicken|300|g boneless;soy-sauce|2|tbsp;mirin|2|tbsp;sugar|1|tbsp;ginger|1|tsp minced;garlic|1|tsp minced;neutral-oil|1|tsp',[
'Mix soy sauce, mirin, sugar, ginger and garlic in a small bowl. Cut boneless chicken into bite-size pieces.',
'Heat oil in a wide pan over medium heat. Add chicken and cook, turning, until lightly browned on all sides.',
'Pour in the sauce and simmer, stirring frequently, until the chicken reaches 74°C in the thickest pieces and the sauce lightly coats it. Add a splash of water if the sauce thickens before the chicken is cooked.',
'Serve the chicken with its glaze.'
], 'A quick pan dinner built around a homemade teriyaki glaze.',prepNote='Adapted from the cookbook’s teriyaki sauce: sugar replaces brown sugar and the sauce is used as a cooked glaze instead of an overnight marinade. Rice is not included.')
add(25,'tofu-pad-thai','Tofu Pad Thai','Thai','lunch / dinner',30,'rice-noodles|150|g;fish-sauce|1.5|tbsp;vinegar|1|tbsp;tamarind-paste|1|tbsp;sugar|1.5|tbsp;neutral-oil|1.5|tbsp;garlic|2|cloves;chilli-powder|0.25|tsp;tofu|200|g;carrot|1|small;eggs|2|eggs;spring-onion|2|stalks;bean-sprouts|1|cup;peanuts|2|tbsp',[
'Soften the rice noodles according to their packet, then drain. Mix fish sauce, vinegar, tamarind, sugar and the measured water for the sauce.',
'Cut tofu into cubes, shred the carrot and chop garlic and spring onion. Heat oil in a wide pan and brown the tofu for 6–8 minutes.',
'Add garlic, chilli powder and carrot; stir-fry until the carrot softens. Push everything aside and scramble the eggs in the pan until fully set.',
'Add noodles and sauce. Toss until the noodles absorb the sauce and are tender, adding water if needed. Add bean sprouts and spring onion and cook for another 2 minutes. Finish with crushed peanuts.'
], 'Stir-fried rice noodles with tofu, egg and a tangy sauce.',water=0.25,prepNote='Contains fish sauce and eggs. Tamarind paste is diluted with the water listed above; check your noodle packet for soaking time.')
add(26,'vegetable-bibimbap','Vegetable Bibimbap','Korean','lunch / dinner',30,'cooked-rice|2|cups;carrot|1|medium;spinach|150|g;bean-sprouts|1|cup;cucumber|0.5|cucumber;eggs|2|eggs;sesame-oil|1|tbsp;sesame-seeds|2|tsp;garlic|1|clove;neutral-oil|2|tsp;gochujang|1|tbsp;salt',[
'Cut carrot and cucumber into thin strips. Mince the garlic and crush the sesame seeds.',
'Cook carrot, spinach and bean sprouts separately in a lightly oiled pan until tender, adding a splash of water as needed. Season each with a little salt, sesame oil, garlic and sesame seeds.',
'Fry the eggs in the remaining neutral oil until the whites and yolks are set. Reheat the cooked rice until steaming hot.',
'Divide rice between bowls. Arrange vegetables and eggs on top, and serve with gochujang to mix in at the table.'
], 'A colourful Korean rice bowl with everyday vegetables.',prepNote='A meat-free adaptation served in ordinary bowls. Uses already cooked rice; the source’s beef, kimchi side and hot-stone finishing are omitted.')
add(27,'quinoa-peanut-salad','Quinoa Peanut Salad','Healthy-ish','lunch',35,'quinoa|0.5|cup;peanut-butter|2|tbsp;soy-sauce|1|tbsp;vinegar|1.5|tbsp;sesame-oil|1|tsp;lime|0.5|lime;hot-sauce|0.5|tsp;peanuts|2|tbsp;cabbage|2|cups shredded;carrot|0.5|cup shredded;spring-onion|2|stalks;capsicum|1|small;coriander|0.25|cup chopped',[
'Rinse the quinoa and cook in the measured water according to its packet until tender. Spread on a plate and allow to cool while you prepare the vegetables.',
'Whisk peanut butter, soy sauce, vinegar, sesame oil, lime juice and hot sauce together. Add water a teaspoon at a time to make a pourable dressing.',
'Thinly slice the spring onion and capsicum. Toss them with cabbage, carrot, coriander and cooled quinoa.',
'Fold in the dressing and sprinkle chopped peanuts over the salad just before serving.'
], 'Crunchy vegetables and quinoa in a simple peanut dressing.',water=1,prepNote='Time includes cooking and briefly cooling quinoa. Adapted from Simmer + Sauce via Foodista and Wikibooks; soy sauce replaces tamari, so this version is not labelled gluten-free.')
recipes[-1]['source']['changes'] += ' Original recipe by Simmer + Sauce, published on Foodista under CC BY and incorporated into Wikibooks.'

# Video metadata is reviewed separately and never inferred from a recipe title at runtime.
videos=json.loads(Path('data/videos.json').read_text())
for r in recipes:
    r['videos']=videos[r['id']]
    assert {v['language'] for v in r['videos']}=={'hi','en'}
Path('src/recipes.json').write_text(json.dumps(recipes,ensure_ascii=False,indent=2)+'\n')
print(f'Built {len(recipes)} unique, attributed recipes.')
