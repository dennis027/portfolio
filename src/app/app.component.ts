import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  loaderConfig:any ={
    theme:{
      back:'rgb(181 24 51 / 0.5)',
      spinner:'#184db5'
    },
    type:'ring', //bar, ring, bubble-spinner, square, bounce,cube
}
  title = 'portfolio';
  navbarOpen = false;
  toggleNavbar() {
    this.navbarOpen =  !this.navbarOpen;
  }
}
