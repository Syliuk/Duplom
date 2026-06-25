import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      this.logger.warn('Resend is not configured. Email notifications will be skipped.');
      return;
    }

    this.resend = new Resend(apiKey);
  }

  async sendMail(to: string, subject: string, text: string) {
    if (!this.resend) return false;

    const from =
      this.configService.get<string>('RESEND_FROM') ||
      'FinanceFlow <onboarding@resend.dev>';

    this.logger.log(`Sending email via Resend to ${to}`);

    const { error } = await this.resend.emails.send({
      from,
      to,
      subject,
      text,
    });

    if (error) {
      this.logger.error(`Resend failed to send email to ${to}`, error);
      throw new Error(error.message);
    }

    this.logger.log(`Resend accepted email to ${to}`);
    return true;
  }
}
