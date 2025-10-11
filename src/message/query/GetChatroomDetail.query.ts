export class GetChatroomDetailQuery {
  constructor(
    public readonly chatroomId: string,
    public readonly userId: string,
  ) {}
}
