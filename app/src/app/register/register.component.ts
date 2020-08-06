import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private BusinessName: String;
  private businessAddress: String;


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

  insertNewBusiness() {
    this.http.post<any>('/api/insertNewBusiness', {name: this.BusinessName, address: this.businessAddress})
      .subscribe(data => {
        console.log(data.statusCode);
      }, error => {
        console.error("insertNewBusiness error: " + error.message)
      });
  }
}

