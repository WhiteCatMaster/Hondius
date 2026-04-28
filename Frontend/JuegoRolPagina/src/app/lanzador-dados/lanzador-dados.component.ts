import { CommonModule } from '@angular/common';
import { Dado } from '../models/dado';
import { DadosService } from '../servicio/simulacion-dados.service';
import { Component, signal, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-lanzador-dados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lanzador-dados.html',
  styleUrls: ['./lanzador-dados.css'],
})
export class LanzadorDadosComponent {
  @Output() dadoLanzado = new EventEmitter<number>();
  // Lista fija: siempre habrá un único dado de 6 caras
  listaDados = signal<Dado[]>([
    { nombre: 'D6', caras: 6, cantidad: 1 }
  ]);

  resultadoTotal = signal<number>(0);
  lanzando = signal<boolean>(false);
  dadosResultados = signal<any[]>([]);

  constructor(private dadosService: DadosService) {}

  lanzar() {
    this.lanzando.set(true);
    this.resultadoTotal.set(0);
    this.dadosResultados.set([]); // Limpiamos la mesa

    // Simulamos la animación
    setTimeout(() => {
      // Pasamos la lista que ahora siempre tiene 1 D6
      const res = this.dadosService.lanzarDados(this.listaDados());
      this.resultadoTotal.set(res.total);
      this.dadosResultados.set(res.detalles);
      this.lanzando.set(false);

      this.dadoLanzado.emit(res.total);
    }, 1000);
  }
}