import { Request, Response } from 'express';
import { DonorService } from '../services/donor/donorService';
import { TwilioService } from '../services/twilio/twilioService';
import { logger } from '../utils/logger';


export class WebhookController {
  public static async handleIncomingMessage(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body;
    
    logger.info('Incoming Twilio webhook', {
      from: payload.From,
      messageLength: payload.Body?.length || 0,
      hasMedia: !!payload.MediaUrl0,
      messageSid: payload.MessageSid
    });

    //validate required fields
    if (!payload.From) {
      logger.warn('Missing required field: From', { payload });
      res.status(400).type('text/xml').send('<Response></Response>');
      return;
    }

    const { from, text, media } = this.parseWebhookPayload(payload);

    //process the message through our donor service
    const response = await DonorService.processMessage({
      phoneNumber: from,
      message: text,
      mediaUrl: media?.url
    });

    //send response back to user using TwilioService
    await TwilioService.sendMessage(from, response);

    //always return success to Twilio to prevent retries
    res.type('text/xml').send('<Response></Response>');
    return;

  } catch (error) {
    logger.error('Webhook processing error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body
    });

    //try and send error message to user
    try {
      if (req.body.From) {
        await TwilioService.sendMessage(
          req.body.From, 
          '❌ Sorry, we encountered an error. Please try again in a moment.'
        );
      }
    } catch (sendError) {
      logger.error('Failed to send error message to user', {
        from: req.body.From,
        error: sendError instanceof Error ? sendError.message : 'Unknown error'
      });
    }

    //again always return success to Twilio to prevent retries
    res.type('text/xml').send('<Response></Response>');
    return; 
  }
}

  private static parseWebhookPayload(payload: any): {
    from: string;
    text: string;
    media?: { url: string; mimeType?: string };
  } {
    const from = payload.From;
    let text = payload.Body?.trim() || '';

    //handle media messages
    let media: { url: string; mimeType?: string } | undefined;
    const numMedia = parseInt(payload.NumMedia || '0');
    
    if (numMedia > 0 && payload.MediaUrl0) {
      media = {
        url: payload.MediaUrl0,
        mimeType: payload.MediaContentType0
      };

      logger.debug('Media attachment received', {
        from,
        mediaUrl: this.maskUrl(payload.MediaUrl0),
        contentType: payload.MediaContentType0
      });

      //if theres no text but has media, use a special keyword
      if (!text) {
        text = 'media_upload';
      }
    }

    //if theres no content at all, use a default message
    if (!text && !media) {
      text = 'hello';
    }

    return { from, text, media };
  }

  public static async handleStatusCallback(req: Request, res: Response): Promise<void> {
    try {
      const { MessageStatus, MessageSid, To, ErrorCode } = req.body;

      logger.info('Message status callback', {
        messageSid: MessageSid,
        to: To,
        status: MessageStatus,
        errorCode: ErrorCode
      });

      res.sendStatus(200);

    } catch (error) {
      logger.error('Error processing status callback', {
        error: error instanceof Error ? error.message : 'Unknown error',
        body: req.body
      });
      res.sendStatus(200);
    }
  }

  public static healthCheck(req: Request, res: Response): void {
    const health = {
      status: 'healthy',
      service: 'blood-donation-bot-webhook',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    };

    res.status(200).json(health);
  }

  public static verifyWebhook(req: Request, res: Response): void {
    res.status(200).json({ 
      status: 'verified',
      message: 'Webhook endpoint is active and ready',
      timestamp: new Date().toISOString()
    });
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