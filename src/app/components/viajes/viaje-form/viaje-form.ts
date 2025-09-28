import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViajesService } from '../../../services/viajes.service';
import { Viaje, ViajeCreate, ViajeUpdate } from '../../../models/viaje.model';

@Component({
  selector: 'app-viaje-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './viaje-form.html',
  styleUrl: './viaje-form.css',
})
export class ViajeForm implements OnInit {
  viaje: ViajeCreate = {
    date: '',
    description: '',
  };

  isEdit = false;
  viajeId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private viajesService: ViajesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEdit = true;
        this.viajeId = +params['id'];
        this.loadViaje();
      }
    });
  }

  async loadViaje() {
    if (!this.viajeId) return;

    this.loading = true;
    try {
      const viaje = await this.viajesService.getViaje(this.viajeId);
      if (viaje) {
        this.viaje = {
          date: viaje.date,
          description: viaje.description || '',
        };
      }
    } catch (error) {
      this.error = 'Error al cargar el viaje';
      console.error('Error loading viaje:', error);
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (!this.viaje.date) {
      this.error = 'La fecha es obligatoria';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      if (this.isEdit && this.viajeId) {
        const updateData: ViajeUpdate = {
          date: this.viaje.date,
          description: this.viaje.description || undefined,
        };
        await this.viajesService.updateViaje(this.viajeId, updateData);
      } else {
        await this.viajesService.createViaje(this.viaje);
      }

      this.router.navigate(['/viajes']);
    } catch (error) {
      this.error = this.isEdit
        ? 'Error al actualizar el viaje'
        : 'Error al crear el viaje';
      console.error('Error saving viaje:', error);
    } finally {
      this.loading = false;
    }
  }

  cancel() {
    this.router.navigate(['/viajes']);
  }
}
