import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { LandingComponent } from './landing/landing.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProjectsComponent } from './projects/projects.component';
import { SkillsComponent } from './skills/skills.component';

const routes: Routes = [
  {path:'',component:LandingComponent},
  {path:'home',component:LandingComponent},
  {path: 'navbar', component:NavbarComponent},
  {path: 'skills',component:SkillsComponent},
  {path:'projects',component:ProjectsComponent},
  {path:'contact',component:ContactComponent},
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}
