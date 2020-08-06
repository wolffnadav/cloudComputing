import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {AppRoutingModule} from './app-routing.module';
import { FormsModule } from '@angular/forms';

import {AppComponent} from './app.component';
import {AnalyticsComponent} from './analytics/analytics.component';
import {RegisterComponent} from './register/register.component';

@NgModule({
  declarations: [
    AppComponent,
    AnalyticsComponent,
    RegisterComponent
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
