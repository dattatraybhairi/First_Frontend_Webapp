import React, { Component, Fragment } from "react";
import axios from "axios";
import "./Styling.css";
import $ from "jquery";

class SlaveGateway extends Component {
  componentDidMount() {
    // API call to get the all master gateways registered for particular floor
    axios({
      method: "GET",
      url: "/tracking/master",
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          this.fdata = response.data;
          if (this.fdata.length !== 0) {
            for (let i = 0; i < this.fdata.length; i++) {
              $("#mastergatewayid").append(
                "<option>" + this.fdata[i].macaddress + "</option>"
              );
            }
          } else {
            $("#slave-error").text("No Master Gateway is registered.");
          }
        } else {
          $("#slave-error").text("Unable to get Gateway ID's");
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          $("#config_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else {
          $("#slave-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  }

  /** Displays Delete slave gateway form on clicking Delete Gateway Button */
  show = () => {
    $("#slaveid").val("");
    $("input[type='text']").val("");
    document.getElementById("slave-del-form").style.display =
      document.getElementById("slave-del-form").style.display === "block"
        ? "none"
        : "block";
  };

  /** Hides all error and success messages displayed on all button clicks */
  hide = () => {
    document.getElementById("slave-error").innerHTML = "";
    document.getElementById("slave-success").innerHTML = "";
  };

  /** Method to register slave gateway under specific master gateway */
  registerSlave = (e) => {
    this.hide();
    $("#slave-del-form").css("display", "none");
    e.preventDefault();
    // let master = $("#mastergatewayid").val();
    let slave = $("#slaveid").val();
    if (slave.length === 0) {
      $("#slave-error").text("Please enter Slave-Gateway ID.");
    } else if (!slave.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")) {
      $("#slave-error").text("Invalid Slave-Gateway ID entered.");
    } else {
      let gateway = $("#mastergatewayid").val();

      axios({
        method: "POST",
        url: "/tracking/slaveRegistration",
        data: { master: gateway, macaddress: slave },
      })
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            $("#slave-success").text("Slave Gateway registered successfully.");
          } else {
            $("#slave-error").text("Unable to registered Slave Gateway.");
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            $("#config_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out. Please Login again"
            );
          } else {
            $("#slave-error").text(
              "Request Failed with status code (" + error.response.status + ")."
            );
          }
        });
    }
  };

  /** Method to delete already registered slave gateways */
  unregisterSlave = (e) => {
    this.hide();
    e.preventDefault();
    let id = $("#slaveid-del").val();
    if (id.length === 0) {
      $("#slave-error").text("Please enter Slave-Gateway ID for deletion.");
    } else if (!id.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")) {
      $("#slave-error").text("Invalid Slave-Gateway ID entered.");
    } else {
      axios({
        method: "POST",
        url: "/tracking/del",
        data: { macaddress: id, key: "slave" },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200 || response.status === 201) {
            $("#slave-success").text(
              "Slave Gateway un-registered successfully."
            );
          } else {
            $("#slave-error").text("Unable to un-registered Slave Gateway.");
          }
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 403) {
            $("#config_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out. Please Login again"
            );
          } else {
            $("#slave-error").text(
              "Request Failed with status code (" + error.response.status + ")."
            );
          }
        });
    }
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    document.getElementById("config_displayModal").style.display = "none";
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLoginError();
  };

  render() {
    return (
      <Fragment>
        <span className="sub-heading">Slave Gateway Registration</span>
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
        {/* Form to register slave gateway */}
        <form id="slave-reg-form">
          {/* Input field for Gateway ID */}
          <div className="input-group">
            <span className="label">Master Gateway ID :</span>
            <select id="mastergatewayid"></select>
          </div>
          {/* Select list for Floor names */}
          <div className="input-group">
            <span className="label">Gateway ID :</span>
            <input
              type="text"
              name="slaveid"
              id="slaveid"
              required="required"
              placeholder="5a-c2-15-00-00-00"
              onChange={this.hide}
            />
          </div>
          <div className="input-group">
            <input
              type="submit"
              value="Register Gateway"
              onClick={this.registerSlave}
              className="btn success-btn"
            />
          </div>
        </form>
        {/* Button for toggeling for Deleting Gateway Form */}
        <button
          onClick={() => {
            this.show();
            this.hide();
          }}
          className="btn success-btn"
        >
          Remove Gateway
        </button>
        {/* Form for deleting the registered gateway tags */}
        <form
          id="slave-del-form"
          className="fading"
          style={{ display: "none" }}
        >
          {/* Input Field for Tag MAC ID */}
          <div className="input-group">
            <span className="label">Gateway MAC ID :</span>
            <input
              type="text"
              name="slaveid-del"
              id="slaveid-del"
              required="required"
              onClick={this.hide}
              placeholder="5a-c2-15-00-00-00"
            />
          </div>
          <div className="input-group">
            <input
              type="submit"
              value="Delete Gateway"
              onClick={this.unregisterSlave}
              className="btn success-btn"
            />
          </div>
        </form>
        <div>
          <br></br>
          {/* Elements for displaying error messages */}
          <span className="error-msg" id="slave-error"></span>
          <span className="success-msg" id="slave-success"></span>
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

export default SlaveGateway;
