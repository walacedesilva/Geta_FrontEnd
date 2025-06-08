import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Toast } from '../../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  public toastState$ = this.toastSubject.asObservable();


  /**
   * Mostra uma notificação toast.
   * @param message A mensagem a ser exibida.
   * @param type O tipo de toast (success, error, etc.) que define a cor.
   * @param duration A duração em milissegundos antes do toast desaparecer.
   */
  show(message: string, type: 'success' | 'error' | 'info' | 'warning', duration = 5000) {
    this.toastSubject.next({ message, type, duration });
  }
}
