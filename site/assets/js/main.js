import {Selected} from './selected.js';
import {Progressive} from './progressive.js';

class Application {
  constructor() {
    this.selected = new Selected();
    this.progressive = new Progressive(this.selected);
  }

  start() {
    this.selected.start();
    this.progressive.start();
  }
}

const app = new Application();
app.start();
