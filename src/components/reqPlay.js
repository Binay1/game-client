import React from 'react';
import PropTypes from 'prop-types';

class reqPlay extends React.Component {
    
    constructor(props) {
        super(props);
        this.socket = this.props.socket;
        this.accept = this.accept.bind(this);
        this.reject = this.reject.bind(this);
    }

    accept() {
        this.socket.emit("accept");
    }

    reject() {
        this.props.updateState(false, "");
        this.socket.emit("reject");
    }

    render() {
        return(
            <div id="requestBox" className="popup">
                <div id="reqPlayContent">
                    <h2>You have been challenged to a game by Player ID: {this.props.id}</h2>
                    <div className="row">
                        <div className="btnContainer col-sm-6">
                            <button className="btn-lg" type="button" onClick={this.accept}>Accept</button>
                        </div>
                        <div className="btnContainer col-sm-6">
                            <button className="btn-lg" type="button" onClick={this.reject}>Reject</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


// set propTypes to prevent passing of wrong data types
reqPlay.propTypes = {
    visible: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
    socket: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
};

export default reqPlay;