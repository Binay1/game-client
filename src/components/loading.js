import React from 'react';
import Loader from 'react-loader-spinner';
import '../App.css';

function Loading() {
    return (
        <div id="loading" className="d-flex justify-content-center align-items-center">
            <Loader type="Bars" color="white" height= "20vh" width = "30vw" />
        </div>
    );
}

export default Loading;