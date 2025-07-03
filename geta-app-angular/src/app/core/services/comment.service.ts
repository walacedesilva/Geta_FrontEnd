import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicationComment } from '../../models/publicationComment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  private http = inject(HttpClient);

  /**
   * Busca todos os comentários para uma publicação específica.
   * @param publicationId O ID da publicação.
   * @returns Um Observable com um array de comentários.
   */
  getCommentsForPublication(publicationId: string): Observable<PublicationComment[]> {
    return this.http.get<PublicationComment[]>(`${environment.apiUrl}/publications/${publicationId}/comments`);
  }

  /**
   * Cria um novo comentário para uma publicação.
   * @param publicationId O ID da publicação que está a ser comentada.
   * @param content O conteúdo do comentário.
   * @returns Um Observable com o comentário criado.
   */
  createComment(publicationId: string, content: string): Observable<PublicationComment> {
    const body = { publicationId, content };
    return this.http.post<PublicationComment>(this.apiUrl, body);
  }

  /**
   * Atualiza um comentário existente.
   * @param commentId O ID do comentário a ser atualizado.
   * @param content O novo conteúdo do comentário.
   * @returns Um Observable com o comentário atualizado.
   */
  updateComment(commentId: string, content: string): Observable<PublicationComment> {
    return this.http.put<PublicationComment>(`${this.apiUrl}/${commentId}`, { content });
  }

  /**
   * Apaga um comentário.
   * @param commentId O ID do comentário a ser apagado.
   * @returns Um Observable vazio.
   */
  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`);
  }
}
