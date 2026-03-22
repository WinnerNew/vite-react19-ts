const db = require('../db')

const postRoutes = async (fastify, options) => {
  // 创建帖子
  fastify.post('/', {
    schema: {
      description: 'Create a new post',
      tags: ['post'],
      security: [{
        bearerAuth: []
      }],
      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: {
            type: 'string',
            description: 'Content of the post'
          },
          image: {
            type: 'string',
            nullable: true,
            description: 'Image URL of the post'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            post: {
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                },
                content: {
                  type: 'string'
                },
                image: {
                  type: 'string',
                  nullable: true
                },
                likes: {
                  type: 'integer'
                },
                reposts: {
                  type: 'integer'
                },
                replies: {
                  type: 'integer'
                },
                userId: {
                  type: 'string'
                },
                createdAt: {
                  type: 'string'
                },
                updatedAt: {
                  type: 'string'
                },
                user: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string'
                    },
                    username: {
                      type: 'string'
                    },
                    handle: {
                      type: 'string'
                    },
                    avatar: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // 验证JWT token
      const { userId } = await request.jwtVerify()
      const { content, image } = request.body

      // 创建帖子
      const post = await db.post.create({
        data: {
          content,
          image,
          userId
        }
      })

      // 获取用户信息
      const user = await db.user.findUnique({ where: { id: userId } })
      const postWithUser = {
        ...post,
        user: user ? {
          id: user.id,
          username: user.username,
          handle: user.handle,
          avatar: user.avatar
        } : null
      }

      return reply.send({ post: postWithUser })
    } catch (error) {
      fastify.log.error(error)
      if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' || error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
        return reply.code(401).send({ error: 'Unauthorized' })
      }
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // 获取帖子列表
  fastify.get('/', {
    schema: {
      description: 'Get list of posts',
      tags: ['post'],
      querystring: {
        type: 'object',
        properties: {
          limit: {
            type: 'integer',
            default: 10,
            description: 'Number of posts to return'
          },
          offset: {
            type: 'integer',
            default: 0,
            description: 'Number of posts to skip'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            posts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string'
                  },
                  content: {
                    type: 'string'
                  },
                  image: {
                    type: 'string',
                    nullable: true
                  },
                  likes: {
                    type: 'integer'
                  },
                  reposts: {
                    type: 'integer'
                  },
                  replies: {
                    type: 'integer'
                  },
                  userId: {
                    type: 'string'
                  },
                  createdAt: {
                    type: 'string'
                  },
                  updatedAt: {
                    type: 'string'
                  },
                  user: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string'
                      },
                      username: {
                        type: 'string'
                      },
                      handle: {
                        type: 'string'
                      },
                      avatar: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            total: {
              type: 'integer'
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { limit = 10, offset = 0 } = request.query

    try {
      const posts = await db.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      })

      // 为每个帖子添加用户信息
      const postsWithUser = await Promise.all(posts.map(async (post) => {
        const user = await db.user.findUnique({ where: { id: post.userId } })
        return {
          ...post,
          user: user ? {
            id: user.id,
            username: user.username,
            handle: user.handle,
            avatar: user.avatar
          } : null
        }
      }))

      const total = await db.post.count()

      return reply.send({ posts: postsWithUser, total })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // 获取单个帖子
  fastify.get('/:id', {
    schema: {
      description: 'Get post by ID',
      tags: ['post'],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Post ID'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            post: {
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                },
                content: {
                  type: 'string'
                },
                image: {
                  type: 'string',
                  nullable: true
                },
                likes: {
                  type: 'integer'
                },
                reposts: {
                  type: 'integer'
                },
                replies: {
                  type: 'integer'
                },
                userId: {
                  type: 'string'
                },
                createdAt: {
                  type: 'string'
                },
                updatedAt: {
                  type: 'string'
                },
                user: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string'
                    },
                    username: {
                      type: 'string'
                    },
                    handle: {
                      type: 'string'
                    },
                    avatar: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    try {
      const post = await db.post.findUnique({
        where: { id }
      })

      if (!post) {
        return reply.code(404).send({ error: 'Post not found' })
      }

      // 获取用户信息
      const user = await db.user.findUnique({ where: { id: post.userId } })
      const postWithUser = {
        ...post,
        user: user ? {
          id: user.id,
          username: user.username,
          handle: user.handle,
          avatar: user.avatar
        } : null
      }

      return reply.send({ post: postWithUser })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // 更新帖子
  fastify.put('/:id', {
    schema: {
      description: 'Update post by ID',
      tags: ['post'],
      security: [{
        bearerAuth: []
      }],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Post ID'
          }
        }
      },
      body: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'Content of the post'
          },
          image: {
            type: 'string',
            nullable: true,
            description: 'Image URL of the post'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            post: {
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                },
                content: {
                  type: 'string'
                },
                image: {
                  type: 'string',
                  nullable: true
                },
                likes: {
                  type: 'integer'
                },
                reposts: {
                  type: 'integer'
                },
                replies: {
                  type: 'integer'
                },
                userId: {
                  type: 'string'
                },
                createdAt: {
                  type: 'string'
                },
                updatedAt: {
                  type: 'string'
                },
                user: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string'
                    },
                    username: {
                      type: 'string'
                    },
                    handle: {
                      type: 'string'
                    },
                    avatar: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    try {
      // 验证JWT token
      const { userId } = await request.jwtVerify()
      const { content, image } = request.body

      // 检查帖子是否存在且属于当前用户
      const existingPost = await db.post.findUnique({
        where: { id }
      })

      if (!existingPost) {
        return reply.code(404).send({ error: 'Post not found' })
      }

      if (existingPost.userId !== userId) {
        return reply.code(403).send({ error: 'Unauthorized' })
      }

      // 更新帖子
      const post = await db.post.update({
        where: { id },
        data: {
          content,
          image
        }
      })

      // 获取用户信息
      const user = await db.user.findUnique({ where: { id: post.userId } })
      const postWithUser = {
        ...post,
        user: user ? {
          id: user.id,
          username: user.username,
          handle: user.handle,
          avatar: user.avatar
        } : null
      }

      return reply.send({ post: postWithUser })
    } catch (error) {
      fastify.log.error(error)
      if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' || error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
        return reply.code(401).send({ error: 'Unauthorized' })
      }
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // 删除帖子
  fastify.delete('/:id', {
    schema: {
      description: 'Delete post by ID',
      tags: ['post'],
      security: [{
        bearerAuth: []
      }],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Post ID'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: {
              type: 'string'
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    try {
      // 验证JWT token
      const { userId } = await request.jwtVerify()

      // 检查帖子是否存在且属于当前用户
      const existingPost = await db.post.findUnique({
        where: { id }
      })

      if (!existingPost) {
        return reply.code(404).send({ error: 'Post not found' })
      }

      if (existingPost.userId !== userId) {
        return reply.code(403).send({ error: 'Unauthorized' })
      }

      // 删除帖子
      await db.post.delete({
        where: { id }
      })

      return reply.send({ message: 'Post deleted successfully' })
    } catch (error) {
      fastify.log.error(error)
      if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' || error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
        return reply.code(401).send({ error: 'Unauthorized' })
      }
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
}

module.exports = postRoutes
