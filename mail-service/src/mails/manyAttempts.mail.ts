import { envService } from "../services/env.service";
import { FullName } from "../types/FullName";
const { API_URL } = envService.vars;

export const manyAttemptsMail = (email: string, name: FullName, token: string) => {
    return {
        to: email,
        subject: "BridgePoint - Multiple Login Attempts Detected",
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px; color: #333;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h2 style="color: #2c3e50;">Hello ${name.first} ${name.last},</h2>
                    <h2>Multiple Login Attempts Detected</h2>
                    <p>We have detected multiple login attempts on your account. If this was not you, please click the button below to secure your account:</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${API_URL}/auth/secure/${token}" 
                           style="background-color: #dc3545; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                           Secure Account
                        </a>
                    </div>

                    <p>it is advised to change your password immediately.</p>
                    <p>Forgot your password? <a href="${API_URL}/auth/forgot-password/${email}" style="color: #007bff; text-decoration: none;">Click here</a></p>
                </div>
            </div>
        `
    };
};
