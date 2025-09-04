export class VerifiEmailCommand {
  constructor(public readonly token: string, public readonly userId: string) {}
}