/**
 * Starter recipe list. Running `setup()` copies these into the "Recipes"
 * sheet, and from then on the sheet is the source of truth — edit it there.
 *
 * Each ingredient is [name, quantity, unit, staple?]. Units: g, kg, ml, l,
 * tsp, tbsp, tin, pack, jar, bunch, or '' for a plain count. Staples are
 * cupboard items (oil, spices, stock) listed separately as "check you have".
 */
var DEFAULT_RECIPES = [
  // ---- Curries (Indian / Thai) ----
  { name: 'Chicken tikka masala', category: 'curry', serves: 4, ingredients: [
    ['Chicken breast', 800, 'g'], ['Onion', 2, ''], ['Garlic', 4, 'clove'],
    ['Tikka masala paste', 1, 'jar'], ['Chopped tomatoes', 1, 'tin'],
    ['Cream', 200, 'ml'], ['Basmati rice', 300, 'g'], ['Naan bread', 1, 'pack'],
    ['Vegetable oil', 1, 'tbsp', true]] },
  { name: 'Thai green curry', category: 'curry', serves: 4, ingredients: [
    ['Chicken thighs', 800, 'g'], ['Thai green curry paste', 1, 'jar'],
    ['Coconut milk', 2, 'tin'], ['Green beans', 200, 'g'], ['Red pepper', 1, ''],
    ['Jasmine rice', 300, 'g'], ['Lime', 1, ''], ['Fresh coriander', 1, 'bunch'],
    ['Fish sauce', 1, 'tbsp', true]] },
  { name: 'Beef massaman curry', category: 'curry', serves: 4, ingredients: [
    ['Diced beef', 800, 'g'], ['Massaman curry paste', 1, 'jar'],
    ['Coconut milk', 2, 'tin'], ['Potatoes', 500, 'g'], ['Onion', 1, ''],
    ['Peanuts', 50, 'g'], ['Jasmine rice', 300, 'g'], ['Vegetable oil', 1, 'tbsp', true]] },
  { name: 'Chickpea & spinach curry', category: 'curry', serves: 4, ingredients: [
    ['Chickpeas', 2, 'tin'], ['Spinach', 200, 'g'], ['Onion', 2, ''],
    ['Garlic', 3, 'clove'], ['Ginger', 1, ''], ['Chopped tomatoes', 1, 'tin'],
    ['Coconut milk', 1, 'tin'], ['Basmati rice', 300, 'g'],
    ['Curry powder', 2, 'tbsp', true], ['Vegetable oil', 1, 'tbsp', true]] },
  { name: 'Chicken korma', category: 'curry', serves: 4, ingredients: [
    ['Chicken breast', 800, 'g'], ['Korma paste', 1, 'jar'], ['Onion', 1, ''],
    ['Cream', 200, 'ml'], ['Ground almonds', 50, 'g'], ['Basmati rice', 300, 'g'],
    ['Naan bread', 1, 'pack'], ['Vegetable oil', 1, 'tbsp', true]] },
  { name: 'Thai red prawn curry', category: 'curry', serves: 4, ingredients: [
    ['Raw king prawns', 500, 'g'], ['Thai red curry paste', 1, 'jar'],
    ['Coconut milk', 2, 'tin'], ['Red pepper', 2, ''], ['Sugar snap peas', 200, 'g'],
    ['Jasmine rice', 300, 'g'], ['Lime', 1, ''], ['Fish sauce', 1, 'tbsp', true]] },

  // ---- Big pot meals ----
  { name: 'Spaghetti bolognese', category: 'pot', serves: 4, ingredients: [
    ['Beef mince', 750, 'g'], ['Onion', 2, ''], ['Carrots', 2, ''], ['Celery', 1, 'pack'],
    ['Garlic', 3, 'clove'], ['Chopped tomatoes', 2, 'tin'], ['Tomato puree', 1, 'tube'],
    ['Spaghetti', 500, 'g'], ['Parmesan', 1, 'pack'], ['Beef stock cube', 1, '', true],
    ['Olive oil', 1, 'tbsp', true], ['Dried oregano', 1, 'tsp', true]] },
  { name: 'Beef & Guinness stew', category: 'pot', serves: 4, ingredients: [
    ['Diced beef', 1, 'kg'], ['Onion', 2, ''], ['Carrots', 4, ''], ['Potatoes', 1, 'kg'],
    ['Guinness', 500, 'ml'], ['Tomato puree', 1, 'tube'], ['Beef stock cube', 2, '', true],
    ['Plain flour', 2, 'tbsp', true], ['Fresh thyme', 1, 'pack']] },
  { name: 'Chilli con carne', category: 'pot', serves: 4, ingredients: [
    ['Beef mince', 750, 'g'], ['Onion', 2, ''], ['Red pepper', 2, ''], ['Garlic', 3, 'clove'],
    ['Kidney beans', 2, 'tin'], ['Chopped tomatoes', 2, 'tin'], ['Basmati rice', 300, 'g'],
    ['Sour cream', 1, 'tub'], ['Chilli powder', 2, 'tsp', true],
    ['Ground cumin', 1, 'tsp', true], ['Beef stock cube', 1, '', true]] },
  { name: 'Irish stew', category: 'pot', serves: 4, ingredients: [
    ['Lamb shoulder, diced', 1, 'kg'], ['Onion', 2, ''], ['Carrots', 4, ''],
    ['Potatoes', 1.5, 'kg'], ['Pearl barley', 100, 'g'], ['Fresh parsley', 1, 'bunch'],
    ['Lamb stock cube', 2, '', true]] },
  { name: 'Sausage casserole', category: 'pot', serves: 4, ingredients: [
    ['Pork sausages', 12, ''], ['Onion', 2, ''], ['Red pepper', 2, ''],
    ['Butter beans', 1, 'tin'], ['Chopped tomatoes', 2, 'tin'], ['Potatoes', 1, 'kg'],
    ['Smoked paprika', 2, 'tsp', true], ['Chicken stock cube', 1, '', true]] },
  { name: 'Chicken cacciatore', category: 'pot', serves: 4, ingredients: [
    ['Chicken thighs', 1, 'kg'], ['Onion', 1, ''], ['Red pepper', 1, ''],
    ['Mushrooms', 250, 'g'], ['Garlic', 3, 'clove'], ['Chopped tomatoes', 2, 'tin'],
    ['Penne', 500, 'g'], ['Olive oil', 1, 'tbsp', true], ['Dried oregano', 1, 'tsp', true]] },

  // ---- Sunday roasts ----
  { name: 'Roast chicken', category: 'roast', serves: 4, ingredients: [
    ['Whole chicken', 1, ''], ['Potatoes', 1.5, 'kg'], ['Carrots', 4, ''],
    ['Broccoli', 1, ''], ['Stuffing mix', 1, 'pack'], ['Lemon', 1, ''],
    ['Gravy granules', 1, 'tbsp', true], ['Vegetable oil', 2, 'tbsp', true]] },
  { name: 'Roast beef', category: 'roast', serves: 4, ingredients: [
    ['Beef roasting joint', 1.2, 'kg'], ['Potatoes', 1.5, 'kg'], ['Parsnips', 4, ''],
    ['Carrots', 4, ''], ['Yorkshire puddings', 1, 'pack'], ['Horseradish sauce', 1, 'jar'],
    ['Gravy granules', 1, 'tbsp', true]] },
  { name: 'Roast pork loin', category: 'roast', serves: 4, ingredients: [
    ['Pork loin joint', 1.2, 'kg'], ['Potatoes', 1.5, 'kg'], ['Cabbage', 1, ''],
    ['Carrots', 4, ''], ['Bramley apples', 2, ''], ['Gravy granules', 1, 'tbsp', true]] },
  { name: 'Roast leg of lamb', category: 'roast', serves: 4, ingredients: [
    ['Leg of lamb', 1.5, 'kg'], ['Potatoes', 1.5, 'kg'], ['Garlic', 4, 'clove'],
    ['Fresh rosemary', 1, 'pack'], ['Peas', 500, 'g'], ['Mint sauce', 1, 'jar'],
    ['Gravy granules', 1, 'tbsp', true]] },

  // ---- Quick meals ----
  { name: 'Chicken & chips', category: 'quick', serves: 4, ingredients: [
    ['Breaded chicken fillets', 1, 'pack'], ['Oven chips', 1, 'kg'], ['Peas', 500, 'g'],
    ['Coleslaw', 1, 'tub']] },
  { name: 'Spaghetti carbonara', category: 'quick', serves: 4, ingredients: [
    ['Spaghetti', 500, 'g'], ['Smoked bacon lardons', 200, 'g'], ['Eggs', 4, ''],
    ['Parmesan', 1, 'pack'], ['Garlic', 2, 'clove']] },
  { name: 'Pesto chicken pasta', category: 'quick', serves: 4, ingredients: [
    ['Penne', 500, 'g'], ['Chicken breast', 500, 'g'], ['Green pesto', 1, 'jar'],
    ['Cherry tomatoes', 250, 'g'], ['Spinach', 100, 'g'], ['Parmesan', 1, 'pack']] },
  { name: 'Beef stir fry', category: 'quick', serves: 4, ingredients: [
    ['Beef stir fry strips', 500, 'g'], ['Stir fry vegetables', 1, 'pack'],
    ['Egg noodles', 1, 'pack'], ['Stir fry sauce', 1, 'jar'], ['Soy sauce', 1, 'tbsp', true]] },
  { name: 'Burgers & wedges', category: 'quick', serves: 4, ingredients: [
    ['Beef burgers', 4, ''], ['Burger buns', 1, 'pack'], ['Potato wedges', 1, 'kg'],
    ['Lettuce', 1, ''], ['Tomatoes', 2, ''], ['Cheese slices', 1, 'pack']] },
  { name: 'Fish, chips & peas', category: 'quick', serves: 4, ingredients: [
    ['Breaded cod fillets', 1, 'pack'], ['Oven chips', 1, 'kg'], ['Peas', 500, 'g'],
    ['Lemon', 1, ''], ['Tartare sauce', 1, 'jar']] },
];

if (typeof module !== 'undefined') module.exports = { DEFAULT_RECIPES: DEFAULT_RECIPES };
