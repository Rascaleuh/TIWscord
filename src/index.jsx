import React from 'react';
import ReactDOM from 'react-dom';

import DataChat from './components/DataChat';

const Index = () => (
  <div className="container">
    <DataChat />
  </div>
);

ReactDOM.render(<Index />, document.getElementById('root'));
