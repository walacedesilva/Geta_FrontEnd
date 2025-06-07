import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Publication } from '../../models/publication.model';
import { PublicationService } from '../../core/services/publication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  publications$!: Observable<Publication[]>;
  publicationForm: FormGroup;

  constructor(
    private publicationService: PublicationService,
    private fb: FormBuilder
  ) {
    this.publicationForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadPublications();
  }

  loadPublications(): void {
    this.publications$ = this.publicationService.getPublications();
  }

  onSubmit(): void {
    if (this.publicationForm.invalid) {
      return;
    }
    const content = this.publicationForm.value.content;
    this.publicationService.createPublication(content).subscribe({
      next: () => {
        this.publicationForm.reset();
        this.loadPublications(); // Recarrega as publicações após criar uma nova
      },
      error: (err) => console.error('Falha ao criar publicação', err)
    });
  }
}
