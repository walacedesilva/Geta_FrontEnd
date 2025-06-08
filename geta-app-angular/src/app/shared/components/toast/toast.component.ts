import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { Toast } from '../../../models/toast.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  animations: [
    trigger('toastAnimation', [
      state('void', style({
        transform: 'translateY(100%)',
        opacity: 0
      })),
      state('*', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('void => *', animate('300ms ease-out')),
      transition('* => void', animate('300ms ease-in'))
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private toastSubscription: Subscription | undefined;
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.toastSubscription = this.toastService.toastState$.subscribe(
      (toast) => {
        this.toasts.push(toast);
        setTimeout(() => this.close(toast), toast.duration || 5000);
      }
    );
  }

  ngOnDestroy(): void {
    this.toastSubscription?.unsubscribe();
  }

  close(toast: Toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  // Define as classes de cor com base no tipo de toast
  getToastClass(toast: Toast): string {
    const baseClass = 'w-full max-w-sm p-4 rounded-lg shadow-lg text-white flex items-center';
    switch (toast.type) {
      case 'success':
        return `${baseClass} bg-green-500`;
      case 'error':
        return `${baseClass} bg-red-500`;
      case 'warning':
        return `${baseClass} bg-yellow-500`;
      case 'info':
        return `${baseClass} bg-blue-500`;
      default:
        return `${baseClass} bg-gray-700`;
    }
  }
}
