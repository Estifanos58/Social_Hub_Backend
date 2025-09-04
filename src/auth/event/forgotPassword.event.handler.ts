import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { MailService } from "src/mail/mail.service";
import { ForgotPasswordEvent } from "./forgotPassword.event";
import { FORGOTPASSWORD } from "src/utils/htmlTemplate";

@Injectable()
export class ForgotPasswordEventHandler {
    constructor(
        private readonly mailService: MailService
    ){}

    @OnEvent('resetpasswordsent.token')
    async handleForgotPasswordEvent(payload: ForgotPasswordEvent){
        const {firstname, email, resetToken} = payload

        const html = FORGOTPASSWORD
        const mail = {
            to: email,
            subject: 'Password Reset Token Sent',
            html,
            placeholders: {
                firstname,
                resetToken,
                year: new Date().getFullYear(),
            }
        }

        await this.mailService.sendMail(mail)
    }
}