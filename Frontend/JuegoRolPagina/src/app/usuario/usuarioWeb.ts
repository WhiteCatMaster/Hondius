import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../models/usuario';
import { Rol } from '../models/jugador-juego';
import { ServicioAPI } from '.././servicio-api';
import { UsuarioService } from '../servicios/usuario-service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [UpperCasePipe, FormsModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.css'],
})
export class UsuarioWebComponent implements OnInit {
  usuario: Usuario | null = null;
  cargando: boolean = true;
  public Rol = Rol;

  modoEdicion: boolean = false;
  editNombre: string = '';
  editFotoUrl: string = '';

  constructor(
    private apiService: ServicioAPI,
    private cdRef: ChangeDetectorRef,
    public usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    const usuarioGoogleId = this.usuarioService.usuarioActual()?.googleId
    this.apiService.obtenerDatosUsuario(usuarioGoogleId).subscribe({
      next: (datos) => {
        console.log('Datos cargados:', datos);
        this.usuario = datos;
        this.cargando = false; 
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
        this.cdRef.detectChanges();
      },
    });
  }
  activarEdicion() {
    if (this.usuario) {
      this.editNombre = this.usuario.nombre;
      this.editFotoUrl = this.usuario.fotoUrl;
      this.modoEdicion = true;
    }
  }

  cancelarEdicion() {
    this.modoEdicion = false;
  }

  guardarEdicion() {
    if (this.usuario) {
      this.usuario.nombre = this.editNombre;
      this.usuario.fotoUrl = this.editFotoUrl;
      this.modoEdicion = false;

      this.usuarioService.iniciarSesion(this.usuario);

    }
  }
}
