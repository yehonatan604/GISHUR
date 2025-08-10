import { FullName } from "@bridgepoint/types";

export const resetPasswordMail = (email: string, name: FullName, newPassword: string) => {
    return {
        to: email,
        subject: "BridgePoint - Your Password Has Been Reset",
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px; color: #333;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h2 style="color: #2c3e50;">Hello ${name.first} ${name.last},</h2>
                    <h2>Your password has been reset successfully!</h2>
                    <p>Your new password is: <strong>${newPassword}</strong></p>
                    <p>Please change your password immediately after logging in.</p>
                </div>
            </div>
        `
    };
};
