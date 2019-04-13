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
import Textarea from 'react-textarea-autosize';
import axios from 'axios';
import Notifications, {notify} from 'react-notify-toast';
import Loader from 'react-loader-spinner';
import API from './../../Config/api.json';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

class ManageReport extends Component {
  constructor(props) {
    super(props);
    this.state =
    {
      userName:'',
      isEditMode:false,
      retainDataMaxDays:'',
      retainLogsMaxDays:'',
      reportReciepents:'',
      configId:'',
      loader:false,
      ddOptions:[{ value: '1', label: '1' },{ value: '7', label: '7' },{ value: '15', label: '15' },{ value: '30', label: '30' },{ value: '60', label: '60' }]
    }
    this.addConfigToDB = this.addConfigToDB.bind(this);
    this.changeTaxtchange = this.changeTaxtchange.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.bindConfigDetails = this.bindConfigDetails.bind(this);
    this.changePurgeDataDays = this.changePurgeDataDays.bind(this);
    this.changePurgeLogsDays = this.changePurgeLogsDays.bind(this);
  }

  changePurgeLogsDays(data)
  {
    console.log('data.value',data.value);
    this.setState({retainLogsMaxDays:(data.value)});
  }

  changePurgeDataDays(data)
  {
    console.log('data',data);
    this.setState({retainDataMaxDays:(data.value)});
  }

  addConfigToDB()
  {
    console.log('submit');
  }

  updateConfig(event)
  {
    console.log(event);
    let pageObj = this;
    this.setState({loader:true});
    console.log('this.state',this.state);
    axios.put(API.current.apiUrl+'/api/v1/config', this.state).then(function(resp){
        if(resp.data.success)
        {
            notify.show("Details updated successfully.", "success", 2000);
            pageObj.bindConfigDetails();
        }
        else {
            notify.show("Updatation Failed.", "error", 2000);
        }
        pageObj.setState({loader:false});
    }).catch(function(err){
        console.log('err', err);
        pageObj.setState({loader:false});
    })
  }

  changeTaxtchange(event)
  {
      this.setState({reportReciepents:event.target.value});
  }

  bindConfigDetails()
  {
    let pageObj = this;
    console.log('login');
    this.setState({loader:true});
    axios.get(API.current.apiUrl+'/api/v1/config').then(function(resp){
        if(resp.data.success)
        {
            pageObj.setState({
              isEditMode:true,
              retainDataMaxDays:resp.data.data[0].retain_data_max_days,
              retainLogsMaxDays:resp.data.data[0].retain_logs_max_days,
              reportReciepents:resp.data.data[0].report_receipients_colon_separated,
              configId:resp.data.data[0].id
            });
        }
        pageObj.setState({loader:false});
    }).catch(function(err){
        console.log('err', err);
        pageObj.setState({loader:false});
    })
  }

  componentDidMount()
  {
    this.setState({userName:(sessionStorage.getItem('user'))?sessionStorage.getItem('user'):''});
    this.bindConfigDetails();
  }

  render() {
    return (
        <div className="manageShowReports" style={{color:'#000'}}>

          {
            /*<div className="userStates">
                <Label text={"Daily Report Count(s)- 100  | Weekly Report(s) - NA | Monthly Report(s) - NA | Custom Report(s) - NA"}></Label>
            </div>*/
          }

            <div className="createUser" style={{margin:'5px', marginTop:'10vh'}}>

                <Grid className="override_container">

                  <Row className="show-grid" style={{display:'none'}}>
                    <Col xs={12} md={12}>
                      <Label text={"Email Report:"} color={"#fff"} size={"16px"} decoration={"underline"}></Label>
                    </Col>
                  </Row>

                  <Row className="show-grid" style={{display:'none'}}>
                    <Col xs={12} md={3}>
                      <Label text={"Report Receipients ( ; separated)"} color={"#fff"} size={"12px"} ></Label>
                    </Col>
                    <Col xs={12} md={9}>
                      <Textarea maxRows={15} minRows={4} className="tb ta" style={{width: 220}} name="reportEmailIds" value={this.state.reportReciepents} onChange={this.changeTaxtchange}></Textarea>
                    </Col>
                  </Row>

                    <Row className="show-grid">
                      <Col xs={12} md={12}>
                        <Label text={"Manage Data and Logs:"} color={"#fff"} size={"16px"} decoration={"underline"}></Label>
                      </Col>
                    </Row>

                    <Row className="show-grid">
                      <Col xs={12} md={3}>
                          <Label text={"Data Retention (Days)"} color={"#fff"} size={"12px"}></Label>
                      </Col>
                      <Col xs={12} md={3}>
                        {/*
                          <TextBox inputType="text" width={"100%"} name="purgeDataDays" content={this.state.retainDataMaxDays} onChangeEvent={this.changeTaxtchange}></TextBox>*/}
                        <Dropdown options={this.state.ddOptions}  value={this.state.retainDataMaxDays} onChange={this.changePurgeDataDays}/>

                      </Col>
                      <Col xs={12} md={3}>
                        <Label text={"Logs Retention (Days)"} color={"#fff"} size={"12px"}></Label>
                      </Col>
                      <Col xs={12} md={3}>
                        {/*<TextBox inputType="text" width={"100%"} name="purgeLogsDays" content={this.state.retainLogsMaxDays} onChangeEvent={this.changeTaxtchange}></TextBox>*/}
                        <Dropdown options={this.state.ddOptions} name="purgeLogsDays" value={this.state.retainLogsMaxDays} onChange={this.changePurgeLogsDays}/>
                      </Col>
                    </Row>

                    <Row className="show-grid" style={{marginTop:'10px'}}>
                      <Col xs={5} md={2}>
                        <Button bsStyle="primary" className="button userPagebtn" bsSize="small" onClick={this.addConfigToDB} style={{display:(this.state.isEditMode) ? "none" : "" }}>
                          Submit
                        </Button>
                        <Button bsStyle="primary" className="button userPagebtn" bsSize="small" onClick={this.updateConfig} style={{display:(!this.state.isEditMode) ? "none" : "" }}>
                          Update
                        </Button>

                      </Col>
                      <Col xs={5} md={2}>
                        <Button bsStyle="primary" className="button userPagebtn" bsSize="small" onClick={this.bindConfigDetails}>
                          Cancel
                        </Button>
                      </Col>
                      <Col xs={1} md={4}>
                        <div></div>
                      </Col>
                      <Col xs={1} md={4}>
                        <div></div>
                      </Col>
                    </Row>
                </Grid>

              </div>
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

export default ManageReport;
