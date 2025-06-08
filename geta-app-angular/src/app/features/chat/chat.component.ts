import { Component, OnDestroy, OnInit, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { Message } from '../../models/message.model';
import { User } from '../../models/user.model';
import { ToastService } from '../../core/services/toast.service';

// Adicionamos um tipo para diferenciar mensagens de notificações
type ChatItem = Message & { type: 'message' | 'notification' };

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  chatError: string | null = null;

  public messages: ChatItem[] = [];
  public newMessage = '';
  public isConnected = false;
  public currentUser: User | null = null;
  public isLoadingHistory = true;
  public typingUsers: string[] = [];
  public onlineUsers: User[] = [];

  private typingSubject = new Subject<void>();
  private subscriptions = new Subscription();
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadHistoryAndStartChat();
    this.setupTypingNotifications();
    this.setupConnectionNotifications();

    const onlineUsersSub = this.chatService.onlineUsers$.subscribe(users => {
      this.onlineUsers = users;
    });
    this.subscriptions.add(onlineUsersSub);
  }

  loadHistoryAndStartChat(): void {
    const historySub = this.chatService.getChatHistory().subscribe({
      next: (history) => {
        this.messages = history.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp), type: 'message' }));
        this.isLoadingHistory = false;
        this.startRealtimeChat();
      },
      error: (err) => {
        console.error("Erro ao carregar o histórico de chat", err);
        this.toastService.show("Não foi possível carregar o histórico.", 'error');
        this.isLoadingHistory = false;
        this.startRealtimeChat();
      }
    });
    this.subscriptions.add(historySub);
  }

  startRealtimeChat(): void {
    const messageSub = this.chatService.messageReceived$.subscribe((message: Message) => {
      this.messages.push({ ...message, timestamp: new Date(message.timestamp), type: 'message' });
    });

    const statusSub = this.chatService.connectionStatus$.subscribe(status => {
      this.isConnected = status;
    });

    this.subscriptions.add(messageSub);
    this.subscriptions.add(statusSub);

    this.chatService.startConnection();
  }

  setupTypingNotifications(): void {
    const typingSub = this.chatService.userTyping$.subscribe(({ username, isTyping }) => {
      if (username !== this.currentUser?.username) {
        if (isTyping && !this.typingUsers.includes(username)) {
          this.typingUsers.push(username);
        } else if (!isTyping) {
          this.typingUsers = this.typingUsers.filter(u => u !== username);
        }
      }
    });

    const selfTypingSub = this.typingSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.chatService.sendTypingNotification();
    });

    this.subscriptions.add(typingSub);
    this.subscriptions.add(selfTypingSub);
  }

  setupConnectionNotifications(): void {
    const userConnectedSub = this.chatService.userConnected$.subscribe(username => {
      if (username !== this.currentUser?.username) {
        this.addNotification(`${username} entrou na sala.`);
      }
    });

    const userDisconnectedSub = this.chatService.userDisconnected$.subscribe(username => {
      if (username !== this.currentUser?.username) {
        this.addNotification(`${username} saiu da sala.`);
      }
    });

    this.subscriptions.add(userConnectedSub);
    this.subscriptions.add(userDisconnectedSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.chatService.stopConnection();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  async sendMessage(): Promise<void> {
    if (this.newMessage.trim() && this.currentUser) {
      const messageContent = this.newMessage;
      this.newMessage = '';

      try {
        await this.chatService.sendMessage(messageContent);
      } catch (err) {
        console.error("Falha ao enviar mensagem:", err);
        this.toastService.show("A sua mensagem não pôde ser enviada.", 'error');
        this.newMessage = messageContent;
      }
    }
  }

  onTyping(): void {
    this.typingSubject.next();
  }

  private addNotification(content: string) {
    const notification: ChatItem = {
      content: content,
      timestamp: new Date(),
      type: 'notification',
      userId: 0, // Id fictício para notificações
      username: 'System'
    };
    this.messages.push(notification);
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(error) {
      console.log(error)// Intentionally ignore scrolling errors
    }
  }
}
