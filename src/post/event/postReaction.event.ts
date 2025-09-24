export class PostReactionEvent {
  constructor(
    public readonly postId: string,
    public readonly reactorId: string,
    public readonly postOwnerId: string,
    public readonly reactionId: string,
    public readonly reactionType?: string,
  ) {}
}
