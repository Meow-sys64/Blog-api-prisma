const { Prisma } = require('@prisma/client');

const softDeleteExtension = (prisma) => {
  // Store original methods to avoid recursion
  const originalFindManyBlogPost = prisma.blogPost.findMany;
  const originalFindUniqueBlogPost = prisma.blogPost.findUnique;
  const originalFindFirstBlogPost = prisma.blogPost.findFirst;
  const originalCreateBlogPost = prisma.blogPost.create;
  const originalUpdateBlogPost = prisma.blogPost.update;
  const originalUpdateManyBlogPost = prisma.blogPost.updateMany;
  //const originalDeleteBlogPost = prisma.blogPost.delete;
  //const originalDeleteManyBlogPost = prisma.blogPost.deleteMany;

  const originalFindManyComment = prisma.comment.findMany;
  const originalFindUniqueComment = prisma.comment.findUnique;
  const originalFindFirstComment = prisma.comment.findFirst;
  const originalCreateComment = prisma.comment.create;
  const originalUpdateComment = prisma.comment.update;
  const originalUpdateManyComment = prisma.comment.updateMany;
  //const originalDeleteComment = prisma.comment.delete;
  //const originalDeleteManyComment = prisma.comment.deleteMany;

  // Read Operations: Add `isDeleted: false` to find queries
  prisma.blogPost.findMany = async (args) => {
    if (!args.where) {
      args.where = {};
    }
    args.where.isDeleted = false;  // Ensure soft-deleted posts are excluded
    return originalFindManyBlogPost.call(prisma, args);
  };

  prisma.blogPost.findUnique = async (args) => {
    if (!args.where) {
      args.where = {};
    }
    args.where.isDeleted = false;
    return originalFindUniqueBlogPost.call(prisma, args);
  };

  prisma.blogPost.findFirst = async (args) => {
    if (!args.where) {
      args.where = {};
    }
    args.where.isDeleted = false;
    return originalFindFirstBlogPost.call(prisma, args);
  };

  // Create Operation: No need to filter `isDeleted`, but ensure it's set to `false` when creating
  prisma.blogPost.create = async (args) => {
    if (!args.data.isDeleted) {
      args.data.isDeleted = false;  // Ensure new posts are not soft-deleted by default
    }
    return originalCreateBlogPost.call(prisma, args);
  };

  // Update Operations: Respect `isDeleted` flag
  prisma.blogPost.update = async (args) => {
    if (args.data.isDeleted !== undefined && args.data.isDeleted === true) {
      // If the update is trying to set `isDeleted: true`, make sure it's a proper soft delete
      args.data.isDeleted = true;
    }
    return originalUpdateBlogPost.call(prisma, args);
  };

  prisma.blogPost.updateMany = async (args) => {
    if (args.data.isDeleted !== undefined && args.data.isDeleted === true) {
      args.data.isDeleted = true;
    }
    return originalUpdateManyBlogPost.call(prisma, args);
  };

  //// Soft Delete (instead of actual delete)
  //prisma.blogPost.delete = async (args) => {
  //  // Soft delete instead of actual deletion
  //  return prisma.blogPost.update({
  //    where: args.where,
  //    data: { isDeleted: true },  // Set isDeleted flag to true instead of deleting
  //  });
  //};
  //
  //prisma.blogPost.deleteMany = async (args) => {
  //  return prisma.blogPost.updateMany({
  //    where: args.where,
  //    data: { isDeleted: true },  // Soft delete multiple posts
  //  });
  //};

  // Repeat the same logic for the Comment model
  prisma.comment.findMany = async (args) => {
    if (!args.where) {
      args.where = {};
    }
    args.where.isDeleted = false;
    return originalFindManyComment.call(prisma, args);
  };

  prisma.comment.findUnique = async (args) => {
    if (!args.where) {
      args.where = {};
    }
    args.where.isDeleted = false;
    return originalFindUniqueComment.call(prisma, args);
  };

  prisma.comment.findFirst = async (args) => {
    if (!args.where) {
      args.where = {};
    }
    args.where.isDeleted = false;
    return originalFindFirstComment.call(prisma, args);
  };

  prisma.comment.create = async (args) => {
    if (!args.data.isDeleted) {
      args.data.isDeleted = false;
    }
    return originalCreateComment.call(prisma, args);
  };

  prisma.comment.update = async (args) => {
    if (args.data.isDeleted !== undefined && args.data.isDeleted === true) {
      args.data.isDeleted = true;
    }
    return originalUpdateComment.call(prisma, args);
  };

  prisma.comment.updateMany = async (args) => {
    if (args.data.isDeleted !== undefined && args.data.isDeleted === true) {
      args.data.isDeleted = true;
    }
    return originalUpdateManyComment.call(prisma, args);
  };

  //prisma.comment.delete = async (args) => {
  //  return prisma.comment.update({
  //    where: args.where,
  //    data: { isDeleted: true },  // Soft delete a comment
  //  });
  //};
  //
  //prisma.comment.deleteMany = async (args) => {
  //  return prisma.comment.updateMany({
  //    where: args.where,
  //    data: { isDeleted: true },  // Soft delete multiple comments
  //  });
  //};

  return prisma;
};

module.exports = { softDeleteExtension };
