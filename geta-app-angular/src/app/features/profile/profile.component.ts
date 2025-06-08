import { PublicationCardComponent } from '../../shared/components/publication-card/publication-card.component';import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe,NgIf } from '@angular/common';
import { Observable, switchMap } from 'rxjs';

import { User } from '../../models/user.model';
import { Publication } from '../../models/publication.model';
import { UserService } from '../../core/services/user.service';
import { PublicationService } from '../../core/services/publication.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    PublicationCardComponent
],
  template: `
    <div *ngIf="user$ | async as user">
      <h2>{{ user.username }}</h2>
      <p>{{ user.email }}</p>
    </div>
    <div *ngIf="publications$ | async as publications">
      <h3>Publications</h3>
      <app-publication-card
        *ngFor="let publication of publications"
        [publication]="publication">
      </app-publication-card>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  // Observables para os dados do utilizador e as suas publicações
  user$!: Observable<User>;
  publications$!: Observable<Publication[]>;

  // Use inject() for dependency injection
  private route = inject(ActivatedRoute); // Para ler o 'id' da URL
  private userService = inject(UserService);
  private publicationService = inject(PublicationService);

  ngOnInit(): void {
    // Usamos 'switchMap' para obter o ID da rota e, em seguida, chamar os serviços
    this.user$ = this.route.paramMap.pipe(
      switchMap(params => {
        const userId = Number(params.get('id'));
        return this.userService.getUser(userId);
      })
    );

    this.publications$ = this.route.paramMap.pipe(
      switchMap(params => {
        const userId = Number(params.get('id'));
        return this.publicationService.getPublicationsByUser(userId);
      })
    );
  }
}
