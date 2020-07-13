import React from 'react';
import io from 'socket.io-client';
import './App.css';
import Lobby from './components/lobby';
import Loading from './components/loading';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      playerID: "",
      loaded: false,
    }
    this.socket = null;
  }

  componentDidMount() {
        // connect client to server
        this.socket=io.connect("https://mazerunnerserver.herokuapp.com/lobby");
        //this.socket = io.connect("http://192.168.1.6:5000/lobby");
        // receive player id and set component state
        this.socket.on("initialize", (res) => {
          this.setState({playerID: res.playerID, loaded:true});
        });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }
  
  render() {
    return (
      <div className = "App" style = {this.state.loaded ? 
        { paddingTop: "2vh",
        paddingBottom: "2vh",
        paddingLeft: "1vw",
        paddingRight: "1vw" } :
        { paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0 } }>
        {
        this.state.loaded ? 
        <Lobby playerID = {this.state.playerID}
        socket = {this.socket} />
        : <Loading />
        }
      </div>
    );
  }
}

export default App;
