const LIGHT = 'light';
const DARK = 'dark';
const KEY = 'contrast';

/**
 *  Switches page contrast.
 */
class Contrast {

  constructor() {
    this.html = document.querySelector('html');
    this.handler = document.querySelector('.contrast');
    this.click = this.onClick.bind(this);
  }

  getContrast() {
    if(this.html.classList.contains(DARK)) {
      return DARK;
    }
    return LIGHT;
  }

  setContrast(id) {
    //console.log(id);

    this.html.classList.remove(DARK);
    this.html.classList.remove(LIGHT);

    this.html.classList.add(id);

    localStorage.setItem(KEY, id);
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
    if(('localStorage' in window) && window.localStorage !== null) {

      if(localStorage.getItem(KEY) === LIGHT
        || localStorage.getItem(KEY) === DARK) {
        this.setContrast(localStorage.getItem(KEY)); 
      }

      this.handler.addEventListener('click', this.click);
    }else{
      this.handler.style = 'display: none';
    }
  }

}

export {Contrast}
