import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { updateChineseCharacterTickValueOnSessionClose } from 'src/app/state/app.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private readonly router:Router, private readonly store:Store) { }

  ngOnInit(): void {
  }
  navigateToMainPage():void{
    this.router.navigate(['']).then(() => {
      window.location.reload();
    });
  }

  saveChanges(){
    this.updateTickedInfo();
  }

  private updateTickedInfo() {
    this.store.dispatch(updateChineseCharacterTickValueOnSessionClose());
  }

}
