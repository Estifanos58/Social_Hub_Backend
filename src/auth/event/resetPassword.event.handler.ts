import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { MailService } from "src/mail/mail.service";
import { ResetPasswordEvent } from "./resetPassword.event";
import { PASSWORDRESETCONFIRMED } from "src/utils/htmlTemplate";

@Injectable()
export class ResetPasswordEventHandler {
    constructor(
        private readonly mailService: MailService,
    ){}

    @OnEvent('password.reset')
    async handleResetPasswordEvent(payload: ResetPasswordEvent) {
        const {email, firstname} = payload

        const html = PASSWORDRESETCONFIRMED
        const mail = {
            to: email,
            subject: 'Password Reset Successful',
            html: html,
            placeholders: {
                firstname,
                year: new Date().getFullYear(),
            }
        }
        await this.mailService.sendMail(mail)

    }
}