import twilio from 'twilio';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/error';

export class TwilioService {
  private static client: twilio.Twilio;
  private static whatsappNumber: string;

  public static initialize(): void {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER!;

    if (!accountSid || !authToken || !this.whatsappNumber) {
      throw new AppError('Twilio configuration missing. Check environment variables.', 500);
    }

    this.client = twilio(accountSid, authToken);
    logger.info('Twilio service initialized successfully');
  }

  public static async sendMessage(to: string, body: string): Promise<void> {
    try {
      if (!this.client) {
        throw new AppError('Twilio client not initialized', 500);
      }

      logger.debug('Sending WhatsApp message', {
        to,
        bodyLength: body.length,
        bodyPreview: body.substring(0, 50) + '...'
      });

      const message = await this.client.messages.create({
        body,
        from: this.whatsappNumber,
        to
      });

      logger.info('WhatsApp message sent successfully', {
        to,
        messageSid: message.sid,
        status: message.status
      });

    } catch (error) {
      logger.error('Failed to send WhatsApp message', {
        to,
        error: error instanceof Error ? error.message : 'Unknown error',
        bodyPreview: body.substring(0, 50) + '...'
      });

      //re-throw with proper error handling
      if (error instanceof Error) {
        throw new AppError(`Failed to send message: ${error.message}`, 500);
      }

      throw new AppError('Failed to send message', 500);
    }
  }

  public static async sendMediaMessage(to: string, mediaUrl: string, body?: string): Promise<void> {
    try {
      if (!this.client) {
        throw new AppError('Twilio client not initialized', 500);
      }

      logger.debug('Sending WhatsApp media message', {
        to,
        mediaUrl: this.maskUrl(mediaUrl),
        hasBody: !!body
      });

      const message = await this.client.messages.create({
        body,
        from: this.whatsappNumber,
        to,
        mediaUrl: [mediaUrl]
      });

      logger.info('WhatsApp media message sent successfully', {
        to,
        messageSid: message.sid,
        status: message.status
      });

    } catch (error) {
      logger.error('Failed to send WhatsApp media message', {
        to,
        mediaUrl: this.maskUrl(mediaUrl),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw new AppError('Failed to send media message', 500);
    }
  }

  public static validatePhoneNumber(phoneNumber: string): boolean {
    //basic E.164 format validation
    return /^\+[1-9]\d{1,14}$/.test(phoneNumber);
  }

  //format phone number to E.164 if needed
  public static formatPhoneNumber(phoneNumber: string): string {
    //remove any non-digit characters except leading +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');

    //to ensure it starts with a +
    if (!cleaned.startsWith('+')) {
      //assuming all nigerian numbers if no country code
      cleaned = '+234' + cleaned.replace(/^0/, '');
    }

    return cleaned;
  }

  public static async getMessageStatus(messageSid: string): Promise<string> {
    try {
      const message = await this.client.messages(messageSid).fetch();
      return message.status;
    } catch (error) {
      logger.error('Failed to get message status', {
        messageSid,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 'unknown';
    }
  }

  private static maskUrl(url: string): string {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/...`;
    } catch {
      return url.substring(0, 50) + '...';
    }
  }
}

//initialize when module loads
TwilioService.initialize();