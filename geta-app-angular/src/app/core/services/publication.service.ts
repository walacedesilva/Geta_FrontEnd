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

  /**
   * Busca todas as publicações para o feed principal.
   * @returns Um Observable com um array de publicações.
   */
  getPublications(): Observable<Publication[]> {
    return this.http.get<Publication[]>(this.apiUrl);
  }

  /**
   * (NOVO) Busca todas as publicações de um utilizador específico.
   * @param userId O ID do utilizador.
   * @returns Um Observable com um array de publicações desse utilizador.
   */
  getPublicationsByUser(userId: number): Observable<Publication[]> {
    // Este endpoint deve existir na sua API (ex: GET /api/publications/user/{userId})
    return this.http.get<Publication[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Cria uma nova publicação.
   * @param content O conteúdo da publicação.
   * @returns Um Observable com a publicação criada.
   */
  createPublication(content: string): Observable<Publication> {
    return this.http.post<Publication>(this.apiUrl, { content });
  }
}
