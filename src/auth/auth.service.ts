import { Injectable } from "@nestjs/common";
import { get } from "http";

@Injectable()
export class AuthService{
    getHello(): string {
        return 'Hello Google Auth!';
    }
}