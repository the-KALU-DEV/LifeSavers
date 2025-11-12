import { BotFlow } from "../../models/Enums";
import { IUser, User } from "../../models/User";


export class UserService {
    static async createUser(data: Partial<IUser>) {
        const existing = await User.findOne({ phoneNumber: data.phoneNumber });
        if (existing) return existing;

        const user = new User({
            phoneNumber: data.phoneNumber,
            role: data.role,
            currentFlow: data.currentFlow || BotFlow.REGISTRATION,
            currentStep: data.currentStep || "START",
            contextData: {},
        });

        return user.save();
    }

    static async getUserByPhone(phoneNumber: string) {
        return User.findOne({ phoneNumber });
    }

    static async getAllUsers(filter: Record<string, any> = {}) {
        return User.find(filter).sort({ createdAt: -1 }).lean();
    }

    static async updateUserState(
        phoneNumber: string,
        updates: Partial<Pick<IUser, "currentFlow" | "currentStep" | "contextData">>
    ): Promise<IUser | null> {
        const user = await User.findOneAndUpdate(
            { phoneNumber },
            { ...updates, lastInteractionAt: new Date() },
            { new: true }
        );

        return user;
    }

    static async updateUser(
        phoneNumber: string,
        updates: Partial<IUser>
    ): Promise<IUser | null> {
        const user = await User.findOneAndUpdate(
            { phoneNumber },
            updates,
            { new: true }
        );
        return user;
    }

    static async disableUser(phoneNumber: string): Promise<IUser | null> {
        const user = await User.findOneAndUpdate(
            { phoneNumber },
            { $set: { isActive: false } },
            { new: true }
        );
        return user;
    }
}
