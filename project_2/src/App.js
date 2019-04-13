import React, { Component } from 'react';
import { BrowserRouter, Route, Switch  } from 'react-router-dom';
import Landing from './Landing.js';
import Dashboard from './Modules/Dashboard/dashboard.js';
import Config from './Modules/Config/Config.js';
import Report from './Modules/Report/Report.js';
import Archive from './Modules/Archive/Archive.js';
//import LoginPage from './loginPage.js';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Switch>
            <Route exact path="/" component = {Landing}></Route>
            <Route path="/dashboard" component = {Dashboard}></Route>
            <Route path="/config" component={Config}></Route>
            <Route path="/report" component={Report}></Route>
            <Route path="/archive" component={Archive}></Route>
          </Switch>
      </div>
      </BrowserRouter>
    );
  }
}

export default App;
