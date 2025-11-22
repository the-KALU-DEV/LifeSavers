import { Router } from "express";
import { RequestController } from "../controllers/request.controller";

const router = Router();

router.post("/requests", RequestController.createRequest);
router.get("/requests/:requestId", RequestController.getRequestById);
router.get("/hospitals/:hospitalId/requests", RequestController.getHospitalRequests);
router.put("/requests/:requestId", RequestController.updateRequest);
router.get("/hospitals/:hospitalId/requests/expired", RequestController.getExpiredRequests);

export default router;