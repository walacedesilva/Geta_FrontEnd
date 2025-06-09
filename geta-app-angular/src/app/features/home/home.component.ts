import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Subscription } from 'rxjs';
import { Publication } from '../../models/publication.model';
import { PublicationService } from '../../core/services/publication.service';
import { ToastService } from '../../core/services/toast.service';
import { PublicationCardComponent } from "../../shared/components/publication-card/publication-card.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PublicationCardComponent,
    NgIf,
    NgFor
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  publicationForm: FormGroup;
  publications: Publication[] = [];
  isLoading = true;
  isLoadingMore = false; // (NOVO) Para o spinner de "a carregar mais"
  currentPage = 1;
  totalPages = 1;
  private subscriptions = new Subscription();

  private publicationService = inject(PublicationService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  constructor() {
    this.publicationForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadPublications(this.currentPage);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // (NOVO) Ouve os eventos de scroll na janela
  @HostListener('window:scroll')
  onScroll() {
    // Verifica se o utilizador está perto do final da página e se há mais páginas para carregar
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
      if (!this.isLoadingMore && this.currentPage < this.totalPages) {
        this.loadPublications(this.currentPage + 1, true);
      }
    }
  }

  loadPublications(page: number, append = false): void {
    if (append) {
      this.isLoadingMore = true;
    } else {
      this.isLoading = true;
      this.publications = []; // Limpa as publicações ao carregar a primeira página
    }

    const sub = this.publicationService.getPublications(page).subscribe({
      next: (result) => {
        // Adiciona as novas publicações à lista existente se 'append' for verdadeiro
        this.publications = append ? [...this.publications, ...result.items] : result.items;
        this.currentPage = result.currentPage;
        this.totalPages = result.totalPages;

        if (append) {
          this.isLoadingMore = false;
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Falha ao carregar publicações', err);
          this.toastService.show('Não foi possível carregar as publicações.', 'error');
          this.isLoading = false;
          this.isLoadingMore = false;
          if (!this.publications) this.publications = [];
        }
    });
    this.subscriptions.add(sub);
  }

  onSubmit(): void {
    if (this.publicationForm.invalid) {
      return;
    }
    const content = this.publicationForm.value.content;
    const sub = this.publicationService.createPublication(content).subscribe({
      next: (newPublication) => {
        this.toastService.show('Publicação criada com sucesso!', 'success');
        this.publicationForm.reset();
        // Adiciona a nova publicação ao topo do feed
        if (!this.publications) {
          this.publications = [];
        }
        this.publications.unshift(newPublication);
      },
      error: (err) => {
        console.error('Falha ao criar publicação', err);
        this.toastService.show('Ocorreu um erro ao criar a publicação.', 'error');
      }
    });
    this.subscriptions.add(sub);
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
}
