import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Observable, switchMap } from 'rxjs';

import { User } from '../../models/user.model';
import { Publication } from '../../models/publication.model';
import { UserService } from '../../core/services/user.service';
import { PublicationService } from '../../core/services/publication.service';
import { PublicationCardComponent } from '../../shared/components/publication-card/publication-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    DatePipe,
    RouterLink,
    PublicationCardComponent,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  // Observables para os dados do utilizador e as suas publicações
  user$!: Observable<User>;
  publications$!: Observable<Publication[]>;

  constructor(
    private route: ActivatedRoute, // Para ler o 'id' da URL
    private userService: UserService,
    private publicationService: PublicationService
  ) {}

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
