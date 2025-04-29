import { Args, Query, Resolver } from '@nestjs/graphql';
import { IdentitiesService } from './identities.service';

@Resolver('Identity')
export class IdentitiesResolver {
  constructor(private readonly identitiesService: IdentitiesService) {}

  @Query('getIdentities')
  async getUsers() {
    return this.identitiesService.getIdentities();
  }

  @Query('getIdentityById')
  async getIdentityById(@Args('id') id: string) {
    const result = await this.identitiesService.getIdentityById(id);
    return result.length > 0 ? result[0] : null;
  }

  @Query('getIdentityByEmail')
  async getIdentityByEmail(@Args('email') email: string) {
    const result = await this.identitiesService.getIdentityByEmail(email);
    return result.length > 0 ? result[0] : null;
  }
}
