import { FullName } from "../users/FullName.js";
import { MailArgs } from "./MailArgs.js";

export type MailFunction = (email: string, name: FullName, token: string) => MailArgs;
export type ResetPasswordMailFunction = (email: string, name: FullName, newPassword: string) => MailArgs;
