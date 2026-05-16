import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partida } from '../models/partida';
import { computed } from '@angular/core'; 
import { ActivatedRoute } from '@angular/router';
import { CombatePersonajesDto, ServicioAPI, toPersonaje } from '../servicio-api';
import { MusicaService } from '../servicio/musica.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UsuarioService } from '../servicios/usuario-service';
import { LanzadorDadosComponent } from '../lanzador-dados/lanzador-dados.component';
import { CpuComponent } from './cpu.component';
import { Personaje } from '../models/personaje';
import { Ataque } from '../models/ataque';

@Component({
  selector: 'app-combate',
  standalone: true,
  imports: [CommonModule, LanzadorDadosComponent], 
  templateUrl: './combate.component.html',
  styleUrl: './combate.component.css'
})
export class CombateComponent implements OnInit {
  personajeTuyo = signal<Personaje>({
    id: null,
    nombre: '',
    urlSprite: '',
    vida: 0,
    ataquesDelPersonaje: [],
    estadisticasDelPersonaje: []
  });
  vidaMaximaTuyo = signal<number>(0)
  vidaMaximaRival = signal<number>(0)

  rival = signal<Personaje>({
    id: null,
    nombre: '',
    urlSprite: '',
    vida: 0,
    ataquesDelPersonaje: [],
    estadisticasDelPersonaje: []
  });

  ataqueSeleccionado = signal<Ataque>({
    id: null,
    nombre: '',
    dadoBase: 0,
    ratioDado: [],
    statReducePropio: [],
    statReduceRival: [],
    danoAtaque: 0
  });
  combateId: string | null = null;
  
  ambasEstatsBien = false;
  turnoTuyo = true;

  // Esto hay que hacerlo porque, de lo contrario, angular bloquea enlaces (al parecer)
  musicaSegurizada: SafeResourceUrl | null = null;

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
    private cpu: CpuComponent,
    private cdr: ChangeDetectorRef, 
    private musicaService: MusicaService,
    private sanitizer: DomSanitizer 
  ){}

  // El computed este es para que se actualice en tiempo real
  vidaTuya = computed(() => this.personajeTuyo().vida || 0);
  vidaRival = computed(() => this.rival().vida || 0);

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

    // MCTS filtra internamente via getLegalActions() — pasamos todo
    const ataque = this.cpu.elegirAtaque(
      rivalActual.ataquesDelPersonaje,
      this.dificultadCpu,
      rivalActual.estadisticasDelPersonaje,
      this.personajeTuyo()?.vida ?? 100
    );
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
    console.log(this.ataqueSeleccionado())
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
            (e) => e.nombreEstadistica === coste.estadistica
          );

          if(miStat && miStat?.valorPropio >= coste.valor) {
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
              (e) => e.nombreEstadistica === estadistica.estadistica
            );
            if(miStat) miStat.valorPropio -= estadistica.valor;
            console.log('Stat:', miStat?.valorPropio, ", reducir:", estadistica.valor)
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
          this.cdr.detectChanges();
        }, 1000);

        this.estaAtacandoTuyo = true;
        setTimeout(() => {
          this.estaAtacandoTuyo = false;
          this.cdr.detectChanges();
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

      this.ataqueSeleccionado.set({
        id: null,
        nombre: '',
        dadoBase: 0,
        ratioDado: [],
        statReducePropio: [],
        statReduceRival: [],
        danoAtaque: 0
      });
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

          if(miStat && miStat.valorPropio >= coste.valor) {
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

            if (miStat) miStat.valorPropio = miStat.valorPropio - estadistica.valor;
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
          this.cdr.detectChanges();
        }, 1000);



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

      this.ataqueSeleccionado.set({
        id: null,
        nombre: '',
        dadoBase: 0,
        ratioDado: [],
        statReducePropio: [],
        statReduceRival: [],
        danoAtaque: 0
      });
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
            this.cargarPersonajesBD(partidaBackend)
            console.log(partidaBackend)
        },
      });
    }

    const urlGuardada = this.musicaService.urlYoutube();
    
    if (urlGuardada) {
      this.musicaSegurizada = this.sanitizer.bypassSecurityTrustResourceUrl(urlGuardada);
    }
  }


  cargarPersonajesBD(dto: CombatePersonajesDto){
    //Supongo que deberia de hacer un GET a backend y recoger el combate por el id 
    //Para hacerlo mas sencillo solo voy a recoger los personajes del combate 
    let personajeTuyo = toPersonaje(dto.personaje1)
    this.vidaMaximaTuyo.set(personajeTuyo.vida)
    let rival = toPersonaje(dto.personaje2)
    this.vidaMaximaRival.set(rival.vida)
    this.personajeTuyo.set(personajeTuyo);
    this.rival.set(rival);
  }

}