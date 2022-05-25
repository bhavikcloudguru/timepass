import { environment } from './../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { OktaAuthService } from '@okta/okta-angular';
import * as OktaSignIn from '@okta/okta-signin-widget';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  signIn;
  widget = new OktaSignIn({
    baseUrl: environment.oktaBaseURL,
    authParams: {
      issuer: environment.oktaConfig.issuer
    }
  });

  constructor(oktaAuth: OktaAuthService, router: Router) {
    console.log(this.widget);
    this.signIn = oktaAuth;
    router.events.forEach(event => {
      if (event instanceof NavigationStart) {
        switch (event.url) {
          case '/login':
            break;
          case '/protected':
            break;
          default:
            this.widget.remove();
            break;
        }
      }
    });
  }

  ngOnInit() {
    console.log(this.widget);
    this.widget.renderEl(
      {
        el: '#okta-signin-container'
      },
      res => {
        if (res.status === 'SUCCESS') {
          console.log(res);
          this.signIn.loginRedirect('/product-schedule', {
            sessionToken: res.session.token
          });
          // Hide the widget
          this.widget.hide();
        }
      },
      err => {
        throw err;
      }
    );
  }
}
