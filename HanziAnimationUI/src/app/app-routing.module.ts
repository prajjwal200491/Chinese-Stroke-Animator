import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { ContentListViewComponent } from './shared/content-list-view/content-list-view.component';

const routes: Routes = [
  {
    path:'',
    component: MainPageComponent,
    pathMatch: 'full'
  },
  {
    path: 'lists',
    component: ContentListViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}
