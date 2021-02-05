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
  zIndex: "-1",
};

class Tracking extends Component {
  // local variable
  fWidth = 0;
  fHeight = 0;
  jsonData = [];
  interval = "";
  c = 0;
  xpixel = 0;
  flag = "false";
  floorData = [];

  /** Method is called on Component Load */
  componentDidMount() {
    linkClicked(3);
    // api call on componet load to get all floor maps registered
    axios({
      method: "GET",
      url: "/tracking/map",
      headers: {
        "content-type": "multipart/form-data",
      },
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          $("#floor-error").text("");
          this.fdata = response.data;
          if (this.fdata.length !== 0) {
            $("#floorBlock").css("display", "block");
            for (let i = 0; i < this.fdata.length; i++) {
              $("#fname").append(
                "<option value=" + i + ">" + this.fdata[i].name + "</option>"
              );
            }
            this.floorData = response.data;
            this.plotFloorMap();
          } else {
            $("#floor-error").text(
              "No floor is registred. Please register floor."
            );
          }
        } else {
          document.getElementById("floor-error").innerHTML =
            "Unable to get Floor Map.";
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          document.getElementById("tracking_displayModal").style.display =
            "block";
          document.getElementById("content").innerHTML =
            "User Session has timed out.<br> Please Login again";
        } else {
          document.getElementById("floor-error").innerHTML =
            "Request Failed with status code (" + error.response.status + ").";
        }
      });
  }

  /** Method to display floor map image on selecting floor name */
  plotFloorMap = () => {
    let floorID = $("#fname").val();
    this.fimage = this.floorData[floorID]; // Extracting image name from received data
    this.fWidth = this.fimage.width; // Fetching floor map width
    this.fHeight = this.fimage.height; // Fetching floor map height
    $("#tempimg").attr("src", this.fimage.image); // Displaying floor map image
    // Setting the pixel size for 1m based on floor map width
    if (this.fWidth > 0 && this.fWidth <= 20) this.xpixel = 50;
    else if (this.fWidth > 20 && this.fWidth <= 40) this.xpixel = 30;
    else if (this.fWidth > 40 && this.fWidth <= 80) this.xpixel = 20;
    else if (this.fWidth > 80 && this.fWidth <= 120) this.xpixel = 10;
    else this.xpixel = 5;
    // Setting maximum width for floor map image based on floor map width
    if (this.fWidth > 0 && this.fWidth <= 20) {
      this.maxWidth = this.fimage.width * 100;
    } else if (this.fWidth > 20 && this.fWidth <= 40) {
      this.maxWidth = this.fimage.width * 60;
    } else if (this.fWidth > 40 && this.fWidth <= 80) {
      this.maxWidth = this.fimage.width * 40;
    } else if (this.fWidth > 80 && this.fWidth <= 120) {
      this.maxWidth = this.fimage.width * 20;
    } else {
      this.maxWidth = this.fimage.width * 10;
    }
    let w = $("#tempimg").css("width"); // Fetching actual width of image in pixels
    let h = $("#tempimg").css("height"); // Fetching actual height of image in pixels
    this.c = parseFloat(w) / parseFloat(h); // Calcualting ratio of floor map
    this.minImgWidth = this.fWidth * this.xpixel; // Calculating default width of floor map image
    this.minImgHeight = this.minImgWidth / this.c; // Calculating default height of floor map image
    this.maxHeight = this.maxWidth / this.c;
    $("#temp").css("width", this.minImgWidth); // Setting width property of floor map image div
    $("#temp").css("height", this.minImgHeight); // Setting height property of floor map image div
    // Setting maximum and minimum width and height for floor map image for zoom effect
    $("#temp").css("max-width", this.maxWidth);
    $("#temp").css("max-height", this.maxHeight);
    $("#temp").css("min-width", this.minImgWidth);
    $("#temp").css("min-height", this.minImgHeight);
    $("#tempimg").attr("style", "width:100%; height:100%;");

    document.getElementById("lastupdated").style.display = "none";
    $("#temp").children("div").remove();
    $("input[type=text]").val("");
    // Calling method to plot tags on map
    this.plotAssets();
    // timer function for refreshing each 5 seconds
    clearInterval(this.interval);
    this.interval = setInterval(this.plotAssets, 5000);
  };

  /** Plots all tags on the floor map */
  plotAssets = () => {
    // API call to get tags data
    let fname = $("#fname").val();
    axios({
      method: "GET",
      url: "/tracking/data?floorname=" + this.floorData[fname].name,
    })
      .then((response) => {
        console.log(response);
        if (response.status === 201 || response.status === 200) {
          $("#track-error").text("");
          let data = response.data;
          if (data.length !== 0) {
            let wpx = document.getElementById("temp").clientWidth / this.fWidth;
            let hpx =
              document.getElementById("temp").clientHeight / this.fHeight;
            document.getElementById("lastupdated").style.display = "block";
            let search_id = document.getElementById("tagid").value;
            // Removing already plotted tags on floor map
            $("#temp").children("div").remove();
            let currTime = new Date();
            // Iterating through all tags
            let ind = 0;
            if (this.flag === "true") {
              for (let i = 0; i < data.length; i++) {
                if (data[i].asset.tagType === "tracking") {
                  // creating date object
                  let timestamp = new Date(
                    data[i].timestamp.substring(0, 10) +
                      " " +
                      data[i].timestamp.substring(11, 19)
                  );
                  // comparing timestamp to get timeinterval
                  if (currTime - timestamp <= 60 * 1000) {
                    // Storing tags data
                    this.jsonData = [
                      ...this.jsonData,
                      {
                        id: data[i].asset.macAddress,
                        x: data[i].x,
                        y: data[i].y,
                      },
                    ];
                    // Checking for the search mac id in the list of all asset data
                    if (data[i].asset.macAddress === search_id) {
                      ind = i;
                      // Tag heighlighter
                      let childDiv = document.createElement("div"); // Creating div element
                      $(childDiv).attr("class", "circle-heighlight"); // Setting class name
                      $(childDiv).attr("id", data[i].asset.macAddress + "tag"); // Setting id property
                      $(childDiv).attr(
                        "title",
                        "Employee Name  : " +
                          data[i].asset.empName +
                          "\nMAC ID : " +
                          data[i].asset.macAddress +
                          "\n x : " +
                          data[i].x +
                          "\n y : " +
                          data[i].y
                      );
                      $(childDiv).attr(
                        "style",
                        "position: absolute; cursor: pointer; left:" +
                          (wpx * parseFloat(data[i].x) - 16) +
                          "px; top:" +
                          (hpx * parseFloat(data[i].y) - 16) +
                          "px;"
                      );
                      // Tag dot
                      let childDiv1 = document.createElement("div");
                      $(childDiv1).attr("id", data[i].asset.macAddress);
                      $(childDiv1).attr(
                        "title",
                        "Employee Name  : " +
                          data[i].asset.empName +
                          "\nMAC ID : " +
                          data[i].asset.macAddress +
                          "\n x : " +
                          data[i].x +
                          "\n y : " +
                          data[i].y
                      );
                      $(childDiv1).attr("class", "circle");
                      $(childDiv1).attr(
                        "style",
                        "position: absolute; cursor: pointer; left:" +
                          wpx * parseFloat(data[i].x) +
                          "px; top:" +
                          hpx * parseFloat(data[i].y) +
                          "px;"
                      );

                      $("#" + data[i].asset.macAddress).css("display", "block");
                      $("#" + data[i].asset.macAddress + "tag").css(
                        "display",
                        "block"
                      );
                      $("#temp").append(childDiv);
                      $("#temp").append(childDiv1);
                      break;
                    }
                  }
                }
              }
            } else {
              for (let i = 0; i < data.length; i++) {
                if (data[i].asset.tagType === "tracking") {
                  let timestamp = new Date(
                    data[i].timestamp.substring(0, 10) +
                      " " +
                      data[i].timestamp.substring(11, 19)
                  );
                  if (currTime - timestamp <= 60 * 1000) {
                    // Storing tags data
                    this.jsonData = [
                      ...this.jsonData,
                      {
                        id: data[i].asset.macAddress,
                        x: data[i].x,
                        y: data[i].y,
                      },
                    ];
                    ind = i;
                    // Tag heighlighter
                    let childDiv = document.createElement("div"); // Creating div element
                    $(childDiv).attr("class", "circle-heighlight"); // Setting class name
                    $(childDiv).attr("id", data[i].asset.macAddress + "tag"); // Setting id property
                    $(childDiv).attr(
                      "title",
                      "Employee Name : " +
                        data[i].asset.empName +
                        "\nMAC ID : " +
                        data[i].asset.macAddress +
                        "\n x : " +
                        data[i].x +
                        "\n y : " +
                        data[i].y
                    );
                    $(childDiv).attr(
                      "style",
                      "position: absolute; cursor: pointer; left:" +
                        (wpx * parseFloat(data[i].x) - 16) +
                        "px; top:" +
                        (hpx * parseFloat(data[i].y) - 16) +
                        "px;"
                    );
                    // Tag dot
                    let childDiv1 = document.createElement("div");
                    $(childDiv1).attr("id", data[i].asset.macAddress);
                    $(childDiv1).attr(
                      "title",
                      "Employee Name  : " +
                        data[i].asset.empName +
                        "\nMAC ID : " +
                        data[i].asset.macAddress +
                        "\n x : " +
                        data[i].x +
                        "\n y : " +
                        data[i].y
                    );
                    $(childDiv1).attr("class", "circle");
                    $(childDiv1).attr(
                      "style",
                      "position: absolute; cursor: pointer; left:" +
                        wpx * parseFloat(data[i].x) +
                        "px; top:" +
                        hpx * parseFloat(data[i].y) +
                        "px;"
                    );
                    $("#temp").append(childDiv);
                    $("#temp").append(childDiv1);
                  }
                }
              }
            }
            document.getElementById("timing").innerHTML = data[ind].timestamp;
            if ($("#temp").children("div").length === 0) {
              document.getElementById("track-error").innerHTML =
                "No asset detected.";
            } else {
              document.getElementById("track-error").innerHTML = "";
            }
          } else {
            document.getElementById("track-error").innerHTML =
              "No Asset is turned on, Please check System Health Page.";
          }
        } else {
          document.getElementById("track-error").innerHTML =
            "Unable to get Tags Data.";
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 403) {
          document.getElementById("tracking_displayModal").style.display =
            "block";
          document.getElementById("content").innerHTML =
            "User Session has timed out.<br> Please Login again";
        } else {
          document.getElementById("track-error").innerHTML =
            "Request Failed with status code (" + error.response.status + ").";
        }
      });
  };

  /** Zoomin the floor map image on button click */
  zoomin = () => {
    // Changes the image width and height
    var myImg = document.getElementById("temp");
    var currWidth = myImg.clientWidth;
    myImg.style.width = currWidth + this.xpixel + "px";
    myImg.style.height = parseFloat(myImg.style.width) / this.c + "px";

    // Changes the tag position based on floor map size
    // Iterating through all the tags plotted on floor map
    for (let i = 0; i < this.jsonData.length; i++) {
      // Changing x coordinate of tag
      $("#" + this.jsonData[i].id).css(
        "left",
        (parseFloat(myImg.clientWidth) / this.fWidth) * this.jsonData[i].x
      );
      $("#" + this.jsonData[i].id + "tag").css(
        "left",
        (parseFloat(myImg.clientWidth) / this.fWidth) * this.jsonData[i].x - 16
      );
      // Changing y coordinate of tag
      $("#" + this.jsonData[i].id).css(
        "top",
        (parseFloat(myImg.clientHeight) / this.fHeight) * this.jsonData[i].y
      );
      $("#" + this.jsonData[i].id + "tag").css(
        "top",
        (parseFloat(myImg.clientHeight) / this.fHeight) * this.jsonData[i].y -
          16
      );
    }
  };

  /** Zoomout the floor map image on button click */
  zoomout = () => {
    // Changes the image width and height
    var myImg = document.getElementById("temp");
    var currWidth = myImg.clientWidth;
    myImg.style.width = currWidth - this.xpixel + "px";
    myImg.style.height = parseFloat(myImg.style.width) / this.c + "px";

    // Changes the tag position based on floor map size
    // Iterating through all the tags plotted on floor map
    // if (parseFloat(myImg.style.width) > this.imgWidth)
    for (let i = 0; i < this.jsonData.length; i++) {
      // Changing x coordinate of tag
      $("#" + this.jsonData[i].id).css(
        "left",
        (parseFloat(myImg.clientWidth) / this.fWidth) * this.jsonData[i].x
      );
      $("#" + this.jsonData[i].id + "tag").css(
        "left",
        (parseFloat(myImg.clientWidth) / this.fWidth) * this.jsonData[i].x - 16
      );
      // Changing y coordinate of tag
      $("#" + this.jsonData[i].id).css(
        "top",
        (parseFloat(myImg.clientHeight) / this.fHeight) * this.jsonData[i].y
      );
      $("#" + this.jsonData[i].id + "tag").css(
        "top",
        (parseFloat(myImg.clientHeight) / this.fHeight) * this.jsonData[i].y -
          16
      );
    }
  };

  /** Method to search tag plotted on floor map */
  search = () => {
    let id = document.getElementById("tagid").value;
    document.getElementById("track-error").innerHTML = "";
    if (id.length === 0) {
      document.getElementById("track-error").innerHTML =
        "Please enter MAC Address.";
    } else if (!id.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")) {
      document.getElementById("track-error").innerHTML =
        "Invalid MAC ID entered.";
    } else if (id.length !== 0 && $("#" + id).length === 1) {
      this.flag = "true";
      $("#temp").children("div").css("display", "none");
      $("#" + id).css("display", "block");
      $("#" + id + "tag").css("display", "block");
    } else {
      document.getElementById("track-error").innerHTML = "Asset Not Found.";
    }
  };

  /** Method to zoomIn and zoomOut image on mouse scroll */
  hadleMouseWheel = (evt) => {
    if (evt.deltaY > 0) {
      this.zoomout();
    } else if (evt.deltaY < 0) {
      this.zoomin();
    }
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    document.getElementById("tracking_displayModal").style.display = "none";
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  /** On component unmount clear the interval */
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  /** Redern the html content on the browser */
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Realtime Tracking</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">REALTIME TRACKING</span>
          <span
            style={{ float: "right", fontSize: "18px", display: "none" }}
            className="sub-heading"
            id="lastupdated"
          >
            Last Updated : <span id="timing">00:00:00</span>{" "}
          </span>
          <br />
          <img alt="" src="../images/Tiles/Underline.png" style={Underline} />
          <div className="container fading" style={{ marginTop: "50px" }}>
            <div className="row">
              {/* Input field for Tag MAC ID */}
              <div className="input-group">
                <span className="label">Floor Name : </span>
                <select
                  name="type"
                  id="fname"
                  onChange={() => {
                    this.plotFloorMap();
                  }}
                ></select>
              </div>
            </div>
            {/* Element for displaying error message */}
            <p className="error-msg" id="floor-error"></p>
            <div id="floorBlock" style={{ display: "none" }}>
              <div className="row">
                <hr></hr>
              </div>
              <div className="row">
                {/* Input field for Tag MAC ID */}
                <div className="input-group">
                  <span className="label">Tag MAC ID : </span>
                  <input
                    type="text"
                    id="tagid"
                    placeholder="5a-c2-15-00-00-00"
                    required="required"
                    onClick={() => $("#track-error").text("")}
                  />
                </div>
                {/* Button to search for tag */}
                <div className="input-group">
                  <input
                    type="button"
                    value="Search"
                    onClick={this.search}
                    className="btn success-btn"
                  />
                  &nbsp;&nbsp;
                  {/* Button to clear serach data */}
                  <input
                    type="button"
                    value="Clear"
                    onClick={() => {
                      $("#temp").children().css("display", "block");
                      document.getElementById("tagid").value = "";
                      document.getElementById("track-error").innerHTML = "";
                      this.flag = "false";
                    }}
                    className="btn success-btn"
                  />
                </div>
                {/* Element for displaying error message */}
                <p className="error-msg" id="track-error"></p>
              </div>
              <div className="row">
                {/* Block to display floor map image */}
                <div
                  id="temp"
                  style={{
                    display: "block",
                    position: "relative",
                  }}
                  onWheel={this.hadleMouseWheel}
                >
                  <img id="tempimg" alt=""></img>
                </div>
              </div>
            </div>
          </div>
          {/* Display modal to display error messages */}
          <div id="tracking_displayModal" className="modal">
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
        </div>
      </Fragment>
    );
  }
}

export default Tracking;
