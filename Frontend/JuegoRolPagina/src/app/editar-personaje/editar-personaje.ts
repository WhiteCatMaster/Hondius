import { Component, OnInit, signal } from '@angular/core'; // 1. Añadimos OnInit
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router'; // 2. Añadimos ActivatedRoute y Router

// 3. IMPORTANTE: Asegúrate de importar tu servicio API (ajusta la ruta si es necesario)
import { ServicioAPI } from '../servicio-api';
import { PersonajeDto } from '../selectorELIMINAR.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-editar-personaje',
  imports: [FormsModule],
  templateUrl: './editar-personaje.html',
  styleUrl: './editar-personaje.css',
})
export class EditarPersonaje implements OnInit {
  personajeEditar = signal<any>(null);
  nombreOriginal = '';
  combateDto: PersonajeDto | null = null;
  idPersonaje = '';

  personaje: any = {
    nombre: 'Guerrero Valiente',
    fotoUrl:
      'https://img.freepik.com/vector-gratis/caballero-personaje-dibujos-animados-espada_1308-127704.jpg?semt=ais_hybrid&w=740&q=80',
    estadisticas: [
      { nombre: 'Fuerza Bruta', valor: 25 },
      { nombre: 'Armadura', valor: 15 },
      { nombre: 'Maná Oscuro', valor: 100 },
      { nombre: 'Velocidad', valor: 8 },
      { nombre: 'Suerte', valor: 2 },
    ],
    ataques: [
      {
        nombre: 'Hachazo Feroz',
        dadoBase: 20,
        statReducePropio: [{ estadistica: 'Estamina', valor: 10 }],
        statReduceRival: [{ estadistica: 'Vida', valor: 20 }],
      },
      {
        nombre: 'Grito de Guerra',
        dadoBase: 12,
        statReducePropio: [{ estadistica: 'Maná', valor: 5 }],
        statReduceRival: [
          { estadistica: 'Defensa', valor: 5 },
          { estadistica: 'Esquiva', valor: 2 },
        ],
      },
      {
        nombre: 'Embestida',
        dadoBase: 8,
        statReducePropio: [{ estadistica: 'Fuerza', valor: 3 }],
        statReduceRival: [],
      },
    ],
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
        next: (personjaeBD) => {
          this.combateDto = personjaeBD;
          this.obtenerPersonajeBD();
          this.nombreOriginal = this.personajeEditar().nombre
          console.log(this.combateDto)
        }
      })
    }
  }


  subirStat(index: number) {
    this.personajeEditar.update((pj) => {
      pj.estadisticas[index].valor++;
      return { ...pj };
    });
  }

  bajarStat(index: number) {
    this.personajeEditar.update((pj) => {
      pj.estadisticas[index].valor--;
      return { ...pj };
    });
  }

  volver() {
    this.location.back(); 
  }

  guardar() {
    console.log('Enviando datos al backend para:', this.nombreOriginal);
    let estats: EstatDto[] = [];
    for (let i of this.personajeEditar().estadisticas) {
      console.log(`metiendo valores: `, i["nombre"],', ', i["valor"])
      let estat: EstatDto = {
        nombre: i["nombre"],
        valorNuevo: i["valor"]
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
  obtenerPersonajeBD() {

    //Supongo que deberia de hacer un GET a backend y recoger el combate por el id 
    //Para hacerlo mas sencillo solo voy a recoger los personajes del combate 
    let estadisticas1: any[] = []
    let ataques1: any[] = []
    let ataques1mana: any[] = []
    let ataques1propio: any[] = []
    this.combateDto?.personajeEstadisticas.forEach(element => {
      let estat = {
        id: element.id,
        nombre: element.nombre,
        valor: element.valor,
        consumible: element.consumible
      }
      estadisticas1.push(estat)
    });
    this.combateDto?.personajeAtaques.forEach(element => {
      console.log(element.manaAtacante)
      for (let i in element.manaAtacante) {
        console.log(i)
        let mana = {
          estadistica: i,
          valor: 10
        }
        console.log(mana)
        ataques1mana.push(mana)
      }
      for (let i in element.estadisticasDefensor.keys) {
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
      console.log(ataque)
      ataques1.push(ataque)
    });

    this.personajeEditar.set({
      id: this.combateDto?.id,
      nombre: this.combateDto?.personajeNombre,
      fotoUrl: this.combateDto?.personajeFotoUrl,
      urlSprite: this.combateDto?.personajeFotoUrl,
      vidaMaxima: this.combateDto?.personajeVida,
      vida: this.combateDto?.personajeVida,
      estadisticas: estadisticas1,
      ataques: ataques1
    });
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
