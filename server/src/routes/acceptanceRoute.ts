import { Router } from "express";
import { AcceptanceController } from "../controllers/acceptance.controller";

const router = Router();

router.get("/donors/:donorId/requests/matching", AcceptanceController.getMatchingRequests);
router.post("/donors/:donorId/requests/:requestId/accept", AcceptanceController.acceptRequest);
router.patch("/acceptances/:acceptanceId/cancel", AcceptanceController.cancelAcceptance);
router.get("/donors/:donorId/acceptances", AcceptanceController.getMyAcceptanceHistory);

export default router;