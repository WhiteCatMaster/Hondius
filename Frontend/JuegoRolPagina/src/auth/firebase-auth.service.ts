/*import { Injectable } from '@angular/core';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private provider = new GoogleAuthProvider();

  async signInWithGoogle(): Promise<string> {
    const result = await signInWithPopup(auth, this.provider);
    // Firebase ID token (send this to Spring Boot)
    return await result.user.getIdToken();
  }

  signOut() {
    return signOut(auth);
  }
}
*/