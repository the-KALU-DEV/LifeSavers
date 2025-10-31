import { DonorSession, RegistrationStep } from '../../types/donor.types';
import { logger } from '../../utils/logger';

export class DonorSessionManager {
  private sessions: Map<string, DonorSession> = new Map();
  private readonly SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

  public async createSession(phoneNumber: string): Promise<DonorSession> {
    const session: DonorSession = {
      phoneNumber,
      currentStep: 'name',
      donorData: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(phoneNumber, session);
    
    logger.debug('New session created', { 
      phoneNumber, 
      currentStep: session.currentStep 
    });

    return session;
  }

  public async getSession(phoneNumber: string): Promise<DonorSession | null> {
    const session = this.sessions.get(phoneNumber);
    
    if (!session) {
      return null;
    }

    //check if session expired
    if (Date.now() - session.updatedAt.getTime() > this.SESSION_TTL) {
      this.sessions.delete(phoneNumber);
      logger.debug('Expired session removed', { phoneNumber });
      return null;
    }

    return session;
  }

  public async updateSession(
    phoneNumber: string, 
    updates: Partial<DonorSession>
  ): Promise<DonorSession> {
    const existingSession = await this.getSession(phoneNumber);
    
    if (!existingSession) {
      throw new Error(`Session not found for ${phoneNumber}`);
    }

    const updatedSession: DonorSession = {
      ...existingSession,
      ...updates,
      updatedAt: new Date()
    };

    this.sessions.set(phoneNumber, updatedSession);

    logger.debug('Session updated', { 
      phoneNumber, 
      currentStep: updatedSession.currentStep,
      dataFields: Object.keys(updatedSession.donorData)
    });

    return updatedSession;
  }

  public async clearSession(phoneNumber: string): Promise<void> {
    this.sessions.delete(phoneNumber);
    logger.debug('Session cleared', { phoneNumber });
  }

  public async cleanupExpiredSessions(): Promise<number> {
    const now = Date.now();
    let deletedCount = 0;

    for (const [phoneNumber, session] of this.sessions.entries()) {
      if (now - session.updatedAt.getTime() > this.SESSION_TTL) {
        this.sessions.delete(phoneNumber);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}