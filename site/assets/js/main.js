import {Selected} from './selected.js';

class Application {
  constructor() {
    this.selected = new Selected();
  }

  start() {
    this.selected.start();
  }
}

const app = new Application();
app.start();
