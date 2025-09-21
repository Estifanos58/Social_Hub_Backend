import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostCommentsQuery } from '../query/getPostComments.query';
import { PrismaService } from 'src/prisma.service';
import { PostCommentsConnectionDto, CommentEdgeDto } from '../types/pagination.types';

@QueryHandler(GetPostCommentsQuery)
export class GetPostCommentsHandler implements IQueryHandler<GetPostCommentsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetPostCommentsQuery): Promise<PostCommentsConnectionDto> {
    const take = Math.min(query.first ?? 5, 50); // safety cap

    // 1. Fetch top-level parents (cursor pagination by id for now)
    const parents = await this.prisma.comment.findMany({
      where: { postId: query.postId, parentId: null, deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      ...(query.after ? { cursor: { id: query.after }, skip: 1 } : {}),
      take: take + 1, // over-fetch to detect hasNextPage
      select: {
        id: true,
        content: true,
        postId: true,
        createdById: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        createdBy: { select: { id: true, firstname: true, lastname: true, avatarUrl: true } },
      },
    });

    const hasNextPage = parents.length > take;
    const slicedParents = parents.slice(0, take);

    if (slicedParents.length === 0) {
      return {
        edges: [],
        pageInfo: { endCursor: null, hasNextPage: false },
        totalCount: 0,
      };
    }

    // 2. Fetch first-level replies for all parents (batched)
    const firstLevel = await this.prisma.comment.findMany({
      where: { parentId: { in: slicedParents.map(p => p.id) }, deletedAt: null },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: query.directRepliesLimit * slicedParents.length + 1, // mild overfetch; later we cap per parent when assembling
      select: {
        id: true,
        content: true,
        postId: true,
        createdById: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        createdBy: { select: { id: true, firstname: true, lastname: true, avatarUrl: true } },
      },
    });

    // 3. Fetch second-level replies for all first-level (grandchildren)
    const secondLevel = firstLevel.length
      ? await this.prisma.comment.findMany({
          where: { parentId: { in: firstLevel.map(c => c.id) }, deletedAt: null },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          take: query.secondLevelLimit * firstLevel.length + 1,
          select: {
            id: true,
            content: true,
            postId: true,
            createdById: true,
            parentId: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            createdBy: { select: { id: true, firstname: true, lastname: true, avatarUrl: true } },
          },
        })
      : [];

    // 4. Counts (replyCount per parent & per first-level) using groupBy for existing (non-deleted) replies
    const allParentsIds = slicedParents.map(p => p.id);
    const allFirstLevelIds = firstLevel.map(f => f.id);
    const countsRaw = await this.prisma.comment.groupBy({
      by: ['parentId'],
      where: { parentId: { in: [...allParentsIds, ...allFirstLevelIds] }, deletedAt: null },
      _count: { parentId: true },
    });
    const countMap = new Map<string, number>();
    countsRaw.forEach(r => countMap.set(r.parentId!, r._count.parentId));

    // 5. Build lookup
    const byParent = new Map<string, any[]>();
    [...firstLevel, ...secondLevel].forEach(c => {
      if (!c.parentId) return;
      if (!byParent.has(c.parentId)) byParent.set(c.parentId, []);
      byParent.get(c.parentId)!.push(c);
    });

    // 6. Attach children with per-parent limits & hasNextPage flags
    const attach = (node: any, depth: number): any => {
      const children = byParent.get(node.id) || [];
      const limit = depth === 0 ? query.directRepliesLimit : query.secondLevelLimit;
      const limited = children.slice(0, limit);
      return {
        ...node,
        replies: limited.map(c => attach(c, depth + 1)),
        replyCount: countMap.get(node.id) || 0,
        repliesHasNextPage: (countMap.get(node.id) || 0) > limited.length,
      };
    };

    const hydrated = slicedParents.map(p => attach(p, 0));

    const edges: CommentEdgeDto[] = hydrated.map(c => ({ cursor: c.id, node: c }));

    // totalCount of top-level comments (separate count query)
    const totalCount = await this.prisma.comment.count({
      where: { postId: query.postId, parentId: null, deletedAt: null },
    });

    return {
      edges,
      pageInfo: { endCursor: edges[edges.length - 1]?.cursor, hasNextPage },
      totalCount,
    };
  }
}
