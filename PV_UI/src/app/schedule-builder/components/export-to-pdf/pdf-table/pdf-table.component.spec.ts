import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfTableComponent } from './pdf-table.component';

describe('PdfTableComponent', () => {
  let component: PdfTableComponent;
  let fixture: ComponentFixture<PdfTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PdfTableComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
