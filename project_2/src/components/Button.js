import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, FormControl, ControlLabel,Grid,Row,Col ,Tooltip, OverlayTrigger} from 'react-bootstrap';
import '../resources/styles/Button.css';
import {Animated} from "react-animated-css";

const RButton = (props) => (
    <div>
      {/*<Button bsStyle="primary" bsClass="button" onClick={props.onClickImplementation}>{props.text}</Button>*/}
      <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">{props.text}</Tooltip>}>
        <img src={require('./../resources/images/user.png')} name="home" style={{width:'20px', height:'20px', cursor:'pointer'}} onClick={props.onClickImplementation}/>
      </OverlayTrigger>
    </div>
);

RButton.propTypes = {
    text: PropTypes.string,
    onClickImplementation:PropTypes.func
};

export default RButton;
