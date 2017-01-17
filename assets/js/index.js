import './array-from'

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

    this.contrast = new Contrast();
    this.selected = new Selected();
    this.scroller = new Scroll();
    //this.progressive = new Progressive(this.selected);
  }

  start() {

    this.contrast.start();
    this.selected.start();
    this.scroller.start();
    //this.progressive.start();
  }

}

//document.querySelector('main')
  //.appendChild(document.createElement('localstorage: ' + window.localStorage));

const app = new Application();
app.start();
