import React from 'react';
import './App.css';
import Lobby from './components/lobby';


class App extends React.Component {

  constructor() {
    super();
    this.updateState = this.updateState.bind(this);
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
  
  render() {
    return (
      <div className="App">
        <Lobby playerID = {this.state.playerID}
               updateState = {this.updateState}/>
        <div id="infoContainer" className="container-fluid">
          <div className="row d-flex justify-content-around">
            <div className="col-sm-5" id="controls">
              <div className="infoWrapper">
                <h1>Rules</h1>
              </div>
            </div>
            <div className="col-sm-5" id="rules">
            <div className="infoWrapper">
              <h1>Controls</h1>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
