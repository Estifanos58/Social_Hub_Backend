export class PostDeletedEvent {
  constructor(
    public readonly postId: string,
    public readonly ownerId: string,
    public readonly reason?: string,
  ) {}
}
