import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  //Business information
  private businessName: String;
  private businessAddress: String;

  //User inforamtion
  private userPhoneNumber: String;
  private userName: String;
  private userEmail: String;
  private businessEntered: String;

  constructor(private http: HttpClient) {
    this.pingServer()
  }

  pingServer() {
    this.http.post<any>('/api/ping', {body: "Ping check"}).subscribe(data => {
      console.log(data.statusCode, data.body);
    }, error => {
      console.error("ping error: " + error.message)
    });
  }

  //when business owner presses to register his business
  //TODO
  insertNewBusiness() {
    this.http.post<any>('/api/insertNewBusiness', {businessname: this.businessName, address: this.businessAddress})
      .subscribe(data => {
        console.log(data.statusCode);
      }, error => {
        console.error("insertNewBusiness error: " + error.message)
      });
  }


  //when customer scans a barcode this adds his visit to the Users table
  insertNewPerson() {
    this.http.post<any>('/api/insertNewPerson', {number: this.userPhoneNumber, username: this.userName, email: this.userEmail, business: this.businessEntered})
      .subscribe(data => {
        console.log(data.statusCode);
      }, error => {
        console.error("insertNewPerson error: \n" + error.message)
      });
  }

}

