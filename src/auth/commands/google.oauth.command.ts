import { Response } from "express";

export class GoogleOAuthCommand {
    constructor(public readonly code: string, public readonly res: Response) {}
}