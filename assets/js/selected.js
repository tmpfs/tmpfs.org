const HOME_ID = 'index';

/**
 *  Set selected state in main navigation.
 */
class Selected{

  constructor() {

    // TODO: redirect to unsupported browser on feature check

    // main element
    this.main = document.querySelector('main');
    this.nav = document.querySelector('header > nav');

    // page id
    this.page = this.main.getAttribute('id');
  }

  /**
   *  Remove the *selected* class from all main navigation links.
   */
  clearSelectedState() {
    const links = Array.from(this.nav.querySelectorAll('a'));
    links.forEach((link) => {
      link.classList.remove('selected');
    })
  }

  /**
   *  Add the *selected* class to a main navigation link with a class name that 
   *  matches the page identifier.
   */
  setSelectedLink() {
    this.clearSelectedState();

    if(this.page !== HOME_ID) {
      const link = this.nav.querySelector('.' + this.page);
      if(!link) {
        throw new Error(
          `could not locate link for id '${this.page}', sync nav class names?`);
      }
      link.classList.add('selected');
    }
  }

  start() {
    this.setSelectedLink();
  }

}

export {Selected}
