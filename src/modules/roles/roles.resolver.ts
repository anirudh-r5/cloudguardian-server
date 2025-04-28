import { Resolver, Query, Args } from '@nestjs/graphql';
import { RolesService } from './roles.service';

@Resolver('Role')
export class RolesResolver {
  constructor(private readonly rolesService: RolesService) {}

  @Query('getRoles')
  async getRoles() {
    return this.rolesService.getRoles();
  }

  @Query('getRoleById')
  async getRoleById(@Args('id') id: string) {
    const result = await this.rolesService.getRoleById(id);
    return result.length > 0 ? result[0] : null;
  }

  @Query('getRoleByName')
  async getRoleByName(@Args('name') name: string) {
    const result = await this.rolesService.getRoleByName(name);
    return result.length > 0 ? result[0] : null;
  }
}
