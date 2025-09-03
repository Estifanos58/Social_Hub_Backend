import { Module } from "@nestjs/common";
// import { TypeOrmModule } from "@nestjs/typeorm";
// import { User } from "src/auth/entities/user";
import { ConfigModule } from "@nestjs/config";
import { MailService } from "./mail.service";

@Module({
    imports: [
        ConfigModule, 
    ],
    controllers: [],
    providers: [MailService],
    exports: [MailService] // Export the service to be used in other modules
})

export class MailModule{}