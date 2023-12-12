import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private readonly router:Router) { }

  ngOnInit(): void {
  }
  navigateToMainPage():void{
    this.router.navigate(['']).then(() => {
      window.location.reload();
    });
  }

}
