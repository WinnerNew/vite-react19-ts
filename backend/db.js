// 简单的内存数据库实现
const bcrypt = require('bcryptjs')

// 模拟数据
const users = []
const posts = []
const chats = []
const messages = []

// 生成ID
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

// 数据库操作
const db = {
  // 用户操作
  user: {
    create: async (data) => {
      const hashedPassword = await bcrypt.hash(data.password, 10)
      const user = {
        id: generateId(),
        username: data.username,
        handle: data.handle,
        password: hashedPassword,
        avatar: data.avatar,
        bio: data.bio,
        location: data.location,
        website: data.website,
        followers: 0,
        following: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      users.push(user)
      return user
    },
    findUnique: async (where) => {
      if (where.id) {
        return users.find(user => user.id === where.id)
      }
      if (where.handle) {
        return users.find(user => user.handle === where.handle)
      }
      return null
    },
    findFirst: async (where) => {
      if (where.OR) {
        for (const condition of where.OR) {
          if (condition.username) {
            const user = users.find(user => user.username === condition.username)
            if (user) return user
          }
          if (condition.handle) {
            const user = users.find(user => user.handle === condition.handle)
            if (user) return user
          }
        }
      }
      return null
    },
    update: async (where, data) => {
      const index = users.findIndex(user => user.id === where.id)
      if (index === -1) return null
      users[index] = {
        ...users[index],
        ...data,
        updatedAt: new Date()
      }
      return users[index]
    }
  },

  // 帖子操作
  post: {
    create: async (data) => {
      const post = {
        id: generateId(),
        content: data.content,
        image: data.image,
        likes: 0,
        reposts: 0,
        replies: 0,
        userId: data.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      posts.push(post)
      return post
    },
    findMany: async (options = {}) => {
      let result = [...posts]
      if (options.where) {
        if (options.where.userId) {
          result = result.filter(post => post.userId === options.where.userId)
        }
      }
      if (options.orderBy) {
        if (options.orderBy.createdAt === 'desc') {
          result.sort((a, b) => b.createdAt - a.createdAt)
        } else if (options.orderBy.createdAt === 'asc') {
          result.sort((a, b) => a.createdAt - b.createdAt)
        }
      }
      if (options.take) {
        result = result.slice(0, options.take)
      }
      if (options.skip) {
        result = result.slice(options.skip)
      }
      return result
    },
    findUnique: async (where) => {
      return posts.find(post => post.id === where.id)
    },
    update: async (where, data) => {
      const index = posts.findIndex(post => post.id === where.id)
      if (index === -1) return null
      posts[index] = {
        ...posts[index],
        ...data,
        updatedAt: new Date()
      }
      return posts[index]
    },
    delete: async (where) => {
      const index = posts.findIndex(post => post.id === where.id)
      if (index === -1) return null
      const post = posts[index]
      posts.splice(index, 1)
      return post
    },
    count: async () => {
      return posts.length
    }
  },

  // 聊天操作
  chat: {
    create: async (data) => {
      const chat = {
        id: generateId(),
        participantId: data.participantId,
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      chats.push(chat)
      return chat
    },
    findMany: async () => {
      return chats
    },
    findFirst: async (where) => {
      if (where.participantId) {
        return chats.find(chat => chat.participantId === where.participantId)
      }
      return null
    },
    findUnique: async (where) => {
      return chats.find(chat => chat.id === where.id)
    },
    update: async (where, data) => {
      const index = chats.findIndex(chat => chat.id === where.id)
      if (index === -1) return null
      chats[index] = {
        ...chats[index],
        ...data,
        updatedAt: new Date()
      }
      return chats[index]
    }
  },

  // 消息操作
  message: {
    create: async (data) => {
      const message = {
        id: generateId(),
        text: data.text,
        senderId: data.senderId,
        chatId: data.chatId,
        createdAt: new Date()
      }
      messages.push(message)
      return message
    },
    findMany: async (options = {}) => {
      let result = [...messages]
      if (options.where) {
        if (options.where.chatId) {
          result = result.filter(message => message.chatId === options.where.chatId)
        }
      }
      if (options.orderBy) {
        if (options.orderBy.createdAt === 'asc') {
          result.sort((a, b) => a.createdAt - b.createdAt)
        } else if (options.orderBy.createdAt === 'desc') {
          result.sort((a, b) => b.createdAt - a.createdAt)
        }
      }
      if (options.take) {
        result = result.slice(0, options.take)
      }
      return result
    }
  }
}

module.exports = db
