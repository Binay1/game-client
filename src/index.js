import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Game from './components/game';
import Oops from './components/oops';
import { BrowserRouter, Redirect } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/">
        <Redirect to="/lobby" />
      </Route>
      <Route exact path="/lobby" component={App}/>
      <Route path="/game/:gameID" component={Game}/>
      <Route component={Oops}/>
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
