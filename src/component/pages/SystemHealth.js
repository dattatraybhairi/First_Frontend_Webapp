import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import { linkClicked } from "../navbar/Navbar";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";

const Underline = {
  width: "75px",
  height: "9px",
  position: "absolute",
};

class SystemHealth extends Component {
  componentDidMount() {
    linkClicked(5);
    this.displayAssetHealth();
    // timer function for refreshing each 10 seconds
    this.interval = setInterval(this.displayAssetHealth, 10000);
  }

  displayAssetHealth = () => {
    document.getElementById("sys-error").innerHTML = "";
    axios({
      method: "GET",
      url: "/tracking/syshealth",
    })
      .then((response) => {
        console.log(response);
        if (response.status === 201 || response.status === 200) {
          let currTime = new Date();
          let lastseen, status;
          if (response.data.master !== undefined) {
            let master = response.data.master;
            $("#gatewayHealth").empty();
            // Displaying master gateway health details in table format
            if (master.length > 0) {
              for (let i = 0; i < master.length; i++) {
                if (master[i].lastseen !== null) {
                  lastseen = master[i].lastseen;
                  let timestamp = new Date(
                    master[i].lastseen.substring(0, 10) +
                      " " +
                      master[i].lastseen.substring(11, 19)
                  );
                  if (currTime - timestamp <= 30 * 1000) status = "green";
                  else status = "red";
                } else {
                  lastseen = "--:--:--";
                  status = "red";
                }
                $("#gatewayHealth").append(
                  "<tr><td>" +
                    (i + 1) +
                    "</td><td>" +
                    master[i].macaddress +
                    "</td><td>" +
                    lastseen +
                    "</td><td>" +
                    "<div class='circle' style='margin:auto;background-color:" +
                    status +
                    ";'></div></td></tr>"
                );
              }
            } else {
              document.getElementById("sys-error").innerHTML =
                "No Master Gateway data found.";
            }
          }

          // Displaying slave gateway health details in table format
          if (response.data.slave !== undefined) {
            let slave = response.data.slave;
            $("#slaveHealth").empty();
            if (slave.length > 0) {
              for (let i = 0; i < slave.length; i++) {
                if (slave[i].lastseen !== null) {
                  lastseen = slave[i].lastseen;
                  let timestamp = new Date(
                    slave[i].lastseen.substring(0, 10) +
                      " " +
                      slave[i].lastseen.substring(11, 19)
                  );
                  if (currTime - timestamp <= 30 * 1000) status = "green";
                  else status = "red";
                } else {
                  lastseen = "--:--:--";
                  status = "red";
                }
                $("#slaveHealth").append(
                  "<tr><td>" +
                    (i + 1) +
                    "</td><td>" +
                    slave[i].macaddress +
                    "</td><td>" +
                    lastseen +
                    "</td><td>" +
                    "<div class='circle' style='margin:auto;background-color:" +
                    status +
                    ";'></div></td></tr>"
                );
              }
            } else {
              document.getElementById("sys-error").innerHTML =
                "No Slave Gateway data found.";
            }
          }

          // Displaying asset health and signal repeater details in table format
          if (response.data.assets !== undefined) {
            let data = response.data.assets;
            let count1 = 0,
              count2 = 0;
            $("#signalRepeaterHealth").empty();
            $("#systemHealth").empty();
            if (data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                if (data[i].type === "tracking") {
                  if (data[i].lastseen !== null) {
                    lastseen = data[i].lastseen;
                    let timestamp = new Date(
                      data[i].lastseen.substring(0, 10) +
                        " " +
                        data[i].lastseen.substring(11, 19)
                    );
                    if (currTime - timestamp <= 30 * 1000) status = "green";
                    else status = "red";
                  } else {
                    lastseen = "--:--:--";
                    status = "red";
                  }
                  let battery = "-:-:-";
                  if (data[i].battery !== undefined) battery = data[i].battery;
                  $("#systemHealth").append(
                    "<tr><td>" +
                      ++count1 +
                      "</td><td>" +
                      data[i].macaddress +
                      "</td><td>" +
                      battery +
                      "</td><td>" +
                      lastseen +
                      "</td><td>" +
                      "<div class='circle' style='margin:auto;background-color:" +
                      status +
                      ";'></div></td></tr>"
                  );
                } else if (data[i].type === "signal-repeater") {
                  if (data[i].lastseen !== null) {
                    lastseen = data[i].lastseen;
                    let timestamp = new Date(
                      data[i].lastseen.substring(0, 10) +
                        " " +
                        data[i].lastseen.substring(11, 19)
                    );
                    if (currTime - timestamp <= 30 * 1000) status = "green";
                    else status = "red";
                  } else {
                    lastseen = "--:--:--";
                    status = "red";
                  }
                  $("#signalRepeaterHealth").append(
                    "<tr><td>" +
                      ++count2 +
                      "</td><td>" +
                      data[i].macaddress +
                      "</td><td>" +
                      lastseen +
                      "</td><td>" +
                      "<div class='circle' style='margin:auto;background-color:" +
                      status +
                      ";'></div></td></tr>"
                  );
                }
              }
            }
          } else {
            document.getElementById("sys-error").innerHTML =
              "No Asset data found.";
          }
        } else {
          document.getElementById("sys-error").innerHTML =
            "Unable to Register Gateway.";
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 403) {
          document.getElementById("syshealth_displayModal").style.display =
            "block";
          document.getElementById("content").innerHTML =
            "User Session has timed out.<br> Please Login again";
        } else {
          document.getElementById("sys-error").innerHTML =
            "Request Failed with status code (" + error.response.status + ").";
        }
      });
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    document.getElementById("syshealth_displayModal").style.display = "none";
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <Fragment>
        <Helmet>
          <title>System Health</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">SYSTEM HEALTH</span>
          <br />
          <img alt="" src="../images/Tiles/Underline.png" style={Underline} />
          <div className="container fading" style={{ marginTop: "40px" }}>
            <p className="error-msg" id="sys-error"></p>
            <br></br>
            {/* Maseter Gateway Table */}
            <span className="heading">Master Gateway</span>
            <br />
            <img
              src="../images/Tiles/Underline.png"
              alt=""
              style={{
                width: "56px",
                height: "3px",
                marginTop: "2px",
                position: "absolute",
              }}
            />
            <table style={{ marginTop: "20px", marginBottom: "30px" }}>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>MAC ID</th>
                  <th>Last Seen</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="gatewayHealth"></tbody>
            </table>
            {/* ----------------------------------------------- */}
            {/* Slave Gateway Table */}
            <span className="heading">Slave Gateway</span>
            <br />
            <img
              src="../images/Tiles/Underline.png"
              alt=""
              style={{
                width: "56px",
                height: "3px",
                marginTop: "2px",
                position: "absolute",
              }}
            />
            <table style={{ marginTop: "20px", marginBottom: "30px" }}>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>MAC ID</th>
                  <th>Last Seen</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="slaveHealth"></tbody>
            </table>
            {/* ----------------------------------------------- */}
            {/*Signal Repeater Table */}
            <span className="heading">Signal Repeater</span>
            <br />
            <img
              src="../images/Tiles/Underline.png"
              alt=""
              style={{
                width: "56px",
                height: "3px",
                marginTop: "2px",
                position: "absolute",
              }}
            />
            <table style={{ marginTop: "20px", marginBottom: "30px" }}>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>MAC ID</th>
                  <th>Last Seen</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="signalRepeaterHealth"></tbody>
            </table>
            {/* ----------------------------------------------- */}
            {/* Assets Table */}
            <span className="heading">Assets</span>
            <br />
            <img
              src="../images/Tiles/Underline.png"
              alt=""
              style={{
                width: "56px",
                height: "3px",
                marginTop: "2px",
                position: "absolute",
              }}
            />
            <table style={{ marginTop: "20px", marginBottom: "30px" }}>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Asset MAC ID</th>
                  <th>Battery Status (%)</th>
                  <th>Last Seen</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="systemHealth"></tbody>
            </table>
            {/* ----------------------------------------------- */}
          </div>
        </div>
        {/* Display modal to display error messages */}
        <div id="syshealth_displayModal" className="modal">
          <div className="modal-content">
            <p id="content" style={{ textAlign: "center" }}></p>
            <button
              id="ok"
              className="btn-center btn success-btn"
              onClick={this.sessionTimeout}
            >
              OK
            </button>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SystemHealth;
