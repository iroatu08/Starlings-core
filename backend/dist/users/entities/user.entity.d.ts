export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    role: UserRole;
    isVerified: boolean;
    isActive: boolean;
    verificationToken: string;
    resetPasswordToken: string;
    resetPasswordExpires: Date;
    refreshTokenHash: string;
    createdAt: Date;
    updatedAt: Date;
}
