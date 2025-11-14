import { Request, Response } from "express";
import { Hospital } from "../models/Hospital";

export class HospitalController {
  /**
   * Get all hospitals
   */
  static async getAllHospitals(req: Request, res: Response): Promise<void> {
    try {
      const hospitals = await Hospital.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        count: hospitals.length,
        data: hospitals,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error fetching hospitals",
        error: error.message,
      });
    }
  }

  /**
   * Get hospital by ID
   */
  static async getHospitalById(req: Request, res: Response): Promise<void> {
    try {
      const hospital = await Hospital.findById(req.params.id);

      if (!hospital) {
        res.status(404).json({
          success: false,
          message: "Hospital not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: hospital,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error fetching hospital",
        error: error.message,
      });
    }
  }

  /**
   * Get hospital by reference number
   */
  static async getHospitalByReference(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const hospital = await Hospital.findOne({
        referenceNumber: req.params.reference,
      });

      if (!hospital) {
        res.status(404).json({
          success: false,
          message: "Hospital not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: hospital,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error fetching hospital",
        error: error.message,
      });
    }
  }

  /**
   * Update hospital verification status
   */
  static async updateVerificationStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { status } = req.body;

      if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        res.status(400).json({
          success: false,
          message: "Invalid status. Must be PENDING, APPROVED, or REJECTED",
        });
        return;
      }

      const hospital = await Hospital.findByIdAndUpdate(
        req.params.id,
        { verificationStatus: status },
        { new: true }
      );

      if (!hospital) {
        res.status(404).json({
          success: false,
          message: "Hospital not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Verification status updated successfully",
        data: hospital,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error updating verification status",
        error: error.message,
      });
    }
  }

  /**
   * Get hospitals by verification status
   */
  static async getHospitalsByStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { status } = req.params;

      if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        res.status(400).json({
          success: false,
          message: "Invalid status. Must be PENDING, APPROVED, or REJECTED",
        });
        return;
      }

      const hospitals = await Hospital.find({
        verificationStatus: status,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        count: hospitals.length,
        data: hospitals,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error fetching hospitals",
        error: error.message,
      });
    }
  }

  /**
   * Delete hospital
   */
  static async deleteHospital(req: Request, res: Response): Promise<void> {
    try {
      const hospital = await Hospital.findByIdAndDelete(req.params.id);

      if (!hospital) {
        res.status(404).json({
          success: false,
          message: "Hospital not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Hospital deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error deleting hospital",
        error: error.message,
      });
    }
  }

  /**
   * Update hospital credits
   */
  static async updateCredits(req: Request, res: Response): Promise<void> {
    try {
      const { credits } = req.body;

      if (typeof credits !== "number") {
        res.status(400).json({
          success: false,
          message: "Credits must be a number",
        });
        return;
      }

      const hospital = await Hospital.findByIdAndUpdate(
        req.params.id,
        { tempCredits: credits },
        { new: true }
      );

      if (!hospital) {
        res.status(404).json({
          success: false,
          message: "Hospital not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Credits updated successfully",
        data: hospital,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error updating credits",
        error: error.message,
      });
    }
  }
}
