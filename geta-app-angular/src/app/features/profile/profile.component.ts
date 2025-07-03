import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgIf, AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, switchMap, tap, BehaviorSubject, map, catchError, finalize, of, take } from 'rxjs';
import { User } from '../../models/user.model';
import { Publication } from '../../models/publication.model';
import { UserService } from '../../core/services/user.service';
import { PublicationService } from '../../core/services/publication.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PublicationCardComponent } from '../../shared/components/publication-card/publication-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    NgIf,
    ReactiveFormsModule,
    PublicationCardComponent
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user$!: Observable<User>;
  publications$!: Observable<Publication[]>;
  isOwnProfile = false;
  isEditMode = false;
  profileForm: FormGroup;
  publicationsSubject = new BehaviorSubject<Publication[]>([]);
  error: string | null = null;
  userId: string | null = null;

  // Propriedades para as publicações
  publications: Publication[] = [];
  isLoadingPublications = false;
  publicationsError: string | null = null;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private publicationService = inject(PublicationService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  constructor() {
    this.profileForm = this.fb.group({
      location: ['', [Validators.required, Validators.minLength(3)]],
      avatarUrl: [''],
      bio: [''],
      createdAt: new Date(),
    });
  }

  ngOnInit(): void {
    const profileId$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        this.userId = id.toString(); // Armazenar o ID do utilizador para uso posterior
        this.loadPublications(true);

        if (isNaN(id)) {
          this.toastService.show('ID de perfil inválido.', 'error');
          return [];
        }
        this.checkIfOwnProfile(id);

        return this.userService.getUser(id);
      })
    );

    this.user$ = profileId$.pipe(
      tap(user => {
        // Preenche o formulário com os dados atuais quando o utilizador é carregado
        this.profileForm.patchValue(user);
        this.loadPublications(true); // Carregar as publicações após obter o utilizador
      })
    );

    this.publications$ = this.route.paramMap.pipe(
      switchMap(params => {
        const userId = Number(params.get('id'));
        return this.publicationService.getPublicationsByUserId(userId.toString(), 1, 10);
      }),
      // Map the paged result to just the array of publications
      tap(pagedResult => this.publicationsSubject.next(pagedResult.items)),
      // Extract the items array for the observable
      // (Assuming the paged result has an 'items' property)
      // If your property is named differently, adjust accordingly
      map(pagedResult => pagedResult.items)
    );
  }

  loadPublications(isInitialLoad = false): void {
    if (!this.userId || this.isLoadingPublications) return;

    if (isInitialLoad) {
      this.isLoadingPublications = true;
      this.currentPage = 1;
      this.publications = [];
    }

    this.publicationsError = null;

    this.publicationService.getPublicationsByUserId(this.userId, this.currentPage, this.pageSize).pipe(
      tap(pagedResult => {
        if (pagedResult && Array.isArray(pagedResult.items)) {
          this.publications.push(...pagedResult.items);
          this.totalPages = Math.ceil(pagedResult.totalCount / this.pageSize);
        }
      }),
      catchError(err => {
        this.publicationsError = 'Não foi possível carregar as publicações.';
        console.error(err);
        return of(null);
      }),
      finalize(() => {
        this.isLoadingPublications = false;
      })
    ).subscribe();
  }

  loadMorePublications(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPublications();
    }
  }

  get hasMorePublications(): boolean {
    return this.currentPage < this.totalPages;
  }

  enterEditMode(): void {
    this.isEditMode = true;
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.userId) {
      return;
    }
    this.userService.updateUser(this.profileForm.value).subscribe({
      next: updatedUser => {
        this.profileForm.patchValue(updatedUser);
        this.isEditMode = false;
        // Atualizar o observable do utilizador para refletir as alterações
        this.user$ = of(updatedUser);
      },
      error: err => {
        console.error('Update failed', err);
        this.error = 'Falha ao atualizar o perfil.';
      },
    });
  }

  private checkIfOwnProfile(profileId: number): void {
    const currentUserId = this.authService.currentUserValue?.id;
    this.isOwnProfile = currentUserId === profileId;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    // Poderia-se resetar o formulário aqui se necessário
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.toastService.show('Por favor, corrija os erros no formulário.', 'error');
      return;
    }

    const currentUserId = this.authService.currentUserValue?.id;
    if (!currentUserId) return;

    this.userService.updateUser(this.profileForm.value).subscribe({
      next: () => {
        this.toastService.show('Perfil atualizado com sucesso!', 'success');
        this.isEditMode = false;
        // Atualiza os dados do utilizador na UI
        // Recarregando a página ou atualizando o Observable
        window.location.reload(); // Solução simples, mas eficaz
      },
      error: (err) => {
        this.toastService.show('Falha ao atualizar o perfil. Tente novamente.', 'error');
        console.log(err);
      }
    });
  }

    followUser(): void {
    if (!this.userId || !this.user$) return;
    this.userService.follow(this.userId).subscribe({
      next: () => {
        this.user$.pipe(
          take(1),
          tap(user => {
            if (user) {
              user.isFollowing = true;
              user.followersCount = (user.followersCount || 0) + 1;
            }
          })
        ).subscribe();
      },
      error: err => console.error('Failed to follow user', err)
    });
  }

  unfollowUser(): void {
    if (!this.userId || !this.user$) return;
    this.userService.unfollow(this.userId).subscribe({
      next: () => {
        this.user$.pipe(
          take(1),
          tap(user => {
            if (user) {
              user.isFollowing = false;
              user.followersCount = (user.followersCount || 0) - 1;
            }
          })
        ).subscribe();
      },
      error: err => console.error('Failed to unfollow user', err)
    });
  }

  /**
   * (NOVO) Remove a publicação da lista quando o evento é recebido.
   */
  onPublicationDeleted(publicationId: number): void {
    const currentPublications = this.publicationsSubject.value;
    this.publicationsSubject.next(currentPublications.filter(p => p.id !== publicationId));
  }

  /**
   * (NOVO) Atualiza uma publicação na lista quando o evento é recebido.
   */
  onPublicationUpdated(updatedPublication: Publication): void {
    const currentPublications = this.publicationsSubject.value;
    const index = currentPublications.findIndex(p => p.id === updatedPublication.id);
    if (index !== -1) {
      currentPublications[index] = updatedPublication;
      this.publicationsSubject.next([...currentPublications]);
    }
  }
}
