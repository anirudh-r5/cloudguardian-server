import { Args, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver('User')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query('getUsers')
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Query('getUserById')
  async getUserById(@Args('id') id: string) {
    const result = await this.usersService.getUserById(id);
    return result.length > 0 ? result[0] : null;
  }

  @Query('getUserByUsername')
  async getUserByUsername(@Args('name') name: string) {
    const result = await this.usersService.getUsersByName(name);
    return result.length > 0 ? result[0] : null;
  }

  @Query('getUsersByProvider')
  async getUsersByProvider(@Args('provider') provider: 'aws' | 'azure') {
    return this.usersService.getUsersByProvider(provider);
  }
}
