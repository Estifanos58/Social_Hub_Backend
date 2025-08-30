import { Response } from "express";

export class RegisterCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly fullname: string,
    public readonly res: Response,
  ) {}
}