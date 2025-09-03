import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { MailService } from "src/mail/mail.service";
import { EmailConfirmedEvent } from "./emailConfirmed.event";
import { EMAILVERIFIED } from "src/utils/htmlTemplate";

@Injectable()
export class EmailConfirmedHandler {
    constructor(
        private readonly mailService: MailService,
    ){}

    @OnEvent('user.verified')
    async handleEmailConfirmedEvent(payload: EmailConfirmedEvent) {
        const { email } = payload;
        const html = EMAILVERIFIED
        const mail = {
            to: email,
            subject: 'Email Verified Successfully',
            html: html,
            placeholders: {
                year: new Date().getFullYear(),
            }
        }
        await this.mailService.sendMail(mail);
    }
}