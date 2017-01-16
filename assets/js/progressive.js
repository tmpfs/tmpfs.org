/**
 *  Progressive enhancement using the `fetch` API to dynamically load and render 
 *  the page without refreshing the entire page content.
 */
class Progressive {

  constructor() {
    this.links = Array.from(document.querySelectorAll('header a'));
    this.click = this.onClick.bind(this);
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
          console.log(main);
          const current = document.querySelector('main');
          current.parentNode.replaceChild(main, current);
        })
      }else{
        console.log('Network response was not ok.');
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


    let href = link.getAttribute('href').replace(/\/$/, '')

    // attempt to navigate to current path
    if(href === pathname) {
      return false; 
    }

    console.log(document.location);
    console.log(href);

    if(href === '') {
      href = '/';
    }

    history.pushState({}, '', href);

    this.render(href);
  }

  start() {
    if(window.fetch !== null) {
      this.links.forEach((link) => {
        link.addEventListener('click', this.click);
      })

      //wid
    }
  }

}

export {Progressive}
