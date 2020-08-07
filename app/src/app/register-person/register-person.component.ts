import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-register-person',
  templateUrl: './register-person.component.html',
  styleUrls: ['./register-person.component.scss']
})
export class RegisterPersonComponent implements OnInit {

  //User inforamtion
  private userPhoneNumber: String;
  private userName: String;
  private userEmail: String;
  private businessEntered: String;

  constructor(private http: HttpClient) { }

  //when customer scans a barcode this adds his visit to the Users table
  insertNewPerson() {
    this.http.post<any>('/api/insertNewPerson', {number: this.userPhoneNumber, username: this.userName, email: this.userEmail, business: this.businessEntered})
      .subscribe(data => {
        console.log(data.statusCode);
      }, error => {
        console.error("insertNewPerson error: \n" + error.message)
      });
  }

  ngOnInit() {
  }

}
