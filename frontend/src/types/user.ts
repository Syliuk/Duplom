export interface User {
  id: number;
  name: string;
  email: string;
  profilePhoto?: string | null;
  emailNotifications?: boolean;
}
