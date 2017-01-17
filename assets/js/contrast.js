const LIGHT = 'light';
const DARK = 'dark';
const KEY = 'contrast';
const DURATION = 500;

/**
 *  Switches page contrast.
 */
class Contrast {

  constructor() {

    this.html = document.querySelector('html');
    this.handler = document.querySelector('.contrast');
    this.click = this.onClick.bind(this);
    this.change = this.onChange.bind(this);

  }

  getContrast() {
    if(this.html.classList.contains(DARK)) {
      return DARK;
    }
    return LIGHT;
  }

  setContrast(id) {
    this.html.classList.remove(DARK);
    this.html.classList.remove(LIGHT);

    this.html.classList.add(id);

    localStorage.setItem(KEY, id);
  }

  toggleContrast() {
    const contrast = this.getContrast()
        , id = contrast === LIGHT ? DARK : LIGHT;
    this.setContrast(id);
  }

  onChange(evt) {
    if(evt.key === KEY
      && evt.oldValue !== evt.newValue
      && evt.newValue !== this.getContrast()) {
      this.setContrast(evt.newValue);   
    }
  }

  onClick(evt) {

    evt.preventDefault();
    this.toggleContrast();

    // disable click for animation duration
    this.handler.removeEventListener('click', this.click);
    this.handler.style = 'cursor: default';
    setTimeout(() => {
      this.handler.addEventListener('click', this.click);
      this.handler.style = 'cursor: auto';
    }, DURATION);

    return false;
  }

  start() {

    if(('localStorage' in window) && window.localStorage !== null) {

      if(localStorage.getItem(KEY) === LIGHT
        || localStorage.getItem(KEY) === DARK) {
        this.setContrast(localStorage.getItem(KEY)); 
      }

      window.addEventListener('storage', this.change);

      this.handler.addEventListener('click', this.click);
    }else{
      this.handler.style = 'display: none';
    }
  }

}

export {Contrast}
