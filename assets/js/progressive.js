/**
 *  Progressive enhancement using the `fetch` API to dynamically load and render 
 *  the page without refreshing the entire page content.
 */
class Progressive {

  constructor() {
    this.links = Array.from(document.querySelectorAll('header a'));
  }

  start() {
    console.log('start progressive enhancement');

    this.links.forEach((link) => {
      console.log(link) 
    })
  }

}

export {Progressive}
