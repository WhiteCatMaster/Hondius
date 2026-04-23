import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partida } from '../models/partida';
import { computed } from '@angular/core'; 

@Component({
  selector: 'app-combate',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './combate.component.html',
  styleUrl: './combate.component.css'
})
export class CombateComponent implements OnInit {
  personajeTuyo = signal<any>(null);
  rival = signal<any>(null);
  ataqueSeleccionado = signal<any>(null);

  TuTurno = true;
  // El computed este es para que se actualice en tiempo real
  vidaTuya = computed(() => this.personajeTuyo()?.vida || 0);
  vidaRival = computed(() => this.rival()?.vida || 0);

  pasarTurnoTuyo() {
    if(this.TuTurno == true) {
      this.TuTurno = false;
    } else {
      this.TuTurno = true;
    }

    if (this.ataqueSeleccionado() !== null) {
      const dano = this.ataqueSeleccionado().statReduceRival[0].valor;

      const datosPaloma = this.rival();
      datosPaloma.vida = datosPaloma.vida - dano;
      this.rival.set(datosPaloma);

      this.ataqueSeleccionado.set(null);
    }
  }

  pasarTurnoRival() {
    if(this.TuTurno == true) {
      this.TuTurno = false;
    } else {
      this.TuTurno = true;
    }

    if (this.ataqueSeleccionado() !== null) {
      const dano = this.ataqueSeleccionado().statReduceRival[0].valor;

      const datosCanario = this.personajeTuyo();
      datosCanario.vida = datosCanario.vida - dano;
      this.personajeTuyo.set(datosCanario);

      this.ataqueSeleccionado.set(null);
    }

  }

  seleccionarAtaque(ataquePulsado: any) {
    this.ataqueSeleccionado.set(ataquePulsado); 
    console.log("Has seleccionado:", this.ataqueSeleccionado().nombre); 
  }

  // A partir de aqui lo de la base de datos temporal
  ngOnInit(): void {
    this.cargarPersonajesDePrueba();
  }
  cargarPersonajesDePrueba() {
    
    // TU PERSONAJE
    this.personajeTuyo.set({
      id: null,
      nombre: 'Canario',
      fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
      urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
      vidaMaxima: 100, 
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
        },
        {
          id: null,
          nombre: 'Machetear',
          dadoBase: 20,
          ratioDado: [1, 20],
          statReducePropio: [{ estadistica: 'Maná', valor: 3 }],  
          statReduceRival: [{ estadistica: 'Vida', valor: 12 }]
        },
        {
          id: null,
          nombre: 'Aniquilar',
          dadoBase: 20,
          ratioDado: [1, 20],
          statReducePropio: [{ estadistica: 'Maná', valor: 35 }],
          statReduceRival: [{ estadistica: 'Vida', valor: 60 }]
        }
      ]
    });

    // EL DEL RIVAL 
    this.rival.set({
      id: null,
      nombre: 'Paloma',
      fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/PigeonMonceau_%28cropped%29.jpg',
      urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/PigeonMonceau_%28cropped%29.jpg',
      vidaMaxima: 70, 
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
    }); 
  }
}

