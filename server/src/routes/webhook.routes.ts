import { Router } from 'express';
import { WebhookController } from '../controllers/webhookController';

const router = Router();

//webhook verification (GET)
router.get('/webhook', WebhookController.verifyWebhook);

//incoming messages (POST)
router.post('/webhook', WebhookController.handleIncomingMessage);

//status callbacks
router.post('/status', WebhookController.handleStatusCallback);

//health check
router.get('/health', WebhookController.healthCheck);

export default router;