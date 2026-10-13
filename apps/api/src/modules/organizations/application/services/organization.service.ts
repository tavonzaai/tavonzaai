import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DrizzleOrganizationRepository } from '../../infrastructure/persistence/drizzle-organization.repository';
import type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
} from '../../presentation/http/dto/organization.dto';
import type { Organization } from '../../domain/entities/organization.entity';

@Injectable()
export class OrganizationService {
  constructor(private readonly orgRepo: DrizzleOrganizationRepository) {}

  async create(ownerId: string, dto: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    const slug = dto.slug || this.generateSlug(dto.name);

    const existing = await this.orgRepo.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Organization with slug "${slug}" already exists`);
    }

    const org = await this.orgRepo.create({
      name: dto.name,
      slug,
      ownerId,
    });

    return this.toResponseDto(org);
  }

  async findById(id: string): Promise<OrganizationResponseDto> {
    const org = await this.orgRepo.findById(id);
    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }
    return this.toResponseDto(org);
  }

  async findByOwner(ownerId: string): Promise<OrganizationResponseDto[]> {
    const orgs = await this.orgRepo.findByOwnerId(ownerId);
    return orgs.map((org) => this.toResponseDto(org));
  }

  async findAll(options?: any): Promise<{ data: OrganizationResponseDto[]; meta: any }> {
    const res = await this.orgRepo.findAll(options);
    return {
      data: res.data.map((org) => this.toResponseDto(org)),
      meta: res.meta,
    };
  }

  async delete(id: string, actingUserId: string): Promise<{ success: boolean }> {
    const org = await this.orgRepo.findById(id);
    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }
    if (org.ownerId !== actingUserId) {
      throw new ForbiddenException('Only the organization owner can delete the organization');
    }
    const deleted = await this.orgRepo.delete(id);
    return { success: deleted };
  }

  async update(
    id: string,
    actingUserId: string,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const org = await this.orgRepo.findById(id);
    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }

    if (org.ownerId !== actingUserId) {
      throw new ForbiddenException('Only the organization owner can update details');
    }

    if (dto.slug && dto.slug !== org.slug) {
      const existing = await this.orgRepo.findBySlug(dto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      }
    }

    const updated = await this.orgRepo.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Organization not found after update`);
    }

    return this.toResponseDto(updated);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `org-${Date.now()}`;
  }

  private toResponseDto(org: Organization): OrganizationResponseDto {
    return {
      id: org.id,
      name: org.name,
      ownerId: org.ownerId,
      slug: org.slug,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }
}
