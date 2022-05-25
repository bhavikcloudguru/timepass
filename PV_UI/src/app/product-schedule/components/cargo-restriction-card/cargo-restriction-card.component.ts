import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-cargo-restriction-card',
  templateUrl: './cargo-restriction-card.component.html',
  styleUrls: ['./cargo-restriction-card.component.scss']
})
export class CargoRestrictionCardComponent implements OnInit {
  @Input() portList: any;
  public dataOnceLoaded;
  public showLoader;
  public cargoRestrictions: Array<any> = [];
  constructor(
    public dataService: DataService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  public openCargoRestriction() {
    if (this.dataOnceLoaded) {
      return;
    }
    this.showLoader = true;
    this.dataService
      .getCargoRestrictionDetails(this.portList)
      .subscribe(result => {
        if (result.length) {
          this.cargoRestrictions = this.setPortOrder(result);
          console.log(this.cargoRestrictions);
        }
        this.showLoader = false;
        this.dataOnceLoaded = true;
        this.changeDetectorRef.detectChanges();
      });
  }

  private setPortOrder(cargos): any {
    const result = cargos.sort((a, b) => {
      return (
        this.portList.indexOf(a.portCode) - this.portList.indexOf(b.portCode)
      );
    });
    return result;
  }
}
