import {Selected} from './selected';
import {Scroll} from './scroll';
import {Contrast} from './contrast';
import {Progressive} from './progressive';

/**
 *  Main application entry point.
 */
class Application {

  constructor() {
    // TODO: redirect to unsupported browser on feature check

    this.selected = new Selected();
    this.scroller = new Scroll();
    this.contrast = new Contrast();
    this.progressive= new Progressive();
  }

  start() {
    this.selected.start();
    this.scroller.start();
    this.contrast.start();
    this.progressive.start();
  }

}

const app = new Application();
app.start();
