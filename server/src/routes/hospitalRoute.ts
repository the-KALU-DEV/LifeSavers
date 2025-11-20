import { Router } from "express";
import { HospitalController } from "../controllers/hospital.controller"; 

const router = Router();

router.get("/", HospitalController.getAllHospitals);
router.get("/:id", HospitalController.getHospitalById);
router.get("/reference/:reference", HospitalController.getHospitalByReference);
router.put("/:id/status", HospitalController.updateVerificationStatus);
router.get("/status/:status", HospitalController.getHospitalsByStatus);
router.delete("/:id", HospitalController.deleteHospital);
router.put("/:id/credits", HospitalController.updateCredits);

export default router;
