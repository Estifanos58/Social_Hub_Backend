export class AddUserToChatroomCommand {
  constructor(
    public readonly userId: string,
    public readonly otherUserIds: string[],
    public readonly chatroomId: string,
  ) {}
}
