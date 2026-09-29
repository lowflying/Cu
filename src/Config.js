/**
 * Everything you're likely to want to tweak lives here.
 */
var CONFIG = {
  // Who gets the shopping list. Leave blank to send it to the script owner.
  email: '',

  // How many people you're feeding at each meal.
  householdSize: 2,

  // Don't repeat a recipe that was picked in the last N weeks (if possible).
  noRepeatWeeks: 3,

  // When the weekly job runs (Apps Script trigger). Day is a ScriptApp.WeekDay name.
  runDay: 'THURSDAY',
  runHour: 7,

  // One entry per cook. `nights` is how many dinners the pot covers;
  // `freezerPortions` adds extra servings to batch-cook and freeze;
  // `servings` fixes the amount outright (e.g. cook a whole joint, eat leftovers).
  slots: [
    { day: 'Monday', category: 'curry', nights: 2, freezerPortions: 0 },
    { day: 'Wednesday', category: 'pot', nights: 2, freezerPortions: 0 },
    { day: 'Friday', category: 'quick', nights: 1, freezerPortions: 0 },
    { day: 'Sunday', category: 'roast', nights: 1, servings: 4 },
  ],

  // Extra things you buy every week regardless of the menu.
  weeklyExtras: ['Milk', 'Bread', 'Butter', 'Eggs', 'Bananas', 'Apples'],
};

if (typeof module !== 'undefined') module.exports = { CONFIG: CONFIG };
