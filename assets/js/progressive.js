/**
 *  Progressive enhancement using the `fetch` API to dynamically load and render 
 *  the page without refreshing the entire page content.
 */
class Progressive {

  constructor(selected) {
    this.selected = selected;
    this.links = Array.from(document.querySelectorAll('header a'));
    this.click = this.onClick.bind(this);
    this.popstate = this.onPopState.bind(this);
    this.pathname = document.location.pathname;
    this.responded = false;
  }

  preloader(href) {
    const now = Date.now();
    // minimum wait time to prevent preloader flicker
    const duration = 1000;

    const body = document.querySelector('body');
    
    let el = document.querySelector('.preload')
      , bg
      , msg
      , txt;

    function remove() {
      body.removeAttribute('style');
      body.removeChild(el);
    }

    if(el) {
      remove();
    }

    // removing existing preloader
    if(href === null) {
      return false; 
    }

    // disable scrolling during preload
    body.style = 'overflow: hidden';

    el = document.createElement('div');
    el.setAttribute('class', 'preload');
    bg = document.createElement('div');
    bg.setAttribute('class', 'background');
    msg = document.createElement('div');
    msg.setAttribute('class', 'message');
    txt = document.createElement('span');
    txt.innerText = `Load: ${href}`;
  
    el.appendChild(bg);
    msg.appendChild(txt);
    el.appendChild(msg);
    body.appendChild(el);

    setTimeout(() => {el.style = 'opacity: 1'}, 5);

    let interval = setInterval(() => {
      if(this.responded && (Date.now() - now >= duration)) {
        remove();
        clearInterval(interval);
      }
    }, 250)
  }

  fallback(href) {
    document.location.pathname = href;
  }

  render(href) {
    const url = href.replace(/\/$/, '') + '/partial.html';

    this.responded = false;
    this.preloader(href);

    fetch(url).then((response) => {

      // flag to remove preloader
      this.responded = true;

      if(response.ok) {
        response.text().then((doc) => {

          const html = document.createElement('html')
              , main = document.createElement('main');

          main.setAttribute('role', 'main');
          main.setAttribute('id', this.getIdentifier(href));

          html.appendChild(main);
          main.innerHTML = doc;

          const current = document.querySelector('main');
          current.parentNode.replaceChild(main, current);

          // reset scroll position
          window.scrollTo(0, 0);

          this.selected.setSelected(this.getClassName(href));

        })
      }else{
        //console.log('Network response was not ok.');
        this.fallback(href);
      }
    })
    .catch(function(error) {
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

    history.pushState({href: href}, '', href);
    this.render(href);
  }

  onPopState(evt) {
    if(evt.state && evt.state.href) {
      this.render(evt.state.href); 
    }else{
      this.render(this.pathname); 
    }
  }

  start() {
    if(window.fetch !== null) {
      this.links.forEach((link) => {
        link.addEventListener('click', this.click);
      })

      window.addEventListener('popstate', this.popstate);
    }
  }

}

export {Progressive}
