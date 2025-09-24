export class ReplyCreatedEvent {
  constructor(
    public readonly parentCommentId: string,
    public readonly replyCommentId: string,
    public readonly parentOwnerId: string,
    public readonly replierId: string,
    public readonly excerpt?: string,
  ) {}
}
