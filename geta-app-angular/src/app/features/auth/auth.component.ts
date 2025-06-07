import { Component } from '@angular/core';
@Component({
  selector: 'app-auth',
  template: `
    <div class="flex items-center justify-center min-h-screen-minus-header bg-gray-100">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`.min-h-screen-minus-header { min-height: calc(100vh - 68px); }`]
})
export class AuthComponent { }
