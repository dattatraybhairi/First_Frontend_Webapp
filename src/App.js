import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Login from "./component/login/Login";
import Header from "./component/header/Header";
import Navbar from "./component/navbar/Navbar";
import Home from "./component/pages/Home";
import Configuration from "./component/pages/Configuration";
import UploadMap from "./component/pages/UploadMap";
import Tracking from "./component/pages/Tracking";
import Assets from "./component/pages/Assets";
import SystemHealth from "./component/pages/SystemHealth";
import Alerts from "./component/pages/Alerts";

class App extends Component {
  // Defining the states for the component
  constructor() {
    super();
    this.state = {
      isLoggedIn: parseInt(0),
    };
  }

  /** Method to change state */
  handleUserLogin = (credentials) => {
    this.setState({ isLoggedIn: parseInt(credentials) });
  };

  /** Redern the html content on the browser */
  render() {
    // Render home component on state set to true
    if (parseInt(sessionStorage.getItem("isLoggedIn")) === 1) {
      return (
        <Router>
          <Header handleLogin={this.handleUserLogin}></Header>
          <Navbar></Navbar>
          <Switch>
            <Route exact path="/">
              <Redirect to="/home"></Redirect>
            </Route>
            <Route exact path="/login">
              <Redirect to="/home"></Redirect>
            </Route>
            <Route
              exact
              path="/home"
              render={(props) => (
                <Home {...props} handleLogin={this.handleUserLogin}></Home>
              )}
            />
            <Route
              exact
              path="/configuration"
              render={(props) => (
                <Configuration
                  {...props}
                  handleLogin={this.handleUserLogin}
                ></Configuration>
              )}
            />
            <Route
              exact
              path="/uploadmap"
              render={(props) => (
                <UploadMap
                  {...props}
                  handleLogin={this.handleUserLogin}
                ></UploadMap>
              )}
            />
            <Route
              exact
              path="/tracking"
              render={(props) => (
                <Tracking
                  {...props}
                  handleLogin={this.handleUserLogin}
                ></Tracking>
              )}
            />
            <Route
              exact
              path="/assets"
              render={(props) => (
                <Assets {...props} handleLogin={this.handleUserLogin}></Assets>
              )}
            />
            <Route
              exact
              path="/systemhealth"
              render={(props) => (
                <SystemHealth
                  {...props}
                  handleLogin={this.handleUserLogin}
                ></SystemHealth>
              )}
            />
            <Route
              exact
              path="/alerts"
              render={(props) => (
                <Alerts {...props} handleLogin={this.handleUserLogin}></Alerts>
              )}
            />
          </Switch>
        </Router>
      );
    } else {
      return (
        <Router>
          <Route path="/">
            <Redirect to="/login"></Redirect>
          </Route>
          <Route
            exact
            path="/login"
            render={(props) => (
              <Login {...props} handleLogin={this.handleUserLogin}></Login>
            )}
          />
        </Router>
      );
    }
  }
}

export default App;
