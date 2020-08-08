import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-register',
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.scss']
})
export class RegisterBusinessComponent {

  //Business information
  public businessName: String;
  public businessAddress: String;

  constructor(private http: HttpClient) {
  }

  //when business owner presses to register his business
  insertNewBusiness() {
    //first check the input is valid
    //both text boxes must be filed
    if(this.businessAddress == undefined || this.businessName == undefined){
      this.failAlert('Address and Name fields must be filed!')
      return;
    }
    //check that all characters entered are alphaNumeric
    if(!(this.alphaNumericCheck(this.businessName) && this.alphaNumericCheck(this.businessAddress))){
      this.failAlert('Only characters and numbers are allowed');
      return;
    }

    //after input is valid send the data to the backend server
    this.http.post<any>('/api/insertNewBusiness', {businessname: this.businessName, address: this.businessAddress})
      .subscribe(data => {
        console.log(data.statusCode);
        this.successAlert("You just managed to sign up your business :) ")

      }, error => {
        console.error("insertNewBusiness error: " + error.message);
        this.failAlert('Something went wrong!\nPlease try again..');
      });
  }

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

  //check that inputTxt is containing only characters and numbers
  alphaNumericCheck(inputTxt) {
    const letters = /^[0-9a-zA-Z ]+$/;
    return (inputTxt.match(letters));
  }

}
