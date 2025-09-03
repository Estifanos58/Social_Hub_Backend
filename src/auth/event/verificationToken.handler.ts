import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { MailService } from "src/mail/mail.service";
import { VERIFICATIONTOKEN } from "src/utils/htmlTemplate";
import { VerifiEmailCommand } from "../commands/verifyEmail.command";
import { VerificationTokenEvent } from "./verificationToken.event";

@Injectable()
export class VerificationTokenHandler {
    constructor(
        private readonly mailService: MailService,    
    ){}

    @OnEvent('verification.token')
    async handleVerificationTokenEvent(payload: VerificationTokenEvent) {
        const { user, token } = payload;
        const html = VERIFICATIONTOKEN;
        const mail = {
            to: user.email,
            subject: 'Verify your email',
            html: html,
            placeholders: {
                code: token,
                year: new Date().getFullYear(),
            } 
        }
        await this.mailService.sendMail(mail);
    }
}