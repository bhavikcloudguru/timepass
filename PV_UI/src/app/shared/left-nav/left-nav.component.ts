import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription, interval } from 'rxjs';
import { map, mergeMap, shareReplay } from 'rxjs/operators';
//import { OktaAuthService } from '@okta/okta-angular';
import { Router } from '@angular/router';
import { Utils } from 'src/app/common/utilities/Utils';
import { DataService } from 'src/app/data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RegisterComponent } from '../components/register/register.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { FeedbackComponent } from '../components/feedback/feedback.component';
import { AppConstants } from '../app-constants/app-constants.model';
import { EventDispatcherService } from '../api-service/event-dispatcher/event-dispatcher.service';
import { KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.scss']
})
export class LeftNavComponent implements OnInit, OnDestroy {
  @Output() public togglePanel = new EventEmitter<any>();
  isExpanded = true;
  userName: string;
  userAcr: string;
  public userDetails: any;
  public opened;
  public timeInterval;
  private subscriptions: Subscription = new Subscription();
  public notificationCount = 0;
  public isDataRepositoryShown = false;
  public isSuperAdmin = false;
  @Input()
  set isOpen(value) {
    this.opened = value;
  }

  get isOpen(): boolean {
    return this.opened;
  }
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  public betaMenuLabel = {
    productSchedule: false,
    browseService: false,
    capacity: false,
    dataRepository: false,
    scheduleBuilder: false,
    notificationInbox: true,
    intermodal: false,
    betaMessage: false
  };
  public ccUrl;
  public itmsUrl;

  constructor(
    private dataService: DataService,
    private breakpointObserver: BreakpointObserver,

    public router: Router,
    public dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private keycloakAngular: KeycloakService
  ) {}
  async ngOnInit() {

    this.ccUrl = environment.ccm.url;
    this.itmsUrl = environment.itms.url;

    Utils.currentlyLoggedInUserInfoKeyCloak = {} as any;
    // used to get logged in user information from okta service
    // const userClaims = await this.oktaService.getUser();
    const userClaims: any = await this.keycloakAngular.getKeycloakInstance()
      .tokenParsed;
    console.log('UserClaims', userClaims);
    this.userDetails = userClaims;
    this.isSuperAdmin =
      userClaims.realm_access &&
      userClaims.realm_access.roles &&
      userClaims.realm_access.roles.indexOf('super-admin') > -1;
    if (userClaims) {
      // Store the user details in common place- UTILs for time being
      Utils.currentlyLoggedInUserInfoKeyCloak = { userClaims } as any;
      EventDispatcherService.next(
        EventDispatcherService.ON_GET_USER_DETALS,
        true
      );
      if (userClaims.name) {
        this.userName = userClaims.name;
        this.userAcr = this.userAcronym(this.userName);

        this.initializeInterval();
        /*
            this.openRegisterUserPopUp(
              userClaims.name,
              userClaims.email,
              '',
              '',
              '',
              true
            );


      */
      }
    }

    /*
    this.openRegisterUserPopUp(
      'name',
      'email',
      '',
      'Admin',
      'Singapore',
      false
    ); */
  }

  public initializeInterval(): void {
    this.timeInterval = interval(1000 * 60);
    this.getNotifications();
    this.subscriptions.add(
      this.timeInterval.subscribe(val => {
        this.getNotifications();
      })
    );
  }

  public getNotifications(): void {
    const userInfo = Utils.currentlyLoggedInUserInfoKeyCloak.userClaims;
    if (userInfo && userInfo.email) {
      this.dataService
        .getNotificationCount(userInfo.email)
        .subscribe(response => {
          this.notificationCount = response.notificationCount;
        });
    }
  }

  navigateToDashboard(url: string) {
    this.router.navigate([url]);
  }

  private openRegisterUserPopUp(
    username,
    emailId,
    userGroup,
    userDesignation,
    userLocation,
    disablePopup
  ) {
    const dialogRef = this.dialog.open(RegisterComponent, {
      width: '616px',
      data: {
        username,
        emailId,
        userGroup,
        userDesignation,
        userLocation,
        groups$: this.dataService.getGroups(),
        designations$: this.dataService.getDesignations(),
        location$: this.dataService.getUserLocations(),
        disablePopup
      },
      disableClose: disablePopup,
      backdropClass: 'backdropBackground'
    });
    dialogRef.componentInstance.registerUser.subscribe(e => {
      const reqParam = { ...e };
      reqParam['userName'] = username;
      reqParam['emailId'] = emailId;
      reqParam['groupId'] = reqParam['group']['id'];
      this.dataService.registerUser(reqParam).subscribe(rResponse => {
        if (rResponse && rResponse.userPresent) {
          Utils.currentlyLoggedInUserInfoKeyCloak = {
            ...Utils.currentlyLoggedInUserInfoKeyCloak,
            groups: [{ ...rResponse.user.group }],
            user: rResponse.user
          };
        }
      });
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'incorrectInfo') {
        this.feedbackPopup();
      }
    });
  }

  public openRegisterPopUp() {
    const currentlyLoggedInUserInfoKeyCloak =
      Utils.currentlyLoggedInUserInfoKeyCloak;
    this.openRegisterUserPopUp(
      currentlyLoggedInUserInfoKeyCloak.userClaims.name,
      currentlyLoggedInUserInfoKeyCloak.userClaims.email,
      currentlyLoggedInUserInfoKeyCloak.user.group,
      currentlyLoggedInUserInfoKeyCloak.user.designation,
      currentlyLoggedInUserInfoKeyCloak.user.location,
      false
    );
  }

  public openRightPanel(): void {
    this.togglePanel.emit(this.notificationCount);
  }

  public userAcronym(name: string): string {
    const matches = name.match(/\b(\w)/g);
    const acronym = matches.join('');
    return acronym.slice(0, 2).toUpperCase();
  }

  public feedbackPopup(): void {
    if (this.userDetails) {
      const dialogRef: MatDialogRef<FeedbackComponent> = this.dialog.open(
        FeedbackComponent,
        {
          width: '616px',
          data: {
            username: this.userDetails.name,
            emailId: this.userDetails.email,
            type: AppConstants.FEEDBACK_GENERAL_TYPE
          },
          scrollStrategy: new NoopScrollStrategy()
        }
      );
      dialogRef.afterClosed().subscribe(result => {});
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  public dataRepoAccess(event) {
    console.log('dataRepoAccessdataRepoAccess', event);
    this.isDataRepositoryShown = !event;
    this.changeDetectorRef.detectChanges();
  }

  goToLink(type: string){
    if(type === 'ccm') {
      window.open(this.ccUrl, "_blank");
    } else if(type === 'itms') {
      window.open(this.itmsUrl, "_blank");
    }
  }

}
