import { Request, Response } from 'express';
import { DonorService } from '../services/donor/donorService';
import { TwilioService } from '../services/twilio/twilioService';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';

export class RegistrationController {
  public static async handleIncomingMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { From, Body, MediaUrl0 } = req.body;
      
      //validate incoming webhook data
      if (!From || !Body) {
        logger.warn('Invalid webhook payload', { payload: req.body });
        throw new AppError('Invalid webhook payload', 400);
      }

      logger.info('Incoming WhatsApp message', {
        from: From,
        message: Body,
        mediaUrl: MediaUrl0,
        timestamp: new Date().toISOString()
      });

      //process the message
      const response = await DonorService.processMessage({
        phoneNumber: From,
        message: Body.trim(),
        mediaUrl: MediaUrl0
      });

      // Send response back via Twilio
      await TwilioService.sendMessage(From, response);

      logger.info('Message processed successfully', {
        from: From,
        responseLength: response.length
      });

      return res.status(200).json({ success: true });

    } catch (error) {
      logger.error('Registration controller error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        payload: req.body
      });

      //send generic error message to user
      if (req.body.From) {
        await TwilioService.sendMessage(
          req.body.From, 
          '❌ Sorry, we encountered an error. Please try again in a moment.'
        );
      }

      return res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }

  public static async healthCheck(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      status: 'healthy',
      service: 'registration-controller',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
}