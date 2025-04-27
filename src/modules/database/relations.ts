import { relations } from 'drizzle-orm/relations';
import {
  identities,
  users,
  roles,
  userAssignments,
  awsRoleTrusts,
} from './schema';

export const usersRelations = relations(users, ({ one, many }) => ({
  identities: one(identities, {
    fields: [users.identityId],
    references: [identities.id],
  }),
  userAssignments: many(userAssignments),
}));

export const identitiesRelations = relations(identities, ({ many }) => ({
  users: many(users),
}));

export const userAssignmentsRelations = relations(
  userAssignments,
  ({ one }) => ({
    roles: one(roles, {
      fields: [userAssignments.roleId],
      references: [roles.id],
    }),
    users: one(users, {
      fields: [userAssignments.userId],
      references: [users.id],
    }),
  }),
);

export const rolesRelations = relations(roles, ({ many }) => ({
  userAssignments: many(userAssignments),
  awsRoleTrusts: many(awsRoleTrusts),
}));

export const awsRoleTrustsRelations = relations(
  awsRoleTrusts,
  ({ one }) => ({
    roles: one(roles, {
      fields: [awsRoleTrusts.roleId],
      references: [roles.id],
    }),
  }),
);
