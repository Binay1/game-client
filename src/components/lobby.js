import React from 'react';
import PropTypes from 'prop-types';
import ReqPlay from './reqPlay';
import CancelPlay from './cancelPlay';
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
            cancelVisible: false,
            message : "",
        }
        this.socket = this.props.socket;
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.toggleReqPlay = this.toggleReqPlay.bind(this);
        this.updateReqPlayState = this.updateReqPlayState.bind(this);
        this.updateCancelVisible = this.updateCancelVisible.bind(this);
        this.toggleCancelVisible = this.toggleCancelVisible.bind(this);
        this.playRandom = this.playRandom.bind(this);
    }

    componentDidMount() {
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

      // to be passed to children so they can lift up the local state
      updateReqPlayState(id, visible) {
        this.setState({reqPlay: {
          id: id,
          visible: visible,
        }});
      }

      updateCancelVisible(visible) {
        this.setState({
          cancelVisible: visible,
        });
      }

      toggleCancelVisible() {
        this.setState({cancelVisible:true});
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
        this.toggleCancelVisible();
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
             id={this.state.reqPlay.id}
             socket={this.socket}
             updateState={this.updateReqPlayState}/>
             : null}
             {
               this.state.cancelVisible ? <CancelPlay socket={this.socket} updateState={this.updateCancelVisible} /> : null
             }
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
                      WASD or Arrow keys for movement <br/>
                      Mouse to look around <br/>
                      Click to fire spell <br/>
                      M for the Game Menu <br/>
                    </p>
                  </div>
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
    socket: PropTypes.object.isRequired,
  };
  
// wrap component in withRouter to get access to history object (in order to redirect)
export default withRouter(lobby);