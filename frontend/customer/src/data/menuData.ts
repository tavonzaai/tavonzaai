export interface MenuItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  category: string;
  image: string;
  popular?: boolean;
  rating?: number;
  reviewsCount?: number;
  dietary?: string;
  contains?: string;
  winePairing?: {
    wine: string;
    description: string;
  };
  prepTime?: string;
  calories?: string;
  description?: string;
  addOns?: { id: string; name: string; price: number }[];
}

export const MENU_CATEGORIES = [
  { id: 'all', name: 'ALL', icon: '🍽️' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'dessert', name: 'Dessert', icon: '🍰' },
  { id: 'mexican', name: 'Mexican', icon: '🌮' },
  { id: 'sushi', name: 'Sushi', icon: '🍣' },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'potato-corn-burger-1',
    name: 'Potato Corn Burger',
    subtitle: 'With Sauce',
    price: 20.53,
    category: 'burgers',
    image: '/images/burger.jpg',
    popular: true,
    rating: 4.8,
    reviewsCount: 96,
    dietary: 'Vegetarian',
    contains: 'Gluten, Dairy',
    winePairing: {
      wine: 'Craft IPA',
      description: 'Hoppy notes balance the rich potato and savory sauce.',
    },
    prepTime: '10 min',
    calories: '420 kcal',
    description:
      'Crispy golden potato corn patty layered with fresh lettuce, melted cheddar, and secret house sauce in an artisanal brioche bun.',
    addOns: [
      { id: 'addon-parm', name: 'Extra Parmigiano', price: 1.5 },
      { id: 'addon-truffle', name: 'Truffle Butter', price: 1.5 },
      { id: 'addon-fries', name: 'Rosemary Fries', price: 1.5 },
    ],
  },
  {
    id: 'mutton-stack',
    name: 'Mutton Stack',
    subtitle: 'With Sweet Honey',
    price: 28.5,
    category: 'burgers',
    image: '/images/burger.jpg',
    popular: true,
    rating: 4.9,
    reviewsCount: 114,
    dietary: 'Chef Choice',
    contains: 'Gluten, Sesame',
    winePairing: {
      wine: 'Cabernet Sauvignon',
      description: 'Bold red wine cuts through succulent mutton glazes.',
    },
    prepTime: '15 min',
    calories: '620 kcal',
    description:
      'Slow-cooked pulled tender mutton infused with aromatic herbs, drizzled with spicy honey glaze and pickled onion relish.',
    addOns: [
      { id: 'addon-parm', name: 'Extra Parmigiano', price: 1.5 },
      { id: 'addon-truffle', name: 'Truffle Butter', price: 1.5 },
      { id: 'addon-fries', name: 'Rosemary Fries', price: 1.5 },
    ],
  },
  {
    id: 'arancini-al-tartufo',
    name: 'Arancini al Tartufo',
    subtitle: 'With Truffle Infusion',
    price: 30.5,
    category: 'mexican',
    image: '/images/seabass.jpg',
    popular: true,
    rating: 4.5,
    reviewsCount: 142,
    dietary: 'Vegetarian',
    contains: 'Gluten, Dairy, Nuts',
    winePairing: {
      wine: 'Chardonnay',
      description: "Oaked Chardonnay echoes the truffle's earthy richness.",
    },
    prepTime: '12 min',
    calories: '480 kcal',
    description:
      'Crispy Sicilian risotto balls infused with black winter truffle and melted fontina cheese, served over parmesan velouté.',
    addOns: [
      { id: 'addon-parm', name: 'Extra Parmigiano', price: 1.5 },
      { id: 'addon-truffle', name: 'Truffle Butter', price: 1.5 },
      { id: 'addon-fries', name: 'Rosemary Fries', price: 1.5 },
    ],
  },
  {
    id: 'potato-corn-burger-2',
    name: 'Potato Corn Burger',
    subtitle: 'With Sauce',
    price: 18.2,
    category: 'burgers',
    image: '/images/burger.jpg',
    popular: false,
    rating: 4.6,
    reviewsCount: 78,
    dietary: 'Vegetarian',
    contains: 'Gluten, Dairy',
    winePairing: {
      wine: 'Craft IPA',
      description: 'Crisp finish complementing savory flavors.',
    },
    prepTime: '10 min',
    calories: '390 kcal',
    description:
      'Double baked golden potato cake topped with roasted sweetcorn relish and smoky garlic aioli.',
    addOns: [
      { id: 'addon-parm', name: 'Extra Parmigiano', price: 1.5 },
      { id: 'addon-truffle', name: 'Truffle Butter', price: 1.5 },
      { id: 'addon-fries', name: 'Rosemary Fries', price: 1.5 },
    ],
  },
  {
    id: 'chicken-burger-fries',
    name: 'Chicken Burger',
    subtitle: 'With Fence Fry',
    price: 20.53,
    category: 'burgers',
    image: '/images/burger.jpg',
    popular: true,
    rating: 4.7,
    reviewsCount: 130,
    dietary: 'Halal Certified',
    contains: 'Gluten, Egg',
    winePairing: {
      wine: 'Crisp Pinot Grigio',
      description: 'Light and refreshing pairing with crispy poultry.',
    },
    prepTime: '12 min',
    calories: '540 kcal',
    description:
      'Crispy buttermilk fried chicken breast, pickled cucumbers, honey-mustard coleslaw and seasoned lattice waffle fries.',
    addOns: [
      { id: 'addon-parm', name: 'Extra Parmigiano', price: 1.5 },
      { id: 'addon-truffle', name: 'Truffle Butter', price: 1.5 },
      { id: 'addon-fries', name: 'Rosemary Fries', price: 1.5 },
    ],
  },
  {
    id: 'chicken-burger-sauce',
    name: 'Chicken Burger',
    subtitle: 'With Sauce',
    price: 20.53,
    category: 'burgers',
    image: '/images/burger.jpg',
    popular: true,
    rating: 4.8,
    reviewsCount: 110,
    dietary: 'Halal Certified',
    contains: 'Gluten, Egg',
    winePairing: {
      wine: 'Sauvignon Blanc',
      description: 'Bright acidity pairing with spicy sauce.',
    },
    prepTime: '12 min',
    calories: '510 kcal',
    description:
      'Grilled chicken fillet drenched in smoky barbecue reduction, topped with smoked gouda and crispy shallots.',
    addOns: [
      { id: 'addon-parm', name: 'Extra Parmigiano', price: 1.5 },
      { id: 'addon-truffle', name: 'Truffle Butter', price: 1.5 },
      { id: 'addon-fries', name: 'Rosemary Fries', price: 1.5 },
    ],
  },
  {
    id: 'dessert-matcha-cake',
    name: 'Matcha Mille Crêpe',
    subtitle: 'With Sweet Cream',
    price: 14.5,
    category: 'dessert',
    image: '/images/slide2.jpg',
    popular: true,
    rating: 4.9,
    reviewsCount: 88,
    dietary: 'Vegetarian',
    contains: 'Dairy, Egg, Gluten',
    winePairing: {
      wine: 'Moscato d’Asti',
      description: 'Sweet floral notes that complement green tea richness.',
    },
    prepTime: '5 min',
    calories: '320 kcal',
    description:
      'Twenty layers of handmade French crêpes filled with ceremonial Uji matcha whipped ganache.',
    addOns: [
      { id: 'addon-parm', name: 'Extra Whipped Cream', price: 1.5 },
      { id: 'addon-truffle', name: 'Vanilla Gelato Scoop', price: 2.0 },
    ],
  },
  {
    id: 'sushi-salmon-platter',
    name: 'Flame Torched Nigiri',
    subtitle: 'With Wasabi & Ginger',
    price: 32.0,
    category: 'sushi',
    image: '/images/slide3.jpg',
    popular: true,
    rating: 5.0,
    reviewsCount: 165,
    dietary: 'Seafood',
    contains: 'Fish, Soy',
    winePairing: {
      wine: 'Junmai Daiginjo Sake',
      description: 'Clean aromatic sake highlighting umami seafood notes.',
    },
    prepTime: '10 min',
    calories: '380 kcal',
    description:
      'Fresh Norwegian salmon glazed with sweet teriyaki and torched with Japanese Kewpie mayonnaise and ikura roe.',
    addOns: [
      { id: 'addon-parm', name: 'Extra Ikura Roe', price: 3.5 },
      { id: 'addon-truffle', name: 'Fresh Wasabi Root', price: 2.0 },
    ],
  },
];
