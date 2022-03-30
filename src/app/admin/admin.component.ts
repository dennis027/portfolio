import { Component, OnInit } from '@angular/core';
import { ContactService } from '../service/contact.service';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  allUsers:any;
  constructor(private contactService:ContactService) { }

  ngOnInit(): void {


    this.contactService.getData().subscribe((res: any[]) => {
      this.allUsers = res;
      console.log(this.allUsers)
    })

  }

}
