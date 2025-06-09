import { Component, inject, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './models/user.model';
import { AuthService } from './core/services/auth.service';
import { ChatService } from './core/services/chat.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { ToastComponent } from './shared/components/toast/toast.component';


import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [], // Removido o styleUrl incorreto
  standalone: true,
  imports: [RouterLink,
            RouterOutlet,
            NgIf,
            AsyncPipe,
            ToastComponent] // As importações corretas já estavam aqui
})
export class AppComponent implements OnInit, OnDestroy {
  user$: Observable<User | null>;
  private authService = inject(AuthService);
  private chatService = inject(ChatService);
  private currentUserId?: string;
  private subscriptions = new Subscription();

 private router = inject(Router);
 private ngZone = inject(NgZone);
  constructor() {
    this.user$ = this.authService.user$;
  }

  ngOnInit(): void {
    // Garante que a conexão do SignalR seja iniciada assim que o utilizador faz login
    const userSub = this.user$.subscribe(user => {
      if (user) {
        this.currentUserId = String(user.id);
        this.ngZone.runOutsideAngular(() => {
          this.chatService.startConnection();
        });

        this.listenForPrivateMessages();
      } else {
        this.chatService.stopConnection();
      }
    });

    this.subscriptions.add(userSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // (NOVO) Ouve por novas mensagens privadas
  private listenForPrivateMessages(): void {
    const privateMessageSub = this.chatService.privateMessageReceived$.subscribe(message => {
      // Verifica se o utilizador não está já na página de chat com o remetente
      const currentUrl = this.router.url;
      const privateChatUrl = `/chat/${message.userId}`;

      if (currentUrl !== privateChatUrl) {
        this.chatService.incrementUnreadCount(message.userId);
      }
    });
    this.subscriptions.add(privateMessageSub);
  }

  public logout(): void {
    this.authService.logout();
  }
}
