import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from '../../api-service/loader/loader.service';
import { LoaderState } from '../../interfaces/loader-interface';

@Component({
  selector: 'app-pre-loader',
  templateUrl: './pre-loader.component.html',
  styleUrls: ['./pre-loader.component.scss']
})
export class PreLoaderComponent implements OnInit, OnDestroy {
  public show: boolean = false;
  public message: any;
  public loaderType: string;
  private loaderSubscription: Subscription = new Subscription();
  private updateSubscription: Subscription = new Subscription();
  constructor(public loaderService: LoaderService) {}

  /**
  Initialize loader subscription
  show    : boolean  - Hide and show loader
  message : string   - Update message in the loader.
  **/
  ngOnInit() {
    this.loaderSubscription.add(
      this.loaderService.getObservable().subscribe((state: LoaderState) => {
        if (state) {
          this.show = state.show;
          this.message = state.message ? state.message : '';
          this.loaderType = state.type ? state.type : '';
        }
      })
    );
    this.updateSubscription = this.loaderService
      .getUpdateObservable()
      .subscribe((state: LoaderState) => {
        if (state) {
          this.message = state.message;
        }
      });
  }

  /* Destroy Subscriptons */
  ngOnDestroy() {
    this.loaderSubscription.unsubscribe();
    this.updateSubscription.unsubscribe();
  }
}
