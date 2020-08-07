import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-register',
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.scss']
})
export class RegisterBusinessComponent {

  //Business information
  private businessName: String;
  private businessAddress: String;

  constructor(private http: HttpClient) {
  }

  //when business owner presses to register-business his business
  //TODO
  insertNewBusiness() {
    this.http.post<any>('/api/insertNewBusiness', {businessname: this.businessName, address: this.businessAddress})
      .subscribe(data => {
        console.log(data.statusCode);
        this.successAlert("You just managed to sign up your business :) ")
      }, error => {
        console.error("insertNewBusiness error: " + error.message);
        this.failAlert();

      });
  }

  successAlert(message) {
    Swal.fire("Wow", message, "success");
  }

  failAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Something went wrong!\nPlease try again..',
    })
  }


}

