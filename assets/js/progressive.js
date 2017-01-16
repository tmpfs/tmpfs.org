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
  }

  fallback(href) {
    document.location.pathname = href;
  }

  render(href) {
    fetch(href).then(function(response) {
      if(response.ok) {
        response.text().then(function(doc) {
          const html = document.createElement('html');
          html.innerHTML = doc;
          const main = html.querySelector('main');
          const current = document.querySelector('main');
          current.parentNode.replaceChild(main, current);
        })
      }else{
        //console.log('Network response was not ok.');
        this.fallback(href);
      }
    })
    .catch(function(error) {
      console.log(`fetch error: ${error.message}`);
      this.fallback(href);
    });
  }

  onClick(evt) {
    evt.preventDefault();

    const link = evt.currentTarget
        , pathname = document.location.pathname.replace(/\/$/, '');


    let href = link.getAttribute('href').replace(/\/$/, '');

    // className is derived by convention from the href
    const className = href.replace(/^\/+/, '');

    // attempt to navigate to current path
    if(href === pathname) {
      return false; 
    }

    if(href === '') {
      href = '/';
    }

    history.pushState({href: href}, '', href);
    this.render(href);
    this.selected.setSelected(className);
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
