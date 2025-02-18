-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "isEdited" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CommentHistory" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER,
    "blogPostId" INTEGER,
    "commentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommentHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommentHistory" ADD CONSTRAINT "CommentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentHistory" ADD CONSTRAINT "CommentHistory_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentHistory" ADD CONSTRAINT "CommentHistory_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
