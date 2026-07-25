import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { getChineseCharacterTickValue, loadWordsList, updateChineseCharacterTickValueOnSessionClose } from './state/app.actions';
import { AppState } from './state/app.state';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { BackendWakeupService } from './backend-wakeup.service';
import { LoadingService } from './loading.service';
export let browserRefresh = false;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  subscription!: Subscription;

  constructor(private readonly store: Store<AppState>, private readonly httpClient:HttpClient, private readonly router:Router, public readonly wakeup: BackendWakeupService, public readonly loading: LoadingService) {}

  @HostListener('window:unload', ['$event'])
  unloadHandler() {
    console.log('unloading contents');
  }
  @HostListener('window:beforeunload', ['$event'])
   beforeUnloadHandler() {
    console.log('before unloading contents');
    this.updateTickedInfo();
   }

  ngOnInit(){
    this.store.dispatch(loadWordsList());    
    this.store.dispatch(getChineseCharacterTickValue());    
    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        browserRefresh = !this.router.navigated;
        if(browserRefresh){
          this.updateTickedInfo();
        }
      }
  });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateTickedInfo() {
    this.store.dispatch(updateChineseCharacterTickValueOnSessionClose());
  }
}
