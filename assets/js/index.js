const HOME_ID = 'index';

class Application {

  constructor() {
    // main element
    this.main = document.querySelector('main');
    this.nav = document.querySelector('header > nav');

    // page id
    this.page = this.main.getAttribute('id');
  }

  setSelectedLink() {
    if(this.page !== HOME_ID) {
      const link = this.nav.querySelector('.' + this.page);

      if(!link) {
        throw new Error(
          `could not locate link for id '${this.page}', sync nav class names?`);
      }

      link.classList.add('selected');

      console.log(link.classList);
    }
  }

  start() {
    this.setSelectedLink();
  }

}

const app = new Application();
app.start();
