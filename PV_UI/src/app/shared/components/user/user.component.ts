import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { ScheduleService } from '../../api-service/schedule/schedule.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  public userList: any = [];

  constructor(public dataService: DataService) {}

  ngOnInit(): void {
    this.loadUser();
  }

  public loadUser() {
    this.dataService.getAllUser().subscribe(response => {
      this.userList = response;
    });
  }
}
