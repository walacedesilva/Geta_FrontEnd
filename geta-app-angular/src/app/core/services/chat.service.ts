import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message } from '../../models/message.model';
import { User } from '../../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: signalR.HubConnection | undefined;
  private chatApiUrl = `${environment.apiUrl}/chat`;

  // Observables para o chat global
  private messageReceived = new Subject<Message>();
  public messageReceived$ = this.messageReceived.asObservable();

  // Subject para mensagens privadas
  private privateMessageReceived = new Subject<Message>();
  public privateMessageReceived$ = this.privateMessageReceived.asObservable();

  // (NOVO) BehaviorSubject para gerir a contagem de mensagens não lidas
  private unreadCounts = new BehaviorSubject<Map<number, number>>(new Map());
  public unreadCounts$ = this.unreadCounts.asObservable();

  private userTyping = new Subject<{ username: string; isTyping: boolean }>();
  public userTyping$ = this.userTyping.asObservable();

  private onlineUsers = new BehaviorSubject<User[]>([]);
  public onlineUsers$ = this.onlineUsers.asObservable();

  private userConnected = new Subject<string>();
  public userConnected$ = this.userConnected.asObservable();
  private userDisconnected = new Subject<string>();
  public userDisconnected$ = this.userDisconnected.asObservable();

  private connectionStatus = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatus.asObservable();

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // (NOVO) Incrementa a contagem de não lidas para um utilizador específico
  public incrementUnreadCount(userId: number): void {
    const counts = this.unreadCounts.value;
    const currentCount = counts.get(userId) || 0;
    counts.set(userId, currentCount + 1);
    this.unreadCounts.next(new Map(counts));
  }

  // (NOVO) Limpa a contagem de não lidas para um utilizador (quando o chat é aberto)
  public clearUnreadCount(userId: number): void {
    const counts = this.unreadCounts.value;
    if (counts.has(userId)) {
      counts.delete(userId);
      this.unreadCounts.next(new Map(counts));
    }
  }

  private platformId = inject(PLATFORM_ID);

  public getChatHistory(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.chatApiUrl}/history`);
  }

  public getPrivateChatHistory(otherUserId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.chatApiUrl}/history/${otherUserId}`);
  }

  public startConnection = () => {
    if (isPlatformBrowser(this.platformId) && !this.hubConnection) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.apiUrlHub}/chatHub`, {
          accessTokenFactory: () => this.authService.token || ''
        })
        .withAutomaticReconnect()
        .build();

      this.hubConnection
        .start()
        .then(() => {
          console.log('Conexão com o Hub de chat estabelecida e autenticada.');
          this.connectionStatus.next(true);
          this.registerOnServerEvents();
        })
        .catch(err => {
          console.error('Erro ao conectar ao hub: ', err);
          this.connectionStatus.next(false);
        });

      this.hubConnection.onclose(() => {
        this.connectionStatus.next(false);
        this.onlineUsers.next([]);
      });
    }
  }

  public stopConnection = () => {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
            console.log('Conexão com o Hub de chat terminada.');
            this.connectionStatus.next(false);
        })
        .catch(err => console.error('Erro ao parar a conexão do hub: ', err));
    }
  }

 /**
   * (ALTERADO) Envia uma mensagem global.
   * Agora chama o método 'SendMessage' do backend, passando 'null' como toUserId.
   */
  public sendMessage(content: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection.invoke('SendMessage', null, content);
    } else {
      return Promise.reject(new Error('A conexão não está ativa.'));
    }
  }

  /**
   * (ALTERADO) Envia uma mensagem privada.
   * Agora chama o método 'SendMessage' do backend, passando o ID do destinatário.
   */
  public sendPrivateMessage(recipientId: number, content: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection.invoke('SendMessage', recipientId.toString(), content);
    } else {
      return Promise.reject(new Error('A conexão não está ativa.'));
    }
  }

  /**
   * (ALTERADO) Envia uma notificação de "a escrever" para um utilizador específico.
   * @param recipientId O ID do utilizador que receberá a notificação.
   */
  public sendTypingNotification(recipientId: number) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection.invoke('UserIsTyping', recipientId.toString());
    }
    return Promise.resolve();
  }

  private registerOnServerEvents(): void {
    if (this.hubConnection) {
      // Chat Global
      this.hubConnection.on('ReceiveMessage', (message: Message) => this.messageReceived.next(message));

      // Mensagens Privadas
      this.hubConnection.on('ReceivePrivateMessage', (message: Message) => {
        this.privateMessageReceived.next(message);
      });

      // Notificações de Status
      this.hubConnection.on('UserTyping', (username: string, isTyping: boolean) => this.userTyping.next({ username, isTyping }));
      this.hubConnection.on('UpdateOnlineUsers', (users: User[]) => this.onlineUsers.next(users));
      this.hubConnection.on('UserConnected', (username: string) => this.userConnected.next(username));
      this.hubConnection.on('UserDisconnected', (username: string) => this.userDisconnected.next(username));
    }
  }
}
