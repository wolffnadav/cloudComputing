import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-register',
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.scss']
})
export class RegisterBusinessComponent {

  //Business information
  private businessName: String;
  private businessAddress: String;

  constructor(private http: HttpClient) { }

  //when business owner presses to register-business his business
  //TODO
  insertNewBusiness() {
    this.http.post<any>('/api/insertNewBusiness', {businessname: this.businessName, address: this.businessAddress})
      .subscribe(data => {
        console.log(data.statusCode);
      }, error => {
        console.error("insertNewBusiness error: " + error.message)
      });
  }

}

