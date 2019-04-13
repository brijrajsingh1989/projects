import React, { Component } from 'react';
import {Button, FormGroup, FormControl, ControlLabel, Grid, Row, Col, Tooltip, OverlayTrigger} from 'react-bootstrap';
import './../../resources/styles/style.css';
import './Report.css';
import Label from './../../components/Label.js';
import TextBox from './../../components/TextBox.js';
import {Animated} from "react-animated-css";
import Iframe from 'react-iframe';
import Header from './../../components/Header.js';
import ShowReports from './ShowReports.js';
import Analytics from './Analytics.js';
import SystemReport from './SystemReport.js';

class Report extends Component {
  constructor(props) {
    super(props);

    this.state={activeTabId : 2, userName:sessionStorage.getItem('user'), isAdmin:sessionStorage.getItem('admin')};
    this.onHeaderButtonsClick = this.onHeaderButtonsClick.bind(this);
    this.onReportClick  =this.onReportClick.bind(this);
  }

  onHeaderButtonsClick(event)
  {
    console.log(event.target.name);
    if(event.target.name == "report")
    {
      this.props.history.push('/report');
    }
    else if(event.target.name == "config")
    {
      console.log('config');
      this.props.history.push('/config');
    }
    else if(event.target.name == "home")
    {
      this.props.history.push('/dashboard');
    }
    else if(event.target.name == "archive")
    {
      this.props.history.push('/archive');
    }
    else if(event.target.name == "logout")
    {
      this.props.history.push('/');
    }
  }

  onReportClick(event)
  {
    this.setState({activeTabId:event.target.id});
  }

  componentDidMount()
  {
    console.log('  this.setState',  this.state);
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
                            <div className="navBarLogo"><img src={require('./../../resources/images/download.png')} className="navPanelLogo" name="report"/></div>
                        </Col>
                        <Col xs={6} md={12} lg={12}>
                          <div className={(this.state.activeTabId == "2") ? 'navBarPanelButton navBarPanelButtonActive': 'navBarPanelButton'} id="2" onClick={this.onReportClick}><img src={require('./../../resources/images/manage_report.png')} className="navPanelIcon" name="manageReport" />Analytics  </div>
                        </Col>
                        <Col xs={6} md={12} lg={12}>
                          <div className={(this.state.activeTabId == "1") ? 'navBarPanelButton navBarPanelButtonActive': 'navBarPanelButton'} id="1" onClick={this.onReportClick}><img src={require('./../../resources/images/team.png')} className="navPanelIcon" name="manageUsers" />Reports    </div>
                        </Col>

                        <Col xs={6} md={12} lg={12}>
                          <div className={(this.state.activeTabId == "3") ? 'navBarPanelButton navBarPanelButtonActive': 'navBarPanelButton'} id="3" onClick={this.onReportClick}><img src={require('./../../resources/images/system.png')} className="navPanelIcon" name="manageUsers" />System Info</div>
                        </Col>

                    </Row>
                  </Col>
                  <Col xs={12} md={10} lg={10} className="sideBarWindow">
                    {(this.state.activeTabId == "1")?
                        (<div>
                          <ShowReports></ShowReports>
                        </div>):
                                          ((this.state.activeTabId == "2")?
                        (<div><Analytics></Analytics></div>):
                        (<div><SystemReport></SystemReport></div>))}
                  </Col>
                </Row>
              </Grid>


      {/*<div className="manageReports">
              <Header text={"Hi " + this.state.userName +  ((new Date().getHours()) > 15 ? ', Good Evening': ', Good Morning') } display={(this.state.isAdmin === "true")?"block":"none"} onClick={this.onHeaderButtonsClick}/>

              <div className="navBar">
                  <div className="navBarPanel">
                    <div className="navBarPanelButton"><img src={require('./../../resources/images/singtel-logo.png')} className="navPanelLogo" name="report"/></div>

                    <div className={(this.state.activeTabId == "1") ? 'navBarPanelButton navBarPanelButtonActive': 'navBarPanelButton'} id="1" onClick={this.onReportClick}><img src={require('./../../resources/images/team.png')} className="navPanelIcon" name="manageUsers" />Reports</div>
                    <div className={(this.state.activeTabId == "2") ? 'navBarPanelButton navBarPanelButtonActive': 'navBarPanelButton'} id="2" onClick={this.onReportClick}><img src={require('./../../resources/images/manage_report.png')} className="navPanelIcon" name="manageReport" />Analytics</div>

                  </div>
                  <div className="navBarWindow">
                    {(this.state.activeTabId == "1")?
                        (<div>
                          <ShowReports></ShowReports>
                        </div>):
                                          ((this.state.activeTabId == "2")?
                        (<div><Analytics></Analytics></div>):
                        (<div></div>))}
                  </div>
                </div>

          </div>*/}
        </div>
    );
  }
}

export default Report;
