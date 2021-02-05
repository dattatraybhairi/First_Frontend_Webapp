import React, { Component, Fragment } from "react";
import axios from "axios";
import "./Styling.css";
import $ from "jquery";

class AssetReg extends Component {
  /** Defining the states of the Component */
  constructor() {
    super();
    this.state = {
      type: "Temperature/Humidity Sensor",
    };
  }

  /** To change the state of component on entering the values in input fields */
  // handleChanges = (e) => {
  //   this.setState({ [e.target.name]: e.target.value });
  // };

  /** Displays all input fields to get details of employees for registering tracking tags */
  displayTrackingForm = () => {
    let type = document.getElementById("type").value;
    this.setState({ type: type });
    if (type === "Tracking")
      document.getElementById("tracking-form").style.display = "block";
    else document.getElementById("tracking-form").style.display = "none";
  };

  /** Displays Delete tag form on clicking Delete Tag Button */
  show = () => {
    $("input[type=text]").val("");
    $("input[type=email]").val("");
    document.getElementById("tracking-form").style.display = "none";
    document.getElementById("delete-form").style.display =
      document.getElementById("delete-form").style.display === "none"
        ? "block"
        : "none";
  };

  /** Hides all error and success messages displayed on all button clicks */
  hide = () => {
    document.getElementById("conf-error").innerHTML = "";
    document.getElementById("conf-success").innerHTML = "";
  };

  /** Register the both sensor and tracking tags */
  register = (e) => {
    this.hide();
    e.preventDefault();
    document.getElementById("delete-form").style.display = "none";
    let data = {};
    if (this.state.type === "Tracking")
      data = {
        macaddress: document.getElementById("tagid").value,
        type: this.state.type,
        emailid: document.getElementById("empMailid").value,
        employeeid: document.getElementById("empId").value,
        employeename: document.getElementById("empName").value,
      };
    else
      data = {
        macaddress: document.getElementById("tagid").value,
        type: this.state.type,
      };
    if (
      data.type === "Tracking" &&
      (data.macaddress === "" ||
        data.employeename === "" ||
        data.employeeid === "" ||
        data.emailid === "")
    )
      document.getElementById("conf-error").innerHTML =
        "Please enter all the fields.";
    else if (data.type !== "Tracking" && data.macaddress === "")
      document.getElementById("conf-error").innerHTML = "Please Enter MAC ID.";
    else if (!data.macaddress.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}"))
      document.getElementById("conf-error").innerHTML =
        "Invalid MAC ID entered.";
    else if (
      data.type === "Tracking" &&
      !data.emailid.match(
        "^[a-zA-Z][a-zA-Z0-9_.-]+@[a-zA-Z0-9]+[.]{1}[a-zA-Z]+$"
      )
    )
      document.getElementById("conf-error").innerHTML =
        "Invalid Mailid entered.";
    else {
      document.getElementById("conf-error").innerHTML = "";

      axios({
        method: "POST",
        url: "/tracking/registration",
        data: data,
      })
        .then((response) => {
          if (response.status === 201 || response.status === 200) {
            document.getElementById("conf-success").innerHTML =
              "Tag registered successfully.";
          } else {
            document.getElementById("conf-error").innerHTML =
              "Unable to Register Tag.";
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            document.getElementById("config_displayModal").style.display =
              "block";
            document.getElementById("content").innerHTML =
              "User Session has timed out.<br> Please Login again";
          } else {
            document.getElementById("conf-error").innerHTML =
              "Request Failed with status code (" +
              error.response.status +
              ").";
          }
        });
    }
    $("input[type=text]").val("");
    $("input[type=email]").val("");
  };

  /** Unregister the registered tags */
  unregister = (e) => {
    this.hide();
    e.preventDefault();
    let id = document.getElementById("macid").value;
    if (id.length === 0)
      document.getElementById("conf-error").innerHTML =
        "Please Enter MAC ID to Un-registered.";
    else if (!id.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}"))
      document.getElementById("conf-error").innerHTML =
        "Invalid MAC ID entered.";
    else {
      axios({
        method: "POST",
        url: "/tracking/del",
        data: { macaddress: id, key: "asset" },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 201 || response.status === 200) {
            document.getElementById("conf-success").innerHTML =
              "Tag un-registered successfully.";
          } else {
            document.getElementById("conf-error").innerHTML =
              "Unable to un-registered Tag.";
          }
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 403) {
            document.getElementById("config_displayModal").style.display =
              "block";
            document.getElementById("content").innerHTML =
              "User Session has timed out.<br> Please Login again";
          } else {
            document.getElementById("conf-error").innerHTML =
              "Request Failed with status code (" +
              error.response.status +
              ").";
          }
        });
    }
    $("input[type=text]").val("");
    $("input[type=email]").val("");
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    document.getElementById("config_displayModal").style.display = "none";
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLoginError();
  };

  render() {
    // const { tagid, empName, empMailid, empId } = this.state; // Destructuring data
    return (
      <Fragment>
        <span className="sub-heading">Asset Registration</span>
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
        <br></br>
        {/* Form for Registering the sensor and tracking tags */}
        <form id="reg-form">
          {/* Input field for Tag MAC ID */}
          <div className="input-group">
            <span className="label">Tag MAC ID :</span>
            <input
              type="text"
              name="tagid"
              id="tagid"
              // value={tagid}
              required="required"
              // onChange={this.handleChanges}
              onClick={this.hide}
              placeholder="5a-c2-15-00-00-00"
            />
          </div>
          {/* Select List for Tag Type  */}
          <div className="input-group">
            <span className="label">Tag Type :</span>
            <select
              name="type"
              id="type"
              onChange={() => {
                this.displayTrackingForm();
                this.hide();
              }}
            >
              <option>Temperature/Humidity Sensor</option>
              <option>IRQ Sensor</option>
              <option value="signal-repeater">Signal Repeater</option>
              <option value="Tracking">Employee</option>
            </select>
          </div>
          {/* Employee Details form, displayed only for tracking tag registration */}
          <div
            id="tracking-form"
            className="fading"
            style={{ display: "none" }}
          >
            {/* Input field for Employee Name */}
            <div className="input-group">
              <span className="label">Employee Name : </span>
              <input
                type="text"
                name="empName"
                id="empName"
                // value={empName}
                required="required"
                // onChange={this.handleChanges}
              />
            </div>
            {/* Input field for Employee ID */}
            <div className="input-group">
              <span className="label">Employee ID : </span>
              <input
                type="text"
                name="empId"
                id="empId"
                // value={empId}
                required="required"
                // onChange={this.handleChanges}
              />
            </div>
            {/* Input field for Email ID */}
            <div className="input-group">
              <span className="label">E-mail ID :</span>
              <input
                type="email"
                name="empMailid"
                id="empMailid"
                // value={empMailid}
                required="required"
                // onChange={this.handleChanges}
              />
            </div>
          </div>
          <div className="input-group">
            <input
              type="submit"
              value="Register Tag"
              onClick={this.register}
              className="btn success-btn"
            />
          </div>
        </form>
        {/* Button for toggeling for Deleting Tag Form */}
        <button
          onClick={() => {
            this.show();
            this.hide();
          }}
          className="btn success-btn"
        >
          Remove Tag
        </button>
        {/* Form for deleting the registered tags */}
        <form id="delete-form" className="fading" style={{ display: "none" }}>
          {/* Input Field for Tag MAC ID */}
          <div className="input-group">
            <span className="label">Tag MAC ID :</span>
            <input
              type="text"
              name="macid"
              id="macid"
              required="required"
              onClick={this.hide}
              placeholder="5a-c2-15-00-00-00"
            />
          </div>

          <div className="input-group">
            <input
              type="submit"
              value="Delete Tag"
              onClick={this.unregister}
              className="btn success-btn"
            />
          </div>
        </form>
        <div>
          <br></br>
          {/* Element for displaying error messages */}
          <span className="error-msg" id="conf-error"></span>
          <span className="success-msg" id="conf-success"></span>
        </div>
        {/* Display modal to display error messages */}
        <div id="config_displayModal" className="modal">
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

export default AssetReg;
