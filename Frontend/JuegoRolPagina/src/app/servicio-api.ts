import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Personaje } from './models/personaje';
import { Observable } from 'rxjs';
import { Ataque } from './models/ataque';
import { Estadistica } from './models/estadistica';

@Injectable({
  providedIn: 'root',
})
export class ServicioAPI {
  private apiUrl = 'http://localhost:8080'; 
  constructor(private http: HttpClient) {

  }

  mandarPartida(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/partida`, payload);
  }

  recogerPartidas(): Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUrl}/partida`);
  }

}