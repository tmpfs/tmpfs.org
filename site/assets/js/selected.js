const HOME_ID = 'home';

/**
 *  Set selected state in main navigation.
 */
class Selected{

  constructor() {

    // main element
    this.main = document.querySelector('main');
    this.header = document.querySelector('header');

    // page id
    this.page = this.main.getAttribute('id');
  }

  setEnabled(flag) {
    this.header.classList.remove('disabled');

   if(flag === false) {
      this.header.classList.add('disabled');
    }
  }

  getDefault() {
    return HOME_ID;
  }

  /**
   *  Remove the *selected* class from all main navigation links.
   */
  clearSelectedState() {
    const links = Array.from(this.header.querySelectorAll('a'));
    links.forEach((link) => {
      link.classList.remove('selected');
    })
  }

  setSelected(className) {

    className = className.replace(/\/$/, '')

    if(!className) {
      className = HOME_ID;
    }

    this.clearSelectedState();

    const link = this.header.querySelector('.' + className);

    if(!link) {
      throw new Error(
        `could not locate link for id '${className}', sync header class names?`);
    }

    link.classList.add('selected');
  }

  /**
   *  Add the *selected* class to a main navigation link with a class name that
   *  matches the page identifier.
   */
  setSelectedState() {
    let id = this.page == "src" ? HOME_ID : this.page
    this.setSelected(id);
  }

  start() {
    this.setSelectedState();
  }

}

export {Selected}
