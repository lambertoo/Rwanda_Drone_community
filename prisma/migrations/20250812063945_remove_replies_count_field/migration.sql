/*
  Warnings:

  - You are about to drop the column `repliesCount` on the `forum_posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."forum_posts" DROP COLUMN "repliesCount";
