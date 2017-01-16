/**
 *  Animates the scroll indicator which gives the user an idea of how much of 
 *  the page has been scrolled thereby indicating how much more content there is 
 *  to read.
 */
class Scroll {

  constructor() {
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
  }

  start() {
    window.addEventListener('scroll', this.handler);
  }

  stop() {
    window.removeEventListener('scroll', this.handler); 
  }
}

export {Scroll}
