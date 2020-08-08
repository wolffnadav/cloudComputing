import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-register-person',
  templateUrl: './register-person.component.html',
  styleUrls: ['./register-person.component.scss']
})
export class RegisterPersonComponent {

  //User info
  public userPhoneNumber: String;
  public userName: String;
  public userEmail: String;
  public businessEntered: String;

  constructor(private http: HttpClient) {
  }

  //when customer scans a barcode this adds his visit to the Users table
  insertNewPerson() {
    //first check the input is valid
    //both text boxes must be filed
    if(this.userPhoneNumber == undefined || this.userName == undefined || this.userEmail == undefined || this.businessEntered == undefined){
      this.failAlert('Address and Name fields must be filed!');
      return;
    }
    //check that all characters entered in Name and Business fields are alphaNumeric
    if(!(this.alphaNumericCheck(this.userName) && this.alphaNumericCheck(this.businessEntered))){
      this.failAlert('Only characters and numbers are allowed\n in the Name and Business fields');
      return;
    }

    //check phone number - important check - this is out primary key so it must be unique
    if(!this.numericCheck(this.userPhoneNumber)){
      this.failAlert('Only numbers are allowed in Phone Number field');
      return;
    }
    if(this.userPhoneNumber.length != 10){
      this.failAlert('Phone number must contain exactly 10 Numbers');
      return;
    }

    //check email
    if(!this.emailCheck(this.userEmail)){
      this.failAlert('The Email entered is not valid');
      return;
    }

    //after input is valid send the data to the backend server
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

  //check that all inputTxt is numbers
  numericCheck(inputTxt) {
    const numbers = /^[0-9]+$/;
    return (inputTxt.match(numbers));
  }

  //check that email is in correct form with '@' and '\.' in the text
  emailCheck(inputTxt) {
    const letters = /^[0-9a-zA-Z@\.]+$/;
    if(!inputTxt.match('@')) return false;
    if(!inputTxt.match('[.]')) return false;
    return (inputTxt.match(letters));
  }

}
