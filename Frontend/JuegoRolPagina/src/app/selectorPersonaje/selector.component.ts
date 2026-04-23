import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partida } from '../models/partida';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-combate',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './selector.component.html',
  styleUrl: './selector.component.css'
})
export class SelectorPersonajeComponent implements OnInit {
  partidaActual = signal<Partida | null>(null);

  // Dado
  estaRodando = true;
  caraDelDado = 20;
  heroeSeleccionado: any = null;
  enemigoSeleccionado: any = null;

  constructor(private router: Router) {}

  // Lo otro, lo de la base de datos temporal
  ngOnInit(): void {
    this.cargarPartidaDePrueba();
  }

  seleccionarHeroe(personaje: any) {
    this.heroeSeleccionado = personaje;
    console.log('Héroe elegido:', personaje.nombre);
  }

  seleccionarEnemigo(personaje: any) {
    if (!this.heroeSeleccionado) {
      alert('¡Por favor, selecciona primero a tu Héroe!');
      return;
    }
    
    // Evitamos que el enemigo sea el mismo que el héroe
    if (personaje === this.heroeSeleccionado) {
      alert('No puedes luchar contra ti mismo, elige a otro rival.');
      return;
    }

    this.enemigoSeleccionado = personaje;
    console.log('Enemigo elegido:', personaje.nombre);
    
    // NAVEGACIÓN AUTOMÁTICA
    // Aquí podrías guardar las selecciones en un servicio antes de irte
    this.router.navigate(['/jugar-combate']);
  }

  cargarPartidaDePrueba() {
    this.partidaActual.set({
      id: null,
      nombre: 'La gran batalla del bosque',
      descripcion: 'El combate final está a punto de empezar...',
      idioma: 'ES',
      maxJugadores: 6,
      personajes: [
        {
          id: 1,
          nombre: 'Guerrero Valiente',
          fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          vida: 120,
          estadisticasDelPersonaje: [
            { nombreEstadistica: 'Fuerza', valorPropio: 18, consumible: false },
            { nombreEstadistica: 'Fuerza', valorPropio: 18, consumible: false },
            { nombreEstadistica: 'Fuerza', valorPropio: 18, consumible: false },
            { nombreEstadistica: 'Defensa', valorPropio: 15, consumible: false },
            { nombreEstadistica: 'Energía', valorPropio: 50, consumible: true }
          ],
          ataquesDelPersonaje: [
            {
              id: null, nombre: 'Golpe Rompecráneos', dadoBase: 20, ratioDado: [19, 20],
              statReducePropio: [{ estadistica: 'Energía', valor: 10 }], 
              statReduceRival: [{ estadistica: 'Vida', valor: 25 }]  
            }
          ]
        },
        {
          id: 2,
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
              id: null, nombre: 'Bola de Fuego', dadoBase: 20, ratioDado: [18, 20],
              statReducePropio: [{ estadistica: 'Maná', valor: 30 }], 
              statReduceRival: [{ estadistica: 'Vida', valor: 45 }]  
            }
          ]
        },
        {
          id: 3,
          nombre: 'Pícaro Sombrío',
          fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          vida: 85,
          estadisticasDelPersonaje: [
            { nombreEstadistica: 'Agilidad', valorPropio: 19, consumible: false },
            { nombreEstadistica: 'Sigilo', valorPropio: 16, consumible: false },
            { nombreEstadistica: 'Energía', valorPropio: 80, consumible: true }
          ],
          ataquesDelPersonaje: [
            {
              id: null, nombre: 'Puñalada Trapera', dadoBase: 20, ratioDado: [15, 20],
              statReducePropio: [{ estadistica: 'Energía', valor: 15 }], 
              statReduceRival: [{ estadistica: 'Vida', valor: 35 }]  
            }
          ]
        },
        {
          id: 4,
          nombre: 'Clérigo de la Luz',
          fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          vida: 100,
          estadisticasDelPersonaje: [
            { nombreEstadistica: 'Sabiduría', valorPropio: 17, consumible: false },
            { nombreEstadistica: 'Fe', valorPropio: 100, consumible: true }
          ],
          ataquesDelPersonaje: [
            {
              id: null, nombre: 'Castigo Divino', dadoBase: 20, ratioDado: [19, 20],
              statReducePropio: [{ estadistica: 'Fe', valor: 20 }], 
              statReduceRival: [{ estadistica: 'Vida', valor: 30 }]  
            }
          ]
        },
        {
          id: 5,
          nombre: 'Bárbaro Furioso',
          fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          vida: 150,
          estadisticasDelPersonaje: [
            { nombreEstadistica: 'Fuerza Bruta', valorPropio: 22, consumible: false },
            { nombreEstadistica: 'Furia', valorPropio: 50, consumible: true }
          ],
          ataquesDelPersonaje: [
            {
              id: null, nombre: 'Hachazo Salvaje', dadoBase: 20, ratioDado: [17, 20],
              statReducePropio: [{ estadistica: 'Furia', valor: 15 }], 
              statReduceRival: [{ estadistica: 'Vida', valor: 40 }]  
            }
          ]
        },
        {
          id: 6,
          nombre: 'Arquero Élfico',
          fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          vida: 90,
          estadisticasDelPersonaje: [
            { nombreEstadistica: 'Destreza', valorPropio: 20, consumible: false },
            { nombreEstadistica: 'Percepción', valorPropio: 18, consumible: false },
            { nombreEstadistica: 'Carcaj', valorPropio: 30, consumible: true }
          ],
          ataquesDelPersonaje: [
            {
              id: null, nombre: 'Flecha Perforante', dadoBase: 20, ratioDado: [16, 20],
              statReducePropio: [{ estadistica: 'Carcaj', valor: 1 }], 
              statReduceRival: [{ estadistica: 'Vida', valor: 28 }]  
            }
          ]
        }
      ]
    } as any); 
  }
}