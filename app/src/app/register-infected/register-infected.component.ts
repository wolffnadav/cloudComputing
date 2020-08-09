import { Component} from '@angular/core';
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
  public max = new Date();
  constructor(private http: HttpClient) { }

  //when a user enter a notice of infection - alert all relevant user of their danger
  //TODO - check date of notice (make it drop down or calender)
  sendInfectedAlert(){
    //first check the text box against unwanted characters - SQL injection protection
    //both text boxes must be filed
    if(this.phoneNumber == undefined || this.dateOfNotice == undefined){
      this.failAlert('Phone Number and Date of notice fields must be filed!')
      return;
    }
    //check phone number - important check - this is out primary key so it must be unique
    if(!this.numericCheck(this.phoneNumber)){
      this.failAlert('Only numbers are allowed in Phone Number field');
      return;
    }
    if(this.phoneNumber.length != 10){
      this.failAlert('Phone number must contain exactly 10 Numbers');
      return;
    }
    //Change date to timestamp
    this.dateOfNoticeTimeStamp = new Date(this.dateOfNotice).getTime();

    //after input is valid send the data to the backend server
    this.http.post<any>('/api/sendInfectedAlert', {phoneNumber: this.phoneNumber, dateOfNotice: this.dateOfNoticeTimeStamp.toString()})
      .subscribe(data => {
        console.log(data.statusCode);
        this.successAlert("Your notice was recorded, you will remain anonymous to all users :) ")
      }, error => {
        console.error("sendInfectedAlert error: " + error.message);
        this.failAlert('Something went wrong!\nPlease try again..');
      });
  }

  //  --  alert functions  --   //

  //success Alert after a business registered successfully
  successAlert(message) {
    Swal.fire("Wow", message, "success");
  }

  //failed alert pops if the registration failed, either the input given by the user was wrong or internal server error
  failAlert(text) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: text,
    })
  }

  //check that all inputTxt is numbers
  numericCheck(inputTxt) {
    const numbers = /^[0-9]+$/;
    return (inputTxt.match(numbers));
  }

  //check that date and time is in correct form
  //TODO - make this field a scroll down menu or auto-complete
  dateCheck(inputTxt) {
    return true;
  }

}
