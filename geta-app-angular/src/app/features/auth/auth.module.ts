import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthComponent } from './auth.component';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, AuthComponent],
  imports: [CommonModule, AuthRoutingModule, ReactiveFormsModule]
})
export class AuthModule { }

// src/app/features/auth/auth-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [{
  path: '',
  component: AuthComponent,
  children: [
    { path: '', component: LoginComponent },
    { path: 'register', component: RegisterComponent }
  ]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
