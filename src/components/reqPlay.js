import React from 'react';
import PropTypes from 'prop-types';

function ReqPlay(props) {
    const socket = props.socket;

    const accept = () => {
        socket.emit("accept");
    }

    const reject = () => {
        if(props.rematch) {
            props.updateState(false);
        }
        else {
            props.updateState(false, "");
        }
        socket.emit("reject");
    }

    return(
        <div id="requestBox" className="popup">
            <div className="popupContent">
                {props.rematch ? <h2>You have been challenged to a rematch</h2> : <h2>You have been challenged to a game by Player ID: {props.id}</h2>}
                <div className="row">
                    <div className="btnContainer col-sm-6">
                        <button className="btn-lg" type="button" onClick={accept}>Accept</button>
                    </div>
                    <div className="btnContainer col-sm-6">
                        <button className="btn-lg" type="button" onClick={reject}>Reject</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// set propTypes to prevent passing of wrong data types
ReqPlay.propTypes = {
    id: PropTypes.string,
    socket: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
    rematch: PropTypes.bool.isRequired
};

export default ReqPlay;