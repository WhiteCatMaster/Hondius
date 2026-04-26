import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-editar-personaje',
  imports: [FormsModule, RouterLink],
  templateUrl: './editar-personaje.html',
  styleUrl: './editar-personaje.css',
})
export class EditarPersonaje {
  personaje: any = {
    nombre: 'Guerrero Valiente',
    fotoUrl: 'https://img.freepik.com/vector-gratis/caballero-personaje-dibujos-animados-espada_1308-127704.jpg?semt=ais_hybrid&w=740&q=80',
    estadisticas: [
      { nombre: 'Fuerza Bruta', valor: 25 },
      { nombre: 'Armadura', valor: 15 },
      { nombre: 'Maná Oscuro', valor: 100 },
      { nombre: 'Velocidad', valor: 8 },
      { nombre: 'Suerte', valor: 2 }
    ],
    ataques: [
      { 
        nombre: 'Hachazo Feroz', 
        dadoBase: 20, 
        statReducePropio: [{ estadistica: 'Estamina', valor: 10 }],
        statReduceRival: [{ estadistica: 'Vida', valor: 20 }]
      },
      { 
        nombre: 'Grito de Guerra', 
        dadoBase: 12, 
        statReducePropio: [{ estadistica: 'Maná', valor: 5 }],
        statReduceRival: [{ estadistica: 'Defensa', valor: 5 }, { estadistica: 'Esquiva', valor: 2 }]
      },
      { 
        nombre: 'Embestida', 
        dadoBase: 8, 
        statReducePropio: [{ estadistica: 'Fuerza', valor: 3 }],
        statReduceRival: []
      }
    ]
  };

  subirStat(index: number) {
    this.personaje.estadisticas[index].valor++;
  }

  bajarStat(index: number) {
    this.personaje.estadisticas[index].valor--;
  }
}
