import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { HealthCheckResponseDto, RootInfoResponseDto } from "./common/swagger/api-error-response.dto";

@ApiTags("Health")
@Controller()
export class AppController {
  @Get("health")
  @ApiOperation({ summary: "Application health check" })
  @ApiOkResponse({
    type: HealthCheckResponseDto,
    description: "Application is healthy and database connection pool is active",
  })
  health(): HealthCheckResponseDto {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
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

