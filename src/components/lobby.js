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
              visible: false,
              id:"",
            },
        }
        this.socket=null;
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.toggleReqPlay = this.toggleReqPlay.bind(this);
        this.updateReqPlayState = this.updateReqPlayState.bind(this);
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
        this.socket.on("reqPlay", (reqID) => this.toggleReqPlay(reqID));
        this.socket.on("message", (msg) => {
            console.log(msg);
        });
        this.socket.on("enterGame", (url) => {
          console.log("Getting the hint");
          this.props.history.push(url.redirectTo);
        });
      }

      componentWillUnmount() {
        this.socket.disconnect();
      }

      // to be passed to children so they can lift up the local state
      updateReqPlayState(visible, id) {
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
          <div className="App">
            <h1>Hello there</h1>
            <h2>Your ID: {this.state.playerID}</h2>
            <h3>Number of Players in lobby: {this.state.playersInLobby}</h3>
            {(this.state.reqPlay.visible) ? 
            <ReqPlay 
             visible = {this.state.reqPlay.visible}
             id={this.state.reqPlay.id}
             socket={this.socket}
             updateState={this.updateReqPlayState}/>
             : null}
            <form onSubmit={this.onSubmit}>
                <label>Player ID</label>
                <input type="text" id="friendID" placeholder="Player ID" value={this.state.input} onChange={this.onChange}></input>
                <button>Play with a friend</button>
            </form>
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