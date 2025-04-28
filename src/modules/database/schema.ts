import {
  pgSchema,
  unique,
  pgPolicy,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const cgdb = pgSchema('cgdb');
export const cspEnum = cgdb.enum('csp', ['aws', 'azure']);
export const identities = cgdb.table(
  'identities',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
    fullName: text('full_name'),
    active: boolean().default(true).notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
  },
  (table) => [
    unique('identities_email_key').on(table.email),
    pgPolicy('Enable all operations for authenticated identities only', {
      as: 'permissive',
      for: 'all',
      to: ['authenticated'],
      using: sql`true`,
    }),
  ],
);

export const roles = cgdb.table(
  'roles',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    permissions: jsonb().notNull(),
    provider: cspEnum().notNull(),
  },
  () => [
    pgPolicy('Enables all operations for authenticated identities only', {
      as: 'permissive',
      for: 'all',
      to: ['authenticated'],
      using: sql`true`,
    }),
  ],
);

export const users = cgdb.table(
  'users',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    identityId: uuid('identity_id').notNull(),
    provider: cspEnum().notNull(),
    providerId: text('provider_id').notNull(),
    username: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.identityId],
      foreignColumns: [identities.id],
      name: 'users_identity_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    pgPolicy('Enables all operations for authenticated identities only', {
      as: 'permissive',
      for: 'all',
      to: ['authenticated'],
      using: sql`true`,
    }),
  ],
);

export const userAssignments = cgdb.table(
  'user_assignments',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id'),
    roleId: text('role_id'),
    assignedBy: text('assigned_by'),
    assignedAt: timestamp('assigned_at', {
      withTimezone: true,
      mode: 'string',
    }),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
    source: text().default('manual'),
  },
  (table) => [
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [roles.id],
      name: 'roles_role_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'users_user_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    pgPolicy('Enables all operations for authenticated identities only', {
      as: 'permissive',
      for: 'all',
      to: ['authenticated'],
      using: sql`true`,
    }),
  ],
);

export const awsRoleTrusts = cgdb.table(
  'aws_role_trusts',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    roleId: text('role_id').default(sql`gen_random_uuid()`),
    type: text(),
    target: text(),
    condition: jsonb(),
  },
  (table) => [
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [roles.id],
      name: 'aws_role_trusts_role_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    pgPolicy('Enables all operations for authenticated identities only', {
      as: 'permissive',
      for: 'all',
      to: ['authenticated'],
      using: sql`true`,
    }),
  ],
);
