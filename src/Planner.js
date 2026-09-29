/**
 * Pure planning logic: no Google services here, so it runs (and is tested)
 * in Node as well as Apps Script.
 */

var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Units we can convert between. Everything else is summed as-is per unit.
var UNIT_BASE = { g: ['g', 1], kg: ['g', 1000], ml: ['ml', 1], l: ['ml', 1000] };

/** The Monday after `date` (never `date` itself). */
function nextMonday(date) {
  var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var daysAhead = (8 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + daysAhead);
  return d;
}

/**
 * Choose one recipe per slot.
 *   history: [{ weekOf: Date, recipe: 'name' }]
 *   rng: () => [0,1) — pass a seeded one for repeatable results.
 * Recipes used in the last `noRepeatWeeks` weeks are skipped when possible;
 * if a category runs dry, the least recently used recipe is picked instead.
 */
function pickMeals(recipes, slots, history, weekOf, noRepeatWeeks, rng) {
  rng = rng || Math.random;
  var cutoff = weekOf.getTime() - noRepeatWeeks * 7 * 86400000;
  var lastUsed = {};
  (history || []).forEach(function (h) {
    var t = new Date(h.weekOf).getTime();
    if (!(h.recipe in lastUsed) || t > lastUsed[h.recipe]) lastUsed[h.recipe] = t;
  });

  var chosen = {};
  return slots.map(function (slot) {
    var inCategory = recipes.filter(function (r) {
      return r.category === slot.category && !chosen[r.name];
    });
    if (!inCategory.length) {
      throw new Error('No recipes left in category "' + slot.category + '" for ' + slot.day);
    }
    var fresh = inCategory.filter(function (r) {
      return !(r.name in lastUsed) || lastUsed[r.name] <= cutoff;
    });
    var recipe;
    if (fresh.length) {
      recipe = fresh[Math.floor(rng() * fresh.length)];
    } else {
      recipe = inCategory.slice().sort(function (a, b) {
        return lastUsed[a.name] - lastUsed[b.name];
      })[0];
    }
    chosen[recipe.name] = true;
    return { slot: slot, recipe: recipe };
  });
}

/** Servings a slot needs: a fixed `servings`, or people x nights + freezer extras. */
function slotServings(slot, householdSize) {
  if (slot.servings) return slot.servings;
  return householdSize * (slot.nights || 1) + (slot.freezerPortions || 0);
}

function roundQty(qty, unit) {
  if (unit === 'g' || unit === 'ml') return Math.ceil(qty / 50 - 1e-9) * 50;
  if (unit === 'tsp' || unit === 'tbsp') return Math.ceil(qty * 2 - 1e-9) / 2;
  return Math.ceil(qty - 1e-9); // counts, tins, packs... you can't buy 1.5 jars
}

/**
 * Scale every chosen recipe and merge duplicate ingredients.
 * Returns { shopping: [...], staples: [...] }, each item { name, qty, unit }.
 */
function buildShoppingList(plan, householdSize, extras) {
  var merged = {};
  plan.forEach(function (p) {
    var factor = slotServings(p.slot, householdSize) / (p.recipe.serves || 4);
    p.recipe.ingredients.forEach(function (ing) {
      var name = ing[0], qty = Number(ing[1]) || 0, unit = (ing[2] || '').toLowerCase();
      var base = UNIT_BASE[unit];
      if (base) { qty *= base[1]; unit = base[0]; }
      var key = name.toLowerCase() + '|' + unit;
      if (!merged[key]) merged[key] = { name: name, qty: 0, unit: unit, staple: false };
      merged[key].qty += qty * factor;
      merged[key].staple = merged[key].staple || !!ing[3];
    });
  });

  (extras || []).forEach(function (name) {
    var key = name.toLowerCase() + '|';
    if (!merged[key]) merged[key] = { name: name, qty: 1, unit: '', staple: false };
  });

  var shopping = [], staples = [];
  Object.keys(merged).sort().forEach(function (key) {
    var item = merged[key];
    item.qty = roundQty(item.qty, item.unit);
    (item.staple ? staples : shopping).push(item);
  });
  return { shopping: shopping, staples: staples };
}

function formatQty(item) {
  var q = item.qty, u = item.unit;
  if (u === 'g' && q >= 1000) return +(q / 1000).toFixed(2) + ' kg';
  if (u === 'ml' && q >= 1000) return +(q / 1000).toFixed(2) + ' l';
  if (!u) return 'x' + q;
  if (['g', 'ml', 'tsp', 'tbsp'].indexOf(u) >= 0 || q === 1) return q + ' ' + u;
  return q + ' ' + (/(ch|sh|s|x)$/.test(u) ? u + 'es' : u + 's');
}

function dayLabel(slot) {
  var start = DAYS.indexOf(slot.day);
  var names = [];
  for (var i = 0; i < (slot.nights || 1); i++) names.push(DAYS[(start + i) % 7].slice(0, 3));
  return names.join(' & ');
}

function formatDate(d) {
  return DAYS[(d.getDay() + 6) % 7].slice(0, 3) + ' ' + d.getDate() + ' ' +
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
}

/** Plain-text email body. The first list is ready to paste into a search box. */
function formatEmail(plan, list, weekOf, householdSize) {
  var lines = ['MEAL PLAN - week of ' + formatDate(weekOf), ''];
  plan.forEach(function (p) {
    var extra = p.slot.freezerPortions ? '  (+' + p.slot.freezerPortions + ' portions to freeze)' : '';
    lines.push(dayLabel(p.slot) + ': ' + p.recipe.name + extra);
  });

  lines.push('', 'PASTE INTO SEARCH (one item per line):', '');
  list.shopping.forEach(function (i) { lines.push(i.name); });

  lines.push('', 'QUANTITIES (for ' + householdSize + ' people):', '');
  list.shopping.forEach(function (i) { lines.push('- ' + i.name + ': ' + formatQty(i)); });

  if (list.staples.length) {
    lines.push('', 'CHECK THE CUPBOARD:', '');
    list.staples.forEach(function (i) { lines.push('- ' + i.name + ' (' + formatQty(i) + ')'); });
  }
  return lines.join('\n');
}

/**
 * Sheet rows <-> recipe objects. One row per ingredient:
 *   Recipe | Category | Serves | Ingredient | Qty | Unit | Staple
 */
var RECIPE_HEADER = ['Recipe', 'Category', 'Serves', 'Ingredient', 'Qty', 'Unit', 'Staple'];

function recipesToRows(recipes) {
  var rows = [];
  recipes.forEach(function (r) {
    r.ingredients.forEach(function (ing) {
      rows.push([r.name, r.category, r.serves, ing[0], ing[1], ing[2] || '', ing[3] ? 'Y' : '']);
    });
  });
  return rows;
}

function rowsToRecipes(rows) {
  var byName = {}, order = [];
  rows.forEach(function (row) {
    var name = String(row[0] || '').trim();
    var ingredient = String(row[3] || '').trim();
    if (!name || !ingredient) return;
    if (!byName[name]) {
      byName[name] = {
        name: name,
        category: String(row[1] || '').trim().toLowerCase(),
        serves: Number(row[2]) || 4,
        ingredients: [],
      };
      order.push(name);
    }
    var staple = /^(y|yes|true|x)$/i.test(String(row[6] || '').trim()) || row[6] === true;
    byName[name].ingredients.push([ingredient, Number(row[4]) || 0, String(row[5] || '').trim(), staple]);
  });
  return order.map(function (n) { return byName[n]; });
}

if (typeof module !== 'undefined') {
  module.exports = {
    nextMonday: nextMonday, pickMeals: pickMeals, buildShoppingList: buildShoppingList,
    formatEmail: formatEmail, formatQty: formatQty, recipesToRows: recipesToRows,
    rowsToRecipes: rowsToRecipes, RECIPE_HEADER: RECIPE_HEADER,
  };
}
