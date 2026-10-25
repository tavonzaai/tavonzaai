import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleOrganizationRepository } from '../repositories/drizzle-organization.repository';
import type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
} from '../dto/organization.dto';
import type { Organization } from '../domain/organization.entity';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';
import {
  assertCanAccessOrganization,
  assertCanManageOrganizations,
  isSuperAdmin,
} from '../../../common/auth/actor.util';

@Injectable()
export class OrganizationService {
  constructor(private readonly orgRepo: DrizzleOrganizationRepository) {}

  async create(user: JwtPayload, dto: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    assertCanManageOrganizations(user);
    const ownerId = isSuperAdmin(user) && dto.ownerId ? dto.ownerId : user.sub;
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

  async findById(user: JwtPayload, id: string): Promise<OrganizationResponseDto> {
    assertCanManageOrganizations(user);
    const org = await this.orgRepo.findById(id);
    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }
    assertCanAccessOrganization(user, org);
    return this.toResponseDto(org);
  }

  async findByOwner(ownerId: string): Promise<OrganizationResponseDto[]> {
    const orgs = await this.orgRepo.findByOwnerId(ownerId);
    return orgs.map((org) => this.toResponseDto(org));
  }

  async findAll(user: JwtPayload, options?: any): Promise<{ data: OrganizationResponseDto[]; meta: any }> {
    assertCanManageOrganizations(user);
    const query = isSuperAdmin(user) ? options : { ...options, ownerId: user.sub };
    const res = await this.orgRepo.findAll(query);
    return {
      data: res.data.map((org) => this.toResponseDto(org)),
      meta: res.meta,
    };
  }

  async delete(id: string, user: JwtPayload): Promise<{ success: boolean }> {
    assertCanManageOrganizations(user);
    const org = await this.orgRepo.findById(id);
    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }
    assertCanAccessOrganization(user, org);
    const deleted = await this.orgRepo.delete(id);
    return { success: deleted };
  }

  async update(
    id: string,
    user: JwtPayload,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    assertCanManageOrganizations(user);
    const org = await this.orgRepo.findById(id);
    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }
    assertCanAccessOrganization(user, org);

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
