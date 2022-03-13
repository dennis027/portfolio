import { Component, Inject, OnInit } from '@angular/core';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DialogData, ProjectsComponent } from '../projects.component';

@Component({
  selector: 'app-mwangaza',
  templateUrl: './mwangaza.component.html',
  styleUrls: ['./mwangaza.component.css']
})

export class MwangazaComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ProjectsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}


  ngOnInit(): void {
    
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }
}
