import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Publication } from '../../../models/publication.model';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-publication-card',
  templateUrl: './publication-card.component.html',
  standalone: true,
  imports: [RouterLink,DatePipe]
})
export class PublicationCardComponent {
  @Input() publication!: Publication;
}
