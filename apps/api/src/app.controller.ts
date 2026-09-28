import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Health")
@Controller()
export class AppController {
  @Get("health")
  @ApiOperation({ summary: "Application health check" })
  @ApiResponse({ status: 200, description: "Application is healthy" })
  health() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: "API root check" })
  root() {
    return {
      service: "Tavonza AI API",
      status: "online",
      docs: "/docs",
    };
  }
}
