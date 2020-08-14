import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-register',
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.scss']
})
export class RegisterBusinessComponent implements OnInit {
  public isSubmit = false;
  public qrImage = [];
  keyword = 'name';
  data = [{"name": "Restaurants", "id": 0}, {"name": "Beach", "id": 1}, {"name": "Bar/Pub", "id": 2},
    {"name": "Malls", "id": 3}, {"name": "Bus line", "id": 4}, {"name": "Train", "id": 5}, {"name": "GYM", "id": 6}];
  public businessType: String;

  //Business information
  public businessName: String;
  public businessAddress: String;

  constructor(private http: HttpClient) {
  }

  //when business owner presses to register his business
  insertNewBusiness() {
    //first check the input is valid
    //both text boxes must be filed
    if (this.businessAddress == undefined || this.businessName == undefined) {
      this.failAlert('Address and Name fields must be filed!')
      return;
    }
    //check that all characters entered are alphaNumeric
    if (!(this.alphaNumericCheck(this.businessName) && this.alphaNumericCheck(this.businessAddress))) {
      this.failAlert('Only characters and numbers are allowed');
      return;
    }

    //after input is valid send the data to the backend server
    this.http.post<any>('/api/insertNewBusiness', {
      businessname: this.businessName,
      address: this.businessAddress,
      type: this.businessType
    })
      .subscribe(data => {
        console.log(data.statusCode);
        this.successAlert("You sign up your business :) ");
        this.getQrImage()
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

  ngOnInit() {
    this.isSubmit = false;
  }

  selectEvent(item) {
    this.businessType = item.name;
  }

  private getQrImage() {
    this.isSubmit = true;
    this.http.get<any>('/api/getQrImage')
      .subscribe(data => {
        debugger;
        this.qrImage = data.images;
      }, error => {
        console.error("getQrImage error: \n" + error.message);
      });
  }

}
