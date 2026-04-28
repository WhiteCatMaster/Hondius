import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Usuario } from '../models/usuario';
import { Rol } from '../models/jugador-juego';
import { ServicioAPI } from '.././servicio-api';
import { UsuarioService } from '../servicios/usuario-service';

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
    private cdRef: ChangeDetectorRef,
    public usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    const usuarioGoogleId = this.usuarioService.usuarioActual()?.googleId
    this.apiService.obtenerDatosUsuario(usuarioGoogleId).subscribe({
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
