import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, FormControl, ControlLabel,Grid,Row,Col ,Tooltip, OverlayTrigger} from 'react-bootstrap';
import '../resources/styles/Button.css';
import {Animated} from "react-animated-css";

const AddReport = (props) => (
    <div>
      <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">{props.text}</Tooltip>}>
        <img src={require('./../resources/images/statistics.png')} name="home" style={{width:'20px', height:'20px', cursor:'pointer'}} onClick={props.onClickImplementation}/>
      </OverlayTrigger>
    </div>
);

AddReport.propTypes = {
    text: PropTypes.string,
    onClickImplementation:PropTypes.func
};

export default AddReport;
