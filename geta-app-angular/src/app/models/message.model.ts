export interface Message {
  recipientId: number; // Change 'number' to 'string' if recipientId should be a string
  userId: number; // Adicionado para identificar o remetente
  username: string;
  content: string;
  timestamp: Date;
  userAvatarUrl?: string;
}
