import { Component } from '@angular/core';

@Component({
  selector: 'angularup-app',
  template: '<h1>hey, {{name}}</h1>'
  
})

export class AppComponent {
  name = "produktor.io"
  constructor() {   }
}