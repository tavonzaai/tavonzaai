// ============================================================================
// Menu Catalog, Items, Modifiers & Stations Seeder Module
// ============================================================================
import { DrizzleDatabase } from '../../client';
import * as schema from '../../schema';

export async function seedMenu(
  db: DrizzleDatabase,
  restaurants: {
    restaurant1: typeof schema.restaurants.$inferSelect;
    restaurant2: typeof schema.restaurants.$inferSelect;
  }
) {
  console.log('🍽️ Cataloging Menu categories, items, and modifier groups for both restaurants...');

  // 1. Restaurant 1: Tavonza Fine Dining Categories
  const [catStarters, catMains, catPastas, catCocktails, catBeverages, catDesserts] = await db.insert(schema.menuCategories).values([
    {
      restaurantId: restaurants.restaurant1.id,
      name: 'Starters & Small Plates',
      description: 'Artisanal appetizers crafted for sharing',
      displayOrder: 1,
      isActive: true,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      name: "Chef's Signature Mains",
      description: 'Prime cut steaks, fresh wild seafood and signature burgers',
      displayOrder: 2,
      isActive: true,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      name: 'Pastas & Risotto',
      description: 'Handcrafted pasta and slow-simmered risottos',
      displayOrder: 3,
      isActive: true,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      name: 'Artisanal Cocktails',
      description: 'Handcrafted spirits, house-infused syrups, and smoked bitters',
      displayOrder: 4,
      isActive: true,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      name: 'Wine, Beer & Refreshments',
      description: 'Fine vintages, craft draughts, and organic soft drinks',
      displayOrder: 5,
      isActive: true,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      name: 'Desserts & Sweets',
      description: 'Indulgent European desserts and artisanal gelatos',
      displayOrder: 6,
      isActive: true,
    },
  ]).returning();

  if (!catStarters || !catMains || !catPastas || !catCocktails || !catBeverages || !catDesserts) {
    throw new Error('Failed to create menu categories for restaurant1');
  }

  // 2. Restaurant 2: Apex Gourmet Burger Bar Categories
  const [catApexBurgers, catApexSides, catApexShakes] = await db.insert(schema.menuCategories).values([
    {
      restaurantId: restaurants.restaurant2.id,
      name: 'Gourmet Smash Burgers',
      description: 'Double smashed USDA Prime patties with house brioche buns',
      displayOrder: 1,
      isActive: true,
    },
    {
      restaurantId: restaurants.restaurant2.id,
      name: 'Loaded Sides & Fries',
      description: 'Crispy waffle fries, onion rings, and smoked mac & cheese',
      displayOrder: 2,
      isActive: true,
    },
    {
      restaurantId: restaurants.restaurant2.id,
      name: 'Handcrafted Shakes',
      description: 'Artisanal milkshakes made with premium custard',
      displayOrder: 3,
      isActive: true,
    },
  ]).returning();

  if (!catApexBurgers || !catApexSides || !catApexShakes) {
    throw new Error('Failed to create menu categories for restaurant2');
  }

  // 3. Menu Items (Restaurant 1: Tavonza Fine Dining)
  const [
    itemCalamari,
    itemFries,
    ,
    itemBurger,
    itemSteak,
    itemSalmon,
    itemPizza,
    itemTagliatelle,
    ,
    itemOldFashioned,
    itemMezcalita,
    itemWine,
    itemBeer,
    itemLavaCake,
  ] = await db.insert(schema.menuItems).values([
    // Starters (KITCHEN)
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catStarters.id,
      name: 'Crispy Calamari',
      description: 'Tender Monterey squid with spicy lemon herb aioli',
      imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600',
      basePrice: 16.0,
      isAvailable: true,
      isVegetarian: false,
      spiceLevel: 1,
      displayOrder: 1,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catStarters.id,
      name: 'Truffle Parmesan Fries',
      description: 'Crispy Idaho russet potatoes with white truffle oil & aged parmesan',
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600',
      basePrice: 12.0,
      isAvailable: true,
      isVegetarian: true,
      spiceLevel: 0,
      displayOrder: 2,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catStarters.id,
      name: 'Heirloom Tomato Bruschetta',
      description: 'Grilled sourdough, balsamic glaze, fresh basil & buffalo mozzarella',
      imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600',
      basePrice: 11.5,
      isAvailable: true,
      isVegetarian: true,
      spiceLevel: 0,
      displayOrder: 3,
    },

    // Mains (KITCHEN)
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catMains.id,
      name: 'Potato Corn Burger',
      description: 'Crispy spiced potato patty with sweet corn, chipotle sauce & brioche',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
      basePrice: 26.0,
      isAvailable: true,
      isVegetarian: true,
      spiceLevel: 1,
      displayOrder: 1,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catMains.id,
      name: 'Prime Ribeye Steak 14oz',
      description: 'USDA Prime dry-aged ribeye served with roasted garlic & herb butter',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
      basePrice: 38.0,
      isAvailable: true,
      isVegetarian: false,
      spiceLevel: 0,
      displayOrder: 2,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catMains.id,
      name: 'Pan-Seared Alaskan Salmon',
      description: 'Wild salmon fillet served over lemon herb risotto & asparagus',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600',
      basePrice: 28.5,
      isAvailable: true,
      isVegetarian: false,
      spiceLevel: 0,
      displayOrder: 3,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catMains.id,
      name: 'Wood-Fired Margherita Pizza',
      description: 'San Marzano tomatoes, Fior di latte mozzarella, fresh basil & EVOO',
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600',
      basePrice: 19.0,
      isAvailable: true,
      isVegetarian: true,
      spiceLevel: 0,
      displayOrder: 4,
    },

    // Pastas (KITCHEN)
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catPastas.id,
      name: 'Wild Mushroom Truffle Tagliatelle',
      description: 'Handmade pasta, chanterelle mushrooms, black truffle emulsion & pecorino',
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600',
      basePrice: 24.0,
      isAvailable: true,
      isVegetarian: true,
      spiceLevel: 0,
      displayOrder: 1,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catPastas.id,
      name: 'Maine Lobster Ravioli',
      description: 'Stuffed with fresh lobster meat in a saffron lobster reduction',
      imageUrl: 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=600',
      basePrice: 32.0,
      isAvailable: true,
      isVegetarian: false,
      spiceLevel: 0,
      displayOrder: 2,
    },

    // Cocktails (BAR)
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catCocktails.id,
      name: 'Smoked Bourbon Old Fashioned',
      description: 'Aged Kentucky bourbon, Angostura bitters, demerara & smoked orange peel',
      imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600',
      basePrice: 16.0,
      isAvailable: true,
      isVegetarian: true,
      spiceLevel: 0,
      displayOrder: 1,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catCocktails.id,
      name: 'Passionfruit Mezcalita',
      description: 'Oaxacan mezcal, passionfruit puree, fresh lime & tajin chili rim',
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600',
      basePrice: 15.0,
      isAvailable: true,
      isVegetarian: true,
      spiceLevel: 1,
      displayOrder: 2,
    },

    // Beverages (BAR)
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catBeverages.id,
      name: 'Napa Valley Cabernet Sauvignon',
      description: 'Full-bodied red with notes of dark blackberry, cassis & cedar',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600',
      basePrice: 15.0,
      isAvailable: true,
      isVegetarian: true,
      spiceLevel: 0,
      displayOrder: 1,
    },
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catBeverages.id,
      name: 'Peroni Nastro Azzurro Draught',
      description: 'Crisp, refreshing Italian premium lager (Pint)',
      imageUrl: 'https://images.unsplash.com/photo-1608270192799-a6813fb82559?w=600',
      basePrice: 8.0,
      isAvailable: true,
      isVegetarian: true,
      spiceLevel: 0,
      displayOrder: 2,
    },

    // Desserts (KITCHEN)
    {
      restaurantId: restaurants.restaurant1.id,
      categoryId: catDesserts.id,
      name: 'Belgian Chocolate Lava Cake',
      description: 'Warm molten dark chocolate center served with Madagascar vanilla gelato',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
      basePrice: 12.0,
      isAvailable: true,
      isVegetarian: true,
      spiceLevel: 0,
      displayOrder: 1,
    },
  ]).returning();

  if (!itemBurger || !itemSteak || !itemSalmon || !itemOldFashioned || !itemFries ||
      !itemPizza || !itemTagliatelle || !itemMezcalita || !itemWine || !itemBeer ||
      !itemCalamari || !itemLavaCake) {
    throw new Error('Failed to create menu items for restaurant1');
  }

  // 4. Menu Items (Restaurant 2: Apex Burger Bar)
  await db.insert(schema.menuItems).values([
    {
      restaurantId: restaurants.restaurant2.id,
      categoryId: catApexBurgers.id,
      name: 'Truffle Wagyu Double Smash',
      description: 'Two 4oz Wagyu patties, black truffle mayo, smoked gouda & caramelized onions',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
      basePrice: 22.0,
      isAvailable: true,
      isVegetarian: false,
      spiceLevel: 0,
      displayOrder: 1,
    },
    {
      restaurantId: restaurants.restaurant2.id,
      categoryId: catApexSides.id,
      name: 'Loaded Bacon Cheddar Waffle Fries',
      description: 'Crispy waffle fries smothered with melted aged cheddar and applewood bacon bits',
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600',
      basePrice: 10.5,
      isAvailable: true,
      isVegetarian: false,
      spiceLevel: 0,
      displayOrder: 1,
    },
    {
      restaurantId: restaurants.restaurant2.id,
      categoryId: catApexShakes.id,
      name: 'Salted Caramel Pretzel Shake',
      description: 'Rich frozen custard blended with artisanal sea-salt caramel and pretzel crumble',
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600',
      basePrice: 8.5,
      isAvailable: true,
      isVegetarian: true,
      spiceLevel: 0,
      displayOrder: 1,
    },
  ]);

  // 5. Modifier Groups & Modifiers
  const [modGroupPatty] = await db.insert(schema.modifierGroups).values({
    menuItemId: itemBurger.id,
    name: 'Patty Style',
    isRequired: false,
    minSelect: 0,
    maxSelect: 1,
  }).returning();
  if (modGroupPatty) {
    await db.insert(schema.modifiers).values([
      { modifierGroupId: modGroupPatty.id, name: 'Single Patty', priceDelta: 0.0 },
      { modifierGroupId: modGroupPatty.id, name: 'Double Patty', priceDelta: 4.0 },
    ]);
  }

  const [modGroupCheese] = await db.insert(schema.modifierGroups).values({
    menuItemId: itemBurger.id,
    name: 'Cheese Selection',
    isRequired: false,
    minSelect: 0,
    maxSelect: 1,
  }).returning();
  if (modGroupCheese) {
    await db.insert(schema.modifiers).values([
      { modifierGroupId: modGroupCheese.id, name: 'Sharp Cheddar', priceDelta: 0.0 },
      { modifierGroupId: modGroupCheese.id, name: 'Aged Swiss', priceDelta: 1.0 },
      { modifierGroupId: modGroupCheese.id, name: 'Vegan Cheddar', priceDelta: 1.5 },
    ]);
  }

  const [modGroupTemp] = await db.insert(schema.modifierGroups).values({
    menuItemId: itemSteak.id,
    name: 'Cooking Temperature',
    isRequired: true,
    minSelect: 1,
    maxSelect: 1,
  }).returning();
  if (modGroupTemp) {
    await db.insert(schema.modifiers).values([
      { modifierGroupId: modGroupTemp.id, name: 'Rare', priceDelta: 0.0 },
      { modifierGroupId: modGroupTemp.id, name: 'Medium Rare', priceDelta: 0.0 },
      { modifierGroupId: modGroupTemp.id, name: 'Medium', priceDelta: 0.0 },
      { modifierGroupId: modGroupTemp.id, name: 'Medium Well', priceDelta: 0.0 },
      { modifierGroupId: modGroupTemp.id, name: 'Well Done', priceDelta: 0.0 },
    ]);
  }

  const [modGroupIce] = await db.insert(schema.modifierGroups).values({
    menuItemId: itemOldFashioned.id,
    name: 'Ice Style',
    isRequired: false,
    minSelect: 0,
    maxSelect: 1,
  }).returning();
  if (modGroupIce) {
    await db.insert(schema.modifiers).values([
      { modifierGroupId: modGroupIce.id, name: 'Large Clear Rock', priceDelta: 0.0 },
      { modifierGroupId: modGroupIce.id, name: 'Crushed Ice', priceDelta: 0.0 },
      { modifierGroupId: modGroupIce.id, name: 'Neat (No Ice)', priceDelta: 0.0 },
    ]);
  }

  return {
    itemBurger,
    itemSteak,
    itemSalmon,
    itemOldFashioned,
    itemFries,
    itemPizza,
    itemTagliatelle,
    itemMezcalita,
    itemWine,
    itemBeer,
    itemCalamari,
    itemLavaCake,
  };
}
