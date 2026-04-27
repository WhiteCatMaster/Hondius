import { Component, OnInit } from '@angular/core'; // 1. Añadimos OnInit
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from "@angular/router"; // 2. Añadimos ActivatedRoute y Router

// 3. IMPORTANTE: Asegúrate de importar tu servicio API (ajusta la ruta si es necesario)
import { ServicioAPI } from '../servicio-api'; 

@Component({
  selector: 'app-editar-personaje',
  imports: [FormsModule, RouterLink],
  templateUrl: './editar-personaje.html',
  styleUrl: './editar-personaje.css',
})
export class EditarPersonaje implements OnInit {

  nombreOriginal = '';
  
  personaje: any = {
    nombre: 'Guerrero Valiente',
    fotoUrl: 'https://img.freepik.com/vector-gratis/caballero-personaje-dibujos-animados-espada_1308-127704.jpg?semt=ais_hybrid&w=740&q=80',
    estadisticas: [
      { nombre: 'Fuerza Bruta', valor: 25 },
      { nombre: 'Armadura', valor: 15 },
      { nombre: 'Maná Oscuro', valor: 100 },
      { nombre: 'Velocidad', valor: 8 },
      { nombre: 'Suerte', valor: 2 }
    ],
    ataques: [
      { 
        nombre: 'Hachazo Feroz', 
        dadoBase: 20, 
        statReducePropio: [{ estadistica: 'Estamina', valor: 10 }],
        statReduceRival: [{ estadistica: 'Vida', valor: 20 }]
      },
      { 
        nombre: 'Grito de Guerra', 
        dadoBase: 12, 
        statReducePropio: [{ estadistica: 'Maná', valor: 5 }],
        statReduceRival: [{ estadistica: 'Defensa', valor: 5 }, { estadistica: 'Esquiva', valor: 2 }]
      },
      { 
        nombre: 'Embestida', 
        dadoBase: 8, 
        statReducePropio: [{ estadistica: 'Fuerza', valor: 3 }],
        statReduceRival: []
      }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ServicioAPI 
  ) {}

  ngOnInit() {
    const nombreEnUrl = this.route.snapshot.paramMap.get('nombre');
    
    if (nombreEnUrl) {
      this.nombreOriginal = nombreEnUrl;
      
      this.personaje.nombre = nombreEnUrl; 
    }
  }

  subirStat(index: number) {
    this.personaje.estadisticas[index].valor++;
  }

  bajarStat(index: number) {
    this.personaje.estadisticas[index].valor--;
  }

  guardar() {
    console.log('Enviando datos al backend para:', this.nombreOriginal);
    /* 
    this.api.actualizarPersonaje(this.nombreOriginal, this.personaje).subscribe({
      next: (respuesta) => {
        console.log('¡Guardado exitoso en BD!', respuesta);
        this.router.navigate(['/selector-master']);
      },
      error: (error) => {
        console.warn('El servidor no responde, activando modo simulación...', error);
        alert('Modo simulación: Backend no disponible. Fingiendo guardado exitoso.');
        
        this.router.navigate(['/selector-master']);
      }
    });
    */
  }
}