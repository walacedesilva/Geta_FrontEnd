export interface Message {
  userId: number; // Adicionado para identificar o remetente
  username: string;
  content: string;
  timestamp: Date;
  userAvatarUrl?: string;
}
