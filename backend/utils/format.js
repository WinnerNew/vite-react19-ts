const formatTimestamp = (date) => {
  const now = new Date();
  const diff = (now - new Date(date)) / 1000;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return new Date(date).toLocaleDateString();
};

const formatUser = (user) => {
  if (!user) return null;
  const { password: _, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    created_at: user.createdAt?.toISOString?.() || user.createdAt,
  };
};

const formatPost = (post, currentUserId = null) => {
  if (!post) return null;

  const formatted = {
    ...post,
    author: post.user
      ? {
          id: post.user.id,
          username: post.user.username,
          handle: post.user.handle,
          avatar: post.user.avatar,
        }
      : null,
    timestamp: formatTimestamp(post.createdAt),
    is_liked: currentUserId && post.likes ? post.likes.length > 0 : false,
    is_reposted:
      currentUserId && post.reposts ? post.reposts.length > 0 : false,
    likes_count: post.likesCount,
    reposts_count: post.repostsCount,
    replies_count: post.repliesCount,
    created_at: post.createdAt?.toISOString?.() || post.createdAt,
    user_id: post.userId,
    parent_id: post.parentId,
  };

  if (post.parent) {
    formatted.parent_post = {
      ...post.parent,
      author: post.parent.user
        ? {
            id: post.parent.user.id,
            username: post.parent.user.username,
            handle: post.parent.user.handle,
            avatar: post.parent.user.avatar,
          }
        : null,
    };
  }

  delete formatted.user;
  delete formatted.likes;
  delete formatted.reposts;
  delete formatted.likesCount;
  delete formatted.repostsCount;
  delete formatted.repliesCount;
  delete formatted.createdAt;
  delete formatted.userId;
  delete formatted.parentId;

  return formatted;
};

const formatMessage = (message, currentUserId) => {
  if (!message) return null;
  return {
    id: message.id,
    content: message.content,
    sender: message.user
      ? {
          id: message.user.id,
          username: message.user.username,
          handle: message.user.handle,
          avatar: message.user.avatar,
        }
      : null,
    created_at: message.createdAt?.toISOString?.() || message.createdAt,
    is_mine: message.userId === currentUserId,
  };
};

const formatChat = (chat, currentUserId) => {
  if (!chat) return null;
  const otherUser = chat.user1Id === currentUserId ? chat.user2 : chat.user1;
  const lastMessage = chat.messages?.[0];

  return {
    id: chat.id,
    user: otherUser,
    last_message: lastMessage
      ? {
          content: lastMessage.content,
          created_at:
            lastMessage.createdAt?.toISOString?.() || lastMessage.createdAt,
        }
      : null,
    updated_at: chat.updatedAt?.toISOString?.() || chat.updatedAt,
  };
};

const formatNotification = (notification, currentUserId = null) => {
  if (!notification) return null;

  const formatted = {
    id: notification.id,
    type: notification.type,
    read: notification.read,
    created_at:
      notification.createdAt?.toISOString?.() || notification.createdAt,
    actor: notification.actor,
  };

  if (["LIKE", "REPOST", "REPLY"].includes(notification.type)) {
    formatted.post = notification.post
      ? {
          id: notification.post.id,
          content: notification.post.content,
          author: notification.post.user,
        }
      : null;
  }

  if (notification.type === "FOLLOW") {
    formatted.is_following = false;
  }

  if (notification.type === "MESSAGE") {
    formatted.message = notification.message
      ? {
          id: notification.message.id,
          content: notification.message.content,
          sender: notification.message.user,
        }
      : null;
  }

  return formatted;
};

module.exports = {
  formatTimestamp,
  formatUser,
  formatPost,
  formatMessage,
  formatChat,
  formatNotification,
};
