import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  insertNewBusinessParam: {};

  constructor(private http: HttpClient) {
    this.callServer()
  }

  callServer() {
    this.http.post<any>('/api/ping', {body: "Ping check"}).subscribe(data => {
      console.log(data.statusCode, data.body);
    }, error => {
      console.error("ping error: " + error.message)
    });
  }

  insertNewBusiness() {
    this.insertNewBusinessParam = {
      ExpressionAttributeNames: {
        "#C": "Customers",
        "#F": "Infected",
        "#N": "Name",
        "#V": "Visitors",
        "#A": "Address"
      },
      ExpressionAttributeValues: {
        ":C": {
          L: [{
            SS: [
              "0544444",
              "2020-12-21T17:42:34Z"
            ]
          }
          ]
        },
        ":F": {
          N: "1"
        },
        ":N": {
          S: "Nadav555"
        },
        ":V": {
          N: "0"
        },
        ":A": {
          S: "Rosh Haayin"
        }
      },
      Key: {
        "ID": {
          N: "3"
        }
      },
      ReturnValues: "ALL_NEW",
      TableName: "Businesses",
      UpdateExpression: "SET #C = #C, :C, #F = :F, #N = :N, #V = :V, #A = :A"
    };
    this.http.post<any>('/api/insertNewBusiness', {key: this.insertNewBusinessParam})
      .subscribe(data => {
        console.log(data.statusCode);
      }, error => {
        console.error("insertNewBusiness error: " + error.message)
      });
  }
}
