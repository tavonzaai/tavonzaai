import { KitchenOrder, KitchenStation, InventoryItem, Recipe, ShiftStat } from "./types";

export const INITIAL_ORDERS: KitchenOrder[] = [
  {
    id: "ord-1",
    orderNumber: "#1524",
    table: "T-01",
    orderType: "Dine-in",
    waiter: "Marco",
    status: "NEW",
    station: "Grill Station",
    timeElapsedMinutes: 2,
    createdAt: "3:48 PM",
    items: [
      {
        id: "item-1-1",
        name: "Classic Burger",
        quantity: 1,
        options: ["Medium Well", "No Onions"],
        isCompleted: false,
      },
      {
        id: "item-1-2",
        name: "Classic Burger",
        quantity: 1,
        options: ["Medium Well", "No Onions"],
        isCompleted: false,
      },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "#1525",
    table: "T-04",
    orderType: "Dine-in",
    waiter: "Marco",
    status: "PREPARING",
    station: "Grill Station",
    timeElapsedMinutes: 8,
    createdAt: "3:42 PM",
    items: [
      {
        id: "item-2-1",
        name: "Classic Burger",
        quantity: 1,
        options: ["Medium Well", "No Onions"],
        isCompleted: true,
      },
      {
        id: "item-2-2",
        name: "Classic Burger",
        quantity: 1,
        options: ["Medium Well", "No Onions"],
        isCompleted: false,
      },
    ],
  },
  {
    id: "ord-3",
    orderNumber: "#1526",
    table: "T-08",
    orderType: "Takeaway",
    waiter: "Sarah",
    status: "OVERDUE",
    station: "Grill Station",
    timeElapsedMinutes: 18,
    createdAt: "3:32 PM",
    items: [
      {
        id: "item-3-1",
        name: "Classic Burger",
        quantity: 1,
        options: ["Medium Well", "Extra Cheese"],
        isCompleted: false,
      },
      {
        id: "item-3-2",
        name: "BBQ Ribs Full Rack",
        quantity: 1,
        options: ["Spicy Sauce", "Fries"],
        isCompleted: false,
      },
    ],
  },
  {
    id: "ord-4",
    orderNumber: "#1042",
    table: "T-04",
    orderType: "Dine-in",
    waiter: "Marco",
    status: "READY",
    station: "Grill Station",
    timeElapsedMinutes: 12,
    createdAt: "3:38 PM",
    items: [
      {
        id: "item-4-1",
        name: "Classic Burger",
        quantity: 1,
        options: ["Medium Well", "No Onions"],
        isCompleted: true,
      },
      {
        id: "item-4-2",
        name: "Classic Burger",
        quantity: 1,
        options: ["Medium Well", "No Onions"],
        isCompleted: true,
      },
    ],
  },
  {
    id: "ord-5",
    orderNumber: "#1051",
    table: "T-02",
    orderType: "Dine-in",
    waiter: "Marco",
    status: "PREPARING",
    station: "Grill Station",
    timeElapsedMinutes: 10,
    createdAt: "3:40 PM",
    flaggedIssue: "Food Quality / Problem",
    items: [
      {
        id: "item-5-1",
        name: "Classic Burger",
        quantity: 1,
        options: ["Medium Well", "No Onions"],
        isCompleted: true,
      },
      {
        id: "item-5-2",
        name: "Classic Burger",
        quantity: 1,
        options: ["Medium Well", "No Onions"],
        isCompleted: false,
      },
    ],
  },
  {
    id: "ord-6",
    orderNumber: "#1528",
    table: "T-03",
    orderType: "Dine-in",
    waiter: "Marco",
    status: "NEW",
    station: "Grill Station",
    timeElapsedMinutes: 1,
    createdAt: "3:49 PM",
    items: [
      {
        id: "item-6-1",
        name: "Classic Wagyu Burger",
        quantity: 1,
        options: ["Medium Rare", "No Onions", "Truffle Aioli"],
        isCompleted: false,
      },
      {
        id: "item-6-2",
        name: "BBQ Pork Ribs Full Rack",
        quantity: 1,
        options: ["Spicy Sauce", "Sweet Potato Fries"],
        isCompleted: false,
      },
    ],
  },
];

export const KITCHEN_STATIONS: KitchenStation[] = [
  { id: "st-1", name: "Grill Station", chefAssigned: "Marco Vance", activeTickets: 5, status: "BUSY" },
  { id: "st-2", name: "Fryer Station", chefAssigned: "Chef Antonio", activeTickets: 3, status: "OPTIMAL" },
  { id: "st-3", name: "Salad & Cold Prep", chefAssigned: "Chef Maria", activeTickets: 2, status: "OPTIMAL" },
  { id: "st-4", name: "Bar & Beverages", chefAssigned: "Bartender Alex", activeTickets: 4, status: "BUSY" },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "inv-1", name: "Prime Beef Patties", category: "Meat & Poultry", stock: 42, unit: "Pcs", status: "IN_STOCK" },
  { id: "inv-2", name: "Brioche Burger Buns", category: "Bakery", stock: 15, unit: "Packs", status: "LOW_STOCK" },
  { id: "inv-3", name: "Cheddar Cheese Slices", category: "Dairy", stock: 120, unit: "Slices", status: "IN_STOCK" },
  { id: "inv-4", name: "BBQ Sauce Concentrate", category: "Sauces & Condiments", stock: 2.5, unit: "Liters", status: "LOW_STOCK" },
  { id: "inv-5", name: "French Fry Potato Cut", category: "Frozen Foods", stock: 85, unit: "Kg", status: "IN_STOCK" },
];

export const RECIPES: Recipe[] = [
  {
    id: "rec-1",
    name: "Classic Tavonza Burger",
    prepTimeMinutes: 12,
    station: "Grill Station",
    ingredients: ["1x Prime Beef Patty", "1x Brioche Bun", "2x Cheddar Slices", "15g House Burger Sauce", "Lettuce & Tomato"],
  },
  {
    id: "rec-2",
    name: "BBQ Pork Ribs Full Rack",
    prepTimeMinutes: 18,
    station: "Grill Station",
    ingredients: ["1x Pork Rib Rack (600g)", "80ml BBQ Glaze", "1x Coleslaw Side", "150g French Fries"],
  },
];

export const SHIFT_STATS: ShiftStat = {
  ticketsCompleted: 142,
  avgPrepTimeMinutes: 9.4,
  flaggedIssuesCount: 3,
  efficiencyScorePct: 96.5,
};

export const FLAG_REASONS = [
  "Food Quality / Problem",
  "Ingredient Unavailable",
  "Customer Special Request Change",
  "Equipment Failure / Delay",
  "Wrong Item Placed",
];
