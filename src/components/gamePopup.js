import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from "react-router-dom";

const GamePopup = (props) => {
    const history = useHistory();

    const backToLobby = () => {
        history.push("/lobby");
    }

    return (
        <div id="gamePopup" className="popup">
            <div className="popupContent">
                <h2>{props.message}</h2>
                <button className="btn-lg" type="button" onClick={ backToLobby }>Return to Lobby</button>
            </div>
        </div>
    );
}

// set propTypes to prevent passing of wrong data types
GamePopup.propTypes = {
    message: PropTypes.string.isRequired,
};


export default GamePopup;