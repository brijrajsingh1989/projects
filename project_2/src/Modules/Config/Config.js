import React, { Component } from 'react';
import {Button, FormGroup, FormControl, ControlLabel, Grid, Row, Col, Tooltip, OverlayTrigger} from 'react-bootstrap';
import './../../resources/styles/style.css';
import './Config.css';
import Label from './../../components/Label.js';
import TextBox from './../../components/TextBox.js';
import RButton from './../../components/Button.js';
import RGrid from './../../components/Grid.js';
import {Animated} from "react-animated-css";
import Iframe from 'react-iframe';
import Header from './../../components/Header.js';
import Users from '../Users/Users.js';
import ManageReport from '../Report/ManageReport.js';

class Config extends Component {
  constructor(props) {
    super(props);

    this.state={activeTabId : 2,
      userName:sessionStorage.getItem('user'),
      isAdmin:sessionStorage.getItem('admin')};
    this.onHeaderButtonsClick = this.onHeaderButtonsClick.bind(this);
    this.onManageConfigClick = this.onManageConfigClick.bind(this);
  }

  onManageConfigClick(event)
  {
    console.log(event);
    this.setState({activeTabId : event.target.id})
    if(event.target.id == "1")
    {
      console.log('report');
      console.log(this.state.activeTabId);
    }
    else if(event.target.id == "2")
    {
      console.log("user management");
      console.log(this.state.activeTabId);
    }
  }

  onHeaderButtonsClick(event)
  {
    console.log(event.target.name);
    if(event.target.name == "logout")
    {
      this.props.history.push('/');
    }
    else if(event.target.name == "home")
    {
      this.props.history.push('/dashboard');
    }
    else if(event.target.name == "report")
    {
      this.props.history.push('/report');
    }
    else if(event.target.name == "archive")
    {
      this.props.history.push('/archive');
    }
  }


  render() {
    return (


        <div className="manageReports">
          <Header text={"Hi " + this.state.userName} display={(this.state.isAdmin === "true")?"block":"none"} onClick={this.onHeaderButtonsClick}/>


        <Grid>
          <Row className="show-grid">
            <Col xs={12} md={2} lg={2}>
              <Row className="show-grid sideBar">
                  <Col xs={12} md={12} lg={12} style={{backgroundColor:'#f2f2f2'}}>
                      <div className="navBarLogo" ><img src={require('./../../resources/images/download.png')} className="navPanelLogo" name="report"/></div>
                  </Col>
                  <Col xs={6} md={12} lg={12}>
                    <div className={(this.state.activeTabId == "2") ? 'navBarPanelButton navBarPanelButtonActive': 'navBarPanelButton'} id="2" onClick={this.onManageConfigClick}><img src={require('./../../resources/images/team.png')} className="navPanelIcon" name="manageUsers" />Manage Users</div>
                  </Col>
                  <Col xs={6} md={12} lg={12}>
                    <div className={(this.state.activeTabId == "1") ? 'navBarPanelButton navBarPanelButtonActive': 'navBarPanelButton'} id="1" onClick={this.onManageConfigClick}><img src={require('./../../resources/images/manage_report.png')} className="navPanelIcon" name="manageReport" />Manage Reports</div>
                  </Col>
              </Row>
            </Col>
            <Col xs={12} md={10} lg={10} className="sideBarWindow">
              {(this.state.activeTabId == "1")?
                  (<div><ManageReport></ManageReport></div>):
                        ((this.state.activeTabId == "2")?
                  (<div><Users></Users></div>):
                  (<div></div>))}
            </Col>
          </Row>
        </Grid>
        {/*<Header text={"Hi " + this.state.userName +  ((new Date().getHours()) > 15 ? ', Good Evening': ', Good Morning') } display={(this.state.isAdmin === "true")?"block":"none"} onClick={this.onHeaderButtonsClick}/>

          <div className="navBar">
            <div className="navBarPanel">
              <div className="navBarPanelButton"><img src={require('./../../resources/images/singtel-logo.png')} className="navPanelLogo" name="report"/></div>

              <div className={(this.state.activeTabId == "1") ? 'navBarPanelButton navBarPanelButtonActive': 'navBarPanelButton'} id="1" onClick={this.onManageConfigClick}><img src={require('./../../resources/images/manage_report.png')} className="navPanelIcon" name="manageReport" />Manage Reports</div>
              <div className={(this.state.activeTabId == "2") ? 'navBarPanelButton navBarPanelButtonActive': 'navBarPanelButton'} id="2" onClick={this.onManageConfigClick}><img src={require('./../../resources/images/team.png')} className="navPanelIcon" name="manageUsers" />Manage Users</div>
            </div>
            <div className="navBarWindow">
              {(this.state.activeTabId == "1")?
                  (<div><ManageReport></ManageReport></div>):
                        ((this.state.activeTabId == "2")?
                  (<div><Users></Users></div>):
                  (<div></div>))}

            </div>
          </div>*/}

        </div>
    );
  }
}

export default Config;
