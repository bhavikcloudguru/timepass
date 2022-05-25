import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CarbonOptionsComponent } from './carbon-options.component';

describe('CarbonOptionsComponent', () => {
  let component: CarbonOptionsComponent;
  let fixture: ComponentFixture<CarbonOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CarbonOptionsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarbonOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
