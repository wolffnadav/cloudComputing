import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-register-infected',
  templateUrl: './register-infected.component.html',
  styleUrls: ['./register-infected.component.scss']
})

export class RegisterInfectedComponent {

  //Notice Info
  public phoneNumber: String;
  public dateOfNotice: any;
  public dateOfNoticeTimeStamp: any;
  public maxDate = new Date();

  constructor(private http: HttpClient) {
  }

  //When a user enter a notice of infection - alert all relevant user
  sendInfectedAlert() {
    //First check the text box against unwanted characters - SQL injection protection
    //Both text boxes must be filed
    if (this.phoneNumber == undefined || this.dateOfNotice == undefined) {
      this.failAlert('Phone Number and Date of notice fields must be filed!')
      return;
    }
    //Check phone number - important check - this is out primary key so it must be unique
    if (!this.numericCheck(this.phoneNumber)) {
      this.failAlert('Only numbers are allowed in Phone Number field');
      return;
    }
    if (this.phoneNumber.length != 10) {
      this.failAlert('Phone number must contain exactly 10 Numbers');
      return;
    }

    //Change date to timestamp
    this.dateOfNoticeTimeStamp = new Date(this.dateOfNotice).getTime();

    //After input is valid send the data to server
    this.http.post<any>('/api/sendInfectedAlert', {
      phoneNumber: this.phoneNumber,
      dateOfNotice: this.dateOfNoticeTimeStamp.toString()
    }).subscribe(data => {
      this.successAlert("Your notice was recorded, you will remain anonymous to all other users :) ")
    }, error => {
      this.failAlert('Something went wrong!\nPlease try again..');
    });
  }

  //Success general alert
  successAlert(message) {
    Swal.fire("Wow", message, "success");
  }

  //Failed general alert
  failAlert(text) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: text,
    })
  }

  //Check that all inputTxt is numbers
  numericCheck(inputTxt) {
    const numbers = /^[0-9]+$/;
    return (inputTxt.match(numbers));
  }
}
