// In packages/shared/types/user.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  passwordHash?: string;
  image?: string; // For Google profile picture
  createdAt: Date;
}
