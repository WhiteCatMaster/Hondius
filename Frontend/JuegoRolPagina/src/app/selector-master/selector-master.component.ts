import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partida } from '../models/partida';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicioAPI } from '../servicio-api';
import { DatosPartidaDto } from '../selectorELIMINAR.component';
import { UsuarioService } from '../servicios/usuario-service';

@Component({
  selector: 'app-editor-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-master.component.html',
  styleUrl: './selector-master.component.css'
})
export class SelectorMasterComponent implements OnInit {
  partidaActual = signal<any|null>(null);
  partidaDto: DatosPartidaDto | null = null;
  combateID= signal<number>(-1);

  constructor(
    private router: Router, 
    private servicioAPI: ServicioAPI,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    //this.cargarDatosPrueba();
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

  seleccionarParaEditar(personaje: any) {
    console.log('Editando a:', personaje.nombre);
    this.router.navigate(['/editar-personaje', personaje.id]);
  }

  cargarDatosPrueba() {
    this.partidaActual.set({
      personajes: [
        { nombre: 'Guerrero Valiente', fotoUrl: 'https://i.pinimg.com/474x/9c/0f/06/9c0f06b14aba220811331c49718d6b93.jpg' },
        { nombre: 'Mago Oscuro', fotoUrl: 'https://i.pinimg.com/474x/9c/0f/06/9c0f06b14aba220811331c49718d6b93.jpg' },
        { nombre: 'Mago Oscuro', fotoUrl: 'https://i.pinimg.com/474x/9c/0f/06/9c0f06b14aba220811331c49718d6b93.jpg' },
        { nombre: 'Mago Oscuro', fotoUrl: 'https://i.pinimg.com/474x/9c/0f/06/9c0f06b14aba220811331c49718d6b93.jpg' },
        { nombre: 'Mago Oscuro', fotoUrl: 'https://i.pinimg.com/474x/9c/0f/06/9c0f06b14aba220811331c49718d6b93.jpg' },
        { nombre: 'Mago Oscuro', fotoUrl: 'https://i.pinimg.com/474x/9c/0f/06/9c0f06b14aba220811331c49718d6b93.jpg' },
        { nombre: 'Pícaro Sombrío', fotoUrl: 'https://i.pinimg.com/474x/9c/0f/06/9c0f06b14aba220811331c49718d6b93.jpg' }
      ]
    });
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
}