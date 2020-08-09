import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {RegisterBusinessComponent} from "./register-business/register-business.component";
import {HomeComponent} from "./home/home.component";
import {AnalyticsComponent} from "./analytics/analytics.component";
import {RegisterPersonComponent} from "./register-person/register-person.component"
import {RegisterInfectedComponent} from "./register-infected/register-infected.component";


const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'newBusiness', component: RegisterBusinessComponent},
  {path: 'registerPerson', component: RegisterPersonComponent},
  {path: 'analytics', component: AnalyticsComponent},
  {path: 'registerInfected', component: RegisterInfectedComponent},
  {path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
