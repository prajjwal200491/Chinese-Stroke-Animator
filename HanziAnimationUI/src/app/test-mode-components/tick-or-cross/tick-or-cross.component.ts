import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tick-or-cross',
  templateUrl: './tick-or-cross.component.html',
  styleUrls: ['./tick-or-cross.component.scss']
})
export class TickOrCrossComponent implements OnInit {
  @Input() isTick=false;

  constructor() { }

  ngOnInit(): void {
  }

}
