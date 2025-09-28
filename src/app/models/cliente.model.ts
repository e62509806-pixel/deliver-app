export interface Cliente {
  id?: number;
  number: number;
  name: string;
  identity_card?: number;
  destination: string;
  packages: number;
  family_name?: string;
  phone?: string;
  familiar?: string;
  description?: string;
  delivered: boolean;
  viaje_id: number;
}

export interface ClienteCreate {
  number: number;
  name: string;
  identity_card?: number;
  destination: string;
  packages: number;
  family_name?: string;
  phone?: string;
  familiar?: string;
  description?: string;
  delivered?: boolean;
  viaje_id: number;
}

export interface ClienteUpdate {
  number?: number;
  name?: string;
  identity_card?: number;
  destination?: string;
  packages?: number;
  family_name?: string;
  phone?: string;
  familiar?: string;
  description?: string;
  delivered?: boolean;
  viaje_id?: number;
}
