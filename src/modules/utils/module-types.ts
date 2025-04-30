export type CloudIdentityType = {
  id: string;
  name: string;
  email: string;
  cloudProvider: 'aws' | 'azure';
  roles: string[];
};
export type RoleType = {
  id: string;
  name: string;
  permissions: any[];
  cloudProvider: 'aws' | 'azure';
};
