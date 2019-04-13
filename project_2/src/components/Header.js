import React, { Component } from 'react';
import {Button, FormGroup, FormControl, ControlLabel, Grid, Row, Col, Tooltip, OverlayTrigger} from 'react-bootstrap';
import './../resources/styles/style.css';
import Label from './Label.js';
import TextBox from './TextBox.js';
import {Animated} from "react-animated-css";
import Iframe from 'react-iframe';
import './../resources/styles/header.css';
import PropTypes from 'prop-types';

const Header = (props) => (
    <div>
      <Grid>
        <Row className="show-grid">
          <Col lg={10} md={10} xs={12} className="userInfo">
            {<Label text={props.text}/>}
          </Col>
          <Col lg={2} md={2} xs={12}>
            <Row className="show-grid">
              {
                (props.display == 'none')?
                <div>
                  <Col lg={4} md={4} xs={4}>
                    <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Dashboard</Tooltip>}>
                      <img src={require('./../resources/images/home.png')} name="home" className="logoutBtn" onClick={props.onClick}/>
                    </OverlayTrigger>
                  </Col>
                  <Col lg={4} md={4} xs={4}>
                    <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Report And Analytics</Tooltip>}>
                      <img src={require('./../resources/images/report.png')} name="report" className="logoutBtn" onClick={props.onClick}/>
                    </OverlayTrigger>
                  </Col>
                  <Col lg={4} md={4} xs={4}>
                    <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Logout</Tooltip>}>
                      <img src={require('./../resources/images/logout.png')} className="logoutBtn" name="logout" onClick={props.onClick}/>
                    </OverlayTrigger>
                  </Col>
              </div>:<div>
                      <Col lg={3} md={3} xs={3}>
                        <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Dashboard</Tooltip>}>
                          <img src={require('./../resources/images/home.png')} name="home" className="logoutBtn" onClick={props.onClick}/>
                        </OverlayTrigger>
                      </Col>
                      <Col lg={3} md={3} xs={3}>
                        <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Report And Analytics</Tooltip>}>
                          <img src={require('./../resources/images/report.png')} name="report" className="logoutBtn" onClick={props.onClick}/>
                        </OverlayTrigger>
                      </Col>
                      <Col lg={3} md={3} xs={3} style={{display:props.display}}>
                        <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Config</Tooltip>}>
                          <img src={require('./../resources/images/settings.png')} name="config" className="logoutBtn" onClick={props.onClick}/>
                        </OverlayTrigger>
                      </Col>
                      <Col lg={3} md={3} xs={3}>
                        <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Logout</Tooltip>}>
                          <img src={require('./../resources/images/logout.png')} className="logoutBtn" name="logout" onClick={props.onClick}/>
                        </OverlayTrigger>
                      </Col>
                </div>
              }
            </Row>
          </Col>
        </Row>
      </Grid>
    </div>
);

Header.propTypes = {
    text: PropTypes.string,
    display: PropTypes.string
};

export default Header;
