import './array-from'

import {Selected} from './selected';
import {Scroll} from './scroll';
import {Contrast} from './contrast';
import {Progressive} from './progressive';

class Application {

  constructor() {
    // TODO: redirect to unsupported browser on feature check

    this.contrast = new Contrast();
    this.selected = new Selected();
    this.scroller = new Scroll();
    this.progressive = new Progressive(this.selected, this.scroller);
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

    // animation redraw issues changing contrast on old iphone
    // so disable the contrast toggle
    if(this.isIos() && (this.isIos5() || this.isIos4())) {
      document.querySelector('ul.workflow li')
        .setAttribute('style', 'display: inline-block')
      this.contrast.disable();
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
