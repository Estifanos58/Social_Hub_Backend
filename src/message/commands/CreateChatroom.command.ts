export class CreateChatroomCommand {
  constructor(
    public readonly userId: string,
    public readonly otherUserId?: string,
    public readonly isGroupChat?: boolean,
    public readonly chatroomName?: string,
  ) {}
}
