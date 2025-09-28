export interface Viaje {
  id?: number;
  date: string;
  description?: string;
}

export interface ViajeCreate {
  date: string;
  description?: string;
}

export interface ViajeUpdate {
  date?: string;
  description?: string;
}
