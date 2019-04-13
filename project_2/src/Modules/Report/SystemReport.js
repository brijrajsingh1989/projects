import React, { Component } from 'react';
import {Button, FormGroup, FormControl, ControlLabel, Grid, Row, Col, OverlayTrigger} from 'react-bootstrap';
import './../../resources/styles/style.css';
import './SystemReport.css';
import Label from './../../components/Label.js';
import TextBox from './../../components/TextBox.js';
import {Animated} from "react-animated-css";
import Iframe from 'react-iframe';
import Header from './../../components/Header.js';
import ShowReports from './ShowReports.js';
import Analytics from './Analytics.js';
import Textarea from 'react-textarea-autosize';
import axios from 'axios';
import Notifications, {notify} from 'react-notify-toast';
import Loader from 'react-loader-spinner';
import API from './../../Config/api.json';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import DonutChart from 'react-donut-chart';
import "react-awesome-popover/dest/react-awesome-popover.css";
import Popover from 'react-awesome-popover';
import ReactCursorPosition, { INTERACTIONS } from 'react-cursor-position';
import Modal from 'react-responsive-modal';
import {Tooltip} from "reactstrap";
import SmoothieComponent from 'react-smoothie';
import {PieChart, BarChart, Legend, ResponsiveContainer} from 'react-easy-chart';
import ReactSvgPieChart from "react-svg-piechart";
import CountUp from 'react-countup';
import {LineChart} from 'react-easy-chart';

class SystemReport extends Component {

  constructor(props) {

    super(props);

    this.state ={left:0, top:0, openModel:false, logLevel:[], loader:false, reportCalculatedData:[], totalDiskSpace:0,freeSpace:0};

    this.onDonutMouseEnter = this.onDonutMouseEnter.bind(this);
    this.onDountSliceClick = this.onDountSliceClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  onCloseModal()
  {
    this.setState({openModel:false});
  }

  onMouseMove(e)
  {
    console.log(e.screenX);
    console.log(e.screenY);
  }
  onDountSliceClick(item, toggled)
  {
    console.log(item);
  }

  onDonutMouseEnter(item)
  {
    console.log(item);
    this.setState({openModel:true});
  }


  componentDidMount() {

      let thisObj = this;

      // var ts1 = this.refs.chart.addTimeSeries({
      //   strokeStyle: 'rgba(0, 255, 0, 1)',
      //   fillStyle: 'rgba(0, 255, 0, 0.1)',
      //   lineWidth: 1,
      // });
      //
      // this.dataGenerator = setInterval(function() {
      //   var time = new Date().getTime();
      //   // Generate times slightly in the future
      //   time += 1000;
      //   axios.get(API.current.apiUrl+'/api/v1/cpuinfo').then(function(res){
      //     ts1.append(time, res.data.cpu);
      //     //ts2.append(time, Math.random());
      //   }).catch(function(err){
      //     console.log(err);
      //   })
      // }, 1000);


      // this.logGenerator = setInterval(function() {
      //
      //   axios.get(API.current.apiUrl+'/api/v1/events').then(function(res){
      //     console.log(res.data);
      //
      //     thisObj.setState({logLevel:[
      //       {title: "Emergency ("+res.data.Emergency+")", value: parseInt(res.data.Emergency), color: "#ef0000"},
      //       {title: "Alert ("+res.data.Alert+")", value: parseInt(res.data.Alert), color: "#A94442"},
      //       {title: "Critical ("+res.data.Critical+")", value: parseInt(res.data.Critical), color: "#FFA500"},
      //       {title: "Error ("+res.data.Error+")", value: parseInt(res.data.Error), color: "#ffa578"},
      //       {title: "Warning ("+res.data.Warning+")", value: parseInt(res.data.Warning), color: "#ff78a9"},
      //       {title: "Notice ("+res.data.Notice+")", value: parseInt(res.data.Notice), color: "#1911bf"},
      //       {title: "Informational ("+res.data.Informational+")", value: parseInt(res.data.Informational), color: "#10bf67"},
      //       {title: "Debug ("+res.data.Debug+")", value: parseInt(res.data.Debug), color: "#00e822"},
      //     ]})
      //     let countAll = parseInt(res.data.Emergency) + parseInt(res.data.Alert) + parseInt(res.data.Critical) + parseInt(res.data.Error) + parseInt(res.data.Warning) + parseInt(res.data.Notice) + parseInt(res.data.Informational) + parseInt(res.data.Debug);
      //     let reportRowCalculatedData = [
      //       {x: "Emergency" + " ("+res.data.Emergency +" | "+ ((parseInt(res.data.Emergency)/countAll)*100).toFixed(2)+"%)"},
      //       {x: "Alert" + " ("+res.data.Alert+" | " + ((parseInt(res.data.Alert)/countAll)*100).toFixed(2)+"%)"},
      //       {x: "Critical" + " ("+res.data.Critical+" | "+((parseInt(res.data.Critical)/countAll)*100).toFixed(2)+"%)"},
      //       {x: "Error" + " ("+res.data.Error+" | " +((parseInt(res.data.Error)/countAll)*100).toFixed(2)+"%)"},
      //       {x: "Warning" + " ("+res.data.Warning+ " | "+((parseInt(res.data.Warning)/countAll)*100).toFixed(2)+"%)"},
      //       {x: "Notice" + " ("+res.data.Notice+" | "+((parseInt(res.data.Notice)/countAll)*100).toFixed(2)+"%)"},
      //       {x: "Informational" + " ("+res.data.Informational+ " | "+((parseInt(res.data.Informational)/countAll)*100).toFixed(2)+"%)"},
      //       {x: "Debug" + " ("+res.data.Debug+" | "+((parseInt(res.data.Debug)/countAll)*100).toFixed(2)+"%)"}
      //     ]
      //
      //     thisObj.setState({reportCalculatedData:reportRowCalculatedData});
      //   }).catch(function(err){
      //     console.log(err);
      //   })
      //
      // }, 5000);


      axios.get(API.current.apiUrl+'/api/v1/freeSpaceinfo').then(function(res){
        console.log(res.data);
        //get free space in GB
          thisObj.setState({totalDiskSpace:((res.data[0] == undefined)?(res.data.total/(1024*1024*1024)):(res.data[0]/(1024*1024*1024))), freeSpace:((res.data[0] == undefined)?(res.data.used/(1024*1024*1024)):(res.data[2]/(1024*1024*1024)))});
        //ts2.append(time, Math.random());
      }).catch(function(err){
        console.log(err);
      })
  }

  componentWillUnmount()
  {
    // clearInterval(this.dataGenerator);
    // clearInterval(this.logGenerator);
  }

  render() {

    return (
        <div className="manageSystemReportPage">
          <div className="manageSystemReports" style={{color:'#000' }}>

          {
            /*<div>
                <SmoothieComponent ref="chart" responsive={true} interpolation="smooth" minValue={0} width={1000} height={150}  maxValue={100} strokeStyle="#ffffff"/>
              </div>
              <div style={{textAlign:'center'}}>
                <Label text="CPU Usage" color={"#000"} size={'30px'} ></Label>
                </div>
                <div>
                  <hr></hr>
                </div>*/
          }
          <div style={{textAlign:'center', fontSize:'30px',color: '#000', fontFamily: 'Calibri'}}>
            <CountUp
              className="account-balance"
              start={0}
              end={this.state.totalDiskSpace}
              duration={2}
              useEasing={true}
              useGrouping={true}
              separator=","
              decimals={0}
              decimal=","
              prefix="Total Hard Disc Space : "
              suffix=" GB"
            />
          </div>
          <div>
            <hr></hr>
          </div>
          <div style={{textAlign:'center', fontSize:'30px',color: '#000', fontFamily: 'Calibri'}}>
            <CountUp
              className="account-balance"
              start={0}
              end={this.state.freeSpace}
              duration={2}
              useEasing={true}
              useGrouping={true}
              separator=","
              decimals={0}
              decimal=","
              prefix="Used Hard Disc Space : "
              suffix=" GB"
            />
          </div>
          <div>
            <hr></hr>
          </div>
          {/*<div id="controlledTooltip" style={{width:'300px'}}>
            <DonutChart
              className = {"donutChart"}
              clickToggle={false}
              height={200}
              width = {200}
              legend = {false}
              onMouseEnter = {(item)=>this.onDonutMouseEnter(item)}
              onClick = {(item, toggled) => this.onDountSliceClick(item, toggled)}
              data={[{
                  label: 'Emergency',
                  value: 3,
                  id:'1'
              },
              {
                  label: 'Alert',
                  value: 12,
                  id:'2'
              },
              {
                  label: 'Critical',
                  value: 17,
                  id:'3'
              },
              {
                  label: 'Error',
                  value: 18,
                  id:'4'
              },
              {
                  label: 'Warning',
                  value: 9,
                  id:'5'
              },
              {
                  label: 'Notice',
                  value: 11,
                  id:'6'
              },
              {
                label:'Informational',
                value:20,
                id:'7'

              },
              {
                label:'Debug',
                value:5,
                id:'8'
              },
              {
                  label: '',
                  value: 5,
                  isEmpty: true,
                  id:'9'
              }]} />
            </div>*/}

            {
              /*<Modal open={this.state.openModel} onClose={this.onCloseModal} style={{top:'2000', left:'2000'}}>
                <div>AT</div>
              </Modal>*/
            }


            {
              /*<LineChart

              width = {600}
              height = {300}

              data={
                      [
                        [
                          { x: '1', y: 20 },
                          { x: '2', y: 10 },
                          { x: '3', y: 25 },
                          { x: '30', y: 25 }
                        ]
                      ]
                    }
                  />*/
                }

          </div>
        </div>
    );
  }
}

export default SystemReport;
