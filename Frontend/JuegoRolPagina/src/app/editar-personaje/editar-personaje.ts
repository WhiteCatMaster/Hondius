import { Component, OnInit, signal } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router'; 
import { PersonajeDto, ServicioAPI, toPersonaje } from '../servicio-api';
import { Location } from '@angular/common';
import { Personaje } from '../models/personaje';

@Component({
  selector: 'app-editar-personaje',
  imports: [FormsModule],
  templateUrl: './editar-personaje.html',
  styleUrl: './editar-personaje.css',
})
export class EditarPersonaje implements OnInit {


  objetosDisponibles: ObjetoInventario[] = [
    { id: 1, nombre: "Poción de Vida Menor", urlImagen: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/3/3e/Potion_of_Healing_JE2_BE2.png/revision/latest/scale-to-width/360?cb=20191027040649", statAfectada: "Vida", valorBonus: 20 },
    { id: 2, nombre: "Elixir de Sabiduría", urlImagen: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/3/3e/Potion_of_Healing_JE2_BE2.png/revision/latest/scale-to-width/360?cb=20191027040649", statAfectada: "Maná", valorBonus: 15 },
    { id: 3, nombre: "Espada de Hierro", urlImagen: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/3/3e/Potion_of_Healing_JE2_BE2.png/revision/latest/scale-to-width/360?cb=20191027040649", statAfectada: "Fuerza", valorBonus: 10 }
  ];

  objetoSeleccionadoId: number | null = null;

  personajeEditar = signal<Personaje & { inventario?: ObjetoInventario[] }>({
    id: null,
    nombre: '',
    urlSprite: '',
    vida: 0,
    ataquesDelPersonaje: [],
    estadisticasDelPersonaje: [],
    inventario: [] 
  });
  
  nombreOriginal = '';
  idPersonaje = '';

  personaje: Personaje = {
    id: null,
    nombre: '',
    urlSprite: '',
    vida: 0,
    ataquesDelPersonaje: [],
    estadisticasDelPersonaje: []
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicioAPI: ServicioAPI,
    private location: Location
  ) {}

  ngOnInit() {
    let id = this.route.snapshot.paramMap.get('id');
    console.log(id)
    if (id) {
      this.idPersonaje = id;
      this.servicioAPI.obtenerPersonajexId(id).subscribe({
        next: (personajeBD) => {
          this.obtenerPersonajeBD(personajeBD);
          this.nombreOriginal = this.personajeEditar().nombre
          console.log(personajeBD)
        }
      })
    }
  }

  subirStat(index: number) {
    this.personajeEditar.update((pj) => {
      pj.estadisticasDelPersonaje[index].valorPropio++;
      return { ...pj };
    });
  }

  bajarStat(index: number) {
    this.personajeEditar.update((pj) => {
      pj.estadisticasDelPersonaje[index].valorPropio--;
      return { ...pj };
    });
  }

  // FUNCIONES DEL INVENTARIO 
  asignarObjeto() {
    if (this.objetoSeleccionadoId) {
      const objetoAAsignar = this.objetosDisponibles.find(obj => obj.id === this.objetoSeleccionadoId);
      if (objetoAAsignar) {
        this.personajeEditar.update((pj) => {
          // Si no tiene inventario inicializado, lo creamos
          if (!pj.inventario) pj.inventario = [];
          
          // Metemos una copia del objeto en la mochila del personaje
          pj.inventario.push({ ...objetoAAsignar });
          return { ...pj };
        });
        // Reseteamos el selector
        this.objetoSeleccionadoId = null;
      }
    }
  }

  quitarObjeto(index: number) {
    this.personajeEditar.update((pj) => {
      if (pj.inventario) {
        pj.inventario.splice(index, 1);
      }
      return { ...pj };
    });
  }

  volver() {
    this.location.back(); 
  }

  guardar() {
    console.log('Enviando datos al backend para:', this.nombreOriginal);
    let estats: EstatDto[] = [];
    for (let i of this.personajeEditar().estadisticasDelPersonaje) {
      console.log(`metiendo valores: `, i.nombreEstadistica,', ', i.valorPropio)
      let estat: EstatDto = {
        nombre: i.nombreEstadistica,
        valorNuevo: i.valorPropio
      }
      estats.push(estat)
    }

    let payload: ActualizarPersonajeDto = {
      nombre: this.personajeEditar().nombre,
      estadisticas: estats
    };
    console.log('Payload de personaje enviado: ', payload);

    this.servicioAPI.actualizarPersonaje(this.idPersonaje, payload).subscribe({
      next: (respuesta) => {
        console.log('Se actualizó el personaje con éxito')
        console.log(respuesta)
      },
      error: (error) =>{
        console.log('Ha ocurrido un error: ', error)
      }
    })
  }

  obtenerPersonajeBD(personajeDto: PersonajeDto) {
    // Al recoger los datos del backend, nos aseguramos de que tenga un array de inventario
    const personajeConvertido = toPersonaje(personajeDto);
    this.personajeEditar.set({ ...personajeConvertido, inventario: [] });
  }
}

export interface EstatDto {
  nombre: string,
  valorNuevo: number
}

export interface ActualizarPersonajeDto {
  nombre: string;
  estadisticas: EstatDto[];
}

//INTERFAZ DEL OBJETO
export interface ObjetoInventario {
  id: number;
  nombre: string;
  urlImagen: string;
  statAfectada: string;
  valorBonus: number;  
}