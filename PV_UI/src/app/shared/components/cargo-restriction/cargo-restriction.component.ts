import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cargo-restriction',
  templateUrl: './cargo-restriction.component.html',
  styleUrls: ['./cargo-restriction.component.scss']
})
export class CargoRestrictionComponent implements OnInit {
  @Input() cargoRestrictions;

  constructor() {}

  ngOnInit(): void {}
}
