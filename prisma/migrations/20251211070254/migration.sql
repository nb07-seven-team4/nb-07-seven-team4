/*
  Warnings:

  - You are about to drop the column `image` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `recommendations` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `target_count` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `records` table. All the data in the column will be lost.
  - You are about to drop the column `exercise_type` on the `records` table. All the data in the column will be lost.
  - Added the required column `goal_rep` to the `groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photo_url` to the `groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "groups" DROP COLUMN "image",
DROP COLUMN "nickname",
DROP COLUMN "password",
DROP COLUMN "recommendations",
DROP COLUMN "target_count",
ADD COLUMN     "goal_rep" INTEGER NOT NULL,
ADD COLUMN     "like_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "owner_id" BIGINT NOT NULL,
ADD COLUMN     "photo_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "is_owner" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "records" DROP COLUMN "duration",
DROP COLUMN "exercise_type",
ADD COLUMN     "time" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
