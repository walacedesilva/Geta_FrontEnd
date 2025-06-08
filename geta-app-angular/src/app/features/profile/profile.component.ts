import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgIf, AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, switchMap, tap } from 'rxjs';
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
      bio: ['']
    });
  }

  ngOnInit(): void {
    const profileId$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        this.checkIfOwnProfile(id);
        return this.userService.getUser(id);
      })
    );

    this.user$ = profileId$.pipe(
      tap(user => {
        // Preenche o formulário com os dados atuais quando o utilizador é carregado
        this.profileForm.patchValue({
          location: user.location,
          avatarUrl: user.avatarUrl,
          bio: user.bio
        });
      })
    );

    this.publications$ = this.route.paramMap.pipe(
      switchMap(params => {
        const userId = Number(params.get('id'));
        return this.publicationService.getPublicationsByUser(userId);
      })
    );
  }

  private checkIfOwnProfile(profileId: number): void {
    const currentUserId = this.authService.currentUserValue?.id;
    this.isOwnProfile = currentUserId === profileId;
  }

  enterEditMode(): void {
    this.isEditMode = true;
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
}
