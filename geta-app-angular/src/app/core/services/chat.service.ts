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

  private messageReceived = new Subject<Message>();
  public messageReceived$ = this.messageReceived.asObservable();

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

  private platformId = inject(PLATFORM_ID);

  public getChatHistory(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.chatApiUrl}/history`);
  }

  public startConnection = () => {
    if (isPlatformBrowser(this.platformId)) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.apiUrl}/chatHub`, {
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

  public sendMessage(content: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection.invoke('SendMessage', content);
    } else {
      return Promise.reject(new Error('A conexão não está ativa.'));
    }
  }

  public sendTypingNotification() {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('UserIsTyping')
        .catch(err => console.error('Erro ao enviar notificação de "a escrever": ', err));
    }
  }

  private registerOnServerEvents(): void {
    if (this.hubConnection) {
      this.hubConnection.on('ReceiveMessage', (message: Message) => {
        this.messageReceived.next(message);
      });

      this.hubConnection.on('UserTyping', (username: string, isTyping: boolean) => {
        this.userTyping.next({ username, isTyping });
      });

      this.hubConnection.on('UpdateOnlineUsers', (users: User[]) => {
        this.onlineUsers.next(users);
      });

      this.hubConnection.on('UserConnected', (username: string) => {
        this.userConnected.next(username);
      });

      this.hubConnection.on('UserDisconnected', (username: string) => {
        this.userDisconnected.next(username);
      });
    }
  }
}
