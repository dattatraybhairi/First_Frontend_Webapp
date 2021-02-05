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

class Alerts extends Component {
  numberPerPage = 25;
  pageList = [];
  currentPage = 1;
  numberOfPages = 0;
  currentRowCount = 0;

  constructor() {
    super();
    this.state = {
      alertList: [],
    };
  }

  /** Method is called on Component Load */
  componentDidMount() {
    linkClicked(6);
    this.getAlertDate();
    // timer function for refreshing each 10 seconds
    this.interval = setInterval(this.getAlertDate, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getAlertDate = () => {
    document.getElementById("alert-error").innerHTML = "";
    // API call
    axios({
      method: "GET",
      url: "/tracking/alerts",
    })
      .then((response) => {
        console.log(response);
        if (response.status === 201 || response.status === 200) {
          if (response.data.length !== 0) {
            document.getElementById("alertBlock").style.display = "block";
            this.data = response.data;
            let alertdata = [];
            let i = 0;
            for (i = this.data.length - 1; i >= 0; i--) {
              var alert;
              if (this.data[i].value === 1) alert = "Panic Button";
              else if (this.data[i].value === 3) alert = "Free Fall";
              else if (this.data[i].value === 4) alert = "No activity";
              alertdata.push(
                "<tr class=" +
                  this.data[i].value +
                  ">" +
                  "<td>" +
                  this.data[i].asset.macAddress +
                  "</td>" +
                  "<td>" +
                  this.data[i].asset.tagType +
                  "</td>" +
                  "<td>" +
                  alert +
                  "</td>" +
                  "<td>" +
                  this.data[i].timestamp +
                  "</td>" +
                  "</tr>"
              );
            }
            this.setState({ alertList: [...alertdata] });
            this.numberOfPages = Math.ceil(
              alertdata.length / this.numberPerPage
            );
            this.currentRowCount = i;
            this.loadList();
          } else {
            document.getElementById("alert-error").innerHTML =
              "No alert data to display.";
          }
        } else {
          document.getElementById("alert-error").innerHTML =
            "Unable to fetch Alert Data.";
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 403) {
          document.getElementById("alert_displayModal").style.display = "block";
          document.getElementById("content").innerHTML =
            "User Session has timed out.<br> Please Login again";
        } else {
          document.getElementById("alert-error").innerHTML =
            "Request Failed with status code (" + error.response.status + ").";
        }
      });
  };

  loadList = () => {
    let begin = (this.currentPage - 1) * this.numberPerPage;
    let end = begin + this.numberPerPage;
    document.getElementById("currentpage").innerHTML = this.currentPage;
    document.getElementById("numberofpages").innerHTML = Math.ceil(
      this.state.alertList.length / this.numberPerPage
    );
    this.pageList = this.state.alertList.slice(begin, end);
    document.getElementById("rowCount").innerHTML = this.pageList.length;

    $("#alertTable").empty();
    $("#alertTable").append(
      " <tr><th>ASSET MAC ID</th><th>ASSET TYPE</th><th>EVENT</th><th>TIMESTAMP</th></tr>"
    );
    for (let r = 0; r < this.pageList.length; r++) {
      $("#alertTable").append(this.pageList[r]);
    }
    document.getElementById("next").disabled =
      this.currentPage === this.numberOfPages ? true : false;
    document.getElementById("previous").disabled =
      this.currentPage === 1 ? true : false;
  };

  nextPage = () => {
    this.currentPage = this.currentPage + 1;
    this.loadList();
  };

  previousPage = () => {
    if (this.currentPage > 0) this.currentPage = this.currentPage - 1;
    this.loadList();
  };

  search = () => {
    $("#tempTable").empty();
    let type = document.getElementById("type").value;
    let data = this.state.alertList;
    document.getElementById("alert-error").innerHTML = "";
    document.getElementById("tempTable").style.display = "table";
    document.getElementById("alertTable").style.display = "none";
    document.getElementById("opt").style.display = "none";
    $("#tempTable").append(
      "<tr><th>ASSET MAC ID</th><th>ASSET TYPE</th><th>EVENT</th><th>TIMESTAMP</th></tr>"
    );
    for (let i = 0; i < data.length; i++) {
      if (data[i].substring(10, 11) === type) {
        $("#tempTable").append(data[i]);
      }
    }
    if ($("#tempTable").children("tr").length === 1) {
      document.getElementById("alert-error").innerHTML = "No data found.";
    }
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    document.getElementById("alert_displayModal").style.display = "none";
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  /** Redern the html content on the browser */
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Alerts</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">ALERTS</span>
          <br />
          <img alt="" src="../images/Tiles/Underline.png" style={Underline} />
          <div className="container fading" style={{ marginTop: "50px" }}>
            <div className="row">
              {/* Select list for tag type */}
              <div className="input-group">
                <span className="label">Event Type : </span>
                <select name="type" id="type">
                  <option value="1">Panic Button</option>
                  <option value="3">Free Fall</option>
                  <option value="4">No Activity</option>
                </select>
              </div>
              {/* Button for searching tag */}
              <div className="input-group">
                <input
                  type="button"
                  value="Search"
                  onClick={this.search}
                  className="btn success-btn"
                />
                &nbsp;&nbsp;
                {/* Clearing search data and hiding search result table */}
                <input
                  type="button"
                  value="Clear"
                  onClick={() => {
                    document.getElementById("tempTable").style.display = "none";
                    document.getElementById("alertTable").style.display =
                      "table";
                    document.getElementById("opt").style.display = "block";
                    document.getElementById("alert-error").innerHTML = "";
                  }}
                  className="btn success-btn"
                />
              </div>
            </div>
            <hr />
            <br></br>
            <p className="error-msg" id="alert-error"></p>
            <div className="row" id="alertBlock" style={{ display: "none" }}>
              <span className="heading">ALERT INFORMATION</span>
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
              {/* Table to display alert msgs */}
              <table
                id="tempTable"
                style={{
                  marginTop: "20px",
                  marginBottom: "30px",
                  display: "none",
                }}
              ></table>

              {/* Table to display alert msgs */}
              <table
                id="alertTable"
                style={{ marginTop: "20px", marginBottom: "30px" }}
              ></table>
              {/* Page navigation options for sensor tags */}
              <div
                id="opt"
                style={{
                  textAlign: "center",
                }}
              >
                <p style={{ float: "left", fontFamily: "Roboto-Regular" }}>
                  ( <span id="currentpage">0</span> /
                  <span id="numberofpages">0</span> )
                </p>
                <button
                  id="previous"
                  onClick={this.previousPage}
                  style={{ fontFamily: "Roboto-Medium" }}
                >
                  Previous
                </button>
                <button
                  id="next"
                  onClick={this.nextPage}
                  style={{ fontFamily: "Roboto-Medium" }}
                >
                  Next
                </button>
                <p style={{ float: "right", fontFamily: "Roboto-Regular" }}>
                  Row count : <span id="rowCount">0</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Display modal to display error messages */}
        <div id="alert_displayModal" className="modal">
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

export default Alerts;
