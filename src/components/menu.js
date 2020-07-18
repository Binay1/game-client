import React from 'react';
import Switch from 'react-switch';
import PropTypes from 'prop-types';
import { useHistory } from "react-router-dom";

function Menu(props) {

    const history = useHistory();

    const music  = () => {
        props.setMusic(!props.music);
    }

    const sound = () => {
        props.setSound(!props.sound);
    }

    const close = () => {
        props.isThisVisible(false);
    }

    const quit = () => {
        props.socket.disconnect();
        history.push("/lobby");      
    }

    return (
        <div id="menuBox" className="popup">
        <div className="popupContent container">
            <h2>Menu</h2>
            <div id = "switchContainer" className="row">
                <div className="col-sm-6">
                    <label>
                        Music
                    </label>
                    <Switch onChange={music} checked={props.music} checkedIcon={false} uncheckedIcon={false} className="switch" />
                </div>
                <div className="col-sm-6">
                    <label>
                        Sound
                    </label>
                    <Switch onChange={sound} checked={props.sound} checkedIcon={false} uncheckedIcon={false} className="switch" />
                </div>
            </div>
            <div className="row">
                <div className="btnContainer col-sm-6">
                    <button className="btn-lg" type="button" onClick={quit}>Quit</button>
                </div>            
                <div className="btnContainer col-sm-6">
                    <button className="btn-lg" type="button" onClick={close}>Close</button>
                </div>
            </div>
        </div>
    </div>
    );
}

// set propTypes to prevent passing of wrong data types
Menu.propTypes = {
    isThisVisible: PropTypes.func.isRequired,
    music: PropTypes.bool.isRequired,
    setMusic: PropTypes.func.isRequired,
    sound: PropTypes.bool.isRequired,
    setSound: PropTypes.func.isRequired,
    socket: PropTypes.object.isRequired,
};

export default Menu;