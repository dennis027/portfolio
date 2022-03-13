
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { DialogData, ProjectsComponent } from '../projects.component';
import { Component, Inject, OnInit } from '@angular/core';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';


@Component({
  selector: 'app-kinetik',
  templateUrl: './kinetik.component.html',
  styleUrls: ['./kinetik.component.css']
})
export class KinetikComponent implements OnInit {

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
