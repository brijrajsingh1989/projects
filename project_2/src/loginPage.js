import React, { Component } from 'react';
import { Button, FormGroup, FormControl, ControlLabel,Grid,Row,Col } from 'react-bootstrap';
import './resources/styles/login.css';
import {Animated} from "react-animated-css";
import TextBox from './components/TextBox.js';
import Label from './components/Label.js';
import Notifications, {notify} from 'react-notify-toast';
import axios from 'axios';
import ReactCardFlip from 'react-card-flip';
import Loader from 'react-loader-spinner';
import Particles from 'react-particles-js';
import Footer from './components/Footer.js';
import API  from './Config/api.json';
class LoginPage extends Component {

  constructor(props) {
    super(props);

  }



  render() {
    return (
        <div>
            <hgroup>
                <h1>Syslog Analyzer</h1>
            </hgroup>
            <form>
                <div class="group">
                  <input type="text"></input><span class="highlight"></span><span class="bar"></span>
                  <label>User ID</label>
                </div>
                <div class="group">
                  <input type="email"></input><span class="highlight"></span><span class="bar"></span>
                  <label>Password</label>
                </div>
                <button type="button" class="button buttonBlue"> Login
                  <div class="ripples buttonRipples"><span class="ripplesCircle"></span></div>
                </button>
            </form>
            <footer>
                <a href="www.singtel.com" target="_blank"><img src="https://cdn1.singteldigital.com/content/dam/singtel/online-draft/singtel_logo_coloured.png"></img></a>
                {/*<p>You Gotta Love <a href="http://www.polymer-project.org/" target="_blank">Google</a></p>*/}
            </footer>
      </div>
    );
  }
}

export default LoginPage;
