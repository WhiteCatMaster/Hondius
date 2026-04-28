import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partida } from '../models/partida';
import { computed } from '@angular/core'; 
import { ActivatedRoute } from '@angular/router';
import { ServicioAPI } from '../servicio-api';
import { PersonajeDto } from '../selectorELIMINAR.component';
import { UsuarioService } from '../servicios/usuario-service';

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
  combateId: string | null = null;
  combateDto: CombatePersonjaesDto|null = null;
  
  ambasEstatsBien = false;

  TuTurno = true;
  constructor(
    private route: ActivatedRoute,
    private servicioAPI: ServicioAPI,
    public usuarioService: UsuarioService
  ){}
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
    //this.cargarPersonajesDePrueba();
    this.combateId = this.route.snapshot.paramMap.get('id');
    //this.cargarPartidaDePrueba();
    if (this.combateId) {
      this.servicioAPI.obtenerCombate(this.combateId).subscribe({
        next: (partidaBackend) => {
            this.combateDto = partidaBackend;
            this.cargarPersonajesBD()
            console.log(this.combateDto)
        },
      });
    }
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

  cargarPersonajesBD(){
    //Supongo que deberia de hacer un GET a backend y recoger el combate por el id 
    //Para hacerlo mas sencillo solo voy a recoger los personajes del combate 
    let estadisticas1:any[] = []
    let ataques1:any[] = []
    let ataques1mana: any[] = []
    let ataques1propio: any[] = []
    let estadisticas2:any[] = []
    let ataques2:any[] = []
    let ataques2mana: any[] = []
    let ataques2propio: any[] = []
    this.combateDto?.personaje1.personajeEstadisticas.forEach(element => {
      let estat = {
          id: element.id, nombreEstadistica: element.nombre, valorPropio: element.valor, consumible: element.consumible
        }
        estadisticas1.push(estat)
    });
    this.combateDto?.personaje1.personajeAtaques.forEach(element => {
      for(let i in element.manaAtacante.keys){
        let mana = {
          estadistica: i,
          valor: element.manaAtacante.get(i)
        }
        ataques1mana.push(mana)
      }
      for(let i in element.estadisticasDefensor.keys){
        let estat = {
          estadistica: i,
          valor: element.estadisticasDefensor.get(i)
        }
        ataques1propio.push(estat)
      }
      let ataque = {
            id: element.id,
              nombre: element.nombre,
              dadoBase: element.dadoBase,
              ratioDado: element.ratioDado,
              danoAtaque: element.danoAtaque,
              statReducePropio: ataques1mana,
              statReduceRival: ataques1propio,
        }
        ataques1.push(ataque)
    });
    this.combateDto?.personaje2.personajeEstadisticas.forEach(element => {
      let estat = {
          id: element.id, nombreEstadistica: element.nombre, valorPropio: element.valor, consumible: element.consumible
        }
        estadisticas2.push(estat)
    });
    this.combateDto?.personaje2.personajeAtaques.forEach(element => {
      for(let i in element.manaAtacante.keys){
        let mana = {
          estadistica: i,
          valor: element.manaAtacante.get(i)
        }
        ataques2mana.push(mana)
      }
      for(let i in element.estadisticasDefensor.keys){
        let estat = {
          estadistica: i,
          valor: element.estadisticasDefensor.get(i)
        }
        ataques2propio.push(estat)
      }
      let ataque = {
            id: element.id,
              nombre: element.nombre,
              dadoBase: element.dadoBase,
              ratioDado: element.ratioDado,
              danoAtaque: element.danoAtaque,
              statReducePropio: ataques2mana,
              statReduceRival: ataques2propio,
        }
        ataques2.push(ataque)
    });
    this.personajeTuyo.set({
      id: this.combateDto?.personaje1.id,
      nombre: this.combateDto?.personaje1.personajeNombre,
      fotoUrl: this.combateDto?.personaje1.personajeFotoUrl,
      urlSprite: this.combateDto?.personaje1.personajeFotoUrl,
      vidaMaxima: this.combateDto?.personaje1.personajeVida, 
      vida: this.combateDto?.personaje1.personajeVida,
      estadisticasDelPersonaje: estadisticas1,
      ataquesDelPersonaje: ataques1
    });
    this.rival.set({
      id: this.combateDto?.personaje2.id,
      nombre: this.combateDto?.personaje2.personajeNombre,
      fotoUrl: this.combateDto?.personaje2.personajeFotoUrl,
      urlSprite: this.combateDto?.personaje2.personajeFotoUrl,
      vidaMaxima: this.combateDto?.personaje2.personajeVida, 
      vida: this.combateDto?.personaje2.personajeVida,
      estadisticasDelPersonaje: estadisticas2,
      ataquesDelPersonaje: ataques2
    });
  }

}

export interface CombatePersonjaesDto{
  id:number;
  personaje1: PersonajeDto
  personaje2: PersonajeDto
}

