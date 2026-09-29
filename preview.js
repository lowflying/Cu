// Print this week's email locally without touching Google: `npm run preview`
var CONFIG = require('./src/Config.js').CONFIG;
var DEFAULT_RECIPES = require('./src/Recipes.js').DEFAULT_RECIPES;
var P = require('./src/Planner.js');

var weekOf = P.nextMonday(new Date());
var plan = P.pickMeals(DEFAULT_RECIPES, CONFIG.slots, [], weekOf, CONFIG.noRepeatWeeks);
var list = P.buildShoppingList(plan, CONFIG.householdSize, CONFIG.weeklyExtras);
console.log(P.formatEmail(plan, list, weekOf, CONFIG.householdSize));
