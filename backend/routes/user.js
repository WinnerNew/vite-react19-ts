const db = require('../db')

const userRoutes = async (fastify, options) => {
  // 获取用户资料
  fastify.get('/:id', {
    schema: {
      description: 'Get user profile by ID',
      tags: ['user'],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
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
                },
                bio: {
                  type: 'string',
                  nullable: true
                },
                location: {
                  type: 'string',
                  nullable: true
                },
                website: {
                  type: 'string',
                  nullable: true
                },
                followers: {
                  type: 'integer'
                },
                following: {
                  type: 'integer'
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
      const user = await db.user.findUnique({
        where: { id }
      })

      if (!user) {
        return reply.code(404).send({ error: 'User not found' })
      }

      // 过滤掉密码字段
      const { password: _, ...userWithoutPassword } = user

      return reply.send({ user: userWithoutPassword })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // 更新用户资料
  fastify.put('/profile', {
    schema: {
      description: 'Update user profile',
      tags: ['user'],
      security: [{
        bearerAuth: []
      }],
      body: {
        type: 'object',
        properties: {
          bio: {
            type: 'string',
            nullable: true,
            description: 'Bio of the user'
          },
          location: {
            type: 'string',
            nullable: true,
            description: 'Location of the user'
          },
          website: {
            type: 'string',
            nullable: true,
            description: 'Website of the user'
          },
          avatar: {
            type: 'string',
            nullable: true,
            description: 'Avatar URL of the user'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
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
                },
                bio: {
                  type: 'string',
                  nullable: true
                },
                location: {
                  type: 'string',
                  nullable: true
                },
                website: {
                  type: 'string',
                  nullable: true
                },
                followers: {
                  type: 'integer'
                },
                following: {
                  type: 'integer'
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
      const { bio, location, website, avatar } = request.body

      // 更新用户资料
      const user = await db.user.update({
        where: { id: userId },
        data: {
          bio,
          location,
          website,
          avatar
        }
      })

      // 过滤掉密码字段
      const { password: _, ...userWithoutPassword } = user

      return reply.send({ user: userWithoutPassword })
    } catch (error) {
      fastify.log.error(error)
      if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' || error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
        return reply.code(401).send({ error: 'Unauthorized' })
      }
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // 获取用户的帖子
  fastify.get('/:id/posts', {
    schema: {
      description: 'Get posts by user ID',
      tags: ['user'],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID'
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
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    try {
      const posts = await db.post.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' }
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

      return reply.send({ posts: postsWithUser })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
}

module.exports = userRoutes
