import React, { useState } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import DataChat from './DataChat';
import VideoChat from './VideoChat';
import Home from './Home';

function App() {
  const [id, setId] = useState('');

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home id={id} setId={setId} />
        </Route>
        <Route exact path="/chat">
          <DataChat id={id} />
        </Route>
        <Route exact path="/video">
          <VideoChat id={id} />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
