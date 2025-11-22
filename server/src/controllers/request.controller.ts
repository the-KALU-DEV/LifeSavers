import { Request, Response } from "express";
import { Request as RequestModel} from "../models/Request";
import { BloodGroup, Genotype,  RequestStatus, UrgencyLevel  } from "../models/Enums";
import { Hospital } from "../models/Hospital";

export class RequestController {

  static async createRequest(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId, bloodType, genotype, unitsNeeded, urgency, deadline } = req.body;

      if (!hospitalId || !bloodType || !genotype || !unitsNeeded || !urgency || !deadline) {
        res.status(400).json({ success: false, message: "All fields are required" });
        return;
      }

      if (unitsNeeded < 1 || unitsNeeded > 15) {
        res.status(400).json({ success: false, message: "Units must be between 1-15" });
        return;
      }

      if (new Date(deadline) <= new Date()) {
        res.status(400).json({ success: false, message: "Deadline must be in the future" });
        return;
      }

      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        res.status(404).json({ success: false, message: "Hospital not found" });
        return;
      }

      const bloodRequest = await RequestModel.create({
        hospital: hospitalId,
        bloodType,
        genotype,
        unitsNeeded,
        urgency,
        deadline: new Date(deadline),
        status: RequestStatus.ACTIVE
      });

      res.status(201).json({
        success: true,
        message: "Blood request created successfully",
        data: bloodRequest
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error creating request",
        error: error.message
      });
    }
  }

  static async getHospitalRequests(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;
      const { status } = req.query;

      const filter: any = { hospital: hospitalId };
      if (status && Object.values(RequestStatus).includes(status as RequestStatus)) {
        filter.status = status;
      }

      const requests = await RequestModel.find(filter)
        .populate("hospital", "hospitalName address contact")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: requests.length,
        data: requests
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error fetching requests",
        error: error.message
      });
    }
  }

  static async updateRequest(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const { unitsNeeded, status } = req.body;

      const updateData: any = {};
      if (unitsNeeded !== undefined) {
        if (unitsNeeded < 1 || unitsNeeded > 15) {
          res.status(400).json({ success: false, message: "Units must be between 1-15" });
          return;
        }
        updateData.unitsNeeded = unitsNeeded;
      }

      if (status && Object.values(RequestStatus).includes(status as RequestStatus)) {
        updateData.status = status;
      }

      const updatedRequest = await RequestModel.findByIdAndUpdate(
        requestId,
        updateData,
        { new: true }
      ).populate("hospital", "hospitalName address contact");

      if (!updatedRequest) {
        res.status(404).json({ success: false, message: "Request not found" });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Request updated successfully",
        data: updatedRequest
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error updating request",
        error: error.message
      });
    }
  }

  static async getExpiredRequests(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;

      const expiredRequests = await RequestModel.find({
        hospital: hospitalId,
        status: RequestStatus.EXPIRED
      })
      .populate("hospital", "hospitalName address contact")
      .sort({ deadline: -1 });

      res.status(200).json({
        success: true,
        count: expiredRequests.length,
        data: expiredRequests
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error fetching expired requests",
        error: error.message
      });
    }
  }
}