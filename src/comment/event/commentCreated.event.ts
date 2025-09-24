export class CommentCreatedEvent {
  constructor(
    public readonly postId: string,
    public readonly commentId: string,
    public readonly postOwnerId: string,
    public readonly commenterId: string,
    public readonly excerpt?: string,
  ) {}
}
