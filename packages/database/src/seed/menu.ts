import { uid } from './constants';
import { one, schema, type Tx } from './types';

type Station = 'KITCHEN' | 'BAR';

export interface MenuItemRef {
  id: string;
  name: string;
  price: number;
  station: Station;
}

export type MenuContext = Record<string, MenuItemRef>;

const IMG = (q: string) => `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=80`;

/** key → [category, name, description, price, station, image, veg, spice, available] */
const ITEMS: [string, string, string, string, number, Station, string, boolean, number | null, boolean][] = [
  ['bruschetta', 'starters', 'Tomato Basil Bruschetta', 'Grilled sourdough, vine tomatoes, basil and aged balsamic', 9.5, 'KITCHEN', IMG('photo-1572695157366-5e585ab2b69f'), true, 0, true],
  ['wings', 'starters', 'Spicy Buffalo Wings', 'Crispy wings tossed in house buffalo sauce, blue-cheese dip', 12.0, 'KITCHEN', IMG('photo-1608039755401-742074f0548d'), false, 3, true],
  ['calamari', 'starters', 'Crispy Calamari', 'Lightly fried squid with lemon aioli', 13.5, 'KITCHEN', IMG('photo-1599487488170-d11ec9c172f0'), false, 1, false],
  ['burger', 'mains', 'Potato Corn Burger', 'Crispy potato patty with sweet corn and signature sauce', 26.0, 'KITCHEN', IMG('photo-1568901346375-23c9450c58cd'), true, 1, true],
  ['salmon', 'mains', 'Grilled Salmon', 'Wild Alaskan salmon, asparagus and lemon risotto', 24.99, 'KITCHEN', IMG('photo-1467003909585-2f8a72700288'), false, 0, true],
  ['pasta', 'mains', 'Truffle Mushroom Pasta', 'Fresh tagliatelle, wild mushrooms, truffle cream', 19.0, 'KITCHEN', IMG('photo-1621996346565-e3dbc646d9a9'), true, 0, true],
  ['chicken', 'grill', 'Grilled Chicken', 'Herb-marinated half chicken with garlic butter', 18.0, 'KITCHEN', IMG('photo-1532550907401-a500c9a57435'), false, 1, true],
  ['ribeye', 'grill', 'Ribeye Steak (14oz)', 'Prime cut ribeye with truffle herb butter', 34.0, 'KITCHEN', IMG('photo-1600891964092-4316c288032e'), false, 0, true],
  ['lamb', 'grill', 'Lamb Chops', 'Rosemary lamb chops with mint chimichurri', 29.0, 'KITCHEN', IMG('photo-1514516345957-556ca7d90a29'), false, 2, true],
  ['caesar', 'salads', 'Caesar Salad Supreme', 'Romaine, parmesan, croutons, classic Caesar dressing', 14.0, 'KITCHEN', IMG('photo-1550304943-4f24f54ddde9'), false, 0, true],
  ['greek', 'salads', 'Greek Village Salad', 'Tomato, cucumber, olives, feta and oregano', 12.5, 'KITCHEN', IMG('photo-1540420773420-3366772f4999'), true, 0, true],
  ['quinoa', 'salads', 'Quinoa Power Bowl', 'Quinoa, avocado, chickpeas and tahini', 13.0, 'KITCHEN', IMG('photo-1512621776951-a57141f2eefd'), true, 0, true],
  ['mojito', 'drinks', 'Mojito Cocktail', 'White rum, fresh mint, lime and soda', 11.0, 'BAR', IMG('photo-1551538827-9c037cb4f32a'), true, null, true],
  ['oldfashioned', 'drinks', 'Smoked Bourbon Old Fashioned', 'Aged bourbon, bitters and smoked orange peel', 14.0, 'BAR', IMG('photo-1470337458703-46ad1756a187'), true, null, true],
  ['lemonade', 'drinks', 'Fresh Mint Lemonade', 'House-squeezed lemons, mint, cane sugar', 6.5, 'BAR', IMG('photo-1621263764928-df1444c5e859'), true, null, true],
  ['pellegrino', 'drinks', 'San Pellegrino Sparkling', 'Crisp natural sparkling mineral water', 6.0, 'BAR', IMG('photo-1560023907-5f339617ea30'), true, null, true],
  ['espresso', 'drinks', 'Double Espresso', 'Single-origin beans, rich crema', 4.5, 'BAR', IMG('photo-1510707577719-ae7c14805e3a'), true, null, true],
  ['lava', 'desserts', 'Chocolate Lava Cake', 'Molten centre, vanilla bean ice cream', 10.0, 'KITCHEN', IMG('photo-1606313564200-e75d5e30476c'), true, null, true],
  ['tiramisu', 'desserts', 'Classic Tiramisu', 'Mascarpone, espresso-soaked ladyfingers', 9.0, 'KITCHEN', IMG('photo-1571877227200-a0d98ea607e9'), true, null, false],
];

const CATEGORIES: [string, string, string][] = [
  ['starters', 'Starters', 'Small plates to share'],
  ['mains', 'Burgers & Mains', 'Hearty signature mains'],
  ['grill', 'Grill', 'Charcoal-grilled meats (Grill station)'],
  ['salads', 'Salads', 'Fresh & cold (Cold station)'],
  ['drinks', 'Drinks', 'Cocktails, soft drinks and coffee (Bar station)'],
  ['desserts', 'Desserts', 'Something sweet to finish'],
];

export const seedMenu = async (tx: Tx, restaurantId: string): Promise<MenuContext> => {
  const catIds: Record<string, string> = {};
  for (const [i, [key, name, description]] of CATEGORIES.entries()) {
    const row = one(
      await tx.insert(schema.menuCategories).values({ id: uid(10, i + 1), restaurantId, name, description, displayOrder: i, isActive: true }).returning(),
      `category ${key}`,
    );
    catIds[key] = row.id;
  }

  const menu: MenuContext = {};
  for (const [i, [key, cat, name, description, price, station, imageUrl, isVegetarian, spiceLevel, isAvailable]] of ITEMS.entries()) {
    const categoryId = catIds[cat];
    if (!categoryId) throw new Error(`Unknown category ${cat}`);
    const row = one(
      await tx.insert(schema.menuItems).values({
        id: uid(11, i + 1), restaurantId, categoryId, name, description, imageUrl, basePrice: price,
        isAvailable, isVegetarian, spiceLevel, displayOrder: i,
      }).returning(),
      `item ${key}`,
    );
    menu[key] = { id: row.id, name, price, station };
  }

  // ── Modifiers ─────────────────────────────────────────────────────
  const group = async (n: number, itemKey: string, name: string, isRequired: boolean, minSelect: number, maxSelect: number, mods: [string, number][]) => {
    const item = menu[itemKey];
    if (!item) throw new Error(`Unknown item ${itemKey}`);
    const g = one(
      await tx.insert(schema.modifierGroups).values({ id: uid(12, n), menuItemId: item.id, name, isRequired, minSelect, maxSelect }).returning(),
      `modifier group ${name}`,
    );
    await tx.insert(schema.modifiers).values(mods.map(([mName, priceDelta]) => ({ modifierGroupId: g.id, name: mName, priceDelta, isAvailable: true })));
  };

  await group(1, 'ribeye', 'Doneness', true, 1, 1, [['Rare', 0], ['Medium Rare', 0], ['Medium', 0], ['Well Done', 0]]);
  await group(2, 'ribeye', 'Extras', false, 0, 3, [['Garlic Butter', 2], ['Peppercorn Sauce', 2.5], ['Grilled Prawns', 7]]);
  await group(3, 'chicken', 'Extras', false, 0, 2, [['Extra Garlic Butter', 1.5], ['Side Fries', 4]]);
  await group(4, 'burger', 'Add-ons', false, 0, 3, [['Cheddar', 1.5], ['Avocado', 2], ['Jalapeños', 1]]);
  await group(5, 'caesar', 'Dressing', true, 1, 1, [['Dressing on top', 0], ['Dressing on side', 0]]);
  await group(6, 'mojito', 'Ice Level', true, 1, 1, [['Regular Ice', 0], ['Less Ice', 0], ['No Ice', 0]]);

  console.log(`🍽️  Seeded ${CATEGORIES.length} categories, ${ITEMS.length} items, 6 modifier groups`);
  return menu;
};
