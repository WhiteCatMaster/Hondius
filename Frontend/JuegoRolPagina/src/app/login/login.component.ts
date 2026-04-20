/*import { Component } from '@angular/core';
import { FirebaseAuthService } from '../auth/firebase-auth.service';

@Component({
  selector: 'app-login',
  template: `<button (click)="login()">Login with Google</button>`,
})
export class LoginComponent {
  constructor(private firebaseAuth: FirebaseAuthService) {}

  async login() {
    const idToken = await this.firebaseAuth.signInWithGoogle();
    console.log('Firebase ID token:', idToken);
    // Next step: send token to backend
  }
}
*/