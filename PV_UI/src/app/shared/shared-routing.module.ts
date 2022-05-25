import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeftNavComponent } from './left-nav/left-nav.component';
// import { SidenavComponent } from './sidenav/sidenav.component';

const routes: Routes = [
  /* {
    path: '',
    component: LeftNavComponent
  }*/
];
/**
 * This routing file has no use as of now.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedRoutingModule {}
