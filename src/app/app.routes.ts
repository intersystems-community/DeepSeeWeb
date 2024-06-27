import {Routes} from '@angular/router';
import {LoginScreenComponent} from './components/screens/login-screen/login-screen.component';
import {MainScreenComponent} from './components/screens/main-screen/main-screen.component';
import {NamespaceService} from './services/namespace.service';
import {ConfigResolver} from './services/config-resolver';

export const routes: Routes = [
  {path: '', component: LoginScreenComponent, resolve: {model: NamespaceService}},
  {path: 'login', component: LoginScreenComponent},
  {
    path: ':ns', resolve: {model: ConfigResolver}, runGuardsAndResolvers: 'always', children: [
      {
        path: '**',
        component: MainScreenComponent,
        data: {isDashboard: true},
        resolve: {model: ConfigResolver},
        runGuardsAndResolvers: 'always'
      }
    ]
  },
];
