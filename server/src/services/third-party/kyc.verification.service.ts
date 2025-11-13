import axios from "axios";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import {
  API_CONSTANTS,
  TIMEOUT_CONSTANTS,
  FILE_CONSTANTS,
  NIN_CONSTANTS,
  FACE_COMPARE_CONSTANTS,
  S3_CONSTANTS
} from "../../utils/constants";
import { 
  AWS_ACCESS_KEY_ID, 
  AWS_REGION, 
  AWS_S3_BUCKET, 
  AWS_SECRET_ACCESS_KEY, 
  DOJAH_APP_ID, 
  DOJAH_BASE_URL, 
  DOJAH_SECRET_KEY 
} from "../../config/env";

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID!,
  secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  region: AWS_REGION!
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
      
      if (!NIN_CONSTANTS.VALIDATION_REGEX.test(cleanNIN)) {
        return { 
          success: false, 
          message: NIN_CONSTANTS.ERROR_MESSAGES.INVALID_FORMAT
        };
      }

      const url = `${DOJAH_BASE_URL}${API_CONSTANTS.DOJAH_NIN_ENDPOINT}`;
      const response = await axios.get(url, {
        headers: {
          "AppId": DOJAH_APP_ID,
          "Authorization": DOJAH_SECRET_KEY,
          "Content-Type": "application/json",
        },
        params: { nin: cleanNIN },
        timeout: TIMEOUT_CONSTANTS.NIN_VERIFICATION,
      });

      if (response.data?.entity) {
        const entity = response.data.entity;
        const isValid = entity.valid === true || entity.status?.toLowerCase() === 'valid';
        
        return {
          success: isValid,
          data: entity,
          message: isValid ? FACE_COMPARE_CONSTANTS.SUCCESS_MESSAGE : NIN_CONSTANTS.ERROR_MESSAGES.INVALID_ACTIVE,
          confidence: 100
        };
      } else {
        return { 
          success: false, 
          message: NIN_CONSTANTS.ERROR_MESSAGES.NOT_FOUND
        };
      }
    } catch (err: any) {
      console.error("NIN verification error:", err.response?.data || err.message);
      
      let errorMessage = API_CONSTANTS.ERROR_MESSAGES.SERVICE_UNAVAILABLE;
      
      if (err.response?.status === API_CONSTANTS.HTTP_STATUS.NOT_FOUND) {
        errorMessage = API_CONSTANTS.ERROR_MESSAGES.NIN_NOT_FOUND;
      } else if (err.response?.status === API_CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS) {
        errorMessage = API_CONSTANTS.ERROR_MESSAGES.TOO_MANY_ATTEMPTS;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = API_CONSTANTS.ERROR_MESSAGES.VERIFICATION_TIMEOUT;
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
        timeout: TIMEOUT_CONSTANTS.MEDIA_DOWNLOAD,
        maxContentLength: FILE_CONSTANTS.MAX_CONTENT_LENGTH,
      });

      const contentType = mediaResponse.headers["content-type"];
      if (!contentType?.startsWith('image/')) {
        throw new Error("Only image files are allowed for verification");
      }

      const fileSize = mediaResponse.data.length;
      if (fileSize > FILE_CONSTANTS.MAX_FILE_SIZE) {
        throw new Error("File size too large. Maximum 5MB allowed.");
      }

      const fileExtension = contentType.split("/")[1] || S3_CONSTANTS.FILE_EXTENSIONS.DEFAULT;
      const timestamp = Date.now();
      const fileName = `${S3_CONSTANTS.UPLOAD_PREFIX}/${phoneNumber}/${type}-${timestamp}.${fileExtension}`;

      const uploadParams = {
        Bucket: AWS_S3_BUCKET!,
        Key: fileName,
        Body: mediaResponse.data,
        ContentType: contentType,
        Metadata: {
          'phone-number': phoneNumber,
          'upload-type': type,
          'upload-timestamp': timestamp.toString()
        },
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
      if (!selfieUrl || !idUrl) {
        return { 
          success: false, 
          message: "Missing required images for comparison" 
        };
      }

      const url = `${DOJAH_BASE_URL}${API_CONSTANTS.DOJAH_FACE_COMPARE_ENDPOINT}`;
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
          timeout: TIMEOUT_CONSTANTS.FACE_COMPARE,
        }
      );

      const entity = response.data?.entity;
      const isMatch = entity?.match === true;
      const confidence = entity?.confidence || entity?.similarity_score || 0;

      const verifiedMatch = isMatch && confidence >= FACE_COMPARE_CONSTANTS.MIN_CONFIDENCE;

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
      
      let errorMessage = API_CONSTANTS.ERROR_MESSAGES.FACE_COMPARE_UNAVAILABLE;
      
      if (err.response?.status === API_CONSTANTS.HTTP_STATUS.BAD_REQUEST) {
        errorMessage = API_CONSTANTS.ERROR_MESSAGES.INVALID_IMAGES;
      } else if (err.response?.status === API_CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS) {
        errorMessage = API_CONSTANTS.ERROR_MESSAGES.FACE_COMPARE_ATTEMPTS;
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  }
}