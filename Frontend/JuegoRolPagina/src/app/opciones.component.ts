import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Estadistica } from './models/estadistica';
import { Personaje, EstadisticaPersonaje } from './models/personaje';
import { Ataque } from './models/ataque';
import { Usuario } from './models/usuario';
import { JugadorJuego, Rol } from './models/jugador-juego';
import { Partida } from './models/partida';
import { ServicioAPI } from './servicio-api';
import { Dado } from './models/dado';
import { UsuarioService } from './servicios/usuario-service';
import { Objeto } from './models/objeto';

// Interfaz ampliada para el objeto completo que se guarda
export interface ObjetoCompleto {
  nombre: string;
  descripcion: string;
  imagen: string;
  // Efectos sobre el propio usuario (positivos o negativos)
  efectosPropios: { estadistica: string; valor: number }[];
  // Efectos sobre el rival (positivos o negativos)
  efectosRival: { estadistica: string; valor: number }[];
  // Cuántas veces se puede usar (0 = ilimitado)
  usos: number;
  // Si se consume al usarse
  consumible: boolean;
}

@Component({
  selector: 'app-opciones',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './opciones.component.html',
  styleUrl: './opciones.component.css',
})
export class OpcionesComponent {
  constructor(
    private servicioAPI: ServicioAPI,
    public usuarioService: UsuarioService,
  ) {}

  nombre = '';
  descripcion = '';
  idioma = '';
  maxJugadores = 0;

  paso = 1;
  estadisticas: Estadistica[] = [
    {
      nombre: '',
      valor: 0,
      consumible: false,
      id: null,
    },
  ];
  ataques: Ataque[] = [
    {
      nombre: '',
      id: null,
      dadoBase: 0,
      ratioDado: [],
      statReducePropio: [],
      statReduceRival: [],
      danoAtaque: 0,
    },
  ];

  dados: Dado[] = [
    {
      nombre: '',
      caras: 6,
      cantidad: 1,
    },
  ];
  personajes: Personaje[] = [
    {
      nombre: '',
      urlSprite: 'https://i.pinimg.com/474x/9c/0f/06/9c0f06b14aba220811331c49718d6b93.jpg',
      vida: 100,
      ataquesDelPersonaje: [
        {
          nombre: '',
          dadoBase: 0,
          ratioDado: [],
          statReducePropio: [{ estadistica: '', valor: 0 }],
          statReduceRival: [{ estadistica: '', valor: 0 }],
          id: null,
          danoAtaque: 0,
        },
      ],
      estadisticasDelPersonaje: [
        {
          nombreEstadistica: '',
          valorPropio: 0,
          consumible: false,
        },
      ],
      id: null,
      fotoUrl: '',
    },
  ];

  // ── OBJETOS ──────────────────────────────────────────────────────────────────
  // Lista final de objetos ya creados y guardados
  objetos: ObjetoCompleto[] = [];

  // ─ Estado del creador de objeto activo ─
  nombreObjetoActual: string = '';
  descripcionObjetoActual: string = '';
  imagenObjetoActual: string = '';
  usosObjetoActual: number = 1;
  consumibleObjetoActual: boolean = true;

  // Efectos del objeto (arrastrables)
  efectosPropiosObjeto: { nombre: string; valor: number; signo: 1 | -1 }[] = [];
  efectosRivalObjeto:   { nombre: string; valor: number; signo: 1 | -1 }[] = [];

  // Item que se está arrastrando (compartido con los ataques)
  itemArrastradoObjeto: any = null;

  iniciarArrastreObjeto(stat: any) {
    this.itemArrastradoObjeto = stat;
  }

  permitirDropObjeto(event: any) {
    event.preventDefault();
  }

  soltarEnEfectoPropio() {
    if (this.itemArrastradoObjeto) {
      this.efectosPropiosObjeto.push({
        nombre: this.itemArrastradoObjeto.nombre,
        valor: 1,
        signo: 1,
      });
      this.itemArrastradoObjeto = null;
    }
  }

  soltarEnEfectoRival() {
    if (this.itemArrastradoObjeto) {
      this.efectosRivalObjeto.push({
        nombre: this.itemArrastradoObjeto.nombre,
        valor: 1,
        signo: -1,
      });
      this.itemArrastradoObjeto = null;
    }
  }

  incrementarEfectoObjeto(item: any) {
    item.valor = Number((item.valor + 1).toFixed(0));
  }

  decrementarEfectoObjeto(item: any) {
    if (item.valor > 1) {
      item.valor = Number((item.valor - 1).toFixed(0));
    }
  }

  toggleSignoEfecto(item: any) {
    item.signo = item.signo === 1 ? -1 : 1;
  }

  eliminarEfectoPropio(index: number) {
    this.efectosPropiosObjeto.splice(index, 1);
  }

  eliminarEfectoRival(index: number) {
    this.efectosRivalObjeto.splice(index, 1);
  }

  guardarObjetoActual() {
    if (this.nombreObjetoActual.trim() === '') {
      alert('¡El objeto necesita un nombre!');
      return;
    }

    const objetoFinal: ObjetoCompleto = {
      nombre: this.nombreObjetoActual,
      descripcion: this.descripcionObjetoActual,
      imagen: this.imagenObjetoActual || 'assets/img/objetos/default.png',
      efectosPropios: this.efectosPropiosObjeto.map(e => ({
        estadistica: e.nombre,
        valor: e.signo * e.valor,
      })),
      efectosRival: this.efectosRivalObjeto.map(e => ({
        estadistica: e.nombre,
        valor: e.signo * e.valor,
      })),
      usos: this.usosObjetoActual,
      consumible: this.consumibleObjetoActual,
    };

    this.objetos.push(objetoFinal);
    console.log('Objeto creado:', objetoFinal);
    alert(`¡Objeto "${this.nombreObjetoActual}" creado con éxito!`);

    // Resetear el formulario del creador
    this.nombreObjetoActual = '';
    this.descripcionObjetoActual = '';
    this.imagenObjetoActual = '';
    this.usosObjetoActual = 1;
    this.consumibleObjetoActual = true;
    this.efectosPropiosObjeto = [];
    this.efectosRivalObjeto = [];
  }

  eliminarObjeto(index: number) {
    this.objetos.splice(index, 1);
  }

  // ── FIN OBJETOS ───────────────────────────────────────────────────────────────

  faltanEstadisticas = false;
  faltasAtaques = false;
  ataquesConNumeros = false;

  juegoCreado: Partida = {
    id: null,
    nombre: this.nombre,
    descripcion: this.descripcion,
    idioma: this.idioma,
    maxJugadores: this.maxJugadores,
  };
  usuarioPrueba: Usuario = {
    id: null,
    googleId: '123456789',
    email: 'usuario@prueba.com',
    nombre: 'usuario 1',
    fotoUrl: 'https://i.pinimg.com/474x/9c/0f/06/9c0f06b14aba220811331c49718d6b93.jpg',
    partidasParticipa: [],
  };
  jugadorJuego: JugadorJuego = {
    id: null,
    usuario: this.usuarioPrueba,
    juego: this.juegoCreado,
    rol: Rol.Admin,
  };

  irSiguiente() {
    if (this.paso == 1) {
      if (this.nombre == '') {
        alert('Introduce un nombre');
        return;
      }
    }

    if (this.paso == 2) {
      for (let estadistica of this.estadisticas) {
        if (estadistica.nombre == '' || estadistica.valor == null) {
          this.faltanEstadisticas = true;
        }
      }
      if (this.faltanEstadisticas == true) {
        alert('Faltan campos');
        this.faltanEstadisticas = false;
        return;
      }
    }

    if (this.paso == 3) {
      for (let personaje of this.personajes) {
        if (personaje.estadisticasDelPersonaje[0].nombreEstadistica == '') {
          personaje.estadisticasDelPersonaje = [];
          for (let estGlobal of this.estadisticas) {
            personaje.estadisticasDelPersonaje.push({
              nombreEstadistica: estGlobal.nombre,
              valorPropio: 0,
              consumible: estGlobal.consumible,
            });
          }
        }
      }
    }

    if (this.paso === 4) {
      for (let dado of this.dados) {
        if (dado.nombre === '' || dado.cantidad == null) {
          alert('Revisa los campos de los dados');
          return;
        }
      }
    }

    if (this.paso === 5) {
      this.paso = this.paso + 1;
      console.log(this.personajes);
      return;
    }

    if (this.paso < 6) {
      this.paso++;
    }
  }

  irAtras() {
    if (this.paso > 1) {
      this.paso = this.paso - 1;
    }
  }

  agregarEstadistica() {
    this.estadisticas.push({ nombre: '', valor: 0, consumible: false, id: null });
  }

  eliminarEstadistica(posicion: number) {
    this.estadisticas.splice(posicion, 1);
  }

  agregarAtaque() {
    this.ataques.push({
      nombre: '', id: null, dadoBase: 0, ratioDado: [],
      statReducePropio: [], statReduceRival: [], danoAtaque: 0,
    });
  }

  eliminarAtaque(posicion: number) {
    this.ataques.splice(posicion, 1);
  }

  agregarDado() {
    this.dados.push({ nombre: '', caras: 6, cantidad: 1 });
  }

  eliminarDado(posicion: number) {
    this.dados.splice(posicion, 1);
  }

  agregarPersonaje() {
    let estadisticasNuevas = [];
    for (let est of this.estadisticas) {
      estadisticasNuevas.push({
        nombreEstadistica: est.nombre,
        valorPropio: 0,
        consumible: est.consumible,
      });
    }
    this.personajes.push({
      nombre: '',
      urlSprite: 'https://i.pinimg.com/474x/9c/0f/06/9c0f06b14aba220811331c49718d6b93.jpg',
      vida: 0,
      ataquesDelPersonaje: [{
        nombre: '', dadoBase: 0, ratioDado: [],
        statReducePropio: [{ estadistica: '', valor: 0 }],
        statReduceRival: [{ estadistica: '', valor: 0 }],
        id: null, danoAtaque: 0,
      }],
      estadisticasDelPersonaje: estadisticasNuevas,
      id: null,
      fotoUrl: '',
    });
  }

  eliminarPersonaje(posicion: number) {
    if (this.personajes.length > 1) {
      this.personajes.splice(posicion, 1);
    } else {
      alert('Debe haber al menos un personaje');
    }
  }

  agregarAtaqueAPersonaje(posicionPersonaje: number) {
    this.personajes[posicionPersonaje].ataquesDelPersonaje.push({
      nombre: '', dadoBase: 0, ratioDado: [],
      statReducePropio: [{ estadistica: '', valor: 0 }],
      statReduceRival: [{ estadistica: '', valor: 0 }],
      id: null, danoAtaque: 0,
    });
  }

  eliminarAtaqueDePersonaje(posicionPersonaje: number, posicionAtaque: number) {
    this.personajes[posicionPersonaje].ataquesDelPersonaje.splice(posicionAtaque, 1);
  }

  agregarEstadisticaAPersonaje(posicionPersonaje: number) {
    this.personajes[posicionPersonaje].estadisticasDelPersonaje.push({
      nombreEstadistica: '', valorPropio: 0, consumible: false,
    });
  }

  eliminarEstadisticaDePersonaje(posicionPersonaje: number, posicionEstadistica: number) {
    this.personajes[posicionPersonaje].estadisticasDelPersonaje.splice(posicionEstadistica, 1);
  }

  alCambiarAtaque(nombreElegido: string, posicionPersonaje: number, posicionAtaque: number) {
    const ataqueOriginal = this.ataques.find((a) => a.nombre === nombreElegido);
    if (ataqueOriginal) {
      this.personajes[posicionPersonaje].ataquesDelPersonaje[posicionAtaque] = ataqueOriginal;
    }
  }

  alCambiarEstadistica(nombreElegido: string, posicionPersonaje: number, posicionEstadistica: number) {
    const estOriginal = this.estadisticas.find((e) => e.nombre === nombreElegido);
    if (estOriginal) {
      this.personajes[posicionPersonaje].estadisticasDelPersonaje[posicionEstadistica].valorPropio = estOriginal.valor;
    }
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  // ── DRAG & DROP – ATAQUES ────────────────────────────────────────────────────
  itemArrastrado: any = null;
  costesEnMesa: any[] = [];
  efectosEnMesa: any[] = [];
  ratioDadoMin: number | null = null;
  ratioDadoMax: number | null = null;
  danoAtaque: number = 0;

  iniciarArrastre(item: any) {
    this.itemArrastrado = item;
  }

  permitirDrop(event: any) {
    event.preventDefault();
  }

  soltarEnCoste() {
    if (this.itemArrastrado) {
      this.costesEnMesa.push({ nombre: this.itemArrastrado.nombre || this.itemArrastrado, valor: 0 });
      this.itemArrastrado = null;
    }
  }

  soltarEnEfecto() {
    if (this.itemArrastrado) {
      this.efectosEnMesa.push({
        nombre: this.itemArrastrado.nombre || this.itemArrastrado,
        valor: 1.0, ratioMin: null, ratioMax: null,
      });
      this.itemArrastrado = null;
    }
  }

  incrementar(item: any) { item.valor += 1; }
  decrementar(item: any) { if (item.valor > 0) item.valor -= 1; }
  incrementarMultiplicador(item: any) { item.valor = Number((item.valor + 0.1).toFixed(1)); }
  decrementarMultiplicador(item: any) { if (item.valor > 0) item.valor = Number((item.valor - 0.1).toFixed(1)); }
  eliminarCoste(index: number) { this.costesEnMesa.splice(index, 1); }
  eliminarEfecto(index: number) { this.efectosEnMesa.splice(index, 1); }

  nombreAtaqueActual: string = '';

  guardarAtaqueActual() {
    if (this.nombreAtaqueActual.trim() === '') {
      alert('¡Tu hechizo necesita un nombre para poder ser creado!');
      return;
    }

    const mapaManaAtacante: { [key: string]: number } = {};
    for (let coste of this.costesEnMesa) {
      mapaManaAtacante[coste.nombre] = coste.valor;
    }

    const mapaEstadisticasDefensor: { [key: string]: number } = {};
    for (let efecto of this.efectosEnMesa) {
      mapaEstadisticasDefensor[efecto.nombre] = efecto.valor;
    }

    let ataqueParaEnviar: Ataque = {
      id: null,
      nombre: this.nombreAtaqueActual,
      dadoBase: 20,
      ratioDado: [this.ratioDadoMin, this.ratioDadoMax],
      statReducePropio: Object.entries(mapaManaAtacante).map(([nombre, valor]) => ({ estadistica: nombre, valor })),
      statReduceRival: Object.entries(mapaEstadisticasDefensor).map(([nombre, valor]) => ({ estadistica: nombre, valor })),
      danoAtaque: this.danoAtaque,
    };
    this.ataques.push(ataqueParaEnviar);

    alert('¡Hechizo "' + this.nombreAtaqueActual + '" creado con éxito!');
    this.nombreAtaqueActual = '';
    this.costesEnMesa = [];
    this.efectosEnMesa = [];
    this.ratioDadoMin = null;
    this.ratioDadoMax = null;
    this.danoAtaque = 0;
  }

  mandarPartida() {
    let jugadores = [];
    const adminId = this.usuarioService.usuarioActual()?.id;

    for (let personaje of this.personajes) {
      let estadisticasPersonaje = [];
      for (let estadistica of personaje.estadisticasDelPersonaje) {
        estadisticasPersonaje.push({
          nombre: estadistica.nombreEstadistica,
          valor: estadistica.valorPropio.toString(),
          consumible: this.estadisticas.find((e) => e.nombre === estadistica.nombreEstadistica)?.consumible || false,
        });
      }

      let ataquesPersonaje = [];
      for (let ataque of personaje.ataquesDelPersonaje) {
        let diccionarioMana: { [key: string]: number } = {};
        if (ataque.statReducePropio) {
          for (let stat of ataque.statReducePropio) {
            if (stat.estadistica && stat.estadistica.trim() !== '') {
              diccionarioMana[stat.estadistica] = stat.valor;
            }
          }
        }
        let diccionarioDefensa: { [key: string]: number } = {};
        if (ataque.statReduceRival) {
          for (let stat of ataque.statReduceRival) {
            if (stat.estadistica && stat.estadistica.trim() !== '') {
              diccionarioDefensa[stat.estadistica] = stat.valor;
            }
          }
        }
        ataquesPersonaje.push({
          nombre: ataque.nombre,
          manaAtacante: diccionarioMana,
          estadisticasDefensor: diccionarioDefensa,
          dadoBase: ataque.dadoBase,
          ratioDado: ataque.ratioDado,
          danoAtaque: ataque.danoAtaque,
        });
      }

      jugadores.push({
        personajeNombre: personaje.nombre,
        personajeVida: personaje.vida,
        personajeFotoUrl: personaje.urlSprite,
        personajeEstadisticas: estadisticasPersonaje,
        personajeAtaques: ataquesPersonaje,
      });
    }

    const payload = {
      juego: {
        nombre: this.nombre,
        descripcion: this.descripcion,
        idioma: this.idioma,
        maximoJugadores: this.maxJugadores,
        jugadores: jugadores,
        adminId: adminId,
        objetos: this.objetos,
      },
    };

    console.log('El payload final queda como ', payload);

    this.servicioAPI.mandarPartida(payload).subscribe({
      next: (response) => {
        console.log('Partida enviada con éxito:', response);
        alert('¡Partida enviada con éxito!');
      },
      error: (error) => {
        console.error('Error al enviar la partida:', error);
        alert('Error al enviar la partida. Revisa la consola.');
      },
    });
  }

  obtenerImagenDado(caras: number): string {
    switch (caras) {
      case 4:   return 'assets/img/dados/d4.png';
      case 6:   return 'assets/img/dados/d6.png';
      case 8:   return 'assets/img/dados/d8.png';
      case 10:  return 'assets/img/dados/d10.png';
      case 12:  return 'assets/img/dados/d12.png';
      case 20:  return 'assets/img/dados/d20.png';
      case 100: return 'assets/img/dados/d100.jpg';
      default:  return 'assets/img/dados/default.jpg';
    }
  }
}
