import { Component, Input } from '@angular/core';
import { Publication } from '../../../models/publication.model';

@Component({
  selector: 'app-publication-card',
  templateUrl: './publication-card.component.html',
  styleUrls: ['./publication-card.component.scss']
})
export class PublicationCardComponent {
  @Input() publication!: Publication;
}
