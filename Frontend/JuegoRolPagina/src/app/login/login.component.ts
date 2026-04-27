import { Component } from '@angular/core';
import { FirebaseAuthService } from '../../auth/firebase-auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private firebaseAuth: FirebaseAuthService,
    private router: Router
  ) {}

  async login() {
   try {
      const idToken = await this.firebaseAuth.signInWithGoogle();
      console.log('Firebase ID token:', idToken);
      
      this.router.navigate(['/']); 
      
    } catch (error) {
      console.error('El login fue cancelado o hubo un error:', error);
      alert('Debes identificarte con Google para continuar la aventura.');
    }
  }
}
