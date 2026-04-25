import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { OpcionesComponent } from './opciones.component';
import { CombateComponent } from './combate/combate.component';
import { SelectorComponent } from './selectorELIMINAR.component';
import { SelectorPersonajeComponent } from './selectorPersonaje/selector.component';;
import { UsuarioWebComponent } from './usuario/usuarioWeb';
import { SelectorMasterComponent} from './selector-master/selector-master.component'
export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'crear-partida', component: OpcionesComponent },
  { path: 'selector', component: SelectorComponent },
  { path: 'jugar-combate', component: CombateComponent },
  { path: 'selector-personaje', component: SelectorPersonajeComponent },
  { path: 'perfil', component: UsuarioWebComponent },
  { path: 'selector-master', component: SelectorMasterComponent},
];
