// import { PublicationComment } from './../../../models/publicationComment.model';
// import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
// import { CommonModule, DatePipe } from '@angular/common';
// import { RouterLink,ActivatedRoute } from '@angular/router';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Publication } from '../../../models/publication.model';
// import { AuthService } from '../../../core/services/auth.service';
// import { PublicationService } from '../../../core/services/publication.service';
// import { ToastService } from '../../../core/services/toast.service';
// import { catchError, Observable, of, tap } from 'rxjs';
// import { User } from '../../../models/user.model';
// import { UserService } from '../../../core/services/user.service';
// import { SharedModule } from '../../../shared/shared.module';
// import { CommentCardComponent } from '../comment-card.component/comment-card.component'; // Importa o componente de comentários
// import { CommentService } from '../../../core/services/comment.service';

// @Component({
//   selector: 'app-publication-card',
//   standalone: true,
//   imports: [ CommonModule,
//     RouterLink,
//     DatePipe,
//     SharedModule,
//     ReactiveFormsModule, // Import para reactive forms
//     CommentCardComponent,],
//   templateUrl: './publication-card.component.html',
// })
// export class PublicationCardComponent implements OnInit {
//   @Input() publication!: Publication;
//   @Output() publicationDeleted = new EventEmitter<number>();
//   @Output() publicationUpdated = new EventEmitter<Publication>();
//   isOwner = false;
//   isEditMode = false;
//   editForm: FormGroup;
//   publication$!: Observable<Publication | null>;
//   comments$!: Observable<PublicationComment[] | null>;

//   error: string | null = null;
//   publicationId: string | null = null;
//   commentForm!: FormGroup;
//   currentUser$: Observable<User | null>;

//   private authService = inject(AuthService);
//   private publicationService = inject(PublicationService);
//   private toastService = inject(ToastService);
//   private fb = inject(FormBuilder);
//   private userService = inject(UserService);

//   private route = inject(ActivatedRoute);

//   private commentService = inject(CommentService);

//   constructor() {
//     // Use the correct observable for the current user from UserService
//     this.currentUser$ = this.userService.getUser(this.authService.currentUserValue?.id || 0);
//     this.editForm = this.fb.group({
//       content: ['', [Validators.required, Validators.maxLength(500)]]
//     });

//      this.commentForm = this.fb.group({
//       content: ['', [Validators.required, Validators.minLength(1)]]
//     });

//   }

//   ngOnInit(): void {
//     const currentUserId = this.authService.currentUserValue?.id;
//     this.isOwner = currentUserId === this.publication.userId;

//     this.publicationId = this.route.snapshot.paramMap.get('id');

//   if (this.publicationId) {
//     this.publication$ = this.publicationService.getPublicationById(this.publicationId).pipe(
//       catchError(err => {
//         console.error('Error fetching publication:', err);
//         this.error = 'Não foi possível carregar a publicação. Tente novamente mais tarde.';
//         return of(null);
//       })
//     );

//     this.loadComments();
//     } else {
//       this.error = 'ID da publicação não encontrado.';
//       this.publication$ = of(null);
//       this.comments$ = of([] as PublicationComment[]);
//     }

//     this.commentForm = this.fb.group({
//       content: ['', [Validators.required, Validators.maxLength(500)]]
//     });

//     this.publicationId = this.route.snapshot.paramMap.get('id');

//     if (this.publicationId) {
//       this.publication$ = this.publicationService.getPublicationById(this.publicationId).pipe(
//         catchError(err => {
//           console.error('Error fetching publication:', err);
//           this.error = 'Não foi possível carregar a publicação. Tente novamente mais tarde.';
//           return of(null);
//         })
//       );
//       this.loadComments();
//     } else {
//         this.error = 'ID da publicação não encontrado.';
//         this.publication$ = of(null);
//         this.comments$ = of([] as PublicationComment[]);
//     }
//   }

//   enterEditMode(): void {
//     this.isEditMode = true;
//     this.editForm.patchValue({ content: this.publication.content });
//   }

//   cancelEdit(): void {
//     this.isEditMode = false;
//   }

//   saveEdit(): void {
//     if (this.editForm.invalid) {
//       return;
//     }

//     const newContent = this.editForm.value.content;
//     this.publicationService.updatePublication(this.publication.id, newContent).subscribe({
//       next: () => {
//         const updatedPublication = { ...this.publication, content: newContent };
//         this.publication = updatedPublication; // Atualiza a publicação localmente
//         this.publicationUpdated.emit(updatedPublication); // Emite o evento para o pai
//         this.toastService.show('Publicação atualizada com sucesso!', 'success');
//         this.isEditMode = false;
//       },
//       error: (err) => {
//         this.toastService.show('Falha ao atualizar a publicação.', 'error');
//         console.error(err);
//       }
//     });
//   }

//   deletePublication(): void {
//     // Adicionar uma confirmação seria ideal aqui
//     if (confirm('Tem a certeza que deseja apagar esta publicação?')) {
//       this.publicationService.deletePublication(this.publication.id).subscribe({
//         next: () => {
//           this.toastService.show('Publicação apagada com sucesso.', 'success');
//           this.publicationDeleted.emit(this.publication.id); // Emite o evento para o pai
//         },
//         error: (err) => {
//           this.toastService.show('Falha ao apagar a publicação.', 'error');
//           console.error(err);
//         }
//       });
//     }
//   }

//   loadComments(): void {
//     if (this.publicationId) {
//       this.comments$ = this.commentService.getCommentsForPublication(this.publicationId).pipe(
//         catchError(err => {
//           console.error('Error fetching comments:', err);
//           // Retornar um array vazio de comentários em caso de erro.
//           // O 'as PublicationComment[]' ajuda o TypeScript a entender o tipo,
//           // garantindo que ele corresponda a Observable<PublicationComment[] | null>.
//           return of([] as PublicationComment[]);
//         })
//       );
//     }
//   }

//   onCommentSubmit(): void {
//     if (this.commentForm.invalid || !this.publicationId) {
//       return;
//     }

//     const content = this.commentForm.value.content;
//     this.commentService.createComment(this.publicationId, content).pipe(
//       tap(() => {
//         this.commentForm.reset();
//         this.loadComments(); // Recarrega os comentários após o envio
//       }),
//       catchError(err => {
//         console.error('Error creating comment:', err);
//         // Handle error, maybe show a toast message
//         return of(null);
//       })
//     ).subscribe();
//   }

//   // Handler para recarregar os comentários quando um é atualizado ou apagado
//   handleCommentChange(): void {
//     this.loadComments();
//   }
// }
import { Component, inject, Input } from '@angular/core';
import { Publication } from '../../../models/publication.model';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicationService } from '../../../core/services/publication.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-publication-card',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './publication-card.component.html',
})
export class PublicationCardComponent {
  /**
   * A propriedade 'publication' é recebida de um componente pai (como o HomeComponent).
   * Este componente não precisa de aceder à rota, pois todos os dados de que precisa
   * são fornecidos através deste @Input.
   */
  @Input() publication!: Publication;

  private publicationService = inject(PublicationService);

    toggleLike(): void {
    if (!this.publication) return;

    const hasLiked = this.publication.hasLiked;
    const publicationId = String(this.publication.id);

    // Atualização otimista da UI
    this.publication.hasLiked = !hasLiked;
    this.publication.likesCount = (this.publication.likesCount || 0) + (!hasLiked ? 1 : -1);

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
        return of(null);
      })
    ).subscribe();
  }
}
