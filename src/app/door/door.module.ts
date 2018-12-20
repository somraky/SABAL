import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { ComponentsModule } from '../components/components.module';
import { IonicModule } from '@ionic/angular';

import { DoorPage } from './door.page';

const routes: Routes = [
  {
    path: '',
    component: DoorPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule
  ],
  declarations: [DoorPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DoorPageModule {}
