# Weekly meal planner

A small Google Apps Script that picks a week of dinners from your recipe list, combines
the ingredients into one shopping list, and emails it to you. It's built from
a Reddit comment describing that routine:

- **Mon/Tue**: one curry (Indian or Thai), cooked once, eaten twice
- **Wed/Thu**: one big-pot meal (bolognese, stew, chilli…), cooked once, eaten twice
- **Fri**: something quick (pasta, chicken & chips…)
- **Sun**: a roast

Every Thursday morning you get an email like this:

```
MEAL PLAN - week of Mon 5 Oct

Mon & Tue: Chickpea & spinach curry
Wed & Thu: Irish stew
Fri: Burgers & wedges
Sun: Roast leg of lamb

PASTE INTO SEARCH (one item per line):

Basmati rice
Beef burgers
...

QUANTITIES (for 2 people):

- Basmati rice: 300 g
- Potatoes: 3 kg
...

CHECK THE CUPBOARD:

- Curry powder (2 tbsp)
...
```

The first list has names only, so you can paste it into the Dunnes (or any
supermarket's) multi-item search, pick the best-value results, and check out. The
quantities list tells you how much of each to buy.

## What it does

- **Rotates the menu.** Nothing you ate in the last 3 weeks gets picked again (while
  there are other options in that category). Every pick is logged to a `History` sheet.
- **Combines ingredients.** Onions from the curry and the stew become one line. `1 kg`
  plus `500 g` of potatoes becomes `1.5 kg`.
- **Scales to your household.** Recipes are written for 4. A 2-night pot for 2 people
  is 4 servings. Tins, jars and packs round up to whole ones.
- **Separates cupboard staples.** Oil, spices, stock cubes and similar go in a "check you
  have" list instead of the shopping list.
- **Can batch-cook for the freezer.** Set `freezerPortions: 4` on a slot to scale that
  meal up and put the extra portions in the freezer.

## Setup (about 5 minutes)

1. Create a new Google Sheet. Go to **Extensions → Apps Script**.
2. In the script editor, create four script files named `Config`, `Recipes`, `Planner`
   and `Main`. Paste in the contents of the matching files from `src/`.
3. Open **Project Settings**, tick *Show "appsscript.json" manifest file*, and replace
   that file's contents with `src/appsscript.json`.
4. Pick `setup` in the function dropdown and click **Run**. Approve the permissions it
   asks for. This creates the `Recipes` and `History` tabs, fills `Recipes` with about
   20 starter meals, and schedules the weekly run.
5. Run `runWeekly` once to get a plan right away.

If you use [clasp](https://github.com/google/clasp), you can skip the copy-paste. Run
`clasp create --type sheets --rootDir src` and then `clasp push`.

## Making it yours

- **Recipes** live in the `Recipes` sheet, one row per ingredient:

  | Recipe | Category | Serves | Ingredient | Qty | Unit | Staple |
  |---|---|---|---|---|---|---|
  | Spaghetti bolognese | pot | 4 | Beef mince | 750 | g | |
  | Spaghetti bolognese | pot | 4 | Olive oil | 1 | tbsp | Y |

  Units `g`/`kg` and `ml`/`l` are converted and summed. Any other unit (`tin`, `pack`,
  `jar`, `clove`, or blank for a count) is summed as-is. Use the exact same ingredient
  name across recipes so the lines merge.
- **The weekly shape** (which days, which categories, how many nights each pot covers,
  household size, run day and time, weekly extras like milk and bread) is set in
  `src/Config.js`. You can add a category just by using it in both a slot and the sheet,
  for example `{ day: 'Saturday', category: 'fakeaway', nights: 1 }`.
- If you change `runDay` or `runHour`, run `setup` again. It replaces the old trigger.

## Developing locally

The planning logic in `src/Planner.js` doesn't use any Google services, so it runs in Node:

```
npm test          # unit tests
npm run preview   # print a sample email using the built-in recipes
```
