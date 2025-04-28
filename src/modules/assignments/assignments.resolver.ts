import { Resolver, Query, Args } from '@nestjs/graphql';
import { AssignmentsService } from './assignments.service';

@Resolver('UserAssignment')
export class AssignmentsResolver {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Query('getAssignments')
  async getAssignments() {
    return this.assignmentsService.getAssignments();
  }

  @Query('getAssignmentsByUserId')
  async getAssignmentsByUserId(@Args('userId') userId: string) {
    return this.assignmentsService.getAssignmentsByUserId(userId);
  }

  @Query('getAssignmentsByRoleId')
  async getAssignmentsByRoleId(@Args('roleId') roleId: string) {
    return this.assignmentsService.getAssignmentsByRoleId(roleId);
  }

  @Query('getAssignmentByRef')
  async getAssignmentByRef(
    @Args('userId') userId: string,
    @Args('roleId') roleId: string,
  ) {
    const result = await this.assignmentsService.getAssignmentsByRef(
      userId,
      roleId,
    );
    return result.length > 0 ? result[0] : null;
  }
}
