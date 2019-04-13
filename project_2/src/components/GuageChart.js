import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, FormControl, ControlLabel,Grid,Row,Col } from 'react-bootstrap';
import '../resources/styles/guageChart.css';
import Label from './Label.js';
import LiquidChart from 'react-liquidchart';

const GuageChart = (props) => (
  <div className="meter">
    <Grid>
        <Row style={{padding:'10px'}}>
          <Col xs={12} md={4}>
            <Label text={"Syslog Severity Level: " + props.logLevelDescription} color={"#000"} size={"14px"} weight={"800"}></Label>
          </Col>
          <Col xs={12} md={8}>
            <Label text={"Top originator appliances"} color={"#000"} size={"14px"}></Label>
          </Col>
        </Row>
        <Row className="show-grid">
          <Col xs={12} md={4}>
          <div style={{
             width: '100%',
             height: '200px',
           }}>
           <LiquidChart
               responsive
               legend={"Percentage of total packets"}
               value={props.valueCount}
               showDecimal
               amplitude={4}
               frequency={2}
               animationTime={2000}
               animationWavesTime={2250}
               gradient={{
                 type: 1,
                 x1: 0,
                 x2: 0,
                 y1: 100,
                 y2: 0
               }}
               postfix={props.postfix}
               legendFontSize={0.1}
               liquidStyle = {{ fill: props.fillcolor}}
           />
       </div>
          </Col>
          <Col xs={12} md={8}>
          {
            (props.topApplicances.length > 0)?(props.topApplicances.map((value,index)=>
            {
              return <Button onClick={props.onApplicanceClick} key={index} name={value.key} value={props.logLevel}>{value.key + ' (' + value.doc_count+")"}</Button>
            })):<Button>No Appliance</Button>
          }
            {/*{
              (props.topApplicances.length > 0)?(props.topApplicances.map((value,index)=>
              {
                return <Button onClick={props.onApplicanceClick} key={index} name={value.key} value={props.logLevel}>{value.key + ' (' + value.doc_count+")"}</Button>
              })):<Button>No Appliance</Button>
            }*/}
          </Col>
        </Row>
      </Grid>
  </div>
);

GuageChart.propTypes = {
  valueCount : PropTypes.number,
  postfix : PropTypes.string,
  totalPackets: PropTypes.number,
  logLevelDescription: PropTypes.string,
  topApplicances: PropTypes.array,
  onApplicanceClick: PropTypes.func,
  logLevel : PropTypes.number,
  fillcolor : PropTypes.string
};

export default GuageChart;
