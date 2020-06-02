import React from 'react';
import './App.css';
import Lobby from './components/lobby';


class App extends React.Component {

  constructor() {
    super();
    this.updateState = this.updateState.bind(this);
    this.apiCall = this.apiCall.bind(this);
    this.state = {
      playerID: "",
    }
  }

  // to allow child components to lift state up to parent
  updateState(playerID) {
    this.setState({
      playerID: playerID
    });
  }

  // Express api call (useless right now, maybe forever since I don't have any db related mechanisms in mind)
  apiCall() {
    fetch("http://localhost:5000")
    .then(res => res.json()).then(
      res => this.setState({userID : res.userID})); 
  }

  render() {
    return (
      <div className="App">
        <Lobby playerID = {this.state.playerID}
               updateState = {this.updateState}/>
      </div>
    );
  }
}

export default App;
