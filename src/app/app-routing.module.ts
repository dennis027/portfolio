import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { ContactComponent } from './contact/contact.component';
import { LandingComponent } from './landing/landing.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AkanComponent } from './projects/akan/akan.component';
import { DelaniComponent } from './projects/delani/delani.component';
import { KinetikComponent } from './projects/kinetik/kinetik.component';
import { MwangazaComponent } from './projects/mwangaza/mwangaza.component';
import { PizzaComponent } from './projects/pizza/pizza.component';
import { ProjectsComponent } from './projects/projects.component';
import { QuotesComponent } from './projects/quotes/quotes.component';
import { SkillsComponent } from './skills/skills.component';

const routes: Routes = [
  // {path:'',component:LandingComponent},
  // {path:'home',component:LandingComponent},
  {path: 'navbar', component:NavbarComponent},
  {path: 'skills',component:SkillsComponent},
  {path:'projects',component:ProjectsComponent},
  {path:'contact',component:ContactComponent},
  {path:'delani', component:DelaniComponent},
  {path:'kinetik',component:KinetikComponent},
  {path:'mwangaza',component:MwangazaComponent},
  {path:'pizza',component:PizzaComponent},
  {path:'quotes',component:QuotesComponent},
  {path:'akan',component:AkanComponent},
  {path:'dennis',component:AdminComponent},
  {path:'contact-form',component:ContactFormComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}
