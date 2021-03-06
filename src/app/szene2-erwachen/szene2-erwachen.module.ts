import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Szene2ErwachenPageRoutingModule } from './szene2-erwachen-routing.module';

import { Szene2ErwachenPage } from './szene2-erwachen.page';
import { ComponentsModule } from '../components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    Szene2ErwachenPageRoutingModule
  ],
  declarations: [Szene2ErwachenPage]
})
export class Szene2ErwachenPageModule {}
