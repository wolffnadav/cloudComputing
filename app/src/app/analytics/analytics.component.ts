import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    // this.http.post<any>('/api/get-images', {key: "123"}).subscribe(data => {
    //   debugger;
    // }, error => {
    //   console.error("http error: " + error.message)
    // })
  }

}
