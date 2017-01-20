/**
 *  Animates the scroll indicator which gives the user an idea of how much of 
 *  the page has been scrolled thereby indicating how much more content there is 
 *  to read.
 */
class Scroll {

  constructor() {
    this.header = document.querySelector('header');
    this.indicator = document.querySelector('.scroll-indicator');
    this.handler = this.onScroll.bind(this);
  }

  getScrollLimit() {
    return Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight, 
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight ) - window.innerHeight;
  }

  show(flag) {
    this.header.classList.remove('scrolling');
    if(!flag) {
      this.header.classList.add('scrolling');
    }
  }

  onScroll(/* evt */) {
    const pos = window.scrollY;
    const limit = this.getScrollLimit();
    // normalized value
    const amount = (pos / limit) * 1;
    // percentage value
    const percent = amount * 100;
    // inline style
    const style = `opacity: ${amount}; width: ${percent}%`;
    this.indicator.style = style;

    if(pos === 0) {
      this.show(true); 
    }else{
      this.show(false);
    }
  }

  start() {
    window.addEventListener('scroll', this.handler);
  }

}

export {Scroll}
