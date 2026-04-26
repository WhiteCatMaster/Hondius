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

  ambasEstatsBien = false;

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
      this.ambasEstatsBien = true;

    if (this.ataqueSeleccionado() !== null) {
      if(this.ataqueSeleccionado().statReducePropio !== null) {
        for(let coste of this.ataqueSeleccionado().statReducePropio) {

          // Esto busca en TU personaje hasta encontrar una estadistica con el nombre de la que esté en el for y la guarda en miStat
          let miStat = this.personajeTuyo().estadisticasDelPersonaje.find(
            (e: any) => e.nombreEstadistica === coste.estadistica
          );

          if(miStat.valorPropio >= coste.valor) {
            this.ambasEstatsBien = true;
          } else {
            this.ambasEstatsBien = false;
            break;
          }
        }
        }

        if(this.ambasEstatsBien == true) {
          for(let estadistica of this.ataqueSeleccionado().statReducePropio) {
            let miStat = this.personajeTuyo().estadisticasDelPersonaje.find(
              (e: any) => e.nombreEstadistica === estadistica.estadistica
            );

            miStat.valorPropio = miStat.valorPropio - estadistica.valor;
          }

        }
      }

      if (this.ambasEstatsBien == true) {
        const dano = this.ataqueSeleccionado().danoAtaque;
        const datosPaloma = this.rival();
        datosPaloma.vida = datosPaloma.vida - dano;//Aquí se debería meter algo con el dado
        this.rival.set(datosPaloma);
        
      } else {
        alert("No tienes recursos suficientes para este ataque.");
      }

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
      this.ambasEstatsBien = true;

    if (this.ataqueSeleccionado() !== null) {
      if(this.ataqueSeleccionado().statReducePropio !== null) {
        for(let coste of this.ataqueSeleccionado().statReducePropio) {

          let miStat = this.rival().estadisticasDelPersonaje.find(
            (e: any) => e.nombreEstadistica === coste.estadistica
          );

          if(miStat.valorPropio >= coste.valor) {
            this.ambasEstatsBien = true;
          } else {
            this.ambasEstatsBien = false;
            break;
          }
        }
        }

        if(this.ambasEstatsBien == true) {
          for(let estadistica of this.ataqueSeleccionado().statReducePropio) {
            let miStat = this.rival().estadisticasDelPersonaje.find(
              (e: any) => e.nombreEstadistica === estadistica.estadistica
            );

            miStat.valorPropio = miStat.valorPropio - estadistica.valor;
          }

        }
      }

      if (this.ambasEstatsBien == true) {
        const dano = this.ataqueSeleccionado().danoAtaque;
        const datosCanario = this.personajeTuyo();
        datosCanario.vida = datosCanario.vida - dano;
        this.personajeTuyo.set(datosCanario);
        
      } else {
        alert("No tienes recursos suficientes para este ataque.");
      }

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
    
    // CANARIO
    this.personajeTuyo.set({
      id: null,
      nombre: 'Canario',
      fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
      urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
      vidaMaxima: 100, 
      vida: 100,
      estadisticasDelPersonaje: [
        { nombreEstadistica: 'Fuerza', valorPropio: 15, consumible: false },
        { nombreEstadistica: 'Maná', valorPropio: 50, consumible: true },
        { nombreEstadistica: 'Pajarería', valorPropio: 30, consumible: true } 
      ],
      ataquesDelPersonaje: [
        {
          id: null,
          nombre: 'Golpe Rompecráneos',
          dadoBase: 20,
          ratioDado: [1, 20],
          statReducePropio: [
            { estadistica: 'Maná', valor: 10 },
            { estadistica: 'Pajarería', valor: 5 }
          ], 
          statReduceRival: [],  
          danoAtaque: 25 
        },
        {
          id: null,
          nombre: 'Machetear',
          dadoBase: 20,
          ratioDado: [1, 20],
          statReducePropio: [
            { estadistica: 'Maná', valor: 3 },
            { estadistica: 'Pajarería', valor: 2 }
          ],  
          statReduceRival: [],
          danoAtaque: 12
        },
        {
          id: null,
          nombre: 'Aniquilar',
          dadoBase: 20,
          ratioDado: [1, 20],
          statReducePropio: [
            { estadistica: 'Maná', valor: 35 },
            { estadistica: 'Pajarería', valor: 20 }
          ],
          statReduceRival: [],
          danoAtaque: 60 
        }
      ]
    });

    // PALOMA
    this.rival.set({
      id: null,
      nombre: 'Paloma',
      fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/PigeonMonceau_%28cropped%29.jpg',
      urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/PigeonMonceau_%28cropped%29.jpg',
      vidaMaxima: 70, 
      vida: 70,
      estadisticasDelPersonaje: [
        { nombreEstadistica: 'Inteligencia', valorPropio: 20, consumible: false },
        { nombreEstadistica: 'Maná', valorPropio: 120, consumible: true },
        { nombreEstadistica: 'Pajarería', valorPropio: 100, consumible: true }
      ],
      ataquesDelPersonaje: [
        {
          id: null,
          nombre: 'Bola de Fuego',
          dadoBase: 20,
          ratioDado: [1, 20],
          statReducePropio: [
            { estadistica: 'Maná', valor: 30 },
            { estadistica: 'Pajarería', valor: 15 }
          ], 
          statReduceRival: [],  
          danoAtaque: 45 
        }
      ]
    }); 
  }

}

