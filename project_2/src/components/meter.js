import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, FormControl, ControlLabel,Grid,Row,Col } from 'react-bootstrap';
import '../resources/styles/meter.css';
import {Animated} from "react-animated-css";
import ReactSpeedometer from "react-d3-speedometer";
import Label from './Label.js';

const Meter = (props) => (
    <div className="meter">
      <Grid>
          <Row style={{padding:'10px'}}>
            <Col xs={12} md={4}>
              <Label text={"Syslog Severity Level: " + props.logLevelDescription} color={"#000"} size={"14px"}></Label>
            </Col>
            <Col xs={12} md={8}>
              <Label text={"Top originator appliances"} color={"#000"} size={"14px"}></Label>
            </Col>
          </Row>
          <Row className="show-grid">
            <Col xs={12} md={4}>
                <ReactSpeedometer
                    maxValue={props.totalPackets}
                    value={props.packetsForLogLevel}
                    needleColor="purple"
                    startColor="green"
                    segments={props.segments}
                    endColor="red"
                    width={250}
                    height={160}
                    forceRender = {true}
                    />
            </Col>
            <Col xs={12} md={8}>
              {
                (props.topApplicances.length > 0)?(props.topApplicances.map((value,index)=>
                {
                  return <Button onClick={props.onApplicanceClick} key={index} name={value.key} value={props.logLevel}>{value.key + ' (' + value.doc_count+")"}</Button>
                })):<Button>No Appliance</Button>
              }
            </Col>
          </Row>
        </Grid>
    </div>
);

Meter.propTypes = {
    logLevelDescription: PropTypes.string,
    topApplicances: PropTypes.array,
    totalPackets: PropTypes.number,
    packetsForLogLevel: PropTypes.number,
    onApplicanceClick: PropTypes.func,
    logLevel : PropTypes.number,
    segments : PropTypes.number
};

export default Meter;
