import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { Unlocker } from './unlocker/unlocker.component';

@NgModule({
	imports: [
		CommonModule,
		IonicModule.forRoot(),
		FormsModule,
	],
	declarations: [Unlocker],
	exports: [Unlocker],
	entryComponents: [],
})
export class ComponentsModule {}