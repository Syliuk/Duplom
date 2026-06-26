import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') || 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP is not configured. Email notifications will be skipped.');
      return;
    }

    const transportOptions: any = {
      host,
      port,
      family: 4,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    };

    this.transporter = nodemailer.createTransport(transportOptions);
  }

  async sendMail(to: string, subject: string, text: string) {
    if (!this.transporter) return false;

    const from = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER');
    this.logger.log(`Sending email via SMTP to ${to}`);
    await this.transporter.sendMail({ from, to, subject, text });
    this.logger.log(`SMTP accepted email to ${to}`);
    return true;
  }
}
