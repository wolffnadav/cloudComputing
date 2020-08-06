import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  user = {id: 1, name: 'Hello'};

  constructor(private http: HttpClient) {
    this.callServer()
  }

  callServer() {
    this.http.post<any>('/api/ping', {key: "1234"}).subscribe(data => {
      console.log(data.statusCode);
      console.log(data.body);
    }, error => {
      console.error("http error: " + error.message)
    });
  }
}
