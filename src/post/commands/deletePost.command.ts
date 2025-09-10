export class DeletePostCommand {
  constructor(public readonly postId: string, public readonly userId: string) {}
}