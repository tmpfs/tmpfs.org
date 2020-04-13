function easeOutQuad (iteration, start, diff, total) {
  return -diff * (iteration /= total) * (iteration - 2) + start
}

class Scroll {

  constructor () {
    this.header = document.querySelector('header')
    this.top = document.querySelector('[href="#top"]')

    this.handler = this.onScroll.bind(this)
    this.resize = this.onResize.bind(this)
    this.scrollTop = this.onScrollTop.bind(this)

    // trigger resize handler on load
    this.resize()
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

  show (flag) {
    this.header.classList.remove('scrolling')
    if (!flag) {
      this.header.classList.add('scrolling')
    }
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

  onResize (/* evt */) {
    // show back to top link
    if (this.getScrollLimit() && this.top.classList.contains('hidden')) {
      this.top.classList.remove('hidden')
    // there is something to scroll
    } else if (!this.getScrollLimit() && !this.top.classList.contains('hidden')) {
      this.top.classList.add('hidden')
    }
  }

  onScroll (/* evt */) {
    const pos = window.scrollY
    const limit = this.getScrollLimit()

    if (pos === 0) {
      this.show(true)
    } else if (!this.header.classList.contains('scrolling')) {
      this.show(false)
    }
  }

  update () {
    this.resize()
  }

  start () {
    this.top.addEventListener('click', this.scrollTop)
    document.addEventListener('scroll', this.handler)
    window.addEventListener('resize', this.resize)
  }

}

export {Scroll}
