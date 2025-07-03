import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publication } from '../../models/publication.model';
import { PagedResult } from '../../models/paged-result.model'; // (NOVO) Importar PagedResult
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  private apiUrl = `${environment.apiUrl}/publications`;
  private http = inject(HttpClient);

  getPublications(page: number, pageSize: number): Observable<PagedResult<Publication>> {
    return this.http.get<PagedResult<Publication>>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
  }

  getPublicationById(id: string): Observable<Publication> {
    return this.http.get<Publication>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca as publicações de um utilizador específico com paginação.
   * @param userId O ID do utilizador.
   * @param page A página a ser retornada.
   * @param pageSize O número de itens por página.
   * @returns Um Observable com o resultado paginado das publicações.
   */
  getPublicationsByUserId(userId: string, page: number, pageSize: number): Observable<PagedResult<Publication>> {
    // Este endpoint assume que a sua API pode buscar publicações de um utilizador.
    // Ex: GET /users/{userId}/publications
    return this.http.get<PagedResult<Publication>>(`${environment.apiUrl}/Publications/${userId}/publications?page=${page}&pageSize=${pageSize}`);
  }

  createPublication(content: string): Observable<Publication> {
    return this.http.post<Publication>(this.apiUrl, { content });
  }
  /**
   * "Gosta" de uma publicação.
   * @param publicationId O ID da publicação.
   */
  likePublication(publicationId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${publicationId}/like`, {});
  }

  /**
   * Remove o "gosto" de uma publicação.
   * @param publicationId O ID da publicação.
   */
  unlikePublication(publicationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${publicationId}/like`);
  }

  /**
   * (NOVO) Atualiza o conteúdo de uma publicação existente.
   * @param id O ID da publicação a ser atualizada.
   * @param content O novo conteúdo da publicação.
   * @returns Um Observable vazio, indicando o sucesso da operação.
   */
  updatePublication(id: number, content: string): Observable<void> {
    // Esta chamada assume que o seu backend tem um endpoint PUT em /api/publications/{id}
    return this.http.put<void>(`${this.apiUrl}/${id}`, { content });
  }

  /**
   * (NOVO) Apaga uma publicação.
   * @param id O ID da publicação a ser apagada.
   * @returns Um Observable vazio, indicando o sucesso da operação.
   */
  deletePublication(id: number): Observable<void> {
    // Esta chamada assume que o seu backend tem um endpoint DELETE em /api/publications/{id}
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
