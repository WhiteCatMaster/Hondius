import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Personaje } from './models/personaje';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Ataque } from './models/ataque';
import { Estadistica } from './models/estadistica';
import { Usuario } from './models/usuario';
import { MOCK_USUARIO } from './usuario/usuario.mock';


@Injectable({
  providedIn: 'root',
})
export class ServicioAPI {
  private apiUrl = 'http://localhost:8080';
  constructor(private http: HttpClient) {}

  mandarPartida(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/partida`, payload);
  }

  recogerPartidas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/partida`);
  }

  obtenerDatosUsuario(): Observable<Usuario> {
    return of(MOCK_USUARIO).pipe(delay(3000));
  }
}
