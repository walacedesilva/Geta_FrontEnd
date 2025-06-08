import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from '../auth/auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthComponent } from './auth.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, AuthRoutingModule, ReactiveFormsModule, AuthComponent, LoginComponent, RegisterComponent]
})
export class AuthModule { }


