const HOME = 'home';

/**
 *  Progressive enhancement using the `fetch` API to dynamically load and render
 *  the page without refreshing the entire page content.
 */
class Progressive {

  constructor(selected, scroller) {
    this.selected = selected;
    this.scroller = scroller;
    this.links = Array.from(document.querySelectorAll('header a'));
    this.click = this.onClick.bind(this);
    this.popstate = this.onPopState.bind(this);
    this.pathname = document.location.pathname;
    this.responded = false;

    // current href
    this.href = null;

    // current loaded document content (HTML)
    this.doc = null;
  }

  render(href, doc) {
    const html = document.createElement('html')
        , main = document.createElement('main');

    main.setAttribute('role', 'main');
    main.setAttribute('id', this.getIdentifier(href));

    html.appendChild(main);
    main.innerHTML = doc;

    const current = document.querySelector('main');
    current.parentNode.replaceChild(main, current);

    // update title based on loaded section partial
    const title = document.querySelector('article[title]')
      .getAttribute('title');
    document.querySelector('head > title').innerText = title;

    this.scroller.update();

    // reset scroll position
    window.scrollTo(0, 0);

  }

  getPreloadMessage(href) {
    let msg = href;
    if(msg === '/') {
      msg = HOME;
    }
    msg = msg.replace(/^\//, '')
    return `Loading ${msg}`;
  }

  remove() {
    const body = document.querySelector('body');
    const el = document.querySelector('body > .preload');
    this.selected.setEnabled(true);
    body.removeAttribute('style');
    body.removeChild(el);
  }

  preloader(href) {

    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }

    const now = Date.now();

    // animation duration for preloader reveal
    // do not draw the view until this time has elapsed
    const animation = 500;

    // minimum wait time to prevent preloader flicker
    const duration = 1000;

    const body = document.querySelector('body');

    let el = document.querySelector('body > .preload');

    if(el) {
      this.remove();
    }

    // get preloader template
    el = document.querySelector('template')
      .content.querySelector('.preload').cloneNode(true);

    // removing existing preloader
    if(href === null) {
      return false;
    }

    // disable scrolling during preload
    body.style = 'overflow: hidden';

    let txt = el.querySelector('em');
    let msg = this.getPreloadMessage(href);
    txt.innerText = msg;

    body.appendChild(el);

    this.timeout = setTimeout(() => {
      el.style = 'opacity: 1';
      this.timeout = null;
    }, 5);

    this.interval = setInterval(() => {
      if(this.doc && (Date.now() - now >= animation)) {
        this.render(this.href, this.doc);

        // do not attempt to redraw once rendered
        this.doc = null;
      }

      if(this.responded && (Date.now() - now >= duration)) {
        this.remove();
        clearInterval(this.interval);
        this.interval = null
      }
    }, 250)
  }

  fallback(href) {
    document.location.pathname = href;
  }

  load(href) {
    const url = href.replace(/\/$/, '') + '/partial.html';

    this.href = href;
    this.responded = false;

    // show preloader
    this.preloader(href);

    this.selected.setEnabled(false);

    // update navigation selected state
    this.selected.setSelected(this.getClassName(href));

    // load the HTML partial
    fetch(url).then((response) => {

      // flag to remove preloader
      this.responded = true;

      if(response.ok) {
        response.text().then((doc) => {

          // keep reference so that the preloader
          // can draw the document to the DOM
          // this is done so that when the page loads very fast
          // it is not rendered before the preloader has finished
          // animating
          this.doc = doc;

        })
      }else{
        //console.log('Network response was not ok.');
        this.fallback(href);
      }
    })
    .catch((error) => {
      console.log(`fetch error: ${error.message} (url: ${url})`);
      this.fallback(href);
    });
  }

  getIdentifier(href) {
    if(href === '/') {
      return this.selected.getDefault();
    }

    // share with class name for the moment
    return this.getClassName(href);
  }

  getClassName(href) {
    // className is derived by convention from the href
    return href.replace(/^\/+/, '');
  }

  onClick(evt) {
    evt.preventDefault();

    const link = evt.currentTarget
        , pathname = document.location.pathname.replace(/\/$/, '');

    let href = link.getAttribute('href').replace(/\/$/, '');

    // attempt to navigate to current path
    if(href === pathname) {
      return false;
    }

    if(href === '') {
      href = '/';
    }

    //if(document.location.hash) {
      //console.log('has hash symbol');
      //href = href.replace(/#.*$/, '');
      ////return this.fallback(href);
    //}
    //
    var push = href;

    // we actually want to show URLs with a trailing slash
    // to prevent amazon redirect / location issues
    if (href !== '/') {
      push += '/'
    }

    history.pushState({href: href}, '', push);
    this.load(href);
  }

  onPopState(evt) {

    if(evt.state && evt.state.href) {
      this.load(evt.state.href);
    }else{

      // allow hash changes to navigate to named anchors
      // when there are no state items in the history
      if(document.location.hash) {
        return;
      }

      this.load(this.pathname);
    }
  }

  start() {
    // NOTE: window.fetch is `undefined` in mobile safari
    if(window.fetch) {
      this.links.forEach((link) => {
        link.addEventListener('click', this.click);
      })

      window.addEventListener('popstate', this.popstate);
    }
  }

}

export {Progressive}
