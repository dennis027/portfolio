import { Component, OnInit,Inject } from '@angular/core';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DialogData, ProjectsComponent } from '../projects.component';
@Component({
  selector: 'app-delani',
  templateUrl: './delani.component.html',
  styleUrls: ['./delani.component.css']
})
export class DelaniComponent implements OnInit {
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
