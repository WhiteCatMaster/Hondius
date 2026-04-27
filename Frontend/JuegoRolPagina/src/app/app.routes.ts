import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { OpcionesComponent } from './opciones.component';
import { CombateComponent } from './combate/combate.component';
import { SelectorComponent } from './selectorELIMINAR.component';
import { SelectorPersonajeComponent } from './selectorPersonaje/selector.component';;
import { UsuarioWebComponent } from './usuario/usuarioWeb';
import { SelectorMasterComponent} from './selector-master/selector-master.component'
import { EditarPersonaje } from './editar-personaje/editar-personaje';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: LoginComponent},
  { path: 'crear-partida', component: OpcionesComponent },
  { path: 'selector/:id', component: SelectorComponent },
  { path: 'jugar-combate/:id', component: CombateComponent },
  { path: 'perfil', component: UsuarioWebComponent },
  { path: 'selector-master', component: SelectorMasterComponent},
  { path:  'editar-personaje/:nombre', component:EditarPersonaje},
  { path: 'selector-personaje/:id', component: SelectorPersonajeComponent },
];
