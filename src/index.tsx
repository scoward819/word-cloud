import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './stylesheets/index.css';

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
);