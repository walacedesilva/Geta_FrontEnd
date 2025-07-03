export interface PublicationComment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  username: string;
  userAvatarUrl?: string;
  publicationId: string;
}
