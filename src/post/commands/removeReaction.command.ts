export class RemoveReactionCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
  ) {}
}