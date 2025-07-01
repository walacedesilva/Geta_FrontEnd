import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user.model';
import { Message } from '../../models/message.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
})
export class PrivateChatComponent implements OnInit {

  recipient$!: Observable<User>;
  messages$!: Observable<Message[]>;
  messageForm: FormGroup;
  currentUserId!: string;

  router = inject(Router);

  route = inject(ActivatedRoute);

  fb = inject(FormBuilder);

  chatService = inject(ChatService);
  userService = inject(UserService);
  authService = inject(AuthService);

  constructor() {
    this.messageForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const recipientId = this.route.snapshot.paramMap.get('id');
    this.currentUserId = this.authService.currentUserValue?.id ? String(this.authService.currentUserValue.id) : '';

    if (recipientId) {
      this.recipient$ = this.userService.getUser(Number(recipientId));
      this.messages$ = this.chatService.getPrivateChatHistory(Number(recipientId));
    }
  }

  sendMessage(): void {
    if (this.messageForm.invalid) {
      return;
    }
    const content = this.messageForm.value.content;

    this.chatService.sendMessage(content).then(() => {
        this.messageForm.reset();
        // Idealmente, a lista de mensagens seria atualizada em tempo real via WebSockets.
        // Por agora, apenas limpamos o formulário.
    });
  }

  goBack(): void {
    window.history.back();
  }
}
