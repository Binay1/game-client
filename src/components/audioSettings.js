import React, { useEffect } from 'react';
import Switch from 'react-switch';
import PropTypes from 'prop-types';

function AudioSettings(props) {

    const music  = () => {
        props.setMusic(!props.music);
    }

    const sound = () => {
        props.setSound(!props.sound);
    }

    const close = () => {
        props.isThisVisible(false);
    }

    return (
        <div id="audioBox" className="popup">
        <div className="popupContent container">
            <h2>Audio Settings</h2>
            <div className="row">
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
            <div className="btnContainer">
                <button className="btn-lg" type="button" onClick={close}>Close</button>
            </div>
        </div>
    </div>
    );
}

// set propTypes to prevent passing of wrong data types
AudioSettings.propTypes = {
    isThisVisible: PropTypes.func.isRequired,
    music: PropTypes.bool.isRequired,
    setMusic: PropTypes.func.isRequired,
    sound: PropTypes.bool.isRequired,
    setSound: PropTypes.func.isRequired,
    // statusBarMessage: PropTypes.string.isRequired,
    // previousMessage: PropTypes.string.isRequired,
    // setStatusBarMessage: PropTypes.func.isRequired,
    // setPreviousMessage: PropTypes.func.isRequired,
    // messages: PropTypes.object.isRequired,
};

export default AudioSettings;