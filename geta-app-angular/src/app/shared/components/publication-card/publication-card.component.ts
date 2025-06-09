import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Publication } from '../../../models/publication.model';
import { AuthService } from '../../../core/services/auth.service';
import { PublicationService } from '../../../core/services/publication.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-publication-card',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, ReactiveFormsModule],
  templateUrl: './publication-card.component.html',
})
export class PublicationCardComponent implements OnInit {
  @Input() publication!: Publication;
  @Output() publicationDeleted = new EventEmitter<number>();
  @Output() publicationUpdated = new EventEmitter<Publication>();

  isOwner = false;
  isEditMode = false;
  editForm: FormGroup;

  private authService = inject(AuthService);
  private publicationService = inject(PublicationService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  constructor() {
    this.editForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    const currentUserId = this.authService.currentUserValue?.id;
    this.isOwner = currentUserId === this.publication.userId;
  }

  enterEditMode(): void {
    this.isEditMode = true;
    this.editForm.patchValue({ content: this.publication.content });
  }

  cancelEdit(): void {
    this.isEditMode = false;
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const newContent = this.editForm.value.content;
    this.publicationService.updatePublication(this.publication.id, newContent).subscribe({
      next: () => {
        const updatedPublication = { ...this.publication, content: newContent };
        this.publication = updatedPublication; // Atualiza a publicação localmente
        this.publicationUpdated.emit(updatedPublication); // Emite o evento para o pai
        this.toastService.show('Publicação atualizada com sucesso!', 'success');
        this.isEditMode = false;
      },
      error: (err) => {
        this.toastService.show('Falha ao atualizar a publicação.', 'error');
        console.error(err);
      }
    });
  }

  deletePublication(): void {
    // Adicionar uma confirmação seria ideal aqui
    if (confirm('Tem a certeza que deseja apagar esta publicação?')) {
      this.publicationService.deletePublication(this.publication.id).subscribe({
        next: () => {
          this.toastService.show('Publicação apagada com sucesso.', 'success');
          this.publicationDeleted.emit(this.publication.id); // Emite o evento para o pai
        },
        error: (err) => {
          this.toastService.show('Falha ao apagar a publicação.', 'error');
          console.error(err);
        }
      });
    }
  }
}
