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
    this.progressive = new Progressive(this.selected);
  }

  isIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  isIos4() {
    return !!window.history && ('pushState' in window.history);
  }

  isIos5() {
    return !!window.matchMedia;
  }

  start() {

    if(this.isIos() && (this.isIos5() || this.isIos4())) {
      this.contrast.setEnabled(false); 
    }else{
      this.contrast.start();
    }
    this.selected.start();
    this.scroller.start();
    this.progressive.start();
  }

}

const app = new Application();
app.start();
