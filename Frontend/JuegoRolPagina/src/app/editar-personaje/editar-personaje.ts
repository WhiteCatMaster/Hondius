import { Component, OnInit, signal } from '@angular/core'; // 1. Añadimos OnInit
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router'; // 2. Añadimos ActivatedRoute y Router

// 3. IMPORTANTE: Asegúrate de importar tu servicio API (ajusta la ruta si es necesario)
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
  personajeEditar = signal<Personaje>({
    id: null,
    nombre: '',
    urlSprite: '',
    vida: 0,
    ataquesDelPersonaje: [],
    estadisticasDelPersonaje: []
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
    console.log('Payload de personja enviado: ', payload);

    this.servicioAPI.actualizarPersonaje(this.idPersonaje, payload).subscribe({
      next: (respuesta) => {
        console.log('Se actualizo el personaje con exito')
        console.log(respuesta)
      },
      error: (error) =>{
        console.log('Ha ocurrido un error: ', error)
      }
    })
  }
  obtenerPersonajeBD(personajeDto: PersonajeDto) {

    //Supongo que deberia de hacer un GET a backend y recoger el combate por el id 
    //Para hacerlo mas sencillo solo voy a recoger los personajes del combate 
    this.personajeEditar.set(toPersonaje(personajeDto))
  }
}


export interface EstatDto {
  nombre: string,
  valorNuevo: number
}
export interface ActualizarPersonajeDto {
  nombre: string;
  //Un array en el que cada objeto es una estadistica con sus atibutos (nombre, id, ...)
  estadisticas: EstatDto[];
}
