import {Selected} from './selected.js';
import {Scroll} from './scroll.js';
import {Progressive} from './progressive.js';

class Application {

  constructor() {
    this.selected = new Selected();
    this.scroller = new Scroll();
    this.progressive = new Progressive(this.selected);
  }

  start() {
    this.selected.start();
    this.scroller.start();
    this.progressive.start();
  }

}

const app = new Application();
app.start();
