import React, { Component } from 'react';
import {Button, FormGroup, FormControl, ControlLabel, Grid, Row, Col, Tooltip, OverlayTrigger} from 'react-bootstrap';
import './../../resources/styles/style.css';
import './Report.css';
import Label from './../../components/Label.js';
import TextBox from './../../components/TextBox.js';
import {Animated} from "react-animated-css";
import Iframe from 'react-iframe';
import Header from './../../components/Header.js';
import Config from '../Config/Config.js';
import SmoothieComponent from 'react-smoothie';
import axios from 'axios';
import Chart from 'react-google-charts';
import Loader from 'react-loader-spinner';
import API from './../../Config/api.json';
// import {PieChart} from 'react-easy-chart';
import {PieChart, BarChart, Legend, ResponsiveContainer} from 'react-easy-chart';
import ReactSvgPieChart from "react-svg-piechart";
import Meter from '../../components/meter.js';
import GuageChart from '../../components/GuageChart.js';
import Datetime  from 'react-datetime';
import Modal from 'react-responsive-modal';
import Pagination from "react-js-pagination";
import Notifications, {notify} from 'react-notify-toast';
import CountUp from 'react-countup';
class Analytics extends Component {
  constructor(props) {
    super(props);
    var d = (new Date());
    console.log('d.setHours(d.getHours()-1)',d.setHours(d.getHours()-1));
    this.state = {
      loader:false,
      logInformation:[],
      logModelOpen:false,
      applianceHostName:'',
      applicanceLogLevel:'',
      appliancesLogs:[],
      activePage:1,
      itemsCountPerPage:0,
      totalItemsCount:0,
      pageRangeDisplayed:0,
      startDateTime:new Date((d.setHours(d.getHours()))),
      endDateTime:new Date(),
      sDT:(new Date((d.setHours(d.getHours())))),
      eDT: (new Date()),
      displayMessageForTimeSelection:'Showing Syslog Severity Level and log packet count and their top 10 originator for last 1 hour.',
      totalPacketCountForAllAppliances:0};
    //this.bindLoglevels = this.bindLoglevels.bind(this);
    this.onApplicanceClick = this.onApplicanceClick.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.onApplyTimeClick = this.onApplyTimeClick.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);
    this.onStartDateChange = this.onStartDateChange.bind(this);
  }

  componentDidMount() {
    var d = (new Date());
    let pageObj = this;
    this.setState({sDT : (new Date((d.setHours(d.getHours()-1)))), eDT : (new Date())},()=>{
      pageObj.bindLoglevels();
    })

  }

  componentWillUnmount(){}

  onStartDateChange(startDT)
  {
    console.log(startDT);
    console.log(startDT._d);
    this.setState({startDateTime:(startDT._d == undefined) ? null : startDT._d});
  }

  onEndDateChange(endDT)
  {
    console.log(endDT);
    console.log(endDT._d);
    this.setState({endDateTime:(endDT._d == undefined) ? null : endDT._d});
  }

  onApplyTimeClick()
  {
    console.log("Start Time -> ",this.state.startDateTime);
    console.log("End Time -> ",this.state.endDateTime);
    let pageObj = this;
    this.setState({displayMessageForTimeSelection:'Showing Syslog Severity Level and log packet count and their top 10 originator, for time starting from '+ this.state.startDateTime + ' to '+ this.state.endDateTime});
    this.setState({sDT : this.state.startDateTime, eDT : this.state.endDateTime},()=>{
        console.log("I am inside apply click.");

        pageObj.bindLoglevels();
    });
  }

  onPageChange(pageNumber)
  {
    //console.log(event);
    console.log(pageNumber);
    let pageObj = this;
    this.setState({activePage:pageNumber},()=>{
      let getLogData = {'SYSLOG_HOSTNAME':pageObj.state.applianceHostName,'SYSLOG_LOG_LEVEL':pageObj.state.applicanceLogLevel, 'PAGE_NUMBER':((pageNumber-1)*1000), 'sDT':(this.state.sDT).toISOString(), 'eDT':(this.state.eDT).toISOString()};
      this.getLogs(getLogData);
    });
    //{logModelOpen:true,applianceHostName:event.target.name, applicanceLogLevel:event.target.value});

  }

  bindLoglevels()
  {
    let pageObj = this;
    this.setState({loader:true});
    let logParams = {'sDT':(this.state.sDT).toISOString(), 'eDT':(this.state.eDT).toISOString()};
    axios.post(API.current.apiUrl+"/api/v1/analytics",logParams).then(function(res)
    {
        pageObj.setState({logInformation:res.data.data,loader:false, totalPacketCountForAllAppliances: res.data.data[0].totalPackets});
    }).catch(function(err){
        pageObj.setState({loader:false});
        console.log(err);
    })
  }

  getLogs(appliance)
  {
    let pageObj = this;
    this.setState({appliancesLogs:[],loader:true});
    axios.post(API.current.apiUrl+"/api/v1/logs",appliance).then(function(res)
    {
        pageObj.setState({appliancesLogs:res.data.hits.hits, totalItemsCount:res.data.hits.total,loader:false});
    }).catch(function(err){
        pageObj.setState({loader:false});
        console.log(err);
    })
  }

  onApplicanceClick(event)
  {
    console.log(event.target.name);
    console.log(event.target.value);
    this.setState({logModelOpen:true, applianceHostName:event.target.name, applicanceLogLevel:event.target.value, activePage:1});
    let getLogData = {'SYSLOG_HOSTNAME':event.target.name,'SYSLOG_LOG_LEVEL':event.target.value, 'PAGE_NUMBER':0, 'sDT':(this.state.sDT).toISOString(), 'eDT':(this.state.eDT).toISOString()};
    this.getLogs(getLogData);
  }

  onCloseModal()
  {
    this.setState({logModelOpen:false});
  }


  render() {
    const colors = ['rgb(255, 0, 0)',
                    'rgb(255, 97, 0)',
                    'rgb(255, 161, 0)',
                    'rgb(255, 204, 0)',
                    'rgb(238, 255, 0)',
                    'rgb(157, 255, 0)',
                    'rgb(67, 255, 0)',
                    'rgb(0, 255, 89)'];

    return (
        <div style={{'height':'85vh', 'overflowY':'scroll'}}>
          <Grid className="override_container">
              <Row className="show-grid">
                <Col xs={12} md={2}>
                  <Label text={"Start Date"} color={"#000"} size={"14px"}></Label>
                </Col>
                <Col xs={12} md={3}>
                      <Datetime className="datePickerField" value={this.state.startDateTime} onChange={this.onStartDateChange}/>
                </Col>
                <Col xs={12} md={2}>
                  <Label text={"End Date"} color={"#000"} size={"14px"}></Label>
                </Col>
                <Col xs={12} md={3}>
                      <Datetime className="datePickerField" value={this.state.endDateTime} defaultValue={new Date()} onChange={this.onEndDateChange}/>
                </Col>
                <Col xs={12} md={2}>
                  <Button bsStyle="primary" className="button userPagebtn" bsSize="small" onClick={this.onApplyTimeClick}>
                    Apply
                  </Button>
                </Col>
              </Row>
            </Grid>

            <div>
              {/*<div>
                <GuageChart valueCount = {48.6} postfix="%"></GuageChart>
              </div>*/}
              <div style={{textAlign: 'center',fontSize: '30px',color: 'darkgray', fontFamily:'Calibri'}}>
                  <CountUp
                    className="account-balance"
                    start={0}
                    end={this.state.totalPacketCountForAllAppliances}
                    duration={5}
                    useEasing={true}
                    useGrouping={true}
                    separator=","
                    decimals={0}
                    decimal=","
                    prefix="Total Packets: "
                    suffix=""
                  />
              </div>

              <div className="userStates" style={{padding:'5px', margin:'5px'}}>
                  <Label text={this.state.displayMessageForTimeSelection}></Label>
              </div>
              <div>
                    {this.state.logInformation.map((value, index) => {
                        // console.log('value',value);
                        // console.log(colors[parseInt(value.logLevel)], value.logLevel);

                        // ((value.totalPackets == 0)?(return <h1>No Record Found.</h1>):<h2>Records Found.</h2>)
                          return <GuageChart totalPackets={(value.totalPackets == 0)?0:value.totalPackets} fillcolor={colors[parseInt(value.logLevel)]} valueCount = {(value.totalPackets == 0) ? 0 :(value.packetsForLogLevel/value.totalPackets)*100} postfix="%" logLevelDescription={value.logLevelDescription} packetsForLogLevel={value.packetsForLogLevel} key={index}
                          topApplicances={value.topApplicances.SYSLOG_HOSTNAME.buckets} logLevel={value.logLevel} onApplicanceClick={this.onApplicanceClick}></GuageChart>
                        {/*return <Meter totalPackets={(value.totalPackets == 0)?1:value.totalPackets} segments={(value.totalPackets == 0)?0:5} logLevelDescription={value.logLevelDescription} packetsForLogLevel={value.packetsForLogLevel} key={index}
                        topApplicances={value.topApplicances.SYSLOG_HOSTNAME.buckets} logLevel={value.logLevel} onApplicanceClick={this.onApplicanceClick}></Meter>*/}

                    })}
              </div>
            </div>

            <Modal open={this.state.logModelOpen} onClose={this.onCloseModal} center>
              <Grid style={{width:'100%', height:'90vh'}}>
                  <Row className="show-grid">
                      <Col xs={12} md={12}>
                        <div style={{textAlign :'center'}}><b style={{fontFamily:'Times New Roman, Times, serif', textDecoration:'none', fontSize:'16px', color:'#000'}}>Showing Logs for:  {this.state.applianceHostName}</b></div>
                            <div style={{backgroundColor:'#222222', padding:'2px', height:'80vh', overflowY:'scroll'}}>
                                  <ul>
                                      {this.state.appliancesLogs.map((value, index)=>{
                                          {/*<li type="none" style={{fontSize:'10px', color:'#ffffff'}}  key={index+'i'}>{ ((this.state.activePage-1)*1000 + index + 1) + ". "+ value._source.message}</li>*/}
                                          return <li type="none" style={{fontSize:'10px', color:'#ffffff'}}  key={index+'i'}>{value._source.message}</li>
                                      })}
                                  </ul>
                            </div>
                      </Col>
                  </Row>
                  <Row className="show-grid">
                    <Col xs={12} md={12}>
                      <Pagination
                          activePage={this.state.activePage}
                          itemsCountPerPage={1000}
                          totalItemsCount={this.state.totalItemsCount}
                          pageRangeDisplayed={15}
                          onChange={this.onPageChange}
                        />
                    </Col>
                  </Row>
              </Grid>
            </Modal>

            <Notifications options={{zIndex: 200, top: '50px'}} />
              {(this.state.loader)?
                  <div className="fadeMe">
                      <div style={{position:'absolute', left:'45%', top: '40%'}}>
                        <Loader
                           type="ThreeDots"
                           color="#00BFFF"
                           height="150"
                           width="150"
                        />
                      </div>
                  </div>:<div></div>
              }
        </div>
    );
  }
}

export default Analytics;
