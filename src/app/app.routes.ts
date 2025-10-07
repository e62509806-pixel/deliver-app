import { Routes } from '@angular/router';
import { ViajesList } from './components/viajes/viajes-list/viajes-list';
import { ViajeForm } from './components/viajes/viaje-form/viaje-form';
import { ClientesList } from './components/clientes/clientes-list/clientes-list';
import { ClienteForm } from './components/clientes/cliente-form/cliente-form';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'viajes',
    component: ViajesList,
    canActivate: [AuthGuard],
  },
  {
    path: 'viajes/new',
    component: ViajeForm,
    canActivate: [AuthGuard],
  },
  {
    path: 'viajes/edit/:id',
    component: ViajeForm,
    canActivate: [AuthGuard],
  },
  {
    path: 'clientes/:id',
    component: ClientesList,
    canActivate: [AuthGuard],
  },
  {
    path: 'clientes/new/:viajeId',
    component: ClienteForm,
    canActivate: [AuthGuard],
  },
  {
    path: 'clientes/edit/:id',
    component: ClienteForm,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: 'home' },
];
