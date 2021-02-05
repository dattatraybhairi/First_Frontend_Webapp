import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import { linkClicked } from "../navbar/Navbar";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";

// Styling property for Underline Image
const Underline = {
  width: "75px",
  height: "9px",
  position: "absolute",
};

class UploadMap extends Component {
  /** Defining the states of the Component */
  constructor() {
    super();
    this.state = {
      fname: "",
      width: "",
      height: "",
      image: null,
    };
  }

  /** Method is called on Component Load */
  componentDidMount() {
    linkClicked(2);
  }

  /** To change the state of component on entering the values in input fields */
  handleChanges = (e) => {
    document.getElementById("upload-error").innerHTML = "";
    this.setState({
      [e.target.id]: e.target.value,
    });
  };

  /** To change the state of component on entering the values in input fields */
  handleImageChange = (e) => {
    document.getElementById("upload-error").innerHTML = "";
    this.setState({
      image: e.target.files[0],
    });
    document.getElementById("temp").style.display = "block";
    var image = document.getElementById("upimg");
    image.src = URL.createObjectURL(e.target.files[0]);
  };

  /** Method to upload a floor map with all the details */
  submit = (e) => {
    document.getElementById("upload-error").innerHTML = "";
    if (
      this.state.image !== null &&
      this.state.name !== "" &&
      this.state.width !== "" &&
      this.state.height !== ""
    ) {
      e.preventDefault();
      let form_data = new FormData();
      form_data.append("name", this.state.fname);
      form_data.append("image", this.state.image, this.state.image.name);
      form_data.append("width", parseFloat(this.state.width));
      form_data.append("height", parseFloat(this.state.height));
      // console.log(form_data);
      axios({
        method: "POST",
        url: "/tracking/map",
        headers: {
          "content-type": "multipart/form-data",
        },
        data: form_data,
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200 || response.status === 201) {
            document.getElementById("upload-success").innerHTML =
              "Floor Map uploaded successfully.";
          } else {
            document.getElementById("upload-error").innerHTML =
              "Unable to upload floor map image.";
          }
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 403) {
            document.getElementById("upload_displayModal").style.display =
              "block";
            document.getElementById("content").innerHTML =
              "User Session has timed out.<br> Please Login again";
          } else {
            document.getElementById("upload-error").innerHTML =
              "Request Failed with status code (" +
              error.response.status +
              ").";
          }
        });
    } else {
      document.getElementById("upload-error").innerHTML =
        "Please enter all fields.";
    }
    $("input[type=text]").val("");
    $("input[type=file]").val("");
    $("input[type=number]").val("");
  };

  delete = () => {};

  sessionTimeout = () => {
    document.getElementById("upload_displayModal").style.display = "none";
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  /** Redern the html content on the browser */
  render() {
    const { fname, width, height } = this.state; // Destructuring data
    return (
      <Fragment>
        <Helmet>
          <title>Upload Map</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">UPLOAD FLOOR MAP</span>
          <br />
          <img alt="" src="../images/Tiles/Underline.png" style={Underline} />
          <div className="container fading" style={{ marginTop: "50px" }}>
            <div className="row">
              {/* Form for uploading the floor map */}
              <form id="uploadForm">
                {/* Input field for Floor Name */}
                <div className="input-group">
                  <span className="label">Floor Name : </span>
                  <input
                    type="text"
                    name="fname"
                    id="fname"
                    value={fname}
                    required="required"
                    onChange={this.handleChanges}
                  />
                </div>
                {/* Input field for Floor Map Image */}
                <div className="input-group">
                  <span className="label">Floor Map : </span>
                  <input
                    type="file"
                    name="floorimg"
                    id="floorimg"
                    accept="image/*"
                    required="required"
                    onChange={this.handleImageChange}
                  />
                </div>
                {/* Input field Floor width */}
                <div className="input-group">
                  <span className="label">Floor Width (in m) : </span>
                  <input
                    type="number"
                    name="width"
                    id="width"
                    value={width}
                    required="required"
                    min="0"
                    placeholder="Width in meter"
                    onChange={this.handleChanges}
                  />
                </div>
                {/* Input field Floor height */}
                <div className="input-group">
                  <span className="label">Floor Height (in m) :</span>
                  <input
                    type="number"
                    name="height"
                    id="height"
                    value={height}
                    required="required"
                    min="0"
                    placeholder="Height in meter"
                    onChange={this.handleChanges}
                  />
                </div>
                {/* Button for uploading floor map */}
                <div className="input-group">
                  <input
                    type="submit"
                    value="Upload Map"
                    id="reg"
                    onClick={this.submit}
                    className="btn success-btn"
                  />
                </div>
              </form>
              <p className="error-msg" id="upload-error"></p>
              <p className="success-msg" id="upload-success"></p>
            </div>
            <div className="row" style={{ display: "none" }}>
              <button
                className="btn success-btn"
                onClick={() => {
                  document.getElementById("deleteuploadForm").style.display =
                    document.getElementById("deleteuploadForm").style
                      .display === "block"
                      ? "none"
                      : "block";
                  document.getElementById("upload-error").innerHTML = "";
                  document.getElementById("dfname").value = "";
                }}
              >
                Delete Floor Map
              </button>
              {/* Form to delete uploaded floor map */}
              <form id="deleteuploadForm" style={{ display: "none" }}>
                {/* Input field for Floor Name */}
                <div className="input-group">
                  <span className="label">Floor Name : </span>
                  <input
                    type="text"
                    name="dfname"
                    id="dfname"
                    required="required"
                    placeholder="Name of Floor Map"
                  />
                </div>
                {/* Button for uploading floor map */}
                <div className="input-group">
                  <input
                    type="submit"
                    value="Delete Map"
                    onClick={this.delete}
                    className="btn warning-btn"
                  />
                </div>
              </form>
            </div>
            <div className="row">
              {/* Block to display floor map image on selecting image */}
              <div
                id="temp"
                style={{
                  width: "900px",
                  height: "300px",
                  zIndex: "-1",
                  position: "relative",
                  display: "none",
                }}
              >
                <img
                  src=""
                  alt=""
                  style={{ width: "900px", height: "300px", zIndex: "-1" }}
                  id="upimg"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Display modal to display error messages */}
        <div id="upload_displayModal" className="modal">
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

export default UploadMap;
