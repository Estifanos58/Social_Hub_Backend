import { Response } from "express";

export class LoginCommand {
    constructor(
        public readonly email: string,
        public readonly password: string,
        public readonly res: Response
    ){}
}