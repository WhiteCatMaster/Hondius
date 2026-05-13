import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicioAPI } from '../servicio-api';
import { UsuarioService } from '../servicios/usuario-service';
import { CpuComponent } from '../combate/cpu.component';

@Component({
  selector: 'app-combate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector.component.html',
  styleUrl: './selector.component.css',
})
export class SelectorPersonajeComponent implements OnInit {
  partidaActual = signal<any | null>(null);
  partidaDto: DatosPartidaDto | null = null;
  combateID= signal<number>(-1);

  // Dado
  estaRodando = true;
  caraDelDado = 20;
  heroeSeleccionado: any = null;
  enemigoSeleccionado: any = null;

  constructor(
    private router: Router,
    private servicioAPI: ServicioAPI,
    private route: ActivatedRoute,
    public usuarioService : UsuarioService,
    public cpu: CpuComponent
  ) {}

  // Lo otro, lo de la base de datos temporal
  ngOnInit(): void {
    //this.cargarPartidaDePrueba();
    let partidaID = this.route.snapshot.paramMap.get('id');
    if (partidaID) {
      this.servicioAPI.obtenerDatosPartida(partidaID).subscribe({
        next: (partidaBackend) => {
          this.partidaDto = partidaBackend;
          this.cargasPartidasBD();
          console.log(this.partidaActual());
        },
      });
    }
  }

  seleccionarHeroe(personaje: any) {
    this.heroeSeleccionado = personaje;
    console.log('Héroe elegido:', personaje);
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

    
    this.enviarCombateBackend().subscribe({
      next: (combateBackend) => {
        // 1. Guardamos el ID real que nos dio Spring Boot
        this.combateID.set(combateBackend.id);
        
        console.log('ID del combate real:', this.combateID());
        
        // 2. AHORA SÍ, navegamos a la pantalla usando el ID real
        this.router.navigate(['/jugar-combate', this.combateID()]);
      },
      error: (err) => {
        alert('Hubo un error al crear el combate en el servidor');
        console.error(err);
        this.router.navigate(['/jugar-combate', this.combateID()]);
      }
    });
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
            { nombreEstadistica: 'Energía', valorPropio: 50, consumible: true },
          ],
          ataquesDelPersonaje: [
            {
              id: null,
              nombre: 'Golpe Rompecráneos',
              dadoBase: 20,
              ratioDado: [19, 20],
              statReducePropio: [{ estadistica: 'Energía', valor: 10 }],
              statReduceRival: [{ estadistica: 'Vida', valor: 25 }],
            },
          ],
        },
        {
          id: 2,
          nombre: 'Mago Oscuro',
          fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          vida: 70,
          estadisticasDelPersonaje: [
            { nombreEstadistica: 'Inteligencia', valorPropio: 20, consumible: false },
            { nombreEstadistica: 'Maná', valorPropio: 120, consumible: true },
          ],
          ataquesDelPersonaje: [
            {
              id: null,
              nombre: 'Bola de Fuego',
              dadoBase: 20,
              ratioDado: [18, 20],
              statReducePropio: [{ estadistica: 'Maná', valor: 30 }],
              statReduceRival: [{ estadistica: 'Vida', valor: 45 }],
            },
          ],
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
            { nombreEstadistica: 'Energía', valorPropio: 80, consumible: true },
          ],
          ataquesDelPersonaje: [
            {
              id: null,
              nombre: 'Puñalada Trapera',
              dadoBase: 20,
              ratioDado: [15, 20],
              statReducePropio: [{ estadistica: 'Energía', valor: 15 }],
              statReduceRival: [{ estadistica: 'Vida', valor: 35 }],
            },
          ],
        },
        {
          id: 4,
          nombre: 'Clérigo de la Luz',
          fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          vida: 100,
          estadisticasDelPersonaje: [
            { nombreEstadistica: 'Sabiduría', valorPropio: 17, consumible: false },
            { nombreEstadistica: 'Fe', valorPropio: 100, consumible: true },
          ],
          ataquesDelPersonaje: [
            {
              id: null,
              nombre: 'Castigo Divino',
              dadoBase: 20,
              ratioDado: [19, 20],
              statReducePropio: [{ estadistica: 'Fe', valor: 20 }],
              statReduceRival: [{ estadistica: 'Vida', valor: 30 }],
            },
          ],
        },
        {
          id: 5,
          nombre: 'Bárbaro Furioso',
          fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          urlSprite: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Serinus_canaria_gelb.JPG',
          vida: 150,
          estadisticasDelPersonaje: [
            { nombreEstadistica: 'Fuerza Bruta', valorPropio: 22, consumible: false },
            { nombreEstadistica: 'Furia', valorPropio: 50, consumible: true },
          ],
          ataquesDelPersonaje: [
            {
              id: null,
              nombre: 'Hachazo Salvaje',
              dadoBase: 20,
              ratioDado: [17, 20],
              statReducePropio: [{ estadistica: 'Furia', valor: 15 }],
              statReduceRival: [{ estadistica: 'Vida', valor: 40 }],
            },
          ],
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
            { nombreEstadistica: 'Carcaj', valorPropio: 30, consumible: true },
          ],
          ataquesDelPersonaje: [
            {
              id: null,
              nombre: 'Flecha Perforante',
              dadoBase: 20,
              ratioDado: [16, 20],
              statReducePropio: [{ estadistica: 'Carcaj', valor: 1 }],
              statReduceRival: [{ estadistica: 'Vida', valor: 28 }],
            },
          ],
        },
      ],
    } as any);
  }
  cargasPartidasBD() {
    let personajes: any[] = [];
    this.partidaDto?.jugadores.forEach((element) => {
      console.log(element);
      let estats: any[] = [];
      let ataques: any[] = [];
      element.personajeEstadisticas.forEach((element) => {
        let estat = {
          id: element.id,
          nombreEstadistica: element.nombre,
          valorPropio: element.valor,
          consumible: element.consumible,
        } as any;
        estats.push(estat);
      });
      element.personajeAtaques.forEach((element) => {
        let ataque = {
          id: element.id,
          nombre: element.nombre,
          dadoBase: element.dadoBase,
          ratioDado: element.ratioDado,
          danoAtatque: element.danoAtaque,
          statReducePropio: element.manaAtacante,
          statReduceRival: element.estadisticasDefensor,
        } as any;
        ataques.push(ataque);
      });
      let personaje = {
        id: element.id,
        nombre: element.personajeNombre,
        urlSprite: element.personajeFotoUrl,
        vida: element.personajeVida,
        estadisticasDelPersonaje: estats,
        ataquesDelPersonaje: ataques,
      } as any;
      personajes.push(personaje);
      console.log(element.personajeFotoUrl)
    });
    this.partidaActual.set({
      id: this.partidaDto?.id,
      nombre: this.partidaDto?.nombre,
      descripcion: this.partidaDto?.descripcion,
      idioma: this.partidaDto?.idioma,
      maxJugadores: this.partidaDto?.maximoJugadores,
      personajes: personajes,
    } as any);
  }

  //Funcion para enviar los personajes que van a aprticipar en el combate
  enviarCombateBackend() {
    const usuarioId = this.usuarioService.usuarioActual()?.id;
    let payload = {
      id: null,
      nombre: 'nombreCombate',
      jugador1: {
        id: null,
        usuarioId: usuarioId,
        rol: 'JUGADOR',
        personajeId: this.heroeSeleccionado.id,
      },
      jugador2: {
        id: null,
        usuarioId: usuarioId,
        rol: 'JUGADOR',
        personajeId: this.enemigoSeleccionado.id,
      },
      juegoId: this.partidaActual().id
    };
    return this.servicioAPI.enviarCombate(payload);
  }
}

export interface EstadisticaDto {
  id: number;
  nombre: string;
  valor: number;
  consumible: boolean;
}
export interface AtaqueDto {
  id: number;
  nombre: string;
  manaAtacante: Map<string, number>;
  estadisticasDefensor: Map<string, number>;
  dadoBase: number;
  ratioDado: number[];
  danoAtaque: number;
}

export interface PersonajeDto {
  id: number;
  personajeNombre: string;
  personajeVida: number;
  personajeFotoUrl: string;
  personajeEstadisticas: EstadisticaDto[];
  personajeAtaques: AtaqueDto[];
}
export interface DatosPartidaDto {
  id: number;
  nombre: string;
  descripcion: string;
  idioma: string;
  maximoJugadores: number;
  jugadores: PersonajeDto[];
}
