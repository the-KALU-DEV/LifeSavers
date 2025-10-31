import { Router } from "express";
import { handleIncomingMessage, sendMessage } from "../controllers/registration.controller";

const router = Router();

router.post("/", handleIncomingMessage);
router.post("/send", sendMessage);

export default router;
