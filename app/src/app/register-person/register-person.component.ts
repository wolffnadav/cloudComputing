import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-register-person',
  templateUrl: './register-person.component.html',
  styleUrls: ['./register-person.component.scss']
})
export class RegisterPersonComponent {

  //User inforamtion
  private userPhoneNumber: String;
  private userName: String;
  private userEmail: String;
  private businessEntered: String;

  constructor(private http: HttpClient) {
  }

  //when customer scans a barcode this adds his visit to the Users table
  insertNewPerson() {
    this.http.post<any>('/api/insertNewPerson', {
      number: this.userPhoneNumber,
      username: this.userName,
      email: this.userEmail,
      business: this.businessEntered
    })
      .subscribe(data => {
        console.log(data.statusCode);
        this.successAlert("You just managed to sign up :) ")
      }, error => {
        console.error("insertNewPerson error: \n" + error.message);
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
