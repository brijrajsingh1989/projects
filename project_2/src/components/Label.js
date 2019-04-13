import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, FormControl, ControlLabel,Grid,Row,Col } from 'react-bootstrap';
import '../resources/styles/Label.css';
import {Animated} from "react-animated-css";

const Label = (props) => (
    <div>
      <label style={{color:props.color, fontSize:props.size, fontWeight:props.weight, cursor: props.cursor, textDecoration: props.decoration}} onClick={props.onLabelClick}>{props.text}</label>
    </div>
);

Label.propTypes = {
    text: PropTypes.string,
    color:PropTypes.string,
    size: PropTypes.string,
    weight: PropTypes.string,
    onLabelClick:PropTypes.func,
    cursor:PropTypes.string,
    decoration: PropTypes.string
};

export default Label;
