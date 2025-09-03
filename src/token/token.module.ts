import { Module } from "@nestjs/common";
import { TokenService } from "./token.service";
import { ConfigService } from "@nestjs/config";

@Module({
    providers: [TokenService, ConfigService],
    exports: [TokenService]
})
export class TokenModule {}