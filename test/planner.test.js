var test = require('node:test');
var assert = require('node:assert');
var P = require('../src/Planner.js');
var CONFIG = require('../src/Config.js').CONFIG;
var DEFAULT_RECIPES = require('../src/Recipes.js').DEFAULT_RECIPES;

function seeded(seed) {
  return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

test('nextMonday always moves forward to a Monday', function () {
  assert.strictEqual(P.nextMonday(new Date(2026, 9, 1)).getDate(), 5); // Thu 1 Oct -> Mon 5 Oct
  assert.strictEqual(P.nextMonday(new Date(2026, 9, 5)).getDate(), 12); // Mon -> following Mon
  assert.strictEqual(P.nextMonday(new Date(2026, 9, 4)).getDate(), 5); // Sun -> next day
});

test('one recipe of the right category per slot', function () {
  var plan = P.pickMeals(DEFAULT_RECIPES, CONFIG.slots, [], new Date(2026, 9, 5), 3, seeded(1));
  assert.deepStrictEqual(plan.map(function (p) { return p.recipe.category; }),
    ['curry', 'pot', 'quick', 'roast']);
});

test('recently used recipes are avoided, old ones allowed back', function () {
  var weekOf = new Date(2026, 9, 5);
  var curries = DEFAULT_RECIPES.filter(function (r) { return r.category === 'curry'; });
  var slots = [{ day: 'Monday', category: 'curry', nights: 2 }];
  var lastWeek = new Date(2026, 8, 28), longAgo = new Date(2026, 5, 1);
  var history = curries.slice(1).map(function (r) { return { weekOf: lastWeek, recipe: r.name }; });
  history.push({ weekOf: longAgo, recipe: curries[0].name });
  for (var s = 1; s < 20; s++) {
    assert.strictEqual(P.pickMeals(DEFAULT_RECIPES, slots, history, weekOf, 3, seeded(s))[0].recipe.name,
      curries[0].name);
  }
});

test('falls back to least recently used when everything is recent', function () {
  var weekOf = new Date(2026, 9, 5);
  var recipes = [
    { name: 'A', category: 'roast', serves: 4, ingredients: [] },
    { name: 'B', category: 'roast', serves: 4, ingredients: [] },
  ];
  var history = [{ weekOf: new Date(2026, 8, 28), recipe: 'A' }, { weekOf: new Date(2026, 8, 21), recipe: 'B' }];
  var plan = P.pickMeals(recipes, [{ day: 'Sunday', category: 'roast' }], history, weekOf, 3);
  assert.strictEqual(plan[0].recipe.name, 'B');
});

test('never picks the same recipe twice in a week', function () {
  var slots = [{ day: 'Monday', category: 'quick' }, { day: 'Tuesday', category: 'quick' }];
  for (var s = 1; s < 30; s++) {
    var plan = P.pickMeals(DEFAULT_RECIPES, slots, [], new Date(2026, 9, 5), 3, seeded(s));
    assert.notStrictEqual(plan[0].recipe.name, plan[1].recipe.name);
  }
});

test('ingredients combine across recipes and units, staples split out', function () {
  var slot = { day: 'Monday', nights: 2 }; // 2 people x 2 nights = 4 servings = x1
  var plan = [
    { slot: slot, recipe: { serves: 4, ingredients: [['Potatoes', 1, 'kg'], ['Onion', 2, ''], ['Salt', 1, 'tsp', true]] } },
    { slot: slot, recipe: { serves: 4, ingredients: [['potatoes', 500, 'g'], ['Onion', 1, ''], ['Chopped tomatoes', 2, 'tin']] } },
  ];
  var list = P.buildShoppingList(plan, 2, ['Milk']);
  var byName = {};
  list.shopping.forEach(function (i) { byName[i.name.toLowerCase()] = P.formatQty(i); });
  assert.strictEqual(byName.potatoes, '1.5 kg');
  assert.strictEqual(byName.onion, 'x3');
  assert.strictEqual(byName['chopped tomatoes'], '2 tins');
  assert.strictEqual(byName.milk, 'x1');
  assert.deepStrictEqual(list.staples.map(function (i) { return i.name; }), ['Salt']);
});

test('freezer portions scale up and round to buyable amounts', function () {
  var plan = [{ slot: { day: 'Wednesday', nights: 2, freezerPortions: 2 },
    recipe: { serves: 4, ingredients: [['Beef mince', 750, 'g'], ['Chopped tomatoes', 1, 'tin']] } }];
  var list = P.buildShoppingList(plan, 2); // 6 servings = x1.5
  assert.strictEqual(P.formatQty(list.shopping[0]), '1.15 kg'); // 1125g -> 1150g
  assert.strictEqual(P.formatQty(list.shopping[1]), '2 tins'); // 1.5 tins -> 2
});

test('a fixed servings count overrides nights', function () {
  var plan = [{ slot: { day: 'Sunday', nights: 1, servings: 4 },
    recipe: { serves: 4, ingredients: [['Leg of lamb', 1.5, 'kg']] } }];
  assert.strictEqual(P.formatQty(P.buildShoppingList(plan, 2).shopping[0]), '1.5 kg');
});

test('sheet rows round-trip to recipes', function () {
  var rows = P.recipesToRows(DEFAULT_RECIPES);
  assert.deepStrictEqual(P.rowsToRecipes(rows), DEFAULT_RECIPES.map(function (r) {
    return { name: r.name, category: r.category, serves: r.serves, ingredients: r.ingredients.map(function (i) {
      return [i[0], i[1], i[2] || '', !!i[3]];
    }) };
  }));
});

test('email has the plan and a paste-ready list', function () {
  var weekOf = new Date(2026, 9, 5);
  var plan = P.pickMeals(DEFAULT_RECIPES, CONFIG.slots, [], weekOf, 3, seeded(7));
  var body = P.formatEmail(plan, P.buildShoppingList(plan, 2, []), weekOf, 2);
  assert.match(body, /week of Mon 5 Oct/);
  assert.match(body, /Mon & Tue: /);
  assert.match(body, /Sun: Roast/);
  var paste = body.split('PASTE INTO SEARCH (one item per line):\n\n')[1].split('\n\n')[0];
  assert.ok(paste.split('\n').length > 5);
  assert.doesNotMatch(paste, /\d/); // names only, no quantities
});
