

  
import { Component, OnInit,Inject } from '@angular/core';
// import { ContactService } from '../service/contact.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {FormBuilder,FormGroup,} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { ContactService } from '../service/contact.service';
import { ContactFormComponent } from '../contact-form/contact-form.component';
// import { TesterComponent } from '../tester/tester.component';
/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
export interface DialogData {
  animal: string;
  name: string;
}
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
  
  
export class ContactComponent implements OnInit {
  
  copyClipText: any = 'machariad196@gmail.com';
  copyClipText1: any = '+254799157137';
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);

  matcher = new MyErrorStateMatcher();
 form:any = {
   name:null,
   email:null,
   subject:null,
   message:null
 }
 animal!: string;
 name!: string;
  constructor(private contactService:ContactService,private router:Router,private toastr: ToastrService, public dialog: MatDialog) { }

  openDialog(): void {
    const dialogRef = this.dialog.open(ContactFormComponent, {
      width: '350px',
      data: {name: this.name, animal: this.animal},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }

  ngOnInit(): void {
  }
  onSubmit(): void{
    let {name,email,subject,message}= this.form;
    this.contactService.post(name,email,subject,message).subscribe(
      (data) => {
        console.log(data)
        this.toastr.success('Mwangaza Little Readers Received Your Message');
        
       
      },
      (err) => {
       console.log(err)
       this.toastr.error('Check Your Details ');
      });
      // );
      // this.dialogRef.close();
  }
}
