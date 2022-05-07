import { Routes } from '@angular/router';

export const VisitorRoutes: Routes = [
    {
        path: '',
        loadChildren: () => import('./visitor.module')
          .then(mod => mod.VisitorModule)
    }
];
