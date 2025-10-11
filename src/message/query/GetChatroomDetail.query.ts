export class GetChatroomDetailQuery {
  constructor(
    public readonly chatroomId: string | null,
    public readonly userId: string,
    public readonly otherUserId: string | null = null,
  ) {}
}
