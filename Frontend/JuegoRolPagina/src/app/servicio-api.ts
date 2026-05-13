import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Usuario } from './models/usuario';
import { MOCK_USUARIO } from './usuario/usuario.mock';
import { ActualizarPersonajeDto } from './editar-personaje/editar-personaje';
import { ActualizarUsuarioDto } from './usuario/usuarioWeb';


@Injectable({
  providedIn: 'root',
})
export class ServicioAPI {
  private apiUrl = 'http://localhost:8081';
  constructor(private http: HttpClient) {}

  mandarPartida(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/partida`, payload);
  }

  recogerPartidas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/partida`);
  }

  obtenerDatosUsuario(googleId: string|undefined): Observable<Usuario> {
    //return of(MOCK_USUARIO).pipe(delay(0));
    return this.http.get<any>(`${this.apiUrl}/usuario/${googleId}`);
  }
  obtenerDatosPartida(id:number|string): Observable<any> {
    //Deberia de devolver lo que necesita selectorELIMINAR para poder cargar una partida y sus personajes
    return this.http.get<any>(`${this.apiUrl}/partida/${id}`)
  }

  enviarCombate(payload: any): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/partida/combate`, payload);
  }

  obtenerCombate(id: number|string): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/partida/combate/${id}`)
  }
  loginConGoogle(token: string) {
    // Lo enviamos en un objeto JSON simple
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { token: token });
  }
  obtenerPersonajexId(id:number|string):Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/personaje/${id}`)
  }
  actualizarPersonaje(id:number|string, payload: ActualizarPersonajeDto):Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/personaje/${id}`, payload)
  }
  actualizarUsuario(googleId: string|undefined, payload: ActualizarUsuarioDto): Observable<Usuario>{
    return this.http.put<any>(`${this.apiUrl}/usuario/${googleId}`, payload)
  }
}
