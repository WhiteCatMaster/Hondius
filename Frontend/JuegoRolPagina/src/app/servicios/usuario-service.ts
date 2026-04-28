import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  usuarioActual = signal<Usuario | null>(null)
  constructor(){
    const usuarioGuardado = localStorage.getItem('usuarioRPG');
    if(usuarioGuardado){
      this.usuarioActual.set(JSON.parse(usuarioGuardado) as Usuario)
    }
  }
  iniciarSesion(usuarioDesdeBackend: Usuario){
    this.usuarioActual.set(usuarioDesdeBackend);
    localStorage.setItem('usuarioRPG', JSON.stringify(usuarioDesdeBackend));
  }
  cerrarSesion(){
    this.usuarioActual.set(null);
    localStorage.removeItem('usuarioRPG')
  }
}
