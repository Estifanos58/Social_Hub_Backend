export class UserDisconnectedEvent {
  constructor(
    public readonly userId: string,
    public readonly disconnectedAt: Date,
  ) {}
}
