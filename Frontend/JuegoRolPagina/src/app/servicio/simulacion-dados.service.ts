import { Injectable } from '@angular/core';
import { Dado } from '../models/dado';

@Injectable({ providedIn: 'root' })
export class DadosService {
  lanzarDados(dadosConfigurados: Dado[]): { total: number; detalles: any[] } {
    let total = 0;
    const detalles: any[] = [];

    dadosConfigurados.forEach((dado) => {
      // Lanzamos este dado tantas veces como marque su cantidad
      for (let i = 0; i < dado.cantidad; i++) {
        const resultado = Math.floor(Math.random() * dado.caras) + 1;
        total += resultado;

        // Guardamos el detalle para dibujarlo después
        detalles.push({
          nombre: dado.nombre,
          caras: dado.caras,
          valor: resultado,
          imagen: dado.imagen,
        });
      }
    });

    return { total, detalles };
  }
}
