export interface UserRequestDto {
  id: string;

  fullName: string;

  email: string;

  phone: string;

  countryCode: string;

  roles: {
    id: string;
    roleName: string;
  }[];

  organization?: {
    id: string;
    level: number;
    legal_name: string;
    parent_id: string | null;
    root_id: string | null;
    status: string;
  };
}
