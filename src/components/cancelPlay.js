import React from 'react';
import PropTypes from 'prop-types';

function CancelPlay(props) {

    const socket = props.socket;

    const leaveRoom = () => {
        socket.emit("leaveRoom");
        props.updateState(false);
    }

    return (
        <div id="cancelBox" className="popup">
            <div className="popupContent">
                <h2>Looking for an opponent</h2>
                <div className="row">
                    <div className="btnContainer col-sm-12">
                        <button className="btn-lg" type="button" onClick={leaveRoom}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// set propTypes to prevent passing of wrong data types
CancelPlay.propTypes = {
    socket: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
};

export default CancelPlay;