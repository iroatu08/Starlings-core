import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailService } from './mail.service';
import { MailTemplateRenderer } from './mail-template.renderer';
import { RESEND_CLIENT } from './mail.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    MailTemplateRenderer,
    {
      provide: RESEND_CLIENT,
      useFactory: (config: ConfigService) =>
        new Resend(config.getOrThrow<string>('RESEND_API_KEY')),
      inject: [ConfigService],
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
