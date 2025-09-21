export class GetPostCommentsQuery {
  constructor(
    public readonly postId: string,
    public readonly first: number = 5,
    public readonly after?: string, // cursor = comment id of last seen top-level
    public readonly directRepliesLimit: number = 5, // per parent
    public readonly secondLevelLimit: number = 5, // per first-level reply
  ) {}
}
