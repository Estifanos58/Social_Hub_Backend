/*
  Warnings:

  - The values [ANGRY] on the enum `ReactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('LOGIN', 'COMMENT_ON_POST', 'REPLY_ON_COMMENT', 'REACTION_ON_POST', 'NEW_FOLLOWER', 'POST_DELETED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ReactionType_new" AS ENUM ('LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD');
ALTER TABLE "public"."Reaction" ALTER COLUMN "type" TYPE "public"."ReactionType_new" USING ("type"::text::"public"."ReactionType_new");
ALTER TYPE "public"."ReactionType" RENAME TO "ReactionType_old";
ALTER TYPE "public"."ReactionType_new" RENAME TO "ReactionType";
DROP TYPE "public"."ReactionType_old";
COMMIT;

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "actorId" TEXT,
    "postId" TEXT,
    "commentId" TEXT,
    "reactionId" TEXT,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_recipientId_isRead_createdAt_idx" ON "public"."Notification"("recipientId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_actorId_createdAt_idx" ON "public"."Notification"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_postId_idx" ON "public"."Notification"("postId");

-- CreateIndex
CREATE INDEX "Notification_commentId_idx" ON "public"."Notification"("commentId");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "public"."Reaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
