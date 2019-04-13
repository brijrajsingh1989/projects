import React, { Component } from 'react';
import {Button, FormGroup, FormControl, ControlLabel, Grid, Row, Col, Tooltip, OverlayTrigger} from 'react-bootstrap';
import './dashboard.css';
import Label from './../../components/Label.js';
import {Animated} from "react-animated-css";
import Iframe from 'react-iframe';
import Header from './../../components/Header.js';
import Footer from './../../components/Footer.js';
import GuageChart from './../../components/GuageChart.js';
import API from './../../Config/api.json';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {userName:sessionStorage.getItem('user'), isAdmin:sessionStorage.getItem('admin')}
    this.onHeaderButtonsClick = this.onHeaderButtonsClick.bind(this);
  }

  onHeaderButtonsClick(event)
  {
    if(event.target.name == "report")
    {
      this.props.history.push('/report');
    }
    else if(event.target.name == "config")
    {
      console.log('config');
      this.props.history.push('/config');
    }
    else if(event.target.name == "archive")
    {
      console.log('archive');
      this.props.history.push('/archive');
    }
    else if(event.target.name == "logout")
    {
      this.props.history.push('/');
    }
  }

  componentDidMount()
  {}


  render() {

    return (
        <div className="dashboard">
            <Header text={"Hi " + this.state.userName} display={(this.state.isAdmin === "true")?"block":"none"} onClick={this.onHeaderButtonsClick}/>
            {console.log(API.current.kibanaURL)}
            <div className="kibana">
                <Iframe url={API.current.kibanaURL}
                width="100%"
                height="100%"
                id="myId"
                className="kibanaDashboard"
                display="initial"
                position="relative"
                allowFullScreen/>
            </div>
        </div>
    );
  }
}

export default Dashboard;
