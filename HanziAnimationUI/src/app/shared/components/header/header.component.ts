import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { updateChineseCharacterTickValueOnSessionClose } from 'src/app/state/app.actions';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  loginUrl='';
  constructor(private readonly router:Router, private readonly store:Store, @Inject(DOCUMENT) public document: Document, public auth: AuthService) { 
    
  }
  

  ngOnInit(): void {
    this.loginUrl=`${this.document.location.origin}/login`;
    this.auth.isAuthenticated$.subscribe(isAuth=>{ console.log(isAuth)})
  }
  navigateToMainPage():void{
    // SPA navigation only — no full-page reload.
    this.router.navigate(['']);
  }

  logout(){
   
    this.auth.logout({logoutParams:{returnTo:`${this.document.location.origin}/logged-out`}})
    //this.auth.loginWithRedirect();
  }
  login(){
    this.auth.loginWithRedirect();
  }

  saveChanges(){
    //this.updateTickedInfo();
  }

  private updateTickedInfo() {
    this.store.dispatch(updateChineseCharacterTickValueOnSessionClose());
  }

}
