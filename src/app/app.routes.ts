import { Routes } from '@angular/router';
import { ViajesList } from './components/viajes/viajes-list/viajes-list';
import { ViajeForm } from './components/viajes/viaje-form/viaje-form';
import { ClientesList } from './components/clientes/clientes-list/clientes-list';
import { ClienteForm } from './components/clientes/cliente-form/cliente-form';

export const routes: Routes = [
  { path: '', redirectTo: '/viajes', pathMatch: 'full' },
  { path: 'viajes', component: ViajesList },
  { path: 'viajes/new', component: ViajeForm },
  { path: 'viajes/edit/:id', component: ViajeForm },
  { path: 'clientes/:id', component: ClientesList },
  { path: 'clientes/new/:viajeId', component: ClienteForm },
  { path: 'clientes/edit/:id', component: ClienteForm },
  { path: '**', redirectTo: '/viajes' },
];
