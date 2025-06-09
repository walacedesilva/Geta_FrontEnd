import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getPublications(pageNumber = 1, pageSize = 10): Observable<PagedResult<Publication>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PagedResult<Publication>>(this.apiUrl, { params });
  }

  getPublicationsByUser(userId: number): Observable<Publication[]> {
    return this.http.get<Publication[]>(`${this.apiUrl}/user/${userId}`);
  }

  createPublication(content: string): Observable<Publication> {
    return this.http.post<Publication>(this.apiUrl, { content });
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
