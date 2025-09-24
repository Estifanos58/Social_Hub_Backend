export class NewFollowerEvent {
  constructor(
    public readonly followerId: string,
    public readonly followingId: string,
  ) {}
}
