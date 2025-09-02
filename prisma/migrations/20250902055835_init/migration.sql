/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - Added the required column `firstname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."User_lastSeenAt_isActive_deletedAt_idx";

-- DropIndex
DROP INDEX "public"."User_username_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "deletedAt",
DROP COLUMN "fullname",
DROP COLUMN "username",
ADD COLUMN     "bio" VARCHAR(160),
ADD COLUMN     "firstname" VARCHAR(30) NOT NULL,
ADD COLUMN     "lastname" VARCHAR(30);

-- CreateIndex
CREATE INDEX "User_email_firstname_idx" ON "public"."User"("email", "firstname");
