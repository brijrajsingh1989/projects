import React, { Component } from 'react';
import {Button, FormGroup, FormControl, ControlLabel, Grid, Row, Col, Tooltip, OverlayTrigger} from 'react-bootstrap';
import './../../resources/styles/style.css';
import './Users.css';
import Label from './../../components/Label.js';
import TextBox from './../../components/TextBox.js';
import RButton from './../../components/Button.js';
import {Animated} from "react-animated-css";
import Iframe from 'react-iframe';
import Header from './../../components/Header.js';
import RGrid from './../../components/Grid.js';
import Modal from 'react-modal';
import Switch from "react-switch";
import Notifications, {notify} from 'react-notify-toast';
import axios from 'axios';
import * as JsSearch from 'js-search';
import Loader from 'react-loader-spinner';
import API from './../../Config/api.json';

const customStyles = {
  content : {
    top                   : 'auto',
    left                  : 'auto',
    right                 : 'auto',
    bottom                : 'auto',
    transform             : 'translate(-50%, -50%)',
    border                : '1px solid yellow'
  }
};

const toggleAdminFormatter = ({ value }) => {
  console.log(value);
  return <div>{(value == "1") ? <Label text="Yes" size="16px" color="green" weight="light"></Label>:<Label  weight="light" text="No" size="16px" color="red"></Label>}</div>
};

var search = new JsSearch.Search('id');
search.addIndex('contact_number');
search.addIndex('email_id');
search.addIndex('emp_id');
search.addIndex('first_name');
search.addIndex('id');
search.addIndex('last_name');

class Users extends Component {

  constructor(props) {
    super(props);

      this.state = {
        modalIsOpen: false,
        firstName: '',
        lastName: '',
        emailId : '',
        contactNumber: '',
        employeeId: '',
        password: '',
        confirmPassword: '',
        isAdmin: false,
        isActive: true,
        userID : '',
        columnsDef: [],
        rowRecords: [],
        isEditMode: false,
        isDeleted : false,
        totoalUsers : '',
        inActiveUsers: '',
        loader:false
      };

      this.openModal = this.openModal.bind(this);
      this.afterOpenModal = this.afterOpenModal.bind(this);
      this.closeModal = this.closeModal.bind(this);
      this.addUser = this.addUser.bind(this);
      this.adduserToDB = this.adduserToDB.bind(this);
      this.onExit = this.onExit.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.changeTaxtchange = this.changeTaxtchange.bind(this);
      //this.onGridRowsUpdated = this.onGridRowsUpdated.bind(this);
      this.UpdateuserInfo = this.UpdateuserInfo.bind(this);
      this.onChangeEvent = this.onChangeEvent.bind(this);
  }
  onChangeEvent(event)
  {
    let filteredData = search.search(event.target.value);
    if(event.target.value)
    {
      this.setState({rowRecords: filteredData});
    }
    else {
      this.getUserDetails();
    }
  }

  UpdateuserInfo()
  {
    let pageObj = this;
    console.log('this.state',this.state);
    if(this.state.firstName.trim() == '')
    {
      notify.show("Please enter first name.", "error", 2000);
      return false;
    }else if (this.state.lastName.trim() == '') {
      notify.show("Please enter last name.", "error", 2000);
      return false;
    }else if (this.state.contactNumber.trim() == '') {
      notify.show("Please enter contact number.", "error", 2000);
      return false;
    }else if (this.state.employeeId.trim() == '') {
      notify.show("Please enter employee ID.", "error", 2000);
      return false;
    }
    console.log('insert into database');
    this.setState({loader:true});
    axios.put(API.current.apiUrl+'/api/v1/user',this.state).then(function(res){
      console.log('res', res.data);
        if(res.data.userDoesNotExists)
        {
          //user already exists
          notify.show("User does not exists.", "error", 2000);
        }
        else if (res.data.createdSuccessFully) {
          //created successfully
          notify.show("User updated successfully.", "success", 2000);
          pageObj.getUserDetails();
        }
        else {
          //system error
          notify.show("System error, Please try after some time.", "error", 2000);
        }

        search = new JsSearch.Search('id');
        search.addIndex('contact_number');
        search.addIndex('email_id');
        search.addIndex('emp_id');
        search.addIndex('first_name');
        search.addIndex('id');
        search.addIndex('last_name');
        
        pageObj.setState({loader:false});
    }).catch(function(error) {
        console.log('error',error);
        pageObj.setState({loader:false});
    })

    //set state to Initial state
    this.setState({modalIsOpen: false,
    firstName:'',
    lastName:'',
    emailId : '',
    contactNumber:'',
    employeeId:'',
    password:'',
    confirmPassword:'',
    isAdmin:false});
  }

  onGridRowsUpdated = ({ fromRow, toRow, updated }) =>{
    console.log('fromRow', fromRow);
    console.log('toRow', toRow);
    console.log('updated', updated);
  }

  getUserDetails()
  {
    let pageObj = this;
    let gridColumns = [

      { key: 'id', name: 'User ID' },
      { key: 'first_name', name: 'First Name' },
      // { key: 'middle_name', name: 'Middle Name' },
      { key: 'last_name', name: 'Last Name' },
      { key: 'email_id', name: 'Email ID' },
      { key: 'contact_number', name:'Contact Number'},
      { key: 'is_admin', name: 'Admin' , formatter: toggleAdminFormatter},
      { key: 'emp_id', name: 'Employee ID' },
      { key: 'created_date', name: 'Create Date' },
      { key: 'is_active', name: 'Active' , formatter: toggleAdminFormatter}
    ];

    this.setState({columnsDef:gridColumns});
    this.setState({loader:true});
    axios.get(API.current.apiUrl+'/api/v1/user').then(function(res){
      console.log('res', res.data);
      // search.clearDocuments();
      search.addDocuments(res.data);
      pageObj.setState({rowRecords: res.data});
      //let deletedUserCount = 0;
      // for(var i =0; i < res.data.length; i++)
      // {
      //   if(res.data[i].is_active == 0)
      //   {
      //     deletedUserCount = deletedUserCount + 1;
      //   }
      //   pageObj.setState({totoalUsers: res.data.length, inActiveUsers : deletedUserCount});
      // }

      pageObj.setState({loader:false});
    }).catch(function(err){
      console.log('error');
      pageObj.setState({loader:false});
    })
  }

  // searchExm(){
  //   var theGreatGatsby = {
  //     isbn: '9781597226769',
  //     title: 'The Great Gatsby',
  //     author: {
  //       name: 'F. Scott Fitzgerald'
  //     },
  //     tags: ['book', 'inspirational']
  //   };
  //   var theDaVinciCode = {
  //     isbn: '0307474275',
  //     title: 'The DaVinci Code',
  //     author: {
  //       name: 'Dan Brown'
  //     },
  //     tags: ['book', 'mystery']
  //   };
  //   var angelsAndDemons = {
  //     isbn: '074349346X',
  //     title: 'Angels & Demons',
  //     author: {
  //       name: 'Dan Brown',
  //     },
  //     tags: ['book', 'mystery']
  //   };
  //
  //
  //   search.addIndex('title');
  //   search.addIndex(['author', 'name']);
  //   search.addIndex('tags')
  //
  //   search.addDocuments([theGreatGatsby, theDaVinciCode, angelsAndDemons]);
  //
  //   console.log('search.search',search.search('book'));
  // }
  componentDidMount()
  {
    this.getUserDetails();
  }

  changeTaxtchange(event)
  {
    let name = event.target.name;
    this.setState({ [name] : event.target.value});
  }

  handleChange(event)
  {
    this.setState({isAdmin:event});
  }

  onExit(event)
  {
    this.setState({modalIsOpen:false});
  }

  adduserToDB(event)
  {
    let pageObj = this;
    console.log('this.state',this.state);
    if(this.state.firstName.trim() == '')
    {
      notify.show("Please enter first name.", "error", 2000);
      return false;
    }else if (this.state.lastName.trim() == '') {
      notify.show("Please enter last name.", "error", 2000);
      return false;
    }else if (this.state.emailId.trim() == '') {
      notify.show("Please enter email ID.", "error", 2000);
      return false;
    }
    else if (!this.state.emailId.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{1,10})$/)) {
      notify.show("Please enter valid email ID.", "error", 2000);
      return false;
    }else if (this.state.contactNumber.trim() == '') {
      notify.show("Please enter contact number.", "error", 2000);
      return false;
    }else if (this.state.employeeId.trim() == '') {
      notify.show("Please enter employee ID.", "error", 2000);
      return false;
    }else if (this.state.password.trim() == '') {
      notify.show("Please enter password.", "error", 2000);
      return false;
    }else if (this.state.confirmPassword.trim() == '') {
      notify.show("Please confirm your password.", "error", 2000);
      return false;
    }else if (this.state.password.trim() != this.state.confirmPassword.trim()) {
      notify.show("Password does not match.", "error", 2000);
      return false;
    }

    this.setState({loader:true});
    axios.post(API.current.apiUrl+'/api/v1/user',this.state).then(function(res){
      console.log('res', res.data);
      if(res.data.alreadyExists)
      {
        //user already exists
        notify.show("User already exists.", "error", 2000);
      }
      else if (res.data.createdSuccessFully) {
        //created successfully
        notify.show("User added successfully.", "success", 2000);
        pageObj.getUserDetails();
      }
      else {
        //system error
        notify.show("User removed from the system, Please contact admin.", "error", 2000);
      }
      pageObj.setState({loader:false});
    }).catch(function(error) {
      console.log('error',error);
      pageObj.setState({loader:false});
    })

    //set state to Initial state
    this.setState({modalIsOpen: false,
    firstName:'',
    lastName:'',
    emailId : '',
    contactNumber:'',
    employeeId:'',
    password:'',
    confirmPassword:'',
    isAdmin:false});
  }

  addUser(event)
  {

    this.setState({modalIsOpen: true,
       isEditMode:false,
       firstName: '',
       lastName: '',
       emailId : '',
       contactNumber : '',
       employeeId : '',
       isAdmin : false});
    console.log(event);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    //this.subtitle.style.color = '#f00';https://www.youtube.com/watch?v=MTsFmUI54as
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  updateUserinfo(row)
  {
    this.setState({
      isEditMode:true,
      modalIsOpen:true,
      firstName: row.first_name,
      lastName: row.last_name,
      emailId : row.email_id,
      contactNumber : row.contact_number,
      employeeId : row.emp_id,
      isAdmin : (row.is_admin == "1")? true :false,
      isActive : (row.is_active == "1")? true : false,
      isDeleted : (row.is_deleted == "1")? true : false,
      userID : row.id});
      console.log(row);
  }

  getCellActions=(column, row)=>{
      console.log('column', column);
      console.log('row', row);

      if (column.key === 'id') {
          return [
                {
                  icon: "glyphicon glyphicon-edit",
                  callback: () => {
                    this.updateUserinfo(row);
                  }
                }
          ]
      }
  }

  render() {
    return (
        <div className="manageUsers">
          {/*  <div className="userStates">
                <Label text={"total users count - "+this.state.totoalUsers + " | " + " inactive users count - " + this.state.inActiveUsers + " | "}></Label>
            </div>
          */}
          <div style={{display:(this.state.modalIsOpen) ? "none" : "" }}>
              <div className="users">
                <div className="addUsers"><RButton text={"Add User"} onClickImplementation={this.addUser}></RButton></div>
                <div className="searchUsers"><TextBox inputType = "text" placeholder="Search" onChangeEvent={this.onChangeEvent}></TextBox><img src={require('./../../resources/images/search.png')} style={{width:'20px',height:'20px', cursor:'pointer'}} name="report"/></div>
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
                    <Label text={"First Name*"} color={"#fff"} size={"12px"}></Label>
                  </Col>
                  <Col xs={12} md={3}>
                    <TextBox inputType="text" width={"100%"} name="firstName" content={this.state.firstName} onChangeEvent={this.changeTaxtchange}></TextBox>
                  </Col>
                  <Col xs={12} md={3}>
                    <Label text={"Last Name*"} color={"#fff"} size={"12px"}></Label>
                  </Col>
                  <Col xs={12} md={3}>
                    <TextBox inputType="text" width={"100%"} name="lastName" content={this.state.lastName} onChangeEvent={this.changeTaxtchange}></TextBox>
                  </Col>
                </Row>

                <Row className="show-grid">
                  <Col xs={12} md={3}>
                    <Label text={"Email ID*"} color={"#fff"} size={"12px"}></Label>
                  </Col>
                  <Col xs={12} md={3}>
                    <TextBox inputType="text" width={"100%"} name="emailId" content={this.state.emailId} onChangeEvent={this.changeTaxtchange}></TextBox>
                  </Col>
                  <Col xs={12} md={3}>
                    <Label text={"Contact Number*"} color={"#fff"} size={"12px"}></Label>
                  </Col>
                  <Col xs={12} md={3}>
                    <TextBox inputType="text" width={"100%"} name="contactNumber" content={this.state.contactNumber} onChangeEvent={this.changeTaxtchange}></TextBox>
                  </Col>
                </Row>

                <Row className="show-grid">
                  <Col xs={12} md={3}>
                    <Label text={"Employee ID*"} color={"#fff"} size={"12px"}></Label>
                  </Col>
                  <Col xs={12} md={3}>
                    <TextBox inputType="text" width={"100%"} name="employeeId" content={this.state.employeeId} onChangeEvent={this.changeTaxtchange}></TextBox>
                  </Col>
                  <Col xs={12} md={3}>
                    <div></div>
                  </Col>
                  <Col xs={12} md={3}>
                    <div></div>
                  </Col>
                </Row>

                <Row className="show-grid" style={{display:(this.state.isEditMode) ? "none" : "" }}>
                  <Col xs={12} md={3}>
                    <Label text={"Password*"} color={"#fff"} size={"12px"}></Label>
                  </Col>
                  <Col xs={12} md={3}>
                    <TextBox inputType="password" width={"100%"} name="password" content={this.state.password} onChangeEvent={this.changeTaxtchange}></TextBox>
                  </Col>
                  <Col xs={12} md={3}>
                    <Label text={"Confirm Password*"} color={"#fff"} size={"12px"}></Label>
                  </Col>
                  <Col xs={12} md={3}>
                    <TextBox inputType="password" width={"100%"} name="confirmPassword" content={this.state.confirmPassword} onChangeEvent={this.changeTaxtchange}></TextBox>
                  </Col>
                </Row>

                <Row className="show-grid">
                  <Col xs={12} md={3}>
                    <Label text={"Admin"} color={"#fff"} size={"12px"}></Label>
                  </Col>
                  <Col xs={12} md={3}>
                    <Switch
                        onChange={()=>this.setState({isAdmin:(!this.state.isAdmin)})}
                        checked={this.state.isAdmin}
                        id="normal-switch"
                        onColor = "#33cc33"
                        offColor = "#ff0000"
                      />
                  </Col>
                  <Col xs={12} md={3} style={{display:(!this.state.isEditMode) ? "none" : "" }}>
                    <Label text={"Active"} color={"#fff"} size={"12px"}></Label>
                  </Col>
                  <Col xs={12} md={3} style={{display:(!this.state.isEditMode) ? "none" : "" }}>
                    <Switch
                        onChange={()=>this.setState({isActive:(!this.state.isActive)})}
                        checked={this.state.isActive}
                        id="normal-switch"
                        onColor = "#33cc33"
                        offColor = "#ff0000"
                      />
                  </Col>
                </Row>

                <Row className="show-grid" style={{display:(!this.state.isEditMode) ? "none" : "" }}>
                  <Col xs={12} md={3}>
                    <Label text={"Delete"} color={"#fff"} size={"12px"}></Label>
                  </Col>
                  <Col xs={12} md={3}>
                    <Switch
                        onChange={()=>this.setState({isDeleted:(!this.state.isDeleted)})}
                        checked={this.state.isDeleted}
                        id="normal-switch"
                        onColor = "#33cc33"
                        offColor = "#ff0000"
                      />
                  </Col>
                  <Col xs={12} md={3}>
                    <div></div>
                  </Col>
                  <Col xs={12} md={3}>
                    <div></div>
                  </Col>
                </Row>

                <Row className="show-grid">
                  <Col xs={12} md={12}><Label text={"* are mandatory fields"} color={"#fff"} size={"12px"}></Label></Col>
                </Row>
                <Row className="show-grid" style={{marginTop:'10px'}}>
                  <Col xs={5} md={2}>
                    <Button bsStyle="primary" className="button userPagebtn" bsSize="small" onClick={this.adduserToDB} style={{display:(this.state.isEditMode) ? "none" : "" }}>
                      Submit
                    </Button>
                    <Button bsStyle="primary" className="button userPagebtn" bsSize="small" onClick={this.UpdateuserInfo} style={{display:(!this.state.isEditMode) ? "none" : "" }}>
                      Update
                    </Button>
                  </Col>
                  <Col xs={5} md={2}>
                    <Button bsStyle="primary" className="button userPagebtn" bsSize="small" onClick={this.onExit}>
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

export default Users;
