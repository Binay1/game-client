import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from "react-router-dom";

const GameOverPopup = (props) => {
    const socket = props.socket;
    const history = useHistory();

    const backToLobby = () => {
        history.push("/lobby");
    }

    const playAgain = () => {
        socket.emit("rematch");
    }

    return (
        <div id="gameOverPopup" className="popup">
            <div className="popupContent">
                <h2>{props.message}</h2>
                <div className="row">
                    <div className="btnContainer col-sm-6">
                        <button className="btn-lg" type="button" onClick={ backToLobby }>Return to Lobby</button>
                    </div>
                    <div className="btnContainer col-sm-6">
                        <button className="btn-lg" type="button" onClick={ playAgain }>Request Rematch</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// set propTypes to prevent passing of wrong data types
GameOverPopup.propTypes = {
    message: PropTypes.string.isRequired,
};


export default GameOverPopup;