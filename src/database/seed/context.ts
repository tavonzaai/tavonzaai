// ============================================================================
// Seed Context Interface
// ============================================================================
import { DrizzleDatabase } from '../client';
import * as schema from '../schema';

export interface SeedContext {
  db: DrizzleDatabase;
  now: Date;
  users: {
    superAdmin: typeof schema.users.$inferSelect;
    owner1: typeof schema.users.$inferSelect;
    owner2: typeof schema.users.$inferSelect;
    manager1: typeof schema.users.$inferSelect;
    manager2: typeof schema.users.$inferSelect;
    waiter1: typeof schema.users.$inferSelect;
    waiter2: typeof schema.users.$inferSelect;
    kitchen1: typeof schema.users.$inferSelect;
    kitchen2: typeof schema.users.$inferSelect;
    bartender1: typeof schema.users.$inferSelect;
    cashier1: typeof schema.users.$inferSelect;
    cashier2: typeof schema.users.$inferSelect;
    host1: typeof schema.users.$inferSelect;
    customer1: typeof schema.users.$inferSelect;
    customer2: typeof schema.users.$inferSelect;
  };
  staff: {
    manager1: typeof schema.staff.$inferSelect;
    manager2: typeof schema.staff.$inferSelect;
    waiter1: typeof schema.staff.$inferSelect;
    waiter2: typeof schema.staff.$inferSelect;
    kitchen1: typeof schema.staff.$inferSelect;
    kitchen2: typeof schema.staff.$inferSelect;
    bartender1: typeof schema.staff.$inferSelect;
    cashier1: typeof schema.staff.$inferSelect;
    cashier2: typeof schema.staff.$inferSelect;
    host1: typeof schema.staff.$inferSelect;
  };
  customers: {
    customer1: typeof schema.customers.$inferSelect;
    customer2: typeof schema.customers.$inferSelect;
  };
  roles: {
    superAdminRole: typeof schema.roles.$inferSelect;
    adminRole: typeof schema.roles.$inferSelect;
    managerRole: typeof schema.roles.$inferSelect;
    waiterRole: typeof schema.roles.$inferSelect;
    kitchenRole: typeof schema.roles.$inferSelect;
    bartenderRole: typeof schema.roles.$inferSelect;
    cashierRole: typeof schema.roles.$inferSelect;
    hostRole: typeof schema.roles.$inferSelect;
    customerRole: typeof schema.roles.$inferSelect;
  };
  hierarchy: {
    org1: typeof schema.organizations.$inferSelect;
    org2: typeof schema.organizations.$inferSelect;
    restaurant1: typeof schema.restaurants.$inferSelect;
    restaurant2: typeof schema.restaurants.$inferSelect;
    branch1: typeof schema.branches.$inferSelect;
    branch2: typeof schema.branches.$inferSelect;
    branch3: typeof schema.branches.$inferSelect;
    managerAssignment1: typeof schema.staffAssignments.$inferSelect;
    waiterAssignment1: typeof schema.staffAssignments.$inferSelect;
    waiterAssignment2: typeof schema.staffAssignments.$inferSelect;
    kitchenAssignment1: typeof schema.staffAssignments.$inferSelect;
    bartenderAssignment1: typeof schema.staffAssignments.$inferSelect;
    cashierAssignment1: typeof schema.staffAssignments.$inferSelect;
  };
  tables: {
    t1: typeof schema.tables.$inferSelect;
    t2: typeof schema.tables.$inferSelect;
    t3: typeof schema.tables.$inferSelect;
    t4: typeof schema.tables.$inferSelect;
    t5: typeof schema.tables.$inferSelect;
    t6: typeof schema.tables.$inferSelect;
    p3: typeof schema.tables.$inferSelect;
    w1: typeof schema.tables.$inferSelect;
    waiterAssignmentsMap: Map<string, string>;
    tableSession1: typeof schema.tableSessions.$inferSelect;
    tableSession3: typeof schema.tableSessions.$inferSelect;
    tableSession4: typeof schema.tableSessions.$inferSelect;
    tableSession5: typeof schema.tableSessions.$inferSelect;
    tableSession6: typeof schema.tableSessions.$inferSelect;
    tableSessionW1: typeof schema.tableSessions.$inferSelect;
    guestSession1: typeof schema.guestSessions.$inferSelect;
    guestSession3Host: typeof schema.guestSessions.$inferSelect;
    guestSession4Host: typeof schema.guestSessions.$inferSelect;
    guestSession4Dwight: typeof schema.guestSessions.$inferSelect;
    guestSession5: typeof schema.guestSessions.$inferSelect;
    guestSession6: typeof schema.guestSessions.$inferSelect;
    guestSessionW1: typeof schema.guestSessions.$inferSelect;
  };
  menu: {
    itemBurger: typeof schema.menuItems.$inferSelect;
    itemSteak: typeof schema.menuItems.$inferSelect;
    itemSalmon: typeof schema.menuItems.$inferSelect;
    itemOldFashioned: typeof schema.menuItems.$inferSelect;
    itemFries: typeof schema.menuItems.$inferSelect;
    itemPizza: typeof schema.menuItems.$inferSelect;
    itemTagliatelle: typeof schema.menuItems.$inferSelect;
    itemMezcalita: typeof schema.menuItems.$inferSelect;
    itemWine: typeof schema.menuItems.$inferSelect;
    itemBeer: typeof schema.menuItems.$inferSelect;
    itemCalamari: typeof schema.menuItems.$inferSelect;
    itemLavaCake: typeof schema.menuItems.$inferSelect;
  };
  orders: {
    order1: typeof schema.orders.$inferSelect;
    order2: typeof schema.orders.$inferSelect;
    order3: typeof schema.orders.$inferSelect;
    order4: typeof schema.orders.$inferSelect;
    order5: typeof schema.orders.$inferSelect;
    order6: typeof schema.orders.$inferSelect;
    order7: typeof schema.orders.$inferSelect;
    order8: typeof schema.orders.$inferSelect;
    order2001?: typeof schema.orders.$inferSelect;
    order4ItemSteak2?: typeof schema.orderItems.$inferSelect;
    order6ItemPizza?: typeof schema.orderItems.$inferSelect;
    order6ItemCalamari?: typeof schema.orderItems.$inferSelect;
    order6ItemWine?: typeof schema.orderItems.$inferSelect;
  };
  billing?: {
    payment1: typeof schema.payments.$inferSelect;
    payment2: typeof schema.payments.$inferSelect;
  };
}
