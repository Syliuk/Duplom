import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface BrevoErrorResponse {
  code?: string;
  message?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string | undefined;
  private readonly fromEmail: string | undefined;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY');
    this.fromEmail = this.configService.get<string>('BREVO_FROM_EMAIL');
    this.fromName = this.configService.get<string>('BREVO_FROM_NAME') || 'FinanceFlow';

    if (!this.apiKey || !this.fromEmail) {
      this.logger.warn('Brevo is not configured. Email notifications will be skipped.');
    }
  }

  async sendMail(to: string, subject: string, text: string) {
    if (!this.apiKey || !this.fromEmail) return false;

    this.logger.log(`Sending email via Brevo to ${to}`);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': this.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: this.fromName,
          email: this.fromEmail,
        },
        to: [{ email: to }],
        subject,
        textContent: text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(async () => {
        const message = await response.text().catch(() => '');
        return { message };
      }) as BrevoErrorResponse;

      const message = errorBody.message || `Brevo API error: ${response.status}`;
      this.logger.error(`Brevo failed to send email to ${to}: ${message}`);
      throw new Error(message);
    }

    this.logger.log(`Brevo accepted email to ${to}`);
    return true;
  }
}
