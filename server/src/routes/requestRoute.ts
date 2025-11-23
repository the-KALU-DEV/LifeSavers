import { Router } from "express";
import { RequestController } from "../controllers/request.controller";

const router = Router();

router.post("/request/create", RequestController.createRequest);
router.get("/:id", RequestController.getRequestById);
router.get("/", RequestController.getHospitalRequests);
router.put("/:id", RequestController.updateRequest);
router.get("/requests/:expired", RequestController.getExpiredRequests);

export default router;