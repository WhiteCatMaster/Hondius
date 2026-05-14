import { Ataque } from '../models/ataque';
import { EstadisticaPersonaje } from '../models/personaje';

export interface MctsConfig {
  iterations?: number;          // default 3000
  explorationConstant?: number; // default √2
  rolloutDepth?: number;        // default 30
}

// ─────────────────────────────────────────────
//  GameState  — snapshot inmutable del combate
// ─────────────────────────────────────────────
export class GameState {
  constructor(
    public readonly stats: EstadisticaPersonaje[],
    public readonly hpEnemigo: number,
    public readonly dificultad: number,
    public readonly ataques: Ataque[],
    public readonly turno: number = 0,
    public readonly maxTurnos: number = 30,
    public readonly turnosAtacados: number = 0,
    public readonly victoria: boolean = false,
    public readonly quedadoSeco: boolean = false
  ) {}

  /** Ataques cuyo coste cabe en las stats actuales */
  getLegalActions(): Ataque[] {
    return this.ataques.filter(atc => {
      if (!atc.statReducePropio || atc.statReducePropio.length === 0) return true;
      for (const coste of atc.statReducePropio) {
        const stat = this.stats.find(s => s.nombreEstadistica === coste.estadistica);
        if (!stat || stat.valorPropio < coste.valor) return false;
      }
      return true;
    });
  }

  /** Estado resultante tras ejecutar un ataque (inmutable) */
  applyAction(ataque: Ataque): GameState {
    const newStats = this.stats.map(s => ({ ...s }));

    for (const coste of (ataque.statReducePropio ?? [])) {
      const stat = newStats.find(s => s.nombreEstadistica === coste.estadistica);
      if (stat) stat.valorPropio -= coste.valor;
    }

    // Tirada de dado real del juego
    const total = ataque.dadoBase > 0 ? ataque.dadoBase : 6;
    const dado = Math.floor(Math.random() * total) + 1;

    const caraCrit   = ataque.ratioDado?.[0] ?? null;
    const caraMedium = ataque.ratioDado?.[1] ?? null;

    let dano = ataque.danoAtaque;
    if (dado === caraCrit)        dano *= 2;
    else if (dado === caraMedium) dano *= 1.5;

    // La dificultad modula el daño: 0 = casi nada, 1 = daño completo
    dano *= Math.max(0.05, this.dificultad);

    const newHp     = this.hpEnemigo - dano;
    const victoria  = newHp <= 0;
    const newTurno  = this.turno + 1;

    // Detectar quedarse sin ataques pagables en el estado resultante.
    // Solo aplica si aún no se alcanzó el límite de turnos (agotarse ≠ agotar el tiempo).
    const candidatoSiguiente = new GameState(
      newStats, newHp, this.dificultad, this.ataques,
      newTurno, this.maxTurnos, this.turnosAtacados + 1, victoria, false
    );
    const quedadoSeco = !victoria
      && newTurno < this.maxTurnos
      && candidatoSiguiente.getLegalActions().length === 0;

    return new GameState(
      newStats, newHp, this.dificultad, this.ataques,
      newTurno, this.maxTurnos, this.turnosAtacados + 1, victoria, quedadoSeco
    );
  }

  isTerminal(): boolean {
    if (this.victoria || this.turno >= this.maxTurnos) return true;
    return this.getLegalActions().length === 0;
  }

  /**
   * Función objetivo:
   *  - Si hay victoria: 50 + turnos_restantes (premia rematar rápido).
   *  - Si no: turnosAtacados (premia mantenerse activo).
   *  - Penaliza -30 por quedarse sin ataques pagables.
   *  - Pequeño bonus por conservar stats consumibles.
   */
  getReward(): number {
    const statsRestantes = this.stats.reduce(
      (sum, s) => (s.consumible ? sum + Math.max(0, s.valorPropio) : sum),
      0
    );
    const base = this.victoria
      ? 50 + (this.maxTurnos - this.turno)
      : this.turnosAtacados;
    return base - 30 * (this.quedadoSeco ? 1 : 0) + 0.1 * statsRestantes;
  }
}

// ─────────────────────────────────────────────
//  MctsNode  — nodo del árbol de búsqueda
// ─────────────────────────────────────────────
class MctsNode {
  children: Map<Ataque, MctsNode> = new Map();
  visits      = 0;
  totalReward = 0;
  untriedActions: Ataque[];

  constructor(
    public readonly state: GameState,
    public readonly parent: MctsNode | null = null,
    public readonly actionFromParent: Ataque | null = null
  ) {
    this.untriedActions = [...state.getLegalActions()];
  }

  isFullyExpanded(): boolean {
    return this.untriedActions.length === 0;
  }

  ucb1(c: number): number {
    if (this.visits === 0) return Infinity;
    return (
      this.totalReward / this.visits
      + c * Math.sqrt(Math.log(this.parent!.visits) / this.visits)
    );
  }

  bestChild(c: number): MctsNode {
    let best: MctsNode | null = null;
    let bestScore = -Infinity;
    for (const child of this.children.values()) {
      const score = child.ucb1(c);
      if (score > bestScore) { bestScore = score; best = child; }
    }
    return best!;
  }
}

// ─────────────────────────────────────────────
//  MctsEngine  — motor MCTS genérico
// ─────────────────────────────────────────────
export class MctsEngine {
  private readonly iterations: number;
  private readonly explorationConstant: number;
  private readonly rolloutDepth: number;

  constructor(config: MctsConfig = {}) {
    this.iterations          = config.iterations          ?? 3000;
    this.explorationConstant = config.explorationConstant ?? Math.SQRT2;
    this.rolloutDepth        = config.rolloutDepth        ?? 30;
  }

  search(rootState: GameState): Ataque | null {
    const legal = rootState.getLegalActions();
    if (legal.length === 0) return null;
    if (legal.length === 1) return legal[0];

    const root = new MctsNode(rootState);

    for (let i = 0; i < this.iterations; i++) {
      const leaf   = this.selectAndExpand(root);
      const reward = this.rollout(leaf.state);
      this.backpropagate(leaf, reward);
    }

    // Acción del hijo más visitado
    let bestAction: Ataque | null = null;
    let bestVisits = -1;
    for (const [action, child] of root.children) {
      if (child.visits > bestVisits) {
        bestVisits = child.visits;
        bestAction = action;
      }
    }

    return bestAction ?? legal[0];
  }

  private selectAndExpand(node: MctsNode): MctsNode {
    while (!node.state.isTerminal()) {
      if (!node.isFullyExpanded()) return this.expand(node);
      node = node.bestChild(this.explorationConstant);
    }
    return node;
  }

  private expand(node: MctsNode): MctsNode {
    const idx    = Math.floor(Math.random() * node.untriedActions.length);
    const action = node.untriedActions.splice(idx, 1)[0];
    const child  = new MctsNode(node.state.applyAction(action), node, action);
    node.children.set(action, child);
    return child;
  }

  private rollout(state: GameState): number {
    let current = state;
    let depth   = 0;
    while (!current.isTerminal() && depth < this.rolloutDepth) {
      const actions = current.getLegalActions();
      if (actions.length === 0) break;
      current = current.applyAction(actions[Math.floor(Math.random() * actions.length)]);
      depth++;
    }
    return current.getReward();
  }

  private backpropagate(node: MctsNode, reward: number): void {
    let cur: MctsNode | null = node;
    while (cur !== null) {
      cur.visits++;
      cur.totalReward += reward;
      cur = cur.parent;
    }
  }
}
