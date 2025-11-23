import { Request, Response } from "express";
import { Request as RequestModel } from "../models/Request";
import { Acceptance } from "../models/Acceptance";
import { Donor } from "../models/Donor";
import { AcceptanceStatus, EligibilityStatus, RequestStatus } from "../models/Enums";

export class AcceptanceController {
  
  static async getMatchingRequests(req: Request, res: Response): Promise<void> {
    try {
      const { donorId } = req.params;
      
      const donor = await Donor.findById(donorId);
      if (!donor) {
        res.status(404).json({ success: false, message: "Donor not found" });
        return;
      }

      const matchingRequests = await RequestModel.find({
        bloodType: donor.bloodGroup,
        status: { $in: [RequestStatus.ACTIVE, RequestStatus.PARTIALLY_FULFILLED] }
      })
      .populate("hospital", "hospitalName address contact")
      .select("bloodType genotype unitsNeeded unitsPledged urgency status deadline createdAt")
      .sort({ urgency: -1, createdAt: -1 });

      res.status(200).json({
        success: true,
        count: matchingRequests.length,
        data: matchingRequests
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error fetching matching requests",
        error: error.message
      });
    }
  }

  static async acceptRequest(req: Request, res: Response): Promise<void> {
    try {
      const { donorId, requestId } = req.params;
      const { unitsPledged } = req.body;

      if (!unitsPledged || unitsPledged < 1 || unitsPledged > 2) {
        res.status(400).json({ success: false, message: "Units pledged must be between 1 and 2" });
        return;
      }

      const [donor, bloodRequest] = await Promise.all([
        Donor.findById(donorId),
        RequestModel.findById(requestId)
      ]);

      if (!donor) {
        res.status(404).json({ success: false, message: "Donor not found" });
        return;
      }

      if (!bloodRequest) {
        res.status(404).json({ success: false, message: "Request not found" });
        return;
      }

      if (donor.eligibilityStatus !== EligibilityStatus.ELIGIBLE) {
        res.status(400).json({ 
          success: false, 
          message: "Donor is not currently eligible to donate" 
        });
        return;
      }

      if (donor.bloodGroup !== bloodRequest.bloodType) {
        res.status(400).json({ 
          success: false, 
          message: "Blood type does not match request requirement" 
        });
        return;
      }

      if (bloodRequest.status === RequestStatus.FULFILLED || 
          bloodRequest.status === RequestStatus.EXPIRED ||
          bloodRequest.status === RequestStatus.CANCELLED) {
        res.status(400).json({ 
          success: false, 
          message: "This request is no longer accepting donations" 
        });
        return;
      }

      // if donor already accepted the request
      const existingAcceptance = await Acceptance.findOne({
        request: requestId,
        donor: donorId
      });

      if (existingAcceptance) {
        res.status(400).json({ 
          success: false, 
          message: "You have already accepted this request" 
        });
        return;
      }

      // if units needed are still available
      const remainingUnits = bloodRequest.unitsNeeded - bloodRequest.unitsPledged;
      if (unitsPledged > remainingUnits) {
        res.status(400).json({ 
          success: false, 
          message: `Only ${remainingUnits} units remaining needed` 
        });
        return;
      }

      // then create acceptance
      const acceptance = await Acceptance.create({
        request: requestId,
        donor: donorId,
        unitsPledged,
        status: AcceptanceStatus.PENDING
      });

      // update request units pledged and status
      const newUnitsPledged = bloodRequest.unitsPledged + unitsPledged;
      let newStatus: RequestStatus = bloodRequest.status;

      if (newUnitsPledged >= bloodRequest.unitsNeeded) {
        newStatus = RequestStatus.FULFILLED;
      } else if (newUnitsPledged > 0) {
        newStatus = RequestStatus.PARTIALLY_FULFILLED;
      }

      await RequestModel.findByIdAndUpdate(requestId, {
        unitsPledged: newUnitsPledged,
        status: newStatus
      });

      res.status(201).json({
        success: true,
        message: "Request accepted successfully",
        data: {
          acceptance,
          remainingUnits: bloodRequest.unitsNeeded - newUnitsPledged
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error accepting request",
        error: error.message
      });
    }
  }

  static async cancelAcceptance(req: Request, res: Response): Promise<void> {
    try {
      const { acceptanceId } = req.params;

      const acceptance = await Acceptance.findById(acceptanceId);
      if (!acceptance) {
        res.status(404).json({ success: false, message: "Acceptance not found" });
        return;
      }

      // update acceptance status
      await Acceptance.findByIdAndUpdate(acceptanceId, {
        status: AcceptanceStatus.CANCELLED
      });

      // update request units pledged and status
      const bloodRequest = await RequestModel.findById(acceptance.request);
      if (bloodRequest) {
        const newUnitsPledged = Math.max(0, bloodRequest.unitsPledged - acceptance.unitsPledged);
        let newStatus = bloodRequest.status;

        if (newUnitsPledged === 0) {
          newStatus = RequestStatus.ACTIVE;
        } else if (newUnitsPledged < bloodRequest.unitsNeeded) {
          newStatus = RequestStatus.PARTIALLY_FULFILLED;
        }

        await RequestModel.findByIdAndUpdate(acceptance.request, {
          unitsPledged: newUnitsPledged,
          status: newStatus
        });
      }

      res.status(200).json({
        success: true,
        message: "Acceptance cancelled successfully"
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error cancelling acceptance",
        error: error.message
      });
    }
  }

  static async getMyAcceptanceHistory(req: Request, res: Response): Promise<void> {
    try {
      const { donorId } = req.params;

      const acceptances = await Acceptance.find({ donor: donorId })
        .populate({
          path: "request",
          populate: {
            path: "hospital",
            select: "hospitalName address contact"
          }
        })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: acceptances.length,
        data: acceptances
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error fetching acceptances",
        error: error.message
      });
    }
  }
}
