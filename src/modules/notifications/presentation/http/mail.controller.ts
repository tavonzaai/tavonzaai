import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { MailService } from '../../application/mail.service';
import {
  SendTestEmailDto,
  SendTestOtpDto,
  SendMailResponseDto,
  MailStatusResponseDto,
} from './dto/mail.dto';

@ApiTags('System | Mailer')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /**
   * POST /mail/test-send
   * Test sending a custom email via AWS SES and Redis FIFO Queue from Swagger UI
   */
  @Post('test-send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Dev/Test] Send a test email via AWS SES / Queue',
    description: 'Enqueues or directly dispatches a formatted test email to the specified address.',
  })
  @ApiOkResponse({ type: SendMailResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid email payload' })
  async sendTestEmail(@Body() dto: SendTestEmailDto): Promise<SendMailResponseDto> {
    return this.mailService.sendTestEmail(dto.to, dto.subject, dto.message);
  }

  /**
   * POST /mail/test-otp
   * Test dispatching a 5-digit OTP verification or password reset template
   */
  @Post('test-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Dev/Test] Send an OTP email template test',
    description: 'Generates a 5-digit OTP code, formats the email using the official template, and dispatches it.',
  })
  @ApiOkResponse({ type: SendMailResponseDto })
  async sendTestOtp(@Body() dto: SendTestOtpDto): Promise<SendMailResponseDto> {
    const testCode = Math.floor(10000 + Math.random() * 90000).toString();
    const name = dto.firstName || 'Developer';

    if (dto.type === 'password_reset') {
      return this.mailService.sendPasswordResetCode(dto.email, name, testCode);
    }
    return this.mailService.sendVerificationCode(dto.email, name, testCode);
  }

  /**
   * GET /mail/status
   * Check SES and Redis Mail Queue status
   */
  @Get('status')
  @ApiOperation({
    summary: '[Dev/Test] Check mail system and queue connection status',
  })
  @ApiOkResponse({ type: MailStatusResponseDto })
  async getStatus(): Promise<MailStatusResponseDto> {
    return this.mailService.getStatus();
  }
}
