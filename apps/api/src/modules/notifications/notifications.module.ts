import { Module } from '@nestjs/common';
import { MailService } from './application/mail.service';
import { MailController } from './presentation/http/mail.controller';

import { NotificationService } from './application/services/notification.service';
import { NotificationController } from './presentation/http/notification.controller';

@Module({
  imports: [],
  controllers: [MailController, NotificationController],
  providers: [MailService, NotificationService],
  exports: [MailService, NotificationService],
})
export class NotificationsModule {}
