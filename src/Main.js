/**
 * Apps Script entry points. Bind this project to a Google Sheet, then:
 *   1. Run `setup()` once (creates the Recipes/History sheets and the weekly trigger).
 *   2. Edit the Recipes sheet to taste.
 *   3. Run `runWeekly()` any time to get a plan now; the trigger does it every week.
 */

var RECIPES_SHEET = 'Recipes';
var HISTORY_SHEET = 'History';

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var recipes = ss.getSheetByName(RECIPES_SHEET);
  if (!recipes) {
    recipes = ss.insertSheet(RECIPES_SHEET);
    var rows = recipesToRows(DEFAULT_RECIPES);
    recipes.getRange(1, 1, 1, RECIPE_HEADER.length).setValues([RECIPE_HEADER]).setFontWeight('bold');
    recipes.getRange(2, 1, rows.length, RECIPE_HEADER.length).setValues(rows);
    recipes.setFrozenRows(1);
    recipes.autoResizeColumns(1, RECIPE_HEADER.length);
  }

  if (!ss.getSheetByName(HISTORY_SHEET)) {
    var history = ss.insertSheet(HISTORY_SHEET);
    history.getRange(1, 1, 1, 3).setValues([['Week of', 'Day', 'Recipe']]).setFontWeight('bold');
    history.setFrozenRows(1);
  }

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'runWeekly') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runWeekly')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay[CONFIG.runDay])
    .atHour(CONFIG.runHour)
    .create();
}

function runWeekly() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var recipes = rowsToRecipes(readRows(ss.getSheetByName(RECIPES_SHEET)));
  if (!recipes.length) recipes = DEFAULT_RECIPES;

  var historySheet = ss.getSheetByName(HISTORY_SHEET);
  var history = readRows(historySheet).map(function (r) {
    return { weekOf: new Date(r[0]), recipe: r[2] };
  });

  var weekOf = nextMonday(new Date());
  var plan = pickMeals(recipes, CONFIG.slots, history, weekOf, CONFIG.noRepeatWeeks);
  var list = buildShoppingList(plan, CONFIG.householdSize, CONFIG.weeklyExtras);
  var body = formatEmail(plan, list, weekOf, CONFIG.householdSize);

  if (historySheet) {
    plan.forEach(function (p) { historySheet.appendRow([weekOf, p.slot.day, p.recipe.name]); });
  }

  MailApp.sendEmail(
    CONFIG.email || Session.getEffectiveUser().getEmail(),
    'Meal plan & shopping list - week of ' + formatDate(weekOf),
    body
  );
}

/** Data rows (header skipped); empty if the sheet is missing. */
function readRows(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
}
