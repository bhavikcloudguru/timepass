import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pdf-header',
  templateUrl: './pdf-header.component.html',
  styleUrls: ['./pdf-header.component.scss']
})
export class PdfHeaderComponent implements OnInit {
  @Input() selectedCountries;
  @Input() pageNumber;
  @Input() totalPages;
  @Input() qrCode;
  @Input() marginIndex;

  constructor() {}

  ngOnInit(): void {}
}
