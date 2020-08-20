import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-register-person',
  templateUrl: './register-person.component.html',
  styleUrls: ['./register-person.component.scss']
})
export class RegisterPersonComponent implements OnInit {

  //User info
  public userPhoneNumber: String;
  public userName: String;
  public userEmail: String;
  public businessEntered: string;

  //Businesses info
  public keyword = 'name';
  public businesses = [];

  constructor(private http: HttpClient) {
  }

  //When customer scans a barcode this adds his visit to the Users table
  insertNewPerson() {
    //First check the input is valid
    //All text boxes must be filed
    if (this.userPhoneNumber == undefined || this.userName == undefined || this.businessEntered == undefined || this.userEmail == undefined) {
      this.failAlert('Address, Name, business and Phone number must be filed!');
      return;
    }
    //Check that all characters entered in Name fields are alphaNumeric
    if (!(this.alphaNumericCheck(this.userName))) {
      this.failAlert('Only characters and numbers are allowed\n in the Name field');
      return;
    }
    //Check phone number - important check - this is our primary key so it must be unique and valid
    if (!this.numericCheck(this.userPhoneNumber)) {
      this.failAlert('Only numbers are allowed in Phone Number field');
      return;
    }
    if (this.userPhoneNumber.length != 10) {
      this.failAlert('Phone number must contain exactly 10 Numbers');
      return;
    }

    //Check email
    if (!this.emailCheck(this.userEmail)) {
      this.failAlert('The Email entered is not valid');
      return;
    }
    //If input is valid send the form data to server
    this.http.post<any>('/api/insertNewPerson',
      {
        number: this.userPhoneNumber,
        username: this.userName,
        email: this.userEmail,
        business: this.businessEntered
      }).subscribe(data => {
      this.successAlert("You just managed to sign up :) ")
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

  //Check that inputTxt is containing only characters and numbers
  alphaNumericCheck(inputTxt) {
    const letters = /^[0-9a-zA-Z ]+$/;
    return (inputTxt.match(letters));
  }

  //Check that all inputTxt is numbers
  numericCheck(inputTxt) {
    const numbers = /^[0-9]+$/;
    return (inputTxt.match(numbers));
  }

  //Check that email is in correct form with '@' and '\.' in the text
  emailCheck(inputTxt) {
    const letters = /^[0-9a-zA-Z@\.]+$/;
    if (!inputTxt.match('@')) return false;
    if (!inputTxt.match('[.]')) return false;
    return (inputTxt.match(letters));
  }

  //Save the business name choose from the businesses list
  selectEvent(item) {
    this.businessEntered = item.name;
  }

  ngOnInit() {
    this.getBusinessesList();
  }

  //Get All businesses list from db
  private getBusinessesList() {
    this.http.get<any>('/api/getBusinessesNames')
      .subscribe(res => {
        this.businesses = res.body;
      }, error => {
        console.error("getBusinessesNames error: \n" + error.message);
      });
  }
}
