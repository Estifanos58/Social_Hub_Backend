export class GetNotificationsQuery {
  constructor(
    public readonly userId: string,
    public readonly take?: number,
    public readonly cursor?: string,
  ) {}
}
