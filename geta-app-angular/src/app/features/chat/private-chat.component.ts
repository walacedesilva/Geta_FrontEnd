import { Component, OnDestroy, OnInit, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, Subscription, switchMap, tap } from 'rxjs';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { Message } from '../../models/message.model';
import { User } from '../../models/user.model';

type ChatItem = Message & { type: 'message' | 'notification', recipientId: number, avatarUrl?: string };

@Component({
  selector: 'app-private-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './private-chat.component.html',
})
export class PrivateChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  public messages: ChatItem[] = [];
  public newMessage = '';
  public isConnected = false;
  public currentUser: User | null = null;
  public otherUser: User | null = null;
  public isLoading = true;
  private otherUserId!: number;

  private subscriptions = new Subscription();
  public isOtherUserTyping = false;
  private typingSubject = new Subject<void>();

  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.chatService.startConnection();

    const routeSub = this.route.paramMap.pipe(
      tap(params => {
        this.otherUserId = Number(params.get('userId'));
        // (NOVO) Limpa a contagem de não lidas para este utilizador ao entrar na conversa
        this.chatService.clearUnreadCount(this.otherUserId);
        this.isLoading = true;
        this.messages = [];
      }),
      switchMap(() => this.userService.getUser(this.otherUserId)),
      tap(user => this.otherUser = user),
      switchMap(() => this.chatService.getPrivateChatHistory(this.otherUserId))
    ).subscribe({
      next: (history) => {
        this.messages = history.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp), type: 'message' }));
        this.isLoading = false;
        this.setupRealtimeListeners();
      },
      error: (err) => {
        console.error("Erro ao carregar chat privado:", err);
        this.toastService.show("Não foi possível carregar a conversa.", 'error');
        this.isLoading = false;
      }
    });

    this.subscriptions.add(routeSub);
  }

  setupRealtimeListeners(): void {
    const statusSub = this.chatService.connectionStatus$.subscribe(status => {
      this.isConnected = status;
    });

    const messageSub = this.chatService.privateMessageReceived$.subscribe((message: Message) => {
      if (message.userId === this.otherUserId || (message.userId === this.currentUser?.id && message.recipientId === this.otherUserId)) {
          this.messages.push({ ...message, timestamp: new Date(message.timestamp), type: 'message' });
      }
    });

    // (NOVO) Ouve por notificações de "a escrever"
    const typingSub = this.chatService.userTyping$.subscribe(({ username, isTyping }) => {
      if (this.otherUser && username === this.otherUser.username) {
        this.isOtherUserTyping = isTyping;
      }
    });

    this.subscriptions.add(typingSub);
    this.subscriptions.add(statusSub);
    this.subscriptions.add(messageSub);
  }
  // (NOVO) Configura o envio de notificações de "a escrever"
  setupTypingNotifications(): void {
    const selfTypingSub = this.typingSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.chatService.sendTypingNotification(this.otherUserId);
    });
    this.subscriptions.add(selfTypingSub);
  }

  onTyping(): void {
    this.typingSubject.next();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  async sendMessage(): Promise<void> {
    if (this.newMessage.trim() && this.currentUser) {
      const messageContent = this.newMessage;
      this.newMessage = '';

      try {
        await this.chatService.sendPrivateMessage(this.otherUserId, messageContent);
        const optimisticMessage: ChatItem = {
            userId: this.currentUser.id,
            recipientId: this.otherUserId,
            username: this.currentUser.username,
            avatarUrl: this.currentUser.avatarUrl,
            content: messageContent,
            timestamp: new Date(),
            type: 'message'
        };
        this.messages.push(optimisticMessage);
      } catch (err) {
        this.newMessage = messageContent;
      }
    }
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error("Erro ao rolar para baixo:", err);
      this.toastService.show("Erro ao rolar para baixo.", 'error');
    }
  }
}
