import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core'; // Importar ChangeDetectorRef
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PublicationService } from '../../core/services/publication.service';
import { CommentService } from '../../core/services/comment.service';
import { Publication } from '../../models/publication.model';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { CommentCardComponent } from '../../shared/components/comment-card/comment-card.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user.model';
import { PublicationComment } from '../../models/publicationComment.model';

@Component({
  selector: 'app-publication-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    SharedModule,
    ReactiveFormsModule,
    CommentCardComponent
  ],
  templateUrl: './publication-view.component.html',
})
export class PublicationViewComponent implements OnInit {
  publication: Publication | null = null;
  comments$!: Observable<PublicationComment[]>;
  isLoading = true;
  error: string | null = null;
  publicationId: string | null = null;
  commentForm: FormGroup;
  currentUser$: Observable<User | null>;

  // Use inject() for dependency injection as recommended
  route = inject(ActivatedRoute);
  publicationService = inject(PublicationService);
  commentService = inject(CommentService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);

  constructor() {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
    this.currentUser$ = this.authService.user$;
  }

  ngOnInit(): void {
    this.publicationId = this.route.snapshot.paramMap.get('id');
    if (this.publicationId) {
      this.loadPublication();
      this.loadComments();
    } else {
        this.error = 'ID da publicação não encontrado.';
        this.isLoading = false;
        this.comments$ = of([]);
    }
  }

  loadPublication(): void {
    if (!this.publicationId) return;
    this.isLoading = true;
    this.publicationService.getPublicationById(this.publicationId).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (pub) => this.publication = pub,
      error: (err) => {
        console.error('Error fetching publication:', err);
        this.error = 'Não foi possível carregar a publicação. Tente novamente mais tarde.';
      }
    });
  }

  loadComments(): void {
    if (this.publicationId) {
      this.comments$ = this.commentService.getCommentsForPublication(this.publicationId).pipe(
        catchError(err => {
          console.error('Error fetching comments:', err);
          return of([]);
        })
      );
    }
  }

  onCommentSubmit(): void {
    if (this.commentForm.invalid || !this.publicationId) {
      return;
    }

    const content = this.commentForm.value.content;
    this.commentService.createComment(this.publicationId, content).pipe(
      tap(() => {
        this.commentForm.reset();
        this.loadComments();
        if (this.publication) {
          this.publication.commentCount = (this.publication.commentCount || 0) + 1;
        }
      }),
      catchError(err => {
        console.error('Error creating comment:', err);
        return of(null);
      })
    ).subscribe();
  }

  handleCommentChange(): void {
    this.loadComments();
  }

  toggleLike(): void {
    if (!this.publication) return;

    const hasLiked = this.publication.hasLiked;
    const publicationId = String(this.publication.id);

    // Atualização otimista da UI
    this.publication.hasLiked = !hasLiked;
    this.publication.likesCount = (this.publication.likesCount || 0) + (!hasLiked ? 1 : -1);

    // Força o Angular a verificar as alterações
    this.cdr.markForCheck();

    const request$ = hasLiked
      ? this.publicationService.unlikePublication(publicationId)
      : this.publicationService.likePublication(publicationId);

    request$.pipe(
      catchError(err => {
        // Reverte a UI em caso de erro
        console.error('Failed to toggle like', err);
        if (this.publication) {
          this.publication.hasLiked = hasLiked;
          this.publication.likesCount = (this.publication.likesCount || 0) + (hasLiked ? 1 : -1);
        }
        // Força a verificação para reverter a UI
        this.cdr.markForCheck();
        return of(null);
      })
    ).subscribe();
  }
}
