import axios from "axios";
import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const DOJAH_BASE_URL = "https://api.dojah.io/api/v1";
const DOJAH_APP_ID = process.env.DOJAH_APP_ID!;
const DOJAH_SECRET_KEY = process.env.DOJAH_SECRET_KEY!;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!,
});

export class VerificationService {
  static async verifyNIN(nin: string): Promise<{
    success: boolean;
    data?: any;
    message: string;
    confidence?: number;
  }> {
    try {
      const cleanNIN = nin.trim().replace(/\s+/g, '');
      
      if (!/^\d{11}$/.test(cleanNIN)) {
        return { 
          success: false, 
          message: "Invalid NIN format. Must be exactly 11 digits." 
        };
      }

      const url = `${DOJAH_BASE_URL}/kyc/nin`;
      const response = await axios.get(url, {
        headers: {
          "AppId": DOJAH_APP_ID,
          "Authorization": DOJAH_SECRET_KEY,
          "Content-Type": "application/json",
        },
        params: { nin: cleanNIN },
        timeout: 30000,
      });

      if (response.data?.entity) {
        const entity = response.data.entity;
        
        const isValid = entity.valid === true || entity.status?.toLowerCase() === 'valid';
        
        return {
          success: isValid,
          data: entity,
          message: isValid ? "NIN verification successful" : "NIN is not valid or active",
          confidence: 100
        };
      } else {
        return { 
          success: false, 
          message: "No NIN record found. Please check and try again." 
        };
      }
    } catch (err: any) {
      console.error("NIN verification error:", err.response?.data || err.message);
      
      let errorMessage = "NIN verification service temporarily unavailable";
      
      if (err.response?.status === 404) {
        errorMessage = "NIN not found in the system. Please check the number.";
      } else if (err.response?.status === 429) {
        errorMessage = "Too many verification attempts. Please try again in a few minutes.";
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Verification timeout. Please try again.";
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  }

  static async uploadMediaToS3(mediaUrl: string, phoneNumber: string, type: 'selfie' | 'id'): Promise<string> {
    try {
      if (!mediaUrl || !mediaUrl.startsWith('https://')) {
        throw new Error("Invalid media URL provided");
      }
      const mediaResponse = await axios.get(mediaUrl, {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
          ).toString("base64")}`,
        },
        timeout: 45000, 
        maxContentLength: 10 * 1024 * 1024, // 10MB max
      });

      const contentType = mediaResponse.headers["content-type"];
      if (!contentType?.startsWith('image/')) {
        throw new Error("Only image files are allowed for verification");
      }

      const fileSize = mediaResponse.data.length;
      if (fileSize > 5 * 1024 * 1024) { // 5MB max
        throw new Error("File size too large. Maximum 5MB allowed.");
      }

      const fileExtension = contentType.split("/")[1] || 'jpg';
      const timestamp = Date.now();
      const fileName = `verifications/${phoneNumber}/${type}-${timestamp}.${fileExtension}`;

      // Upload to S3 with metadata
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileName,
        Body: mediaResponse.data,
        ContentType: contentType,
        Metadata: {
          'phone-number': phoneNumber,
          'upload-type': type,
          'upload-timestamp': timestamp.toString()
        },
        // ACL: "private", // Remove ACL if bucket policy handles permissions
      };

      const result = await s3.upload(uploadParams).promise();
      console.log(`Uploaded ${type} to S3 for ${phoneNumber}:`, result.Location);
      
      return result.Location;
    } catch (err: any) {
      console.error("S3 upload error:", err.message);
      
      if (err.message.includes('size')) {
        throw new Error("File too large. Please send a photo under 5MB.");
      } else if (err.message.includes('image')) {
        throw new Error("Please send a valid image file (JPEG, PNG).");
      } else if (err.code === 'ECONNABORTED') {
        throw new Error("Upload timeout. Please try again.");
      }
      
      throw new Error("Failed to upload media. Please try again.");
    }
  }

  static async compareFaces(selfieUrl: string, idUrl: string): Promise<{
    success: boolean;
    match?: boolean;
    confidence?: number;
    message: string;
    result?: any;
  }> {
    try {
      // Validate the URLs
      if (!selfieUrl || !idUrl) {
        return { 
          success: false, 
          message: "Missing required images for comparison" 
        };
      }

      const url = `${DOJAH_BASE_URL}/kyc/face/compare`;
      const response = await axios.post(
        url,
        { 
          image_one: selfieUrl, 
          image_two: idUrl 
        },
        {
          headers: {
            "AppId": DOJAH_APP_ID,
            "Authorization": DOJAH_SECRET_KEY,
            "Content-Type": "application/json",
          },
          timeout: 45000, 
        }
      );

      const entity = response.data?.entity;
      const isMatch = entity?.match === true;
      const confidence = entity?.confidence || entity?.similarity_score || 0;

      const MIN_CONFIDENCE = 98;
      const verifiedMatch = isMatch && confidence >= MIN_CONFIDENCE;

      return {
        success: true,
        match: verifiedMatch,
        confidence,
        message: verifiedMatch 
          ? `Faces matched successfully (${confidence.toFixed(1)}% confidence)`
          : `Faces did not match (${confidence.toFixed(1)}% confidence)`,
        result: entity
      };
    } catch (err: any) {
      console.error("Face comparison error:", err.response?.data || err.message);
      
      let errorMessage = "Face comparison service temporarily unavailable";
      
      if (err.response?.status === 400) {
        errorMessage = "Invalid images provided. Please send clear, front-facing photos.";
      } else if (err.response?.status === 429) {
        errorMessage = "Too many face comparison attempts. Please try again later.";
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  }
}