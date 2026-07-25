import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { ContentListViewComponent } from './shared/content-list-view/content-list-view.component';
import { LoggedOutComponent } from './logged-out/logged-out.component';
import { AuthGuard } from '@auth0/auth0-angular';

const routes: Routes = [
  {
    path:'',
    component: MainPageComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'lists',
    component: ContentListViewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'logged-out',
    component: LoggedOutComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}
