import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partida } from './models/partida';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ServicioAPI } from './servicio-api';

@Component({
  selector: 'app-combate',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './selectorELIMINAR.component.html',
  styleUrl: './selectorELIMINAR.component.css',
})
export class SelectorComponent implements OnInit {
  partidaActual = signal<Partida | null>(null);
  partidaDto: DatosPartidaDto|null = null;
  partidaID: string | null = null;
  constructor(
    private route: ActivatedRoute,
    private servicioAPI: ServicioAPI,
  ) {}

  // Dado
  estaRodando = true;
  caraDelDado = 20;

  tirarDado() {
    const resultado = Math.floor(Math.random() * 20) + 1;
    this.estaRodando = false;
    this.caraDelDado = resultado;
  }

  // Lo otro, lo de la base de datos temporal
  ngOnInit(): void {
    this.partidaID = this.route.snapshot.paramMap.get('id');
    //this.cargarPartidaDePrueba();
    if (this.partidaID) {
      this.servicioAPI.obtenerDatosPartida(this.partidaID).subscribe({
        next: (partidaBackend) => {
            this.partidaDto = partidaBackend;
            
            this.cargasPartidasBD()
            console.log(this.partidaActual)
        },
      });
    }

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
          urlSprite: 'https://i.pinimg.com/474x/9c/0f/06/9c0f06b14aba220811331c49718d6b93.jpg',
          vida: 100,
          estadisticasDelPersonaje: [
            { id: null, nombreEstadistica: 'Fuerza', valorPropio: 15, consumible: false },
            { id: null, nombreEstadistica: 'Maná', valorPropio: 50, consumible: true },
          ],
          ataquesDelPersonaje: [
            {
              id: null,
              nombre: 'Golpe Rompecráneos',
              dadoBase: 20,
              ratioDado: [1, 20],
              danoAtatque: 10,
              statReducePropio: [{ estadistica: 'Maná', valor: 10 }],
              statReduceRival: [{ estadistica: 'Vida', valor: 25 }],
            },
          ],
        },
        {
          id: null,
          nombre: 'Mago Oscuro',
          urlSprite: 'https://i.pinimg.com/474x/9c/0f/06/9c0f06b14aba220811331c49718d6b93.jpg',
          vida: 70,
          estadisticasDelPersonaje: [
            { id: null, nombreEstadistica: 'Inteligencia', valorPropio: 20, consumible: false },
            { id: null, nombreEstadistica: 'Maná', valorPropio: 120, consumible: true },
          ],
          ataquesDelPersonaje: [
            {
              id: null,
              nombre: 'Bola de Fuego',
              dadoBase: 20,
              ratioDado: [1, 20],
              danoAtaque: 10,
              statReducePropio: [{ estadistica: 'Maná', valor: 30 }],
              statReduceRival: [{ estadistica: 'Vida', valor: 45 }],
            },
          ],
        },
      ],
    } as any);
  }

  cargasPartidasBD(){
    let personajes: any[] = []
    this.partidaDto?.jugadores.forEach(element => {
      let estats:any[] = [];
      let ataques:any[] = []
      element.personajeEstadisticas.forEach(element => {
        let estat = {
          id: element.id, nombreEstadistica: element.nombre, valorPropio: element.valor, consumible: element.consumible
        }
        estats.push(estat)
      });
      element.personajeAtaques.forEach(element => {
        let ataque = {
            id: element.id,
              nombre: element.nombre,
              dadoBase: element.dadoBase,
              ratioDado: element.ratioDado,
              danoAtatque: element.danoAtaque,
              statReducePropio: element.manaAtacante,
              statReduceRival: element.estadisticasDefensor,
        }
        ataques.push(ataque)
      });
      let personaje = {
        id: element.id,
          nombre: element.personajeNombre,
          urlSprite: element.personajeFotoUrl,
          vida: element.personajeVida,
          estadisticasDelPersonaje : estats,
          ataquesDelPersonaje : ataques
      }
      personajes.push(personaje);
    });
    this.partidaActual.set({
      id:this.partidaDto?.id,
      nombre: this.partidaDto?.nombre,
      descripcion: this.partidaDto?.descripcion,
      idioma: this.partidaDto?.idioma,
      maxJugadores: this.partidaDto?.maximoJugadores,
      personajes: personajes
    } as any)
  }


}


export interface EstadisticaDto{
  id: number;
  nombre: string;
  valor : number;
  consumible: boolean;
}
export interface AtaqueDto{
  id:number;
  nombre : string;
  manaAtacante: Map<string, number>
  estadisticasDefensor: Map<string, number>
  dadoBase: number;
  ratioDado: number[];
  danoAtaque: number;
}

export interface PersonajeDto {
  id: number;
  personajeNombre : string;
  personajeVida: number;
  personajeFotoUrl: string;
  personajeEstadisticas: EstadisticaDto[];
  personajeAtaques: AtaqueDto[];
}
export interface DatosPartidaDto{
  id: number;
  nombre: string;
  descripcion: string;
  idioma: string;
  maximoJugadores: number;
  jugadores: PersonajeDto[]
}
