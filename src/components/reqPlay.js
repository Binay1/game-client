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
            <div className="popup">
                <form>
                    <label>You have been challenged to a game by </label>
                    <button type="button" onClick={this.accept}>Accept</button>
                    <button type="button" onClick={this.reject}>Reject</button>
                </form>
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