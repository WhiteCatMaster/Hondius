import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partida } from '../models/partida';
import { Router } from '@angular/router';
import { ServicioAPI } from '../servicio-api';

@Component({
  selector: 'app-editor-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-master.component.html',
  styleUrl: './selector-master.component.css'
})
export class SelectorMasterComponent implements OnInit {
  partidaActual = signal<any>(null);

  constructor(private router: Router, private api: ServicioAPI) {}

  ngOnInit(): void {
    this.cargarDatosPrueba();
  }

  seleccionarParaEditar(personaje: any) {
    console.log('Editando a:', personaje.nombre);
    this.router.navigate(['/editor-estadisticas', personaje.nombre]);
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
}