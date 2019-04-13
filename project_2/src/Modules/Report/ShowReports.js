import React, { Component } from 'react';
import {Button, FormGroup, FormControl, ControlLabel, Grid, Row, Col, OverlayTrigger, Glyphicon} from 'react-bootstrap';
import './../../resources/styles/style.css';
import './Report.css';
import Label from './../../components/Label.js';
import TextBox from './../../components/TextBox.js';
import {Animated} from "react-animated-css";
import Iframe from 'react-iframe';
import Header from './../../components/Header.js';
import Config from '../Config/Config.js';
import RGrid from './../../components/Grid.js';
import Switch from "react-switch";
import Notifications, {notify} from 'react-notify-toast';
import axios from 'axios';
import * as JsSearch from 'js-search';
import AddReport from './../../components/AddReport.js';
import Datetime  from 'react-datetime';
//import './../../resources/styles/react-datetime.css';
import moment from 'moment';
import './../../../node_modules/react-datetime/css/react-datetime.css';
import Modal from 'react-responsive-modal';
import {PieChart, BarChart, Legend, ResponsiveContainer} from 'react-easy-chart';
import Tooltip from "react-simple-tooltip";
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import saveAs from 'save-as';
import Loader from 'react-loader-spinner';
import API from './../../Config/api.json';
import DonutChart from 'react-donut-chart';
import "react-awesome-popover/dest/react-awesome-popover.css";

const toggleAdminFormatter = ({ value }) => {
  console.log(value);
  return <div>{}</div>
};

var search = new JsSearch.Search('id');
search.addIndex('start_date');
search.addIndex('end_date');
search.addIndex('created_by');
search.addIndex('created_on');
search.addIndex('id');
search.addIndex('log_type');

class ShowReports extends Component {

  constructor(props) {
    super(props);
    this.state =
    {
      modalIsOpen:false,
      startDate:null,
      endDate:new Date(),
      columnsDef: [],
      rowRecords: [],
      viewReportModelOpen:false,
      reportData : [],
      showToolTip:false,
      top: '',
      left:'',
      reportCalculatedData:[],
      reportStartDate:'',
      reportEndDate:'',
      loader:false,
      sendEmail:false
    };

    this.geenrateReports = this.geenrateReports.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onGenerateReportsClick = this.onGenerateReportsClick.bind(this);
    this.onCancelClick = this.onCancelClick.bind(this);
    this.onChangeEvent = this.onChangeEvent.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);

    this.mouseOutHandler = this.mouseOutHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseOverHandler = this.mouseOverHandler.bind(this);

    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);

    this.onDonutMouseEnter = this.onDonutMouseEnter.bind(this);
    this.onDountSliceClick = this.onDountSliceClick.bind(this);
  }

  onDonutMouseEnter(donut)
  {
    console.log(donut);
  }
  onDountSliceClick(donut)
  {
    console.log(donut);
  }

  onEndDateChange(endDate)
  {
    this.setState({endDate:endDate._d});
  }

  onStartDateChange(startDate)
  {
      this.setState({startDate:startDate._d});
  }

  mouseOverHandler(d, e) {
    console.log('over y', e.y);
    console.log('over x', e.x);
    this.setState({
      showToolTip: true,
      top: `${e.screenY - 50}px`,
      left: `${e.screenX + 10}px`,
      y: d.y,
      x: d.x});
  }

  mouseMoveHandler(e) {
    if (this.state.showToolTip) {
      this.setState({top: `${e.y - 50}px`, left: `${e.x + 10}px`});
    }
  }

  mouseOutHandler(event) {
    this.setState({showToolTip: false});
  }

  onCloseModal(event)
  {
    this.setState({viewReportModelOpen:false});
  }

  onChangeEvent(event)
  {
    let filteredData = search.search(event.target.value);
    if(event.target.value)
    {
      this.setState({rowRecords: filteredData});
    }
    else {
      this.bindReportGrid();
    }
  }

  onCancelClick(event)
  {
    this.setState({modalIsOpen:false});
  }

  lower(obj) {
    var output = {};
    for (let i in obj) {
        if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
           output[i.toLowerCase()] = this.lower(obj[i]);
        }else if(Object.prototype.toString.apply(obj[i]) === '[object Array]'){
            output[i.toLowerCase()]=[];
             output[i.toLowerCase()].push(this.lower(obj[i][0]));
        } else {
            output[i.toLowerCase()] = obj[i];
        }
    }
    return output;
}

  onGenerateReportsClick(event)
  {
    let pageObj = this;
    if(!moment(this.state.startDate).isValid())
    {
      notify.show("Please enter valid start date.", "error", 2000);
      return false;
    }
    else if(!moment(this.state.startDate).isValid())
    {
      notify.show("Please enter valid end date.", "error", 2000);
      return false;
    }
    else {
        let inpData = {
          'startDate': this.state.startDate.toISOString(),
          'endDate': this.state.endDate.toISOString()
        }

        this.setState({loader:true});
        axios.post(API.current.apiUrl+'/api/v1/elastic', inpData).then(function(res){
          let row = pageObj.lower(res.data);
          console.log('row', row);
          console.log('pageObj.state.startDate', pageObj.state.startDate);
          console.log('pageObj.state.endDate', pageObj.state.endDate);
          row.start_date = String(pageObj.state.startDate);
          row.end_date = String(pageObj.state.endDate);
          console.log('row new', row);
          //pageObj.setState({sendEmail:true});
          pageObj.viewReport(row);
          pageObj.bindReportGrid();
          pageObj.setState({loader:false});
        }).catch(function(err)
        {
          console.log('err', err);
          pageObj.setState({loader:false});
          pageObj.setState({sendEmail:false});
        });
    }
  }

  onDateChange(event)
  {

  }

  geenrateReports(event)
  {
    this.setState({modalIsOpen:true});
  }

  bindReportGrid()
  {
    search = new JsSearch.Search('id');
    search.addIndex('start_date');
    search.addIndex('end_date');
    search.addIndex('created_by');
    search.addIndex('created_on');
    search.addIndex('id');
    search.addIndex('log_type');

    let pageObj = this;

    let gridColumns = [
      { key: 'id', name: 'Report ID' },
      { key: 'start_date', name: 'Start Date' },
      { key: 'end_date', name: 'End Date' },
      { key: 'created_by', name:'Generated By'},
      { key: 'created_on', name: 'Generated On' },
      { key: 'log_type', name: 'Frequency' }
    ];

    this.setState({columnsDef:gridColumns});
    this.setState({loader:true});
    axios.get(API.current.apiUrl+"/api/v1/elastic").then(function(res)
    {
        search.addDocuments(res.data);
        pageObj.setState({rowRecords: res.data});
        pageObj.setState({loader:false});
    }).catch(function(err){
        console.log(err);
        pageObj.setState({loader:false});
    })
  }

  componentDidMount()
  {
    this.bindReportGrid();
  }


  viewReport(row)
  {
    this.setState({viewReportModelOpen:true});
    let reportRow =
    [
        {x: "Emergency", y: parseInt(row.emergency), color: "#ef0000"},
        {x: "Alert", y: parseInt(row.alert), color: "#a94442"},
        {x: "Critical", y: parseInt(row.critical), color: "#FFA500"},
        {x: "Error", y: parseInt(row.error), color: "#ffa578"},
        {x: "Warning", y: parseInt(row.warning), color: "#ff78a9"},
        {x: "Notice", y: parseInt(row.notice), color: "#1911bf"},
        {x: "Informational", y: parseInt(row.informational), color: "#10bf67"},
        {x: "Debug", y: parseInt(row.debug), color: "#00e822"}
    ]

    this.setState({reportData:reportRow});

    let countAll = parseInt(row.emergency) + parseInt(row.alert) + parseInt(row.critical) + parseInt(row.error) + parseInt(row.warning) + parseInt(row.notice) + parseInt(row.informational) + parseInt(row.debug)

    if(countAll == 0)
    {
      countAll = 1;
    }

    // let reportRowCalculatedData = [
    //   {x: "Emergency" + " ("+row.emergency +" | "+ ((parseInt(row.emergency)/countAll)*100).toFixed(2)+"%)"},
    //   {x: "Alert" + " ("+row.alert+" | " + ((parseInt(row.alert)/countAll)*100).toFixed(2)+"%)"},
    //   {x: "Critical" + " ("+row.critical+" | "+((parseInt(row.critical)/countAll)*100).toFixed(2)+"%)"},
    //   {x: "Error" + " ("+row.error+" | " +((parseInt(row.error)/countAll)*100).toFixed(2)+"%)"},
    //   {x: "Warning" + " ("+row.warning+ " | "+((parseInt(row.warning)/countAll)*100).toFixed(2)+"%)"},
    //   {x: "Notice" + " ("+row.notice+" | "+((parseInt(row.notice)/countAll)*100).toFixed(2)+"%)"},
    //   {x: "Informational" + " ("+row.informational+ " | "+((parseInt(row.informational)/countAll)*100).toFixed(2)+"%)"},
    //   {x: "Debug" + " ("+row.debug+" | "+((parseInt(row.debug)/countAll)*100).toFixed(2)+"%)"}
    // ]

    let reportRowCalculatedData = [
      ((parseInt(row.emergency)/countAll)*100).toFixed(2),
      ((parseInt(row.alert)/countAll)*100).toFixed(2),
      ((parseInt(row.critical)/countAll)*100).toFixed(2),
      ((parseInt(row.error)/countAll)*100).toFixed(2),
      ((parseInt(row.warning)/countAll)*100).toFixed(2),
      ((parseInt(row.notice)/countAll)*100).toFixed(2),
      ((parseInt(row.informational)/countAll)*100).toFixed(2),
      ((parseInt(row.debug)/countAll)*100).toFixed(2)
    ]

    this.setState({reportCalculatedData:reportRowCalculatedData});
    this.setState({reportStartDate:moment(row.start_date).format('YYYY-MM-DD HH:mm:ss')});
    this.setState({reportEndDate:moment(row.end_date).format('YYYY-MM-DD HH:mm:ss')});
    //Tue Dec 11 2018 00:00:00 GMT+0800 (Singapore Standard Time)
    //open all report page and clear start and end dates
    this.setState({modalIsOpen: false, startDate: '', endDate: new Date()});

      // let emailReportData = {
      //     'emailId':sessionStorage.getItem('mailId'),
      //     'emergency':row.emergency,
      //     'alert':row.alert,
      //     'critical':row.critical,
      //     'error':row.error,
      //     'warning':row.warning,
      //     'notice':row.notice,
      //     'informational':row.informational,
      //     'debug':row.debug,
      //     'startdate':moment(row.start_date).format('YYYY-MM-DD HH:mm:ss'),
      //     'enddate':moment(row.end_date).format('YYYY-MM-DD HH:mm:ss'),
      //     'name':sessionStorage.getItem('user')
      //   };
      // if(this.state.sendEmail)
      // {
      //   this.setState({loader:true});
      //   let pageObj = this;
      //   axios.post(API.current.apiUrl+'/api/v1/send_email', emailReportData).then(function(res){
      //       console.log(res);
      //       notify.show("States send to your registered email id -" + sessionStorage.getItem('mailId'), "success", 2000);
      //       pageObj.setState({loader:false});
      //       pageObj.setState({sendEmail:false});
      //   }).catch(function(err)
      //   {
      //     console.log('err', err);
      //     console.log(err);
      //     pageObj.setState({loader:false});
      //     pageObj.setState({sendEmail:false});
      //   });
      // }
  }

  downloadReport(row)
  {
    this.setState({loader:true});
    let pageObj = this;
    //Generate a directory within the Zip file structure
    //Generate csv file file
    //Add CSV to zip file
    //Generate HTML file
    //Add HTML report to zip
    let csvReport = '';
    axios.post(API.current.apiUrl+'/api/v1/download_csv_report', row).then(function(res){
        csvReport = res.data;
        axios.post(API.current.apiUrl+'/api/v1/download_html_report', row).then(function(res){
          let htmlReport = res.data;
          let zip = new JSZip();
          console.log(res.data);
          zip.file(row.start_date+"_to_"+row.end_date+".csv", csvReport);
          zip.file(row.start_date+"_to_"+row.end_date+".html", htmlReport);

          zip.generateAsync({type: "blob"}).then( function(content) {
            FileSaver.saveAs(content, "report.zip");
          });
          pageObj.setState({loader:false});

        }).catch(function(err)
        {
          console.log('err', err);
          pageObj.setState({loader:false});
        });

    }).catch(function(err)
    {
      console.log('err', err);
      pageObj.setState({loader:false});
    });
  }

  deleteReport(row)
  {
    this.setState({loader:true});
    let pageObj = this;

    axios.patch(API.current.apiUrl+"/api/v1/elastic", { id : row.id} ).then(function(res)
    {
      pageObj.setState({loader:false});
      pageObj.bindReportGrid();
    }).catch(function(err){
        console.log(err);
        pageObj.setState({loader:false});
    })
  }

  getCellActions=(column, row)=>{

      if (column.key === 'id') {
          return [
                    {
                    icon: "glyphicon glyphicon-download",
                      callback: () => {
                        this.downloadReport(row);
                      }
                    },
                    {
                    icon: "glyphicon glyphicon-remove-circle",
                      callback: () => {
                        this.deleteReport(row);
                      }
                    },
                    {
                    icon: "glyphicon glyphicon-list-alt",
                      callback: () => {
                        this.viewReport(row);
                      }
                    }
                  ]
      }
  }

  render() {

    return (
        <div className="manageShowReports" style={{color:'#000'}}>

          {/*<div className="userStates">
              <Label text={"Daily Report(s) - "+this.state.rowRecords.length+" | Weekly Report(s) - NA | Monthly Report(s) - NA | Daily Report(s) - NA | Custom Report(s) - NA"}></Label>
          </div>*/}

          <div style={{display:(this.state.modalIsOpen) ? "none" : "" }}>
              <div className="users">
                <div className="addUsers"><AddReport text={"Generate Report"} onClickImplementation={this.geenrateReports}></AddReport></div>

                <div className="searchUsers">
                    <TextBox inputType = "text" placeholder="Search" onChangeEvent={this.onChangeEvent}></TextBox>
                    <img src={require('./../../resources/images/search.png')} style={{width:'20px',height:'20px', cursor:'pointer'}} name="report"/>
                </div>

              </div>
                <RGrid
                    columnDefs={this.state.columnsDef}
                    rowData = {this.state.rowRecords}
                    onGridRowsUpdated={this.onGridRowsUpdated}
                    getCellActions={this.getCellActions}
                  >
                </RGrid>
          </div>

          <div style={{display:(!this.state.modalIsOpen) ? "none" : "" }} className="users">
              <div className="createUser">
                  <Grid className="override_container">
                      <Row className="show-grid">
                        <Col xs={12} md={3}>
                          <Label text={"Start Date"} color={"#fff"} size={"12px"}></Label>
                        </Col>
                        <Col xs={12} md={3}>

                              <Datetime className="datePickerField" value={this.state.startDate} onChange={this.onStartDateChange}/>

                        </Col>
                        <Col xs={12} md={3}>
                          <Label text={"End Date"} color={"#fff"} size={"12px"}></Label>
                        </Col>
                        <Col xs={12} md={3}>

                              <Datetime className="datePickerField" value={this.state.endDate} defaultValue={new Date()} onChange={this.onEndDateChange}/>

                        </Col>
                      </Row>

                      <Row className="show-grid" style={{marginTop:'10px'}}>
                        <Col xs={5} md={2}>
                          <Button bsStyle="primary" className="button userPagebtn" bsSize="small" onClick={this.onGenerateReportsClick}>
                            Generate Report
                          </Button>
                        </Col>
                        <Col xs={5} md={2}>
                          <Button bsStyle="primary" className="button userPagebtn" bsSize="small" onClick={this.onCancelClick}>
                            Cancel
                          </Button>
                        </Col>
                        <Col xs={1} md={2}>
                          <div></div>
                        </Col>
                        <Col xs={1} md={6}>
                          <div></div>
                        </Col>
                      </Row>

                    </Grid>
                </div>
            </div>

            <Notifications  options={{zIndex: 2000, top: '20px'}} />

            <Modal open={this.state.viewReportModelOpen} onClose={this.onCloseModal} center>
              <Grid>
                  <Row className="show-grid">
                      <Col xs={12} md={12}>
                        {/*<div><Label text={"Report from "+ this.state.reportStartDate  +" to " + this.state.reportEndDate +""} size="14px" color="#000"></Label></div>*/}
                        <div style={{textAlign :'center'}}><b style={{fontFamily:'Calibri', textDecoration:'underline', fontSize:'18px', color:'#005571'}}>Report from {this.state.reportStartDate} to {this.state.reportEndDate}</b></div>
                      </Col>
                  </Row>
                  <Row className="show-grid">
                      <Col xs={12} md={12}>
                        {/*<div><Label text={"Errors State"} size="14px" color="#000"></Label></div>*/}
                        <div className="logStatesDiv">
                            <b style={{fontFamily:'Calibri', fontSize:'16px'}}>Log Level States</b>
                        </div>
                      </Col>
                  </Row>

                  <Row>
                    <Col  xs={12} md={12}>
                      <div style={{textAlign:'center'}}>
                        <DonutChart
                          className = {"donutChart"}
                          clickToggle={false}
                          height={350}
                          width = {350}
                          legend = {false}
                          onMouseEnter = {(item)=>this.onDonutMouseEnter(item)}
                          onClick = {(item, toggled) => this.onDountSliceClick(item, toggled)}
                          data={[{
                              label: 'Emergency',
                              value: parseFloat(this.state.reportCalculatedData[0]),
                              id:'1'
                          },
                          {
                              label: 'Alert',
                              value: parseFloat(this.state.reportCalculatedData[1]),
                              id:'2'
                          },
                          {
                              label: 'Critical',
                              value: parseFloat(this.state.reportCalculatedData[2]),
                              id:'3'
                          },
                          {
                              label: 'Error',
                              value: parseFloat(this.state.reportCalculatedData[3]),
                              id:'4'
                          },
                          {
                              label: 'Warning',
                              value: parseFloat(this.state.reportCalculatedData[4]),
                              id:'5'
                          },
                          {
                              label: 'Notice',
                              value: parseFloat(this.state.reportCalculatedData[5]),
                              id:'6'
                          },
                          {
                            label:'Informational',
                            value: parseFloat(this.state.reportCalculatedData[6]),
                            id:'7'

                          },
                          {
                            label:'Debug',
                            value: parseFloat(this.state.reportCalculatedData[7]),
                            id:'8'
                          }]} />
                        {/*<Legend data={this.state.reportCalculatedData} dataId={'x'} horizontal
                          config= {
                            [
                              {color: '#ef0000'},{color: '#a94442'},{color: '#FFA500'},
                              {color: '#ffa578'},{color: '#ff78a9'},{color: '#1911bf'},
                              {color: '#10bf67'},{color: '#00e822'}
                            ]
                          }/>*/}
                      </div>
                    </Col>
                  </Row>

                  {/*<Row>
                      <Col xs={12} md={12}>
                        <div className="logStatesDiv">
                            <BarChart
                              axes
                              colorBars
                              height={250}
                              width={600}
                              margin={{top: 0, right: 0, bottom: 50, left: 80}}
                              data = {this.state.reportData}
                              barWidth={40}
                              axisLabels={{x: 'Syslog Level', y: 'Syslog Packet Count'}}
                            />
                        </div>
                      </Col>
                  </Row>*/}
              </Grid>
            </Modal>
            {/*style={{top: this.state.top, left: this.state.left}}*/}
            <Notifications options={{zIndex: 2001, top: '50px'}} />

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

export default ShowReports;
