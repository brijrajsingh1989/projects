import React, { Component } from 'react';
import {Button, FormGroup, FormControl, ControlLabel, Grid, Row, Col, Tooltip, OverlayTrigger} from 'react-bootstrap';
import './../resources/styles/style.css';
import Label from './Label.js';
import TextBox from './TextBox.js';
import {Animated} from "react-animated-css";
import Iframe from 'react-iframe';
import './../resources/styles/header.css';
import PropTypes from 'prop-types';

const Footer = (props) => (
  <div className='footer'>
        <div>Copyright © 2018 Remego Pte Ltd.</div>
  </div>
);

export default Footer;
