import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partida } from '../models/partida';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-combate',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './selector.component.html',
  styleUrl: './selector.component.css'
})
export class SelectorPersonajeComponent implements OnInit {
  partidaActual = signal<Partida | null>(null);

  // Dado
  estaRodando = true;
  caraDelDado = 20;


  // Lo otro, lo de la base de datos temporal
  ngOnInit(): void {
    this.cargarPartidaDePrueba();
  }

  cargarPartidaDePrueba() {
    this.partidaActual.set({
      id: null,
      nombre: 'La gran batalla del bosque',
      descripcion: 'El combate final está a punto de empezar...',
      idioma: 'ES',
      maxJugadores: 4,
      personajes: [
        {
          id: null,
          nombre: 'Guerrero Valiente',
          fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          vida: 100,
          estadisticasDelPersonaje: [
            { nombreEstadistica: 'Fuerza', valorPropio: 15, consumible: false },
            { nombreEstadistica: 'Maná', valorPropio: 50, consumible: true }
          ],
          ataquesDelPersonaje: [
            {
              id: null,
              nombre: 'Golpe Rompecráneos',
              dadoBase: 20,
              ratioDado: [1, 20],
              statReducePropio: [{ estadistica: 'Maná', valor: 10 }], 
              statReduceRival: [{ estadistica: 'Vida', valor: 25 }]  
            }
          ]
        },
        {
          id: null,
          nombre: 'Mago Oscuro',
          fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          vida: 70,
          estadisticasDelPersonaje: [
            { nombreEstadistica: 'Inteligencia', valorPropio: 20, consumible: false },
            { nombreEstadistica: 'Maná', valorPropio: 120, consumible: true }
          ],
          ataquesDelPersonaje: [
            {
              id: null,
              nombre: 'Bola de Fuego',
              dadoBase: 20,
              ratioDado: [1, 20],
              statReducePropio: [{ estadistica: 'Maná', valor: 30 }], 
              statReduceRival: [{ estadistica: 'Vida', valor: 45 }]  
            }
          ]
        }
      ]
    } as any); 
  }
}