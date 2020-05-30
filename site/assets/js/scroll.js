function easeOutQuad (iteration, start, diff, total) {
  return -diff * (iteration /= total) * (iteration - 2) + start
}

class Scroll {

  constructor () {
    this.top = document.querySelector('.top')
    this.scrollTop = this.onScrollTop.bind(this)
  }

  getScrollHeight () {
    return Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight)
  }

  getScrollLimit () {
    return this.getScrollHeight() - window.innerHeight
  }

  onScrollTop (e) {
    e.preventDefault()
    // window.scrollTo(0,0);
    this.scrollToTop(0)
  }

  getScrollPosition () {
    let doc = document.documentElement
    let left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0)
    let top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
    return {left: left, top: top}
  }

  scrollToTop (val) {
    let start = this.getScrollPosition().top
    let iteration = 0
    let duration = 50
    let diff = val < start ? -start : val
    let requestAnimationFrame = window.requestAnimationFrame ||
                                window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                window.msRequestAnimationFrame

    // perform the animation
    function doScroll () {
      const value = easeOutQuad(iteration, start, diff, duration)
      const amount = value < 0 ? -value : value
      window.scrollTo(0, amount)
      if (iteration >= duration) {
        window.scrollTo(0, Math.floor(amount))
        return
      }
      requestAnimationFrame(doScroll)
      iteration++
    }

    doScroll()
  }

  start () {
    this.top.addEventListener('click', this.scrollTop)
  }

}

export {Scroll}
