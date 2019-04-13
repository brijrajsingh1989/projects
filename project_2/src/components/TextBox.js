import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, FormControl, ControlLabel,Grid,Row,Col } from 'react-bootstrap';
import '../resources/styles/textbox.css';
import {Animated} from "react-animated-css";

const TextBox = (props) => (
    <div>
      <input
        className="tb"
        name={props.name}
        type={props.inputType}
        value={props.content}
        onChange={props.onChangeEvent}
        placeholder={props.placeholder}
        style = {{width:props.width,height:props.height}}
         />
    </div>
);

TextBox.propTypes = {
    inputType: PropTypes.oneOf(['text', 'password','number']).isRequired,
    title: PropTypes.string,
    name: PropTypes.string,
    onChangeEvent: PropTypes.func,
    content: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    placeholder: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string
};

export default TextBox;
