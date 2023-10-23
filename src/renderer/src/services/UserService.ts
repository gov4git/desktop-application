import { AbstractUserService } from '~/shared'

import { proxyService } from './proxyService.js'

const UserService = proxyService<typeof AbstractUserService>('user')

export const userService = new UserService()
