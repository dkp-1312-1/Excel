import { Grid } from './components/Grid.js';

const initGrid = () => {
  new Grid();
  
  document.removeEventListener('DOMContentLoaded', initGrid);
};

document.addEventListener('DOMContentLoaded', initGrid);