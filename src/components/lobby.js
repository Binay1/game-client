import React from 'react';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import ReqPlay from './reqPlay';
import { withRouter } from "react-router";

class lobby extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playersInLobby: 0,
            playerID: this.props.playerID,
            input:"",
            reqPlay: {
              id:"",
              visible: false,
            },
            message : "",
        }
        this.socket = null;
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.toggleReqPlay = this.toggleReqPlay.bind(this);
        this.updateReqPlayState = this.updateReqPlayState.bind(this);
        this.playRandom = this.playRandom.bind(this);
    }

    componentDidMount() {
        // connect client to server
        this.socket=io.connect("http://localhost:5000/lobby");
        // receive player id and set component state
        this.socket.on("initialize", (res) => {
          this.setState({playerID: res.playerID});
          // Pass state to parent so everything is in sync
          this.props.updateState(this.state.playerID);
        });
        // Event listener: update state whenever number of players changes
        this.socket.on("playerUpdate", (res) => {
          this.setState({playersInLobby: res.playersInLobby});
        });
        // Receive a request
        this.socket.on("reqPlay", (reqID) => this.toggleReqPlay(reqID));
        // Receive some kind of message from the server
        this.socket.on("message", (msg) => {
            this.setState({message: msg});
            setTimeout(() => {
              this.setState({message: ""});
            }, 5000);
        });
        // Get redirected to the game
        this.socket.on("enterGame", (url) => {
          this.props.history.push(url.redirectTo);
        });
      }

      componentWillUnmount() {
        this.socket.disconnect();
      }

      // to be passed to children so they can lift up the local state
      updateReqPlayState(id, visible) {
        this.setState({reqPlay: {
          id: id,
          visible: visible,
        }});
      }

      // Make reqPlay visible
      toggleReqPlay(reqID) {
        this.setState({reqPlay: {
          visible: true,
          id:reqID,
        }});
      }

      playRandom() {
        this.socket.emit("playRandom");
      }

      onSubmit(event) {
          // prevent page from reloading
          event.preventDefault();
          this.socket.emit("reqFriend", this.state.input);
          this.setState({input:""});
      }

      onChange(event) {
        this.setState({input:event.target.value});
      }

      render() {
        return (
          <div id="lobbyContainer">
            <div id="messageDisplay">
              <p>{this.state.message}</p>
            </div>
            <div id="lobbyDetails">
              <h2>Your ID: {this.state.playerID}</h2>
              <h2>Number of Players in lobby: {this.state.playersInLobby}</h2>
            </div>
            {(this.state.reqPlay.visible) ? 
            <ReqPlay 
             visible = {this.state.reqPlay.visible}
             id={this.state.reqPlay.id}
             socket={this.socket}
             updateState={this.updateReqPlayState}/>
             : null}
             <div className="container-fluid">
               <div className="row">
                <div id="reqPlayForm" className="col-sm-6">
                  <h1> Play with a Friend</h1>
                  <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                      <label>Enter Player ID</label>
                      <input className="form-control" type="text" id="friendID" placeholder="Player ID" value={this.state.input} onChange={this.onChange}></input>
                    </div>
                    <button className="btn-lg btn-block">Invite</button>
                  </form>
                </div>
                <div id="main" className="col-sm-6">
                  <h1 id="logo">MAZE <br/> RUNNER</h1>
                  <button id="playNow" className="btn-lg" type="button" onClick = {this.playRandom}>Play Now</button>
                </div>
               </div>
             </div>
          </div>
        );
      }
}

// set propTypes to prevent passing of wrong data types
lobby.propTypes = {
    playerID: PropTypes.string.isRequired,
    updateState: PropTypes.func.isRequired,
  };
  
// wrap component in withRouter to get access to history object (in order to redirect)
export default withRouter(lobby);