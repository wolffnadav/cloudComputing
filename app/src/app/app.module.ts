import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {AppRoutingModule} from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule,MatSliderModule, MatIconModule, MatSidenavModule, MatListModule, MatButtonModule } from  '@angular/material';

import {AppComponent} from './app.component';
import {AnalyticsComponent} from './analytics/analytics.component';
import {RegisterBusinessComponent} from './register-business/register-business.component';
import { HomeComponent } from './home/home.component';
import { RegisterPersonComponent } from './register-person/register-person.component';
import { RegisterInfectedComponent } from './register-infected/register-infected.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    AnalyticsComponent,
    RegisterBusinessComponent,
    HomeComponent,
    RegisterPersonComponent,
    RegisterInfectedComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    BrowserAnimationsModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
