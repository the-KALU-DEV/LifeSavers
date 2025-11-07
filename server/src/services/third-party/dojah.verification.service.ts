import axios from "axios";
import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
import {
  API_CONSTANTS,
  TIMEOUT_CONSTANTS,
  FILE_CONSTANTS,
  NIN_CONSTANTS,
  FACE_COMPARE_CONSTANTS,
  STORAGE_CONSTANTS
} from "../../utils/constants";
import {  
  DOJAH_APP_ID, 
  DOJAH_BASE_URL, 
  DOJAH_SECRET_KEY, 
  GCP_CLIENT_EMAIL, 
  GCP_PRIVATE_KEY, 
  GCP_PROJECT_ID,
  GCP_STORAGE_BUCKET
} from "../../config/env";
import { ZeehCACService } from "./zeeh-cac.service";
import { CACVerificationResult } from "../../types/cac.types";

dotenv.config();

const storage = new Storage({
  projectId: GCP_PROJECT_ID,
  credentials: {
    client_email: GCP_CLIENT_EMAIL,
    private_key: GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export class VerificationService {
  private static cacService = ZeehCACService.getInstance();
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
      } else if (err.code === API_CONSTANTS.HTTP_STATUS.ECONNABORTED) {
        errorMessage = API_CONSTANTS.ERROR_MESSAGES.VERIFICATION_TIMEOUT;
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  }

  static async uploadMediaToGCP(mediaUrl: string, phoneNumber: string, type: 'selfie' | 'id'): Promise<string> {
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

    const fileExtension = contentType.split("/")[1] || 'jpg';
    const timestamp = Date.now();
    const fileName = `verifications/${phoneNumber}/${type}-${timestamp}.${fileExtension}`;

    const bucket = storage.bucket(GCP_STORAGE_BUCKET!);
    const file = bucket.file(fileName);

    // create a writable stream for better handling of large files
    const stream = file.createWriteStream({
      metadata: {
        contentType: contentType,
        metadata: {
          'phone-number': phoneNumber,
          'upload-type': type,
          'upload-timestamp': timestamp.toString()
        }
      },
      resumable: false // set to true for large files (>10MB)
    });

    // return a promise that resolves when upload completes
    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('GCP stream error:', error);
        reject(new Error("Failed to upload media to storage."));
      });

      stream.on('finish', async () => {
        try {
          // make the file publicly readable for dojah to access it, since dojah API might get "access denied" when trying to read the image
          await file.makePublic();
          
          // the proper public URL format
          const publicUrl = `https://storage.googleapis.com/${GCP_STORAGE_BUCKET}/${fileName}`;
          // alternatively: const publicUrl = file.publicUrl();
          
          console.log(`Uploaded ${type} to GCP for ${phoneNumber}:`, publicUrl);
          resolve(publicUrl);
        } catch (makePublicError) {
          console.error('Error making file public:', makePublicError);
          // even when making public fails, return the URL as it might still be accessible
          const publicUrl = `https://storage.googleapis.com/${GCP_STORAGE_BUCKET}/${fileName}`;
          resolve(publicUrl);
        }
      });

      // finally write the buffer to the stream
      stream.end(mediaResponse.data);
    });

  } catch (err: any) {
    console.error("GCP upload error:", err.message);
    
    if (err.code === API_CONSTANTS.HTTP_STATUS.UNAUTHORIZED) {
      throw new Error(API_CONSTANTS.ERROR_MESSAGES.GCP_AUTH_FAILED);
    } else if (err.code === API_CONSTANTS.HTTP_STATUS.FORBIDDEN) {
      throw new Error(API_CONSTANTS.ERROR_MESSAGES.GCP_FORBIDDEN);
    } else if (err.code === API_CONSTANTS.HTTP_STATUS.NOT_FOUND) {
      throw new Error(API_CONSTANTS.ERROR_MESSAGES.GCP_NOT_FOUND);
    } else if (err.message.includes('size')) {
      throw new Error("File too large. Please send a photo under 5MB.");
    } else if (err.message.includes('image')) {
      throw new Error("Please send a valid image file (JPEG, PNG).");
    } else if (err.code === API_CONSTANTS.HTTP_STATUS.ECONNABORTED) {
      throw new Error(API_CONSTANTS.ERROR_MESSAGES.VERIFICATION_TIMEOUT);
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

    static async verifyCAC(rcNumber: string, companyName: string): Promise<CACVerificationResult> {
    return await this.cacService.verifyCAC(rcNumber, companyName);
  }
}