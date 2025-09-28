export class AddUserToChatroomCommand {
  constructor(
    public readonly userId: string,
    public readonly otherUserId: string,
    public readonly chatroomId: string,
  ) {}
}
