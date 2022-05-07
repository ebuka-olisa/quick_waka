import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppRoutes } from './routes';

// hold all routes
const routes: Routes = AppRoutes;

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})], /*, {
    scrollPositionRestoration: 'top'
  })],*/
  exports: [RouterModule]
})
export class AppRoutingModule { }
