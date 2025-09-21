export class GetCommentRepliesQuery {
  constructor(
    public readonly commentId: string, // parent comment
    public readonly first: number = 5,
    public readonly after?: string, // cursor = direct reply id
    public readonly includeChildren: boolean = true, // optionally fetch second level (grandchildren)
    public readonly secondLevelLimit: number = 5,
  ) {}
}
