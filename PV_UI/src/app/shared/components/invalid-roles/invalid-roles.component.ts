import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-invalid-roles',
  templateUrl: './invalid-roles.component.html',
  styleUrls: ['./invalid-roles.component.css']
})
export class InvalidRolesComponent implements OnInit {
  userName: String;
  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    this.keycloakService
      .getKeycloakInstance()
      .loadUserInfo()
      .then(data => {
        this.userName = data['name'];
      })
      .catch(e => {
        console.log('error....', e);
      });
  }
}
