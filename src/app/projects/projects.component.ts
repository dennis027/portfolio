import { Component, OnInit, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AkanComponent } from './akan/akan.component';
import { DelaniComponent } from './delani/delani.component';
import { KinetikComponent } from './kinetik/kinetik.component';
import { MwangazaComponent } from './mwangaza/mwangaza.component';
import { QuotesComponent } from './quotes/quotes.component';
export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  constructor(public dialog: MatDialog) {}
  openDialog(): void {
    const dialogRef = this.dialog.open(MwangazaComponent, {
      width: '80%',
      height: '100%'
    
    });
    

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
  
    });
  }
  openDialog1(): void {
    const dialogRef = this.dialog.open(QuotesComponent, {
      width: '80%',
      height: '100%'
    
    });
    

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
  
    });
  }
  openDialog2(): void {
    const dialogRef = this.dialog.open(AkanComponent, {
      width: '80%',
      height: '100%'
    
    });
    

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
  
    });
  }
  openDialog3(): void {
    const dialogRef = this.dialog.open(KinetikComponent, {
      width: '80%',
      height: '100%'
    
    });
    

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
  
    });
  }
  openDialog4(): void {
    const dialogRef = this.dialog.open(DelaniComponent, {
      width: '80%',
      height: '100%'
    
    });
    

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
  
    });
  }
  ngOnInit(): void {
  }

}
