export class GetPostsQuery {
  constructor(
    public readonly cursor?: string,
    public readonly take: number = 10,
    public readonly userId?: string
  ) {}
}
