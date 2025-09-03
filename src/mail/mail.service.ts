import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';
import { ConfigService } from "@nestjs/config";
import { substitutePlaceholders } from "src/utils/substituteHtml";

interface SendMailType {
    to: string;
    subject: string;
    placeholders?: Record<any, any>;
    html?: string;
}

@Injectable()
export class MailService {
    constructor( private readonly configService: ConfigService){}
    emailTransport(){
        const transporter = nodemailer.createTransport({
            host: this.configService.get<string>('GMAIL_HOST'), 
            port: this.configService.get<number>('GMAIL_PORT'),
            secure: false,
            auth: {
                user: this.configService.get<string>('GMAIL_USER'),
                pass: this.configService.get<string>('GMAIL_PASSWORD')
            }
        })

        return transporter;
    }

    async sendMail(mail: SendMailType): Promise<void> {
        const { to, html, placeholders, subject } = mail;
        const transformHtml = substitutePlaceholders(html!, placeholders!);
        try {
            const transporter = this.emailTransport();
            const options: nodemailer.SendMailOptions = {
                from: this.configService.get<string>('GMAIL_USER'),
                to: to,
                subject: subject,
                html: transformHtml
            }

            await transporter.sendMail(options);
            // console.log(`OTP sent to ${to}`);
        } catch (error) {
            console.error(`Failed to send OTP to :`, error);
            throw new Error('Failed to send OTP');
        }
    }
}