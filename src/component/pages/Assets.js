import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import { linkClicked } from "../navbar/Navbar";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";

axios.defaults.xsrfHeaderName = "x-csrftoken";
axios.defaults.xsrfCookieName = "csrftoken";

// Styling property for Underline Image
const Underline = {
  width: "75px",
  height: "9px",
  position: "absolute",
};

class Assets extends Component {
  numberPerPage = 10;

  // variables required for sensor tags table
  pageList = [];
  currentPage = 1;
  numberOfPages = 0;
  currentRowCount = 0;

  // variables required for signal repeater tags table
  s_pageList = [];
  s_currentPage = 1;
  s_numberOfPages = 0;
  s_currentRowCount = 0;

  // variables required for tracking tags table
  e_pageList = [];
  e_currentPage = 1;
  e_numberOfPages = 0;
  e_currentRowCount = 0;

  /** Defining the states of the Component */
  constructor() {
    super();
    this.state = {
      sesnorlist: [],
      signalrepeaterlist: [],
      employeelist: [],
    };
  }

  /** Method is called on Component Load */
  componentDidMount() {
    linkClicked(4);
    // API call to get the all asset details
    axios({
      method: "GET",
      url: "/tracking/assets",
    })
      .then((response) => {
        console.log(response);
        if (response.status === 200 || response.status === 201) {
          let data = response.data.assets;
          if (data.length > 0) {
            let empC = 0,
              tagC = 0,
              senC = 0;
            let sensorArray = [],
              tagsArray = [],
              employeeArray = [];
            for (let i = 0; i < data.length; i++) {
              // Iterating through tag list
              // Filtering tracking tags
              if (data[i].tagType === "tracking") {
                empC++;
                employeeArray.push(
                  "<tr id=" +
                    data[i].macAddress +
                    " class=" +
                    data[i].tagType +
                    "><td>" +
                    empC +
                    "</td><td>" +
                    data[i].macAddress +
                    "</td><td>" +
                    data[i].tagType +
                    "</td><td>" +
                    data[i].empName +
                    "</td><td>" +
                    data[i].empId +
                    "</td><td>" +
                    data[i].emailId +
                    "</td></tr>"
                );
              } // Filtering Temp/humid or IRQ tags
              else if (data[i].tagType === "signal-repeater") {
                tagC++;
                tagsArray.push(
                  "<tr id=" +
                    data[i].macAddress +
                    " class=" +
                    data[i].tagType +
                    "><td>" +
                    tagC +
                    "</td><td>" +
                    data[i].macAddress +
                    "</td></tr>"
                );
              } else {
                senC++;
                let type = "";
                if (data[i].tagType === "temperature/humidity sensor")
                  type = "temperature";
                else if (data[i].tagType === "irq sensor") type = "irq";
                // else type = "signal-repeater";
                sensorArray.push(
                  "<tr id=" +
                    data[i].macAddress +
                    " class=" +
                    type +
                    "><td>" +
                    senC +
                    "</td><td>" +
                    data[i].macAddress +
                    "</td><td>" +
                    data[i].tagType +
                    "</td></tr>"
                );
              }
            }
            // Setting the state with sensor tag list
            this.setState({ sesnorlist: [...sensorArray] });
            this.numberOfPages = Math.ceil(
              sensorArray.length / this.numberPerPage
            );
            this.currentRowCount = senC;

            // Setting the state with signal repeater tag list
            this.setState({ signalrepeaterlist: [...tagsArray] });
            this.s_numberOfPages = Math.ceil(
              tagsArray.length / this.numberPerPage
            );
            this.s_currentRowCount = tagC;

            // Setting the state with tracking tag list
            this.setState({ employeelist: [...employeeArray] });
            this.e_numberOfPages = Math.ceil(
              employeeArray.length / this.numberPerPage
            );
            this.e_currentRowCount = empC;
            // Calling methods to display tag list with pagination added
            this.loadList();
            this.loadSList();
            this.loadEList();
          } else {
            document.getElementById("asset-error").innerHTML =
              "No asset is registered.";
          }
        } else {
          document.getElementById("asset-error").innerHTML = "No assets found.";
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 403) {
          document.getElementById("asset_displayModal").style.display = "block";
          document.getElementById("content").innerHTML =
            "User Session has timed out.<br> Please Login again";
        } else {
          document.getElementById("asset-error").innerHTML =
            "Request Failed with status code (" + error.response.status + ").";
        }
      });
  }

  loadList = () => {
    let begin = (this.currentPage - 1) * this.numberPerPage;
    let end = begin + this.numberPerPage;
    document.getElementById("currentpage").innerHTML = this.currentPage;
    document.getElementById("numberofpages").innerHTML = Math.ceil(
      this.state.sesnorlist.length / this.numberPerPage
    );
    this.pageList = this.state.sesnorlist.slice(begin, end);
    document.getElementById("rowCount").innerHTML = this.pageList.length;

    $("#sensorTable").empty();
    $("#sensorTable").append(
      "<tr><th>S.No</th><th>MAC ID</th><th>SENSOR TYPE</th></tr>"
    );
    for (let r = 0; r < this.pageList.length; r++) {
      $("#sensorTable").append(this.pageList[r]);
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
    this.currentPage = this.currentPage - 1;
    this.loadList();
  };

  loadSList = () => {
    let begin = (this.s_currentPage - 1) * this.numberPerPage;
    let end = begin + this.numberPerPage;
    document.getElementById("s_currentpage").innerHTML = this.s_currentPage;
    document.getElementById("s_numberofpages").innerHTML = Math.ceil(
      this.state.signalrepeaterlist.length / this.numberPerPage
    );
    this.s_pageList = this.state.signalrepeaterlist.slice(begin, end);
    document.getElementById("s_rowCount").innerHTML = this.s_pageList.length;

    $("#signalRepeaterTable").empty();
    $("#signalRepeaterTable").append("<tr><th>S.No</th><th>MAC ID</th></tr>");
    for (let r = 0; r < this.s_pageList.length; r++) {
      $("#signalRepeaterTable").append(this.s_pageList[r]);
    }
    document.getElementById("s_next").disabled =
      this.s_currentPage === this.s_numberOfPages ? true : false;
    document.getElementById("s_previous").disabled =
      this.s_currentPage === 1 ? true : false;
  };

  nextSPage = () => {
    this.s_currentPage = this.s_currentPage + 1;
    this.loadSList();
  };

  previousSPage = () => {
    this.s_currentPage = this.s_currentPage - 1;
    this.loadSList();
  };

  loadEList = () => {
    let begin = (this.e_currentPage - 1) * this.numberPerPage;
    let end = begin + this.numberPerPage;
    document.getElementById("e_currentpage").innerHTML = this.e_currentPage;
    document.getElementById("e_numberofpages").innerHTML = Math.ceil(
      this.state.employeelist.length / this.numberPerPage
    );
    this.e_pageList = this.state.employeelist.slice(begin, end);
    document.getElementById("e_rowCount").innerHTML = this.e_pageList.length;

    $("#employeeTable").empty();
    $("#employeeTable").append(
      "<tr><th>S.No</th><th>MAC ID</th><th>TAG TYPE</th><th>EMPLOYEE NAME</th>" +
        "<th>EMPLOYEE ID</th><th>EMAIL ID</th></tr>"
    );
    for (let r = 0; r < this.e_pageList.length; r++) {
      $("#employeeTable").append(this.e_pageList[r]);
    }
    document.getElementById("e_next").disabled =
      this.e_currentPage === this.e_numberOfPages ? true : false;
    document.getElementById("e_previous").disabled =
      this.e_currentPage === 1 ? true : false;
  };

  nextEPage = () => {
    this.e_currentPage = this.e_currentPage + 1;
    this.loadEList();
  };

  previousEPage = () => {
    this.e_currentPage = this.e_currentPage - 1;
    this.loadEList();
  };

  search = () => {
    // Fetcing data entered by user for searching data
    let type = document.getElementById("type").value;
    let tagid = document.getElementById("tagid").value;

    // Erasing already existing table content
    $("#tempTable").empty();
    document.getElementById("tables").style.display = "none";
    document.getElementById("tempTable").style.display = "table";

    // Conditional statements to get the data and display in table
    // Displys all tracking tags
    if (type === "tracking" && tagid.length === 0) {
      let array = [...document.querySelectorAll("tr." + type)];
      $("#tempTable").append(
        "<tr><th>S.No</th><th>MAC ID</th><th>TAG TYPE</th><th>EMPLOYEE NAME</th>" +
          "<th>EMPLOYEE ID</th><th>EMAIL ID</th></tr>"
      );
      for (let i = 0; i < array.length; i++) {
        $("#tempTable").append("<tr>" + array[i].innerHTML + "</tr>");
      }
    }
    // displays all temp/humid and irq tags
    else if (tagid.length === 0 && type !== "tracking") {
      let array = [...document.querySelectorAll("tr." + type)];
      if (type === "signal-repeater")
        $("#tempTable").append("<tr><th>S.No</th><th>MAC ID</th></tr>");
      else
        $("#tempTable").append(
          "<tr><th>S.No</th><th>MAC ID</th><th>SENSOR TYPE</th></tr>"
        );
      for (let i = 0; i < array.length; i++) {
        $("#tempTable").append("<tr>" + array[i].innerHTML + "</tr>");
      }
    }
    // Displays tag bases on tag mac id provided
    else {
      if ($("#" + tagid).attr("class") === undefined) {
        document.getElementById("asset-error").innerHTML = "Asset Not Found.";
      } else {
        if ($("#" + tagid).attr("class") === "tracking") {
          $("#tempTable").append(
            "<tr><th>S.No</th><th>MAC ID</th><th>TAG TYPE</th><th>EMPLOYEE NAME</th>" +
              "<th>EMPLOYEE ID</th><th>EMAIL ID</th></tr>"
          );
          $("#tempTable").append(
            "<tr>" + document.getElementById(tagid).innerHTML + "</tr>"
          );
        } else if ($("#" + tagid).attr("class") === "signal-repeater") {
          $("#tempTable").append("<tr><th>S.No</th><th>MAC ID</th></tr>");
          $("#tempTable").append(
            "<tr>" + document.getElementById(tagid).innerHTML + "</tr>"
          );
        } else {
          $("#tempTable").append(
            "<tr><th>S.No</th><th>MAC ID</th><th>SENSOR TYPE</th></tr>"
          );
          $("#tempTable").append(
            "<tr>" + document.getElementById(tagid).innerHTML + "</tr>"
          );
        }
      }
    }
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    document.getElementById("asset_displayModal").style.display = "none";
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  /** Redern the html content on the browser */
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Assets</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">ALL ASSETS</span>
          <br />
          <img alt="" src="../images/Tiles/Underline.png" style={Underline} />

          <div className="container fading" style={{ marginTop: "50px" }}>
            {/* Tag search options for both tracking and sensor tag */}
            <div className="row">
              {/* Select list for tag type */}
              <div className="input-group">
                <span className="label">Tag Type : </span>
                <select
                  name="type"
                  id="type"
                  onChange={() => {
                    document.getElementById("tagid").value = "";
                  }}
                >
                  <option value="temperature">
                    Temperature/Humidity Sensor
                  </option>
                  <option value="irq">IRQ Sensor</option>
                  <option value="signal-repeater">Signal Repeater</option>
                  <option value="tracking">Employee</option>
                </select>
              </div>
              {/* Input field for tag MAC ID */}
              <div className="input-group">
                <span className="label">Tag MAC ID : </span>
                <input
                  type="text"
                  id="tagid"
                  placeholder="5a-c2-15-00-00-00"
                  required="required"
                />
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
                    document.getElementById("tables").style.display = "block";
                    document.getElementById("tagid").value = "";
                    document.getElementById("asset-error").innerHTML = "";
                  }}
                  className="btn success-btn"
                />
              </div>
            </div>
            <hr />
            <p className="error-msg" id="asset-error"></p>
            {/* Table for displaying search result */}
            <table
              id="tempTable"
              style={{
                marginTop: "20px",
                marginBottom: "30px",
              }}
            ></table>
            {/* Table for displaying all registered tags */}
            <div className="row" id="tables">
              {/* SENSOR TAGS TABLE */}
              <div className="container">
                <span className="heading">Sensor Tags</span>
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
                {/* Table displays Sensor tags registered */}
                <table
                  id="sensorTable"
                  style={{
                    marginTop: "20px",
                    marginBottom: "30px",
                  }}
                >
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>MAC ID</th>
                      <th>SENSOR TYPE</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
                {/* Page navigation options for sensor tags */}
                <div
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
              {/* ------------------------------------------- */}
              {/* SIGNAL REPEATER TAGS TABLE */}
              <div className="container">
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
                {/* Table displays Sensor tags registered */}
                <table
                  id="signalRepeaterTable"
                  style={{
                    marginTop: "20px",
                    marginBottom: "30px",
                  }}
                >
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>MAC ID</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
                {/* Page navigation options for sensor tags */}
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <p style={{ float: "left", fontFamily: "Roboto-Regular" }}>
                    ( <span id="s_currentpage">0</span> /
                    <span id="s_numberofpages">0</span> )
                  </p>
                  <button
                    id="s_previous"
                    onClick={this.previousSPage}
                    style={{ fontFamily: "Roboto-Medium" }}
                  >
                    Previous
                  </button>
                  <button
                    id="s_next"
                    onClick={this.nextSPage}
                    style={{ fontFamily: "Roboto-Medium" }}
                  >
                    Next
                  </button>
                  <p style={{ float: "right", fontFamily: "Roboto-Regular" }}>
                    Row count : <span id="s_rowCount">0</span>
                  </p>
                </div>
              </div>
              {/* ------------------------------------------- */}
              {/* TRACKING TAGS TABLE */}
              <div className="container">
                <span className="heading">Employee Tags</span>
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
                {/* Table displays Employee tags registered */}
                <table
                  id="employeeTable"
                  style={{
                    marginTop: "20px",
                    marginBottom: "30px",
                  }}
                >
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>MAC ID</th>
                      <th>TAG TYPE</th>
                      <th>EMPLOYEE NAME</th>
                      <th>EMPLOYEE ID</th>
                      <th>EMAIL ID</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
                {/* Page navigation options for tracking tags */}
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <p style={{ float: "left", fontFamily: "Roboto-Regular" }}>
                    ( <span id="e_currentpage">0</span> /
                    <span id="e_numberofpages">0</span> )
                  </p>
                  <button
                    id="e_previous"
                    onClick={this.previousEPage}
                    style={{ fontFamily: "Roboto-Medium" }}
                  >
                    Previous
                  </button>
                  <button
                    id="e_next"
                    onClick={this.nextEPage}
                    style={{ fontFamily: "Roboto-Medium" }}
                  >
                    Next
                  </button>
                  <p style={{ float: "right", fontFamily: "Roboto-Regular" }}>
                    Row count : <span id="e_rowCount">0</span>
                  </p>
                </div>
              </div>
              {/* ----------------------------------------------------- */}
            </div>
          </div>
        </div>
        {/* Display modal to display error messages */}
        <div id="asset_displayModal" className="modal">
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

export default Assets;
