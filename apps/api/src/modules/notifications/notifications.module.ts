import { Module } from '@nestjs/common';
import { MailService } from './application/mail.service';
import { MailController } from './presentation/http/mail.controller';

@Module({
  imports: [],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class NotificationsModule {}
