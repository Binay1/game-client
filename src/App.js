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
          <div className="row">
            <div className="col-sm-6 infoBox" id="rules">
              <div className="infoWrapper">
                <h1>Rules</h1>
                <p>
                  This is a battle between two wizards stuck in the void between two dimensions.
                  There is only one exit and only one of them can leave. The other one won't die, he'll just be stuck there for eternity.
                  There is no death in this timeless void. If you jump off the path, you will just spawn back to where you started again.
                  There are spells spread throughout that can be used via your magical wand once you pick them up.
                  Beware though, each spell can only be used once and you can't pick two at the same time.
                  Your wand will automatically absorb any new spell you touch. May the best wizard win.
                </p>
              </div>
            </div>
            <div className="col-sm-4 infoBox" id="controls">
            <div className="infoWrapper">
              <h1>Controls</h1>
              <p>
                - WASD or Arrow keys for movement <br/>
                - Mouse to look around <br/>
                - Click to fire spell <br/>
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
