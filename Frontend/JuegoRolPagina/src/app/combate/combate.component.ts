import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partida } from '../models/partida';
import { computed } from '@angular/core'; 
import { ActivatedRoute } from '@angular/router';
import { ServicioAPI } from '../servicio-api';
import { Router } from '@angular/router';
import { PersonajeDto } from '../selectorELIMINAR.component';
import { UsuarioService } from '../servicios/usuario-service';
import { LanzadorDadosComponent } from '../lanzador-dados/lanzador-dados.component';
import { CpuComponent } from './cpu.component';

@Component({
  selector: 'app-combate',
  standalone: true,
  imports: [CommonModule, LanzadorDadosComponent], 
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
  turnoTuyo = true;

  estaAtacandoTuyo = false;
  estaAtacandoRival = false;
  recibiendoTuyo = false;
  recibiendoRival = false;
  muerteTuyo = false;
  muerteRival = false;

  TuTurno = true;

  get usarCpu(): boolean { return this.cpu.usarCpu; }
  get dificultadCpu(): number { return this.cpu.dificultad; }

  constructor(
    private route: ActivatedRoute,
    private servicioAPI: ServicioAPI,
    public usuarioService: UsuarioService,
    private router: Router,
    private cpu: CpuComponent
  ){}

  // El computed este es para que se actualice en tiempo real
  vidaTuya = computed(() => this.personajeTuyo()?.vida || 0);
  vidaRival = computed(() => this.rival()?.vida || 0);

  resultadoUltimoDado = signal<number>(0);

  ejecutarTurnoConDado(resultadoDado: number) {
    this.resultadoUltimoDado.set(resultadoDado);
    if (this.turnoTuyo == true) {
      this.pasarTurnoTuyo();
      if (this.usarCpu && !this.turnoTuyo && this.rival() && this.rival().vida > 0) {
        setTimeout(() => this.ejecutarTurnoCpu(), 1000);
      }
    } else {
      this.pasarTurnoRival()
    }

  }

  ejecutarTurnoCpu() {
    const rivalActual = this.rival();
    if (!rivalActual || !rivalActual.ataquesDelPersonaje) {
      this.turnoTuyo = true;
      this.TuTurno = true;
      return;
    }

    const ataquesAsequibles = rivalActual.ataquesDelPersonaje.filter((atc: any) => {
      if (!atc.statReducePropio) return true;
      for (const coste of atc.statReducePropio) {
        const stat = rivalActual.estadisticasDelPersonaje.find((e: any) => e.nombreEstadistica === coste.estadistica);
        if (!stat || stat.valorPropio < coste.valor) return false;
      }
      return true;
    });

    const ataque = this.cpu.elegirAtaque(ataquesAsequibles, this.dificultadCpu);
    if (!ataque) {
      this.turnoTuyo = true;
      this.TuTurno = true;
      return;
    }

    this.ataqueSeleccionado.set(ataque);

    const total = ataque.dadoBase && ataque.dadoBase > 0 ? ataque.dadoBase : 6;
    const dado = Math.floor(Math.random() * total) + 1;
    this.resultadoUltimoDado.set(dado);

    this.pasarTurnoRival();
  }

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
        let dano = this.ataqueSeleccionado().danoAtaque;
        const datosPaloma = this.rival();

        const rangoCritico = this.ataqueSeleccionado().ratioDado[0]; 
        const rangoNormal = this.ataqueSeleccionado().ratioDado[1];
        const dado = this.resultadoUltimoDado()

        if(dado == rangoCritico) {
          dano = dano * 2; 
        } else if(dado == rangoNormal) { 
          dano = dano * 1.5; 
        }

        this.recibiendoRival = true;
        setTimeout(() => {
          this.recibiendoRival = false;
        }, 300);

        this.estaAtacandoTuyo = true;
        setTimeout(() => {
          this.estaAtacandoTuyo = false;
        }, 200);

        datosPaloma.vida = datosPaloma.vida - dano;

        if (datosPaloma.vida <= 0) {
          this.muerteRival = true;
          setTimeout(() => {
            alert("¡Has ganado la batalla!");
            this.router.navigate(['/']); 
          }, 1500);
        }

        this.rival.set(datosPaloma);
        
      } else {
        alert("No tienes recursos suficientes para este ataque.");
      }

      this.ataqueSeleccionado.set(null);
      this.turnoTuyo = false;
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
        let dano = this.ataqueSeleccionado().danoAtaque;
        const datosCanario = this.personajeTuyo();
        
        const rangoCritico = this.ataqueSeleccionado().ratioDado[0]; 
        const rangoNormal = this.ataqueSeleccionado().ratioDado[1];
        const dado = this.resultadoUltimoDado()

        if(dado == rangoCritico) {
          dano = dano * 2; 
        } else if(dado == rangoNormal) { 
          dano = dano * 1.5; 
        }

        this.estaAtacandoRival = true;
        setTimeout(() => {
          this.estaAtacandoRival = false;
        }, 200);

        this.recibiendoTuyo = true;
        setTimeout(() => {
          this.recibiendoTuyo = false;
        }, 300);



        datosCanario.vida = datosCanario.vida - dano;

        if (datosCanario.vida <= 0) {
          this.muerteTuyo = true;
          setTimeout(() => {
            alert("¡Has perdido la batalla!");
            this.router.navigate(['/']); 
          }, 1500);
        }


        this.personajeTuyo.set(datosCanario);
        
      } else {
        alert("No tienes recursos suficientes para este ataque.");
      }

      this.ataqueSeleccionado.set(null);
      this.turnoTuyo = true;
    }
  }

  seleccionarAtaque(ataquePulsado: any) {
    this.ataqueSeleccionado.set(ataquePulsado); 
    console.log("Has seleccionado:", this.ataqueSeleccionado().nombre); 
  }


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
          id: element.id, nombreEstadistica: element.nombre, valorPropio: Number(element.valor), consumible: element.consumible
        }
        estadisticas1.push(estat)
    });
    this.combateDto?.personaje1.personajeAtaques.forEach(element => {
      let ataques1mana: any[] = []; 
      let ataques1propio: any[] = [];

      if (element.manaAtacante) {
        Object.keys(element.manaAtacante as any).forEach(key => {
          ataques1mana.push({
            estadistica: key,
            valor: Number((element.manaAtacante as any)[key])
          });
        });
      }

      if (element.estadisticasDefensor) {
        Object.keys(element.estadisticasDefensor as any).forEach(key => {
          ataques1propio.push({
            estadistica: key,
            valor: Number((element.estadisticasDefensor as any)[key])
          });
        });
      }

      if (element.estadisticasDefensor) {
        Object.keys(element.estadisticasDefensor as any).forEach(key => {
          ataques1propio.push({
            estadistica: key,
            valor: Number((element.estadisticasDefensor as any)[key])
          });
        });
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
          id: element.id, nombreEstadistica: element.nombre, valorPropio: Number(element.valor), consumible: element.consumible
        }
        estadisticas2.push(estat)
    });
    this.combateDto?.personaje2.personajeAtaques.forEach(element => {
      let ataques2mana: any[] = []; 
      let ataques2propio: any[] = [];

      if (element.manaAtacante) {
        Object.keys(element.manaAtacante as any).forEach(key => {
          ataques2mana.push({
            estadistica: key,
            valor: Number((element.manaAtacante as any)[key])
          });
        });
      }

      if (element.estadisticasDefensor) {
        Object.keys(element.estadisticasDefensor as any).forEach(key => {
          ataques2propio.push({
            estadistica: key,
            valor: Number((element.estadisticasDefensor as any)[key])
          });
        });
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