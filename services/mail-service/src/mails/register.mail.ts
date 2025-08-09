import { env } from "../env.js";
import { FullName } from "../types/FullName.js";
const { API_URL } = env;

export const registerMail = (email: string, name: FullName, token: string) => {
    return {
        to: email,
        subject: "BridgePoint - Confirm Your Registration",
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px; color: #333;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h2 style="color: #2c3e50;">Hello ${name.first} ${name.last},</h2>
                    <h2>Thank you for registering with BridgePoint!</h2>
                    <p>To complete your registration, please click the button below:</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${API_URL}/auth/verify/${token}" 
                           style="background-color: #007bff; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                           Confirm Registration
                        </a>
                    </div>
                </div>
            </div>
        `
    };
};
