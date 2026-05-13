import { Injectable } from '@angular/core';
import { Ataque } from '../models/ataque';

@Injectable({ providedIn: 'root' })
export class CpuComponent {
  usarCpu = false;
  dificultad = 0.5;

  elegirAtaque(ataques: Ataque[], dificultad: number = this.dificultad): Ataque | null {
    if (!ataques || ataques.length === 0) return null;

    const dicRatios: { atc: Ataque; ratio: number }[] = [];

    for (const atc of ataques) {
      const total = atc.dadoBase;
      if (!total || total <= 0) continue;

      const caraCrit = atc.ratioDado?.[0] ?? null;
      const caraMedium = atc.ratioDado?.[1] ?? null;

      const critValida = caraCrit != null && caraCrit >= 1 && caraCrit <= total;
      const mediumValida = caraMedium != null && caraMedium >= 1 && caraMedium <= total && caraMedium !== caraCrit;

      const ncarasC = critValida ? 1 : 0;
      const ncarasM = mediumValida ? 1 : 0;

      const m = atc.danoAtaque;
      const c = atc.danoAtaque;
      const ratio = m * (ncarasM / total) + 2 * c * (ncarasC / total);

      dicRatios.push({ atc, ratio });
    }

    if (dicRatios.length === 0) return null;

    const maxRatio = Math.max(...dicRatios.map(r => r.ratio));
    const alpha = dificultad * maxRatio;

    let diffMin = Infinity;
    let atcElegido: Ataque | null = null;

    for (const r of dicRatios) {
      const diff = Math.abs(r.ratio - alpha);
      if (diff < diffMin) {
        diffMin = diff;
        atcElegido = r.atc;
      }
    }

    return atcElegido;
  }
}
