import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Um serviço para gerir o estado da UI em toda a aplicação.
 * Atualmente, é usado para controlar a visibilidade do cabeçalho principal.
 */
@Injectable({
  providedIn: 'root'
})
export class UiService {
  // BehaviorSubject que armazena o estado de visibilidade do cabeçalho.
  private showHeaderSource = new BehaviorSubject<boolean>(true);

  /**
   * Observable que os componentes podem subscrever para reagir a alterações
   * na visibilidade do cabeçalho.
   */
  showHeader$ = this.showHeaderSource.asObservable();

  /**
   * Define o estado de visibilidade do cabeçalho.
   * @param value `true` para mostrar o cabeçalho, `false` para o esconder.
   */
  setShowHeader(value: boolean) {
    // Usamos setTimeout para evitar o erro "ExpressionChangedAfterItHasBeenCheckedError"
    // que pode ocorrer se o valor for alterado durante um ciclo de deteção de alterações.
    setTimeout(() => this.showHeaderSource.next(value), 0);
  }
}
