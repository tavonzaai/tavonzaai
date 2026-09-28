// ============================================================================
// Menu Domain — MenuItem Entity
// ============================================================================
// This maps to the "Add to Cart" detail screen in the Figma design.
// Fields include: name, description, price, prep time, calories, allergens,
// wine pairing, rating, dietary badges, add-ons, and availability.
// ============================================================================

export interface MenuItemAddOn {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemProps {
  id: string;
  branchId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  prepTime: number | null;
  calories: number | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergens: string | null;
  winePairing: string | null;
  winePairingNote: string | null;
  rating: number | null;
  ratingCount: number;
  isAvailable: boolean;
  isPopular: boolean;
  addOns: MenuItemAddOn[];
}

export class MenuItem {
  readonly id: string;
  readonly branchId: string;
  readonly categoryId: string;
  readonly categoryName: string;
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly imageUrl: string | null;
  readonly prepTime: number | null;
  readonly calories: number | null;
  readonly isVegetarian: boolean;
  readonly isVegan: boolean;
  readonly isGlutenFree: boolean;
  readonly allergens: string[];
  readonly winePairing: string | null;
  readonly winePairingNote: string | null;
  readonly rating: number | null;
  readonly ratingCount: number;
  readonly isAvailable: boolean;
  readonly isPopular: boolean;
  readonly addOns: MenuItemAddOn[];

  constructor(props: MenuItemProps) {
    this.id = props.id;
    this.branchId = props.branchId;
    this.categoryId = props.categoryId;
    this.categoryName = props.categoryName ?? '';
    this.name = props.name;
    this.description = props.description;
    this.price = props.price;
    this.imageUrl = props.imageUrl;
    this.prepTime = props.prepTime;
    this.calories = props.calories;
    this.isVegetarian = props.isVegetarian;
    this.isVegan = props.isVegan;
    this.isGlutenFree = props.isGlutenFree;
    this.winePairing = props.winePairing;
    this.winePairingNote = props.winePairingNote;
    this.rating = props.rating;
    this.ratingCount = props.ratingCount;
    this.isAvailable = props.isAvailable;
    this.isPopular = props.isPopular;
    this.addOns = props.addOns;

    // Parse comma-separated allergens string into an array
    this.allergens = props.allergens
      ? props.allergens.split(',').map((a) => a.trim())
      : [];
  }

  // ── Domain Logic ──────────────────────────────────────────────────────

  /**
   * Get the dietary badge label (shown on item detail screen).
   * Figma shows: "Vegetarian" badge on the item card.
   */
  get dietBadge(): string | null {
    if (this.isVegan) return 'Vegan';
    if (this.isVegetarian) return 'Vegetarian';
    if (this.isGlutenFree) return 'Gluten Free';
    return null;
  }

  /**
   * Format allergens for display: "Contains: Gluten, Dairy, Nuts"
   * Shown on the item detail screen below the diet badge.
   */
  get allergenDisplay(): string | null {
    if (this.allergens.length === 0) return null;
    return `Contains: ${this.allergens.join(', ')}`;
  }
}
