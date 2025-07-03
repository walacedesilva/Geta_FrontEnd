import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { PublicationComment } from '../../../models/publicationComment.model';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/user.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommentService } from '../../../core/services/comment.service';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'app-comment-card',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, ReactiveFormsModule],
  templateUrl: './comment-card.component.html',
})
export class CommentCardComponent implements OnInit {
  @Input() comment!: PublicationComment;
  @Input() currentUser!: User | null;
  @Output() commentDeleted = new EventEmitter<string>();
  @Output() commentUpdated = new EventEmitter<void>();

  isOwner = false;
  isEditing = false;
  editForm: FormGroup;

  private fb = inject(FormBuilder);
  private commentService = inject(CommentService);

  constructor() {
    this.editForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.isOwner = String(this.currentUser?.id) === String(this.comment.userId);
  }

  enterEditMode(): void {
    this.isEditing = true;
    this.editForm.setValue({ content: this.comment.content });
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  onEditSubmit(): void {
    if (this.editForm.invalid) {
      return;
    }
    const newContent = this.editForm.value.content;
    this.commentService.updateComment(this.comment.id, newContent).pipe(
      tap(() => {
        this.isEditing = false;
        this.commentUpdated.emit();
      }),
      catchError(err => {
        console.error("Error updating comment", err);
        // Opcional: Adicionar notificação de erro para o utilizador
        return of(null);
      })
    ).subscribe();
  }

  onDelete(): void {
    // A confirmação pode ser melhorada com um modal customizado no futuro
    if (confirm('Tem a certeza que quer apagar este comentário?')) {
      this.commentService.deleteComment(this.comment.id).pipe(
        tap(() => {
          this.commentDeleted.emit(this.comment.id);
        }),
        catchError(err => {
          console.error("Error deleting comment", err);
          // Opcional: Adicionar notificação de erro para o utilizador
          return of(null);
        })
      ).subscribe();
    }
  }
}
