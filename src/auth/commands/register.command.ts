import { Response } from "express";

export class RegisterCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly firstname: string,
    public readonly lastname: string,
    public readonly res: Response,
  ) {}
}