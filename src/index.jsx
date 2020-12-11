import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import DataChat from './components/DataChat';
import VideoChat from './components/VideoChat';

const DataChatIndex = () => (
  <div className="container">
    <DataChat />
  </div>
);

const VideoChatIndex = () => (
  <div className="container">
    <VideoChat />
  </div>
);

ReactDOM.render((
  <Router>
    <Switch>
      <Route exact path="/" component={DataChatIndex} />
      <Route exact path="/video" component={VideoChatIndex} />
    </Switch>
  </Router>
), document.getElementById('root'));
