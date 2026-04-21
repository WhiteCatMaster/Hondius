import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

import { Partida } from '../models/partida';
import { ServicioAPI } from '../servicio-api';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  imports: [RouterLink],
})
// export class Landing {}
export class Landing implements OnInit {
  constructor(private servicioAPI: ServicioAPI) {}
  partidas = signal<Partida[]>([]);

  ngOnInit(): void {
    //this.cargarPartidasMock();
    this.cargarPartidasBD();
  }
  /* 
cargarPartidasMock() {
  this.partidas = [
    {
      nombre: 'Aventura en el bosque',
      descripcion: 'Exploración y misterio',
      idioma: 'ES',
      maxJugadores: 4,
      id: null
    },
    {
      nombre: 'Batalla final',
      descripcion: 'PvP intenso',
      idioma: 'EN',
      maxJugadores: 8,
      id: null
    }
  ];
}
*/
  cargarPartidasBD() {
    //Se deberian de cargar las partidas que hay en DB

    this.servicioAPI.recogerPartidas().subscribe({
      next: (partidasBackend) => {
        this.partidas.set(partidasBackend.map(atributo =>({
          nombre:atributo.nombre,
          descripcion: atributo.descripcion,
          id: atributo.id,
          idioma: atributo.idioma,
          maxJugadores: atributo.maximoJugadores
        })))
      },
      error: (error) => {
        console.log('Parece que ha ocurrido un error:', error);
      },
    });
  }
}
