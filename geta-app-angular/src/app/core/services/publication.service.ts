import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publication } from '../../models/publication.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  private apiUrl = `${environment.apiUrl}/publications`;

  constructor(private http: HttpClient) { }

  // Busca todas as publicações
  getPublications(): Observable<Publication[]> {
    return this.http.get<Publication[]>(this.apiUrl);
  }

  // Cria uma nova publicação
  createPublication(content: string): Observable<Publication> {
    return this.http.post<Publication>(this.apiUrl, { content });
  }
}
