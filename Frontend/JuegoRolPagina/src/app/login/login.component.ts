import { Component } from '@angular/core';
import { FirebaseAuthService } from '../../auth/firebase-auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServicioAPI } from '../servicio-api';
import { UsuarioService } from '../servicios/usuario-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
    private firebaseAuth: FirebaseAuthService,
    private servicioAPI: ServicioAPI,
    private router: Router,
    private usuarioService: UsuarioService,
  ) {}

  async login() {
    try{
    const idToken = await this.firebaseAuth.signInWithGoogle();
    console.log('Firebase ID token:', idToken);
    this.servicioAPI.loginConGoogle(idToken).subscribe({
        next: (usuarioBD) => {
          console.log('¡Login exitoso en Spring Boot!', usuarioBD);
          this.usuarioService.iniciarSesion(usuarioBD)
          this.router.navigate(['/'])
        },
        error: (err) => {
          console.error('Error al verificar en el backend', err);
        }
      });
    } catch (error) {
      console.error('El usuario canceló el popup de Google', error);
    }
  }
}
