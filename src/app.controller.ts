import { Controller, Get, Inject, Optional, ServiceUnavailableException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiOkResponse, ApiServiceUnavailableResponse } from "@nestjs/swagger";
import { sql } from "drizzle-orm";
import { DRIZZLE, DrizzleDatabase } from "@/database";
import { HealthCheckResponseDto, RootInfoResponseDto } from "./common/swagger/api-error-response.dto";

@ApiTags("Health")
@Controller()
export class AppController {
  constructor(
    @Optional() @Inject(DRIZZLE) private readonly db?: DrizzleDatabase,
  ) {}

  @Get("health")
  @ApiOperation({ summary: "Application liveness check" })
  @ApiOkResponse({
    type: HealthCheckResponseDto,
    description: "Application process is alive and responsive",
  })
  health(): HealthCheckResponseDto {
    return {
      status: "ok",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get("health/readiness")
  @ApiOperation({ summary: "Deep application readiness probe" })
  @ApiOkResponse({
    type: HealthCheckResponseDto,
    description: "Database connection pool is healthy and accepting queries",
  })
  @ApiServiceUnavailableResponse({
    description: "Database connection pool is unreachable or unhealthy",
  })
  async readiness(): Promise<HealthCheckResponseDto> {
    try {
      if (this.db) {
        await this.db.execute(sql`SELECT 1`);
      }
      return {
        status: "ok",
        database: "connected",
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      throw new ServiceUnavailableException(`Database connection check failed: ${err.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: "API root check" })
  @ApiOkResponse({
    type: RootInfoResponseDto,
    description: "Root service information and Swagger documentation URL",
  })
  root(): RootInfoResponseDto {
    return {
      service: "Tavonza AI API",
      status: "online",
      docs: "/docs",
    };
  }
}

