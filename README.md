# MealMint

A Vite app with a bundled recipe database in `src/recipes.json`. Pantry state stays in the browser; recipes and recommendations do not require an API or backend server.

```sh
npm install
npm run dev -- --host 127.0.0.1
npm test
npm run build
```

The kitchen has individual basics/spice switches and a separate searchable ingredient picker. Cuisines, time bands and planning horizons support unlimited selections. Time bands are up to 15, 16–30, and over 30 minutes. An empty preference means any option. Planning horizons are preference tags and give batch-friendly dishes a ranking nudge; they do not imply storage life or allocate a calendar.

Recommendations include every database recipe, ordered by exact ingredient coverage, difficulty, preferences, time and ingredient count. A missing staple always counts as missing. Water is a preparation instruction, not an assumed pantry match. Main ingredient lists do not repeat available basics and spices; their quantities are accessible in a separate disclosure. Servings scale quantities. Cooked rice and cooked chickpeas are explicit ingredients so a quick recipe cannot silently assume preparation has already happened.

Legacy `mealmint-pantry-v1` data migrates to v2. The old basics switch enables salt, pepper and cooking oil, but never assumes the newly added sugar is available. Invalid saved values are discarded.

## Recipe provenance and refresh

`data/source-manifest.json` is the reviewed Wikibooks allowlist. `data/scraped-sources.json` contains extracted ingredient/method records, revision IDs, URLs, attribution and licensing. All sources were fetched on 8 September 2026. Original downloaded HTML is ignored by Git.

```sh
python3 scripts/scrape_recipes.py
npm run recipes:build
npm test
npm run build
```

The scraper uses Python's standard library and curl, limits requests to 30/minute, and stops on HTTP errors. It only updates source records. `scripts/build_catalogue.py` holds reviewed adaptations with normalised ingredients, quantities, preparation assumptions and estimated total times. Review source changes and adaptations before rebuilding. Do not generate new recipes by renaming existing ones.

Recipe adaptations and extracted source content are available under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) with attribution to Wikibooks contributors. Each displayed recipe links its exact source revision and contributor history. The quinoa salad also credits its original author, Simmer + Sauce via Foodista. These recipe-content terms do not change the app code's licensing.

`data/videos.json` records two direct YouTube videos per recipe, language, channel, title, presentation format and metadata-check date. YouTube oEmbed metadata was checked during this update. English guides with written instructions are labelled “on-screen instructions” in recipe details. Videos are related guides by their original creators; their ingredients can differ from the cookbook adaptation. Embeds and transcripts are not copied. Future availability and geographic playback restrictions are controlled by YouTube and the creators.

The regression suite covers catalogue integrity, ingredient ranking, staple switches, raw/cooked distinctions, unrestricted multi-selection, state migration, empty kitchens and batch preferences.
