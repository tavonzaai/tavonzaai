// ============================================================================
// Menu Domain — MenuCategory Entity
// ============================================================================
// Domain entities are plain TypeScript classes that represent business objects.
// They contain business logic and validation — NOT database columns.
//
// KEY PRINCIPLE: This class never imports Prisma, NestJS, or any framework.
//               It's a pure domain model that could work in any runtime.
// ============================================================================

export interface MenuCategoryProps {
  id: string;
  branchId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  itemCount?: number;
}

export class MenuCategory {
  readonly id: string;
  readonly branchId: string;
  readonly name: string;
  readonly description: string | null;
  readonly imageUrl: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly itemCount: number;

  constructor(props: MenuCategoryProps) {
    this.id = props.id;
    this.branchId = props.branchId;
    this.name = props.name;
    this.description = props.description;
    this.imageUrl = props.imageUrl;
    this.sortOrder = props.sortOrder;
    this.isActive = props.isActive;
    this.itemCount = props.itemCount ?? 0;
  }
}
