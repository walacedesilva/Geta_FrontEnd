export interface Publication {
  id: number;
  userId: number;
  username: string;
  userAvatarUrl?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
