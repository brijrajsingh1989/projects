import React, { Component } from 'react';
import { Button, FormGroup, FormControl, ControlLabel,Grid,Row,Col } from 'react-bootstrap';
import './resources/styles/landing.css';
import {Animated} from "react-animated-css";
import TextBox from './components/TextBox.js';
import Label from './components/Label.js';
import Notifications, {notify} from 'react-notify-toast';
import axios from 'axios';
import ReactCardFlip from 'react-card-flip';
import Loader from 'react-loader-spinner';
import Particles from 'react-particles-js';
import Footer from './components/Footer.js';
import API  from './Config/api.json';
class Landing extends Component {

  constructor(props) {
    super(props);
    this.state = {email_id:'', password:'', isFlipped: false, loader:false};
    this.onChangeEvent = this.onChangeEvent.bind(this);
    this.onLoginButtonClick = this.onLoginButtonClick.bind(this);
    this.onForgotPasswordClick = this.onForgotPasswordClick.bind(this);
  }

  onForgotPasswordClick(event)
  {
    notify.show("Not Implemented yet.", "error", 2000);
  }

  onLoginButtonClick(event)
  {
    if((this.state.email_id === "")&&(this.state.password === ""))
    {
      notify.show("Please enter User Name and Password.", "error", 2000);
    }
    else
    {
        let pageObj = this;
        this.setState({loader:true});
        sessionStorage.setItem('mailId', this.state.email_id);
        axios.post(API.current.apiUrl+'/api/v1/login',{email_id:this.state.email_id, password:this.state.password}).then(function(res){
          console.log('res',res.data.isUser);
          pageObj.setState({loader:false});
          if(res.data.userInactive)
          {
            notify.show("User inactive, Please contact admin.", "error", 2000);
            return false;
          }
          else if(res.data.userDeleted)
          {
            notify.show("User deleted, Please contact admin.", "error", 2000);
            return false;
          }
          else if(!res.data.isUser)
          {
            notify.show("User Name or Password is wrong.", "error", 2000);
            return false;
          }
          else
          {
            console.log('res', res.data);
            sessionStorage.setItem('user', res.data.userName);
            sessionStorage.setItem('admin', res.data.isAdmin);
            //pageObj.props.history.push('/dashboard')
            pageObj.props.history.push('/report')
          }

        }).catch(function(error) {
          console.log('error',error);
          pageObj.setState({loader:false});
        })
    }
  }

  onChangeEvent(event)
  {
      if(event.target.name === "email_id")
      {
        this.setState({ email_id: event.target.value},() => console.log(this.state));
      }
      else {
        this.setState({ password: event.target.value},() => console.log(this.state));
      }
  }

  timer(){
    //this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
  }

  componentDidMount() {
    this.intervalId = setInterval(this.timer.bind(this), 2000);
  }

  componentWillUnmount(){
    clearInterval(this.intervalId);
  }

  render() {
    return (
        <div className="login" >
          <div>
            <hgroup>
                <h1>Syslog Analyzer</h1>
            </hgroup>

            <form>
              <div className="group">
                {/*<input type="text" placeholder="User Id"></input><span className="highlight"></span><span className="bar"></span>*/}
                <TextBox onChangeEvent={this.onChangeEvent} name="email_id" inputType="text" height="30px" width="100%" placeholder="User ID"/>
              </div>
              <div className="group">
                {/*<input type="password" placeholder="Password"></input><span className="highlight"></span><span className="bar"></span>*/}
                <TextBox onChangeEvent={this.onChangeEvent} name="password" inputType="password" width="100%" height="30px" placeholder="Password"/>
              </div>
              <button type="button" className="loginbutton buttonBlue" onClick={this.onLoginButtonClick}>Login
                <div className="ripples buttonRipples"><span className="ripplesCircle"></span></div>
              </button>

                {/*<button type="button" className="button buttonBlue">Login
                <div className="ripples buttonRipples"><span className="ripplesCircle"></span></div>
              </button>*/}
          </form>
          <footer><a href="#" target="_blank"><img src={require('./resources/images/download.png')} ></img></a>

          </footer>

          </div>

          {/*<Footer></Footer>*/}

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

export default Landing;
