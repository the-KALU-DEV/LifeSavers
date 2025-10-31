import { Router } from 'express';
import { RegistrationController } from '../controllers/donorRegistrationController';

const router = Router();

//twilio webhook verification (GET)
router.get('/webhook', (req, res) => {
  res.status(200).json({ status: 'Webhook verified' });
});

//whatsApp message webhook (POST)
router.post('/webhook', RegistrationController.handleIncomingMessage);

//health check
router.get('/health', RegistrationController.healthCheck);

export default router;