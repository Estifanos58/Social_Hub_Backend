export class CreateMessageCommand {
  constructor(
    public readonly userId: string,
    public readonly chatroomId: string,
    public readonly content?: string,
    public readonly imageUrl?: string,
  ) {}
}
