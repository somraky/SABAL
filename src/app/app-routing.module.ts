import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'light', loadChildren: './light/light.module#LightPageModule' },
  { path: 'smoke', loadChildren: './smoke/smoke.module#SmokePageModule' },
  { path: 'door', loadChildren: './door/door.module#DoorPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
