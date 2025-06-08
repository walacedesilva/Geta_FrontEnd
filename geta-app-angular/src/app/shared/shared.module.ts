import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicationCardComponent } from './components/publication-card/publication-card.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    PublicationCardComponent
  ],
  exports: [
    PublicationCardComponent // Exporta o componente para que outros módulos o possam usar
  ]
})
export class SharedModule { }
