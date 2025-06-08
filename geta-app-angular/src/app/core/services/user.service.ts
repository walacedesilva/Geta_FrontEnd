import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { User, UpdateUserRequest } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/profile`;
  private http = inject(HttpClient);

  /**
   * Busca os detalhes de um utilizador específico pelo seu ID.
   * @param id O ID do utilizador a ser buscado.
   * @returns Um Observable com os dados do utilizador.
   */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * (NOVO) Atualiza os dados de um utilizador.
   * @param id O ID do utilizador a ser atualizado.
   * @param data Os dados a serem atualizados (bio, avatarUrl,location).
   * @returns Um Observable com o utilizador atualizado.
   */
  updateUser(data: UpdateUserRequest): Observable<User> {
  // Agora faz PUT para /profile apenas com o objeto no corpo
  return this.http.put<User>(`${this.apiUrl}`, data).pipe(
    catchError(error => {
      console.error('Error updating user:', error);
      throw error;
    })
  );
}
}
