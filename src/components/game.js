import React from 'react';
import io from 'socket.io-client';

class game extends React.Component {
    constructor() {
        super();
        this.state = {
            playersInGame: 0,
        }
    }

    componentDidMount() {
        // connect client to server
        this.socket=io.connect("http://localhost:5000" + window.location.pathname);
    }

    render() {
        return(
            <div>
                <p>Players in game: {this.state.playersInGame}</p>
            </div>
        );
    }

}

export default game;
