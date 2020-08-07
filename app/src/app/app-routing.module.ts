import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {RegisterComponent} from "./register/register.component";
import {HomeComponent} from "./home/home.component";
import {AnalyticsComponent} from "./analytics/analytics.component";


const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'newBusiness', component: RegisterComponent},
  {path: 'analytics', component: AnalyticsComponent},
  {path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
