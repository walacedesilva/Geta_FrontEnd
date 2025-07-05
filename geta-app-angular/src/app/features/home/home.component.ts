import { User } from './../../models/user.model';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { catchError, finalize, Observable, of, Subscription, tap } from 'rxjs';
import { Publication } from '../../models/publication.model';
import { PublicationService } from '../../core/services/publication.service';
import { ToastService } from '../../core/services/toast.service';
import { PublicationCardComponent } from "../../shared/components/publication-card/publication-card.component";
import { PagedResult } from '../../models/paged-result.model';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PublicationCardComponent,
    NgIf,
    NgFor,
    RouterModule
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  publicationForm: FormGroup;
  publications: Publication[] = [];
  isLoading = false;
  isLoadingMore = false; // (NOVO) Para o spinner de "a carregar mais"
  currentPage = 1;
  totalPages = 0;
  pageSize = 10;
  private subscriptions = new Subscription();
  user$: Observable<User | null>;

  private publicationService = inject(PublicationService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);


  error: string | null = null;

  constructor() {
    this.user$ = this.authService.user$;
    this.publicationForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadPublications(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // (NOVO) Ouve os eventos de scroll na janela
  // @HostListener('window:scroll')
  // onScroll() {
  //   // Verifica se o utilizador está perto do final da página e se há mais páginas para carregar
  //   if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
  //     if (!this.isLoadingMore && this.currentPage < this.totalPages) {
  //       this.loadPublications(true);
  //     }
  //   }
  // }

  // loadPublications(page: number, append = false): void {
  //   if (append) {
  //     this.isLoadingMore = true;
  //   } else {
  //     this.isLoading = true;
  //     this.publications = []; // Limpa as publicações ao carregar a primeira página
  //   }

  //   const sub = this.publicationService.getPublications(page).subscribe({
  //     next: (result) => {
  //       // Adiciona as novas publicações à lista existente se 'append' for verdadeiro
  //       this.publications = append ? [...this.publications, ...result.items] : result.items;
  //       this.currentPage = result.currentPage;
  //       this.totalPages = result.totalPages;

  //       if (append) {
  //         this.isLoadingMore = false;
  //       } else {
  //         this.isLoading = false;
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Falha ao carregar publicações', err);
  //         this.toastService.show('Não foi possível carregar as publicações.', 'error');
  //         this.isLoading = false;
  //         this.isLoadingMore = false;
  //         if (!this.publications) this.publications = [];
  //       }
  //   });
  //   this.subscriptions.add(sub);
  // }

  // onSubmit(): void {
  //   if (this.publicationForm.invalid) {
  //     return;
  //   }
  //   const content = this.publicationForm.value.content;
  //   const sub = this.publicationService.createPublication(content).subscribe({
  //     next: (newPublication) => {
  //       this.publications.unshift(newPublication); // Adiciona a nova publicação no topo da lista

  //       this.toastService.show('Publicação criada com sucesso!', 'success');
  //       this.publicationForm.reset();
  //       // Adiciona a nova publicação ao topo do feed
  //       if (!this.publications) {
  //         this.publications = [];
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Falha ao criar publicação', err);
  //       this.toastService.show('Ocorreu um erro ao criar a publicação.', 'error');
  //     }
  //   });
  //   this.subscriptions.add(sub);
  // }

  loadPublications(isInitialLoad = false): void {
    if (this.isLoading || this.isLoadingMore) return;

    if (isInitialLoad) {
      this.isLoading = true;
      this.currentPage = 1;
      this.publications = [];
    } else {
      this.isLoadingMore = true;
    }

    this.error = null;

    this.publicationService.getPublications(this.currentPage, this.pageSize).pipe(
      tap((pagedResult: PagedResult<Publication> | null) => {
        // Verificação de segurança para garantir que a resposta da API tem o formato esperado
        if (pagedResult && Array.isArray(pagedResult.items)) {
          this.publications.push(...pagedResult.items);
          this.totalPages = Math.ceil(pagedResult.totalCount / this.pageSize);
        } else {
          // Regista um aviso se a estrutura de dados for inesperada, para ajudar na depuração
          console.warn('Estrutura de dados inesperada recebida para publicações paginadas:', pagedResult);
          // Define o erro para que o utilizador saiba que algo correu mal
          this.error = 'Não foi possível processar a resposta do servidor.';
        }
      }),
      catchError(err => {
        console.error('Error fetching publications:', err);
        this.error = 'Não foi possível carregar as publicações. Tente novamente mais tarde.';
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
        this.isLoadingMore = false;
      })
    ).subscribe();
  }

  onSubmit(): void {
    if (this.publicationForm.invalid) {
      return;
    }

    const content = this.publicationForm.value.content;
    this.publicationService.createPublication(content).pipe(
      tap((newPublication) => {
        this.publications.unshift(newPublication); // Adiciona a nova publicação no topo da lista
        this.publicationForm.reset();
      }),
      catchError(err => {
        console.error('Error creating publication:', err);
        // Opcional: Adicionar notificação de erro para o utilizador (ex: com o ToastService)
        return of(null);
      })
    ).subscribe();
  }

    /**
   * (NOVO) Remove a publicação da lista quando o evento é recebido.
   * @param publicationId O ID da publicação a ser removida.
   */
  onPublicationDeleted(publicationId: number): void {
    this.publications = this.publications.filter(p => p.id !== publicationId);
  }

  /**
   * (NOVO) Atualiza uma publicação na lista quando o evento é recebido.
   * @param updatedPublication A publicação com o conteúdo atualizado.
   */
  onPublicationUpdated(updatedPublication: Publication): void {
    const index = this.publications.findIndex(p => p.id === updatedPublication.id);
    if (index !== -1) {
      this.publications[index] = updatedPublication;
    }
  }

  loadMore(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPublications();
    }
  }

  get hasMorePublications(): boolean {
    return this.currentPage < this.totalPages;
  }
}
