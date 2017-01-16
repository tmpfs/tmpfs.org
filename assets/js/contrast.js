const LIGHT = 'light';
const DARK = 'dark';

/**
 *  Switches page contrast.
 */
class Contrast {

  constructor() {
    this.body = document.querySelector('body');
    this.handler = document.querySelector('.contrast');
    this.click = this.onClick.bind(this);
  }

  getContrast() {
    if(this.body.classList.contains(DARK)) {
      return DARK;
    }
    return LIGHT;
  }

  setContrast(id) {
    console.log(id);

    this.body.classList.remove(DARK);
    this.body.classList.remove(LIGHT);

    this.body.classList.add(id);
  }

  toggleContrast() {
    const contrast = this.getContrast()
        , target = contrast === LIGHT ? DARK : LIGHT;
    this.setContrast(target);
  }

  onClick(evt) {
    evt.preventDefault();
    this.toggleContrast(); 
    return false;
  }

  start() {
    this.handler.addEventListener('click', this.click);
  }

}

export {Contrast}
