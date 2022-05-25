import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  HostListener,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-right-nav',
  templateUrl: './right-nav.component.html',
  styleUrls: ['./right-nav.component.scss']
})
export class RightNavComponent implements OnInit {
  isExpanded = true;
  public userDetails: any;
  @ViewChild('sidenav') sidenav: MatSidenav;
  @Input() position;
  @Input() count;
  @Output() public closeRightPanel = new EventEmitter<any>();
  public opened;
  public showMainView = true;
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (
      !this.eRef.nativeElement.contains(event.target) &&
      event.target.className !== 'bell-icon-container'
    ) {
      this.closeRightPanel.emit();
      this.sidenav.close();
    }
  }
  @Input()
  set isOpen(value) {
    this.opened = value;
    if (this.opened) {
      this.sidenav.open();
    } else {
      if (this.closeRightPanel && this.sidenav) {
        this.closeRightPanel.emit();
        this.sidenav.close();
      }
    }
  }

  get isOpen(): boolean {
    return this.opened;
  }

  constructor(
    public router: Router,
    public dialog: MatDialog,
    private eRef: ElementRef
  ) {}
  ngOnInit() {}
  /** Disabe tab except right panel
   *  @param event: KeyboardEvent
   *  return null
   */

  public handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.opened && event.key === 'Tab') {
      event.preventDefault();
    }
  }

  /** close right panel
   *  @param event: any
   */
  public closePanel(): void {
    this.closeRightPanel.emit();
    this.sidenav.close();
  }
  public onClose(event) {
    if (event.target && event.target.id === 'content-div') {
      this.closePanel();
    }
  }
}
