import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Usuario } from '../models/usuario';
import { Rol } from '../models/jugador-juego';
import { ServicioAPI } from '.././servicio-api';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [UpperCasePipe],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.css'],
})
export class UsuarioWebComponent implements OnInit {
  usuario: Usuario | null = null;
  cargando: boolean = true;
  public Rol = Rol;

  constructor(
    private apiService: ServicioAPI,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.apiService.obtenerDatosUsuario().subscribe({
      next: (datos) => {
        console.log('Datos cargados:', datos);
        this.usuario = datos;
        this.cargando = false; // Esto quita el mensaje de carga
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
        this.cdRef.detectChanges();
      },
    });
  }
}
