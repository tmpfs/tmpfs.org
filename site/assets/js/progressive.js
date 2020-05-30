const HOME = 'home';

/**
 *  Progressive enhancement using the `fetch` API to dynamically load and render
 *  the page without refreshing the entire page content.
 */
class Progressive {

  constructor(selected) {
    this.selected = selected;
    this.links = Array.from(document.querySelectorAll('header a, a.internal'));
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
    let main = document.querySelector("main");
    let old = document.querySelector("article");
    let article = doc.querySelector("article");
    if (article) {
      main.replaceChild(article, old);

      // update title based on loaded section partial
      const title = document.querySelector('article')
        .getAttribute('data-title');
      document.querySelector('head > title').innerText = title;
    }
    // reset scroll position
    window.scrollTo(0, 0);
  }

  getName(href) {
    return href
      .replace(/\/$/, '')
      .replace(/^([.]+\/?)+/, '')
      .replace(/\/$/, '');
  }

  getPreloadMessage(href) {
    let msg = this.getName(href)
    if(msg === '/') {
      msg = HOME;
    }
    if (msg == '') {
      msg = 'Home'
    }
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
    if (!/\/$/.test(href)) {
      href += "/"
    }
    document.location.pathname = href;
  }

  load(href) {
    const url = href;

    this.href = href;
    this.responded = false;

    // show preloader
    this.preloader(href);

    this.selected.setEnabled(false);

    // update navigation selected state
    this.selected.setSelected(this.getClassName(href));

    console.log("fetch url", url);

    // load the HTML partial
    fetch(url).then((response) => {

      // flag to remove preloader
      this.responded = true;

      if(response.ok) {
        response.text().then((doc) => {

          let parser = new DOMParser();
          let dom = parser.parseFromString(doc, "text/html");

          // keep reference so that the preloader
          // can draw the document to the DOM
          // this is done so that when the page loads very fast
          // it is not rendered before the preloader has finished
          // animating
          this.doc = dom;

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

    var push = href;

    // we actually want to show URLs with a trailing slash
    // to prevent amazon redirect / location issues
    if (href !== '/') {
      if (!/^\//.test(href)) {
        push = '/' + push;
      }
      push += '/'
    }

    //console.log("pushState", href, push)

    history.pushState({href}, '', push);
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
