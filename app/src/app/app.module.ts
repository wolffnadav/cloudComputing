import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {AnalyticsComponent} from './analytics/analytics.component';
import {RegisterBusinessComponent} from './register-business/register-business.component';
import {HomeComponent} from './home/home.component';
import {RegisterPersonComponent} from './register-person/register-person.component';
import {RegisterInfectedComponent} from './register-infected/register-infected.component';

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
    FormsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
