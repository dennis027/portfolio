import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {
  showButton: boolean = false;
  showDiv: boolean = false;
  showDiv1: boolean = false;
  showDiv2: boolean = false;
  showDiv3: boolean = false;
  showDiv4: boolean = false;
  showDiv5: boolean = false;
  showDiv6: boolean = false;
  showDiv7: boolean = false;
  showDiv8: boolean = false;
  showDiv9: boolean = false;
  showDiv10: boolean = false;
  showDiv11: boolean = false;
  changeText: boolean;
  constructor() {
     this.changeText = false;
  }

  ngOnInit(): void {
  }

}
