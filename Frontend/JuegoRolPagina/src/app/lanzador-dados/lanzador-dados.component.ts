import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dado } from '../models/dado';
import { DadosService } from '../servicio/simulacion-dados.service';

@Component({
  selector: 'app-lanzador-dados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lanzador-dados.html',
  styleUrls: ['./lanzador-dados.css'],
})
export class LanzadorDadosComponent {
  // Inicializamos nuestra "caja de dados" usando tu modelo
  listaDados = signal<Dado[]>([
    { nombre: 'D4', caras: 4, cantidad: 0 },
    { nombre: 'D6', caras: 6, cantidad: 1 }, // Empezamos con 1 D6 por defecto
    { nombre: 'D8', caras: 8, cantidad: 0 },
    { nombre: 'D10', caras: 10, cantidad: 0 },
    { nombre: 'D12', caras: 12, cantidad: 0 },
    { nombre: 'D20', caras: 20, cantidad: 0 },
    { nombre: 'D100', caras: 100, cantidad: 0 },
  ]);

  resultadoTotal = signal<number>(0);
  lanzando = signal<boolean>(false);
  dadosResultados = signal<any[]>([]);

  constructor(private dadosService: DadosService) {}

  cambiarCantidad(index: number, delta: number) {
    this.listaDados.update((dados) => {
      const nuevosDados = [...dados];
      const nuevaCantidad = nuevosDados[index].cantidad + delta;
      nuevosDados[index].cantidad = Math.max(0, nuevaCantidad); // Evita números negativos
      return nuevosDados;
    });
  }

  lanzar() {
    // Comprobamos si hay al menos un dado seleccionado
    const hayDados = this.listaDados().some((d) => d.cantidad > 0);
    if (!hayDados) return;

    this.lanzando.set(true);
    this.resultadoTotal.set(0);
    this.dadosResultados.set([]); // Limpiamos la mesa

    // Simulamos la animación
    setTimeout(() => {
      const res = this.dadosService.lanzarDados(this.listaDados());
      this.resultadoTotal.set(res.total);
      this.dadosResultados.set(res.detalles);
      this.lanzando.set(false);
    }, 1000);
  }
}
