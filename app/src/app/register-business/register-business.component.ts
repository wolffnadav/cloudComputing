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
  public keyword = 'name';

  //Business information
  public businessName: String;
  public businessAddress: String;
  public businessType: String;

  public businessesTypeList = [{"name": "Restaurants", "id": 0}, {"name": "Beach", "id": 1},
    {"name": "Bar/Pub", "id": 2}, {"name": "Shopping store", "id": 3}, {"name": "Bus line", "id": 4},
    {"name": "Train", "id": 5}, {"name": "GYM", "id": 6}];

  constructor(private http: HttpClient) {
  }

  //When business owner presses to register his business
  insertNewBusiness() {
    //First check the input is valid
    //Both text boxes must be filed
    if (this.businessAddress == undefined || this.businessType == undefined || this.businessName == undefined) {
      this.failAlert('Business type, Address and Name fields must be filed!');
      return;
    }
    //Check that all characters entered are alphaNumeric
    if (!(this.alphaNumericCheck(this.businessName) && this.alphaNumericCheck(this.businessAddress))) {
      this.failAlert('Only characters and numbers are allowed');
      return;
    }

    //After input is valid send the data to server
    this.http.post<any>('/api/insertNewBusiness', {
      businessname: this.businessName,
      address: this.businessAddress,
      type: this.businessType
    }).subscribe(data => {
      console.log(data.statusCode);
      this.successAlert("You sign up your business :) ");
      this.getQrImage()
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

  ngOnInit() {
    this.isSubmit = false;
  }

  //Save the business type choose from the businesses type list
  selectEvent(item) {
    this.businessType = item.name;
  }

  onChangeSearch(val: string) {
  }

  onFocused(e){
  }

  //After successful sign up get the qr code from server (saves in s3)
  private getQrImage() {
    this.isSubmit = true;
    this.http.get<any>('/api/getQrImage').subscribe(data => {
      this.qrImage = data.images;
    }, error => {
      console.error("getQrImage error: \n" + error.message);
    });
  }

}
