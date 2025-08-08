import { FullName } from "./FullName";
import { MailArgs } from "./MailArgs";

export type MailFunction = (email: string, name: FullName, token: string) => MailArgs;
export type ResetPasswordMailFunction = (email: string, name: FullName, newPassword: string) => MailArgs;
