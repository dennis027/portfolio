import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { ProjectsComponent } from '../projects.component';


@Component({
  selector: 'app-kinetik',
  templateUrl: './kinetik.component.html',
  styleUrls: ['./kinetik.component.css']
})
export class KinetikComponent implements OnInit {
  [x: string]: any;
 

  constructor() { }
 
  ngOnInit(): void {
  }

}
