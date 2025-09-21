import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentRepliesQuery } from '../query/getCommentReplies.query';
import { PrismaService } from 'src/prisma.service';
import { CommentRepliesConnectionDto, CommentEdgeDto } from '../types/pagination.types';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetCommentRepliesQuery)
export class GetCommentRepliesHandler implements IQueryHandler<GetCommentRepliesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(q: GetCommentRepliesQuery): Promise<CommentRepliesConnectionDto> {
    // Ensure parent exists
    const parent = await this.prisma.comment.findUnique({ where: { id: q.commentId } });
    if (!parent || parent.deletedAt) throw new NotFoundException('Comment not found');

    const take = Math.min(q.first ?? 5, 50);
    const direct = await this.prisma.comment.findMany({
      where: { parentId: q.commentId, deletedAt: null },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      ...(q.after ? { cursor: { id: q.after }, skip: 1 } : {}),
      take: take + 1,
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

    const hasNextPage = direct.length > take;
    const sliced = direct.slice(0, take);

    let grandchildren: any[] = [];
    if (q.includeChildren && sliced.length) {
      grandchildren = await this.prisma.comment.findMany({
        where: { parentId: { in: sliced.map(c => c.id) }, deletedAt: null },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        take: q.secondLevelLimit * sliced.length + 1,
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
    }

    // counts for each direct reply
    const directIds = sliced.map(c => c.id);
    const countsRaw = await this.prisma.comment.groupBy({
      by: ['parentId'],
      where: { parentId: { in: directIds }, deletedAt: null },
      _count: { parentId: true },
    });
    const countMap = new Map<string, number>();
    countsRaw.forEach(r => countMap.set(r.parentId!, r._count.parentId));

    const byParent = new Map<string, any[]>();
    grandchildren.forEach(g => {
      if (!g.parentId) return;
      if (!byParent.has(g.parentId)) byParent.set(g.parentId, []);
      byParent.get(g.parentId)!.push(g);
    });

    const attach = (node: any): any => {
      const kids = byParent.get(node.id) || [];
      const limited = kids.slice(0, q.secondLevelLimit);
      return {
        ...node,
        replies: limited,
        replyCount: countMap.get(node.id) || 0,
        repliesHasNextPage: (countMap.get(node.id) || 0) > limited.length,
      };
    };

    const hydrated = sliced.map(attach);

    const edges: CommentEdgeDto[] = hydrated.map(c => ({ cursor: c.id, node: c }));
    const totalCount = await this.prisma.comment.count({ where: { parentId: q.commentId, deletedAt: null } });

    return {
      edges,
      pageInfo: { endCursor: edges[edges.length - 1]?.cursor, hasNextPage },
      totalCount,
    };
  }
}
