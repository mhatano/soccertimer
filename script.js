/***
Copyright 2023 Manami Hatano

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the “Software”), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
***/
import { LitElement, html } from 'lit';

class AdjustButton extends LitElement {
  static properties = {
    backgroundColor: { type: String },
    color: { type: String },
    label: { type: String }
  };

  constructor() {
    super();
    this.backgroundColor = this.getAttribute("backgroundColor") || "#efcebe";
    this.color = this.getAttribute("color") || "black";
    this.label = this.getAttribute("label") || "Click Me";
  }

  render() {
    return html`
      <style>
        button {
          border-radius: 8px;
          border-width: 3px;
          border-color: #c0c0e0;
          background-color: ${this.backgroundColor};
          color: ${this.color};
          font-size: 14pt;
          font-family: sans-serif;
          font-weight: plain;
          padding: 10px 20px 10px 20px;
          width: 190px;
          height: 50px;
        }
      </style>
      <span>
        <button @click="${this._buttonClicked}">${this.label}</button>
      </span>
    `;
  }

  _buttonClicked(e) {
    var thisHalfClock = document.getElementById("this-half");
    var totalClock = document.getElementById("total");
    if (this.id == "adjust-plus") {
      thisHalfClock.upToZero();
      totalClock.upToZero();
    } else if (this.id == "adjust-minus") {
      thisHalfClock.downToZero();
      totalClock.downToZero();
    }
  }
}

customElements.define("adjust-button", AdjustButton);

class ControllerButton extends LitElement {
  static properties = {
    backgroundColor: { type: String },
    color: { type: String },
    label: { type: String }
  };

  constructor() {
    super();
    this.backgroundColor = this.getAttribute("backgroundColor") || "#00bebe";
    this.color = this.getAttribute("color") || "black";
    this.label = this.getAttribute("label") || "Click Me";
  }

  render() {
    return html`
      <style>
        button {
          border-radius: 12px;
          border-width: 5px;
          border-color: darkcyan;
          background-color: ${this.backgroundColor};
          color: ${this.color};
          font-size: 16pt;
          font-family: sans-serif;
          font-weight: bold;
          padding: 10px 20px 10px 20px;
          width: 190px;
          height: 100px;
          vertical-align: middle;
        }
      </style>
      <span>
        <button @click="${this._buttonClicked}">${this.label}</button>
      </span>
    `;
  }

  _buttonClicked(e) {
    var kickoffButton = document.getElementById("kickoff-button");
    var timeupButton = document.getElementById("timeup-button");
    var thisHalfClock = document.getElementById("this-half");
    var totalClock = document.getElementById("total");
    if (this == kickoffButton) {
      if (
        this.getAttribute("label") == "START" ||
        this.getAttribute("label") == "2nd HALF START"
      ) {
        var date = new Date();
        thisHalfClock.setTime(date);
        if (timeupButton.getAttribute("label") == "HALF TIME") {
          this.setAttribute("label", "1st HALF STARTED");
          totalClock.setTime(date);
        } else {
          this.setAttribute("label", "2nd HALF STARTED");
          totalClock.setTimeDiff(date, 45);
        }
      } else if (this.getAttribute("label") == "RESET") {
        thisHalfClock.stop();
        thisHalfClock.setAttribute("color", "black");
        totalClock.stop();
        totalClock.setAttribute("color", "black");
        kickoffButton.setAttribute("label", "START");
        timeupButton.setAttribute("label", "HALF TIME");
        thisHalfClock.setAttribute("text", "00:00");
        totalClock.setAttribute("text", "00:00");
      }
    } else if (this == timeupButton) {
      if (this.getAttribute("label") == "HALF TIME") {
        this.setAttribute("label", "FULL TIME");
        kickoffButton.setAttribute("label", "2nd HALF START");
        thisHalfClock.stop();
        thisHalfClock.setAttribute("color", "black");
        thisHalfClock.setAttribute("text", "00:00");
        totalClock.stop();
        totalClock.setAttribute("color", "black");
        totalClock.setAttribute("text", "45:00");
      } else if (this.getAttribute("label") == "FULL TIME") {
        kickoffButton.setAttribute("label", "RESET");
        thisHalfClock.stop();
        totalClock.stop();
      }
    }
  }
}

customElements.define("controller-button", ControllerButton);

class ClockFace extends LitElement {
  intervalId = 0;
  date = null;
  halfdur = 45;
  fulldur = 90;

  static properties = {
    backgroundColor: { type: String },
    color: { type: String },
    text: { type: String }
  };

  constructor() {
    super();
    this.backgroundColor = this.getAttribute("backgroundColor") || "#a0c0a8";
    this.color = this.getAttribute("color") || "black";
    this.text = this.getAttribute("text") || "00:00";
    this.date = Date.now();
  }

  render() {
    return html`
      <style>
        span {
          display: flex;
          font-size: 36pt;
          padding-top: 20px;
          padding-bottom: 20px;
          align-item: center;
          border-radius: 12px;
          background-color: ${this.backgroundColor};
          color: ${this.color};
        }
        span > div {
          width: 100%;
          text-align: right;
          margin-right: 70px;
        }
      </style>
      <span><div>${this.text}</div></span>
    `;
  }

  setText() {
    var duration = 0;
    if (this.date != null) {
      var now = new Date();
      duration = Math.floor((now - this.date) / 1000);
      this.text = zeroPadMin(duration / 60) + ":" + zeroPadSec(duration % 60);
    }
    var timeupButton = document.getElementById("timeup-button");
    var duration_min = duration / 60;
    if (
      (this.id == "this-half" && duration_min > this.halfdur) ||
      (this.id == "total" &&
        ((timeupButton.getAttribute("label") == "HALF TIME" &&
          duration_min > this.halfdur) ||
          (timeupButton.getAttribute("label") == "FULL TIME" &&
            duration_min > this.fulldur)))
    ) {
      this.color = "red";
    } else {
      this.color = "black";
    }
  }

  setTimeDiff(_date, min) {
    this.date = _date - min * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.setText();
    }, intervalConst);
  }

  setTime(_date) {
    if (_date != null) {
      this.setTimeDiff(_date, 0);
    } else {
      this.date = null;
    }
  }

  upToZero() {
    var duration = 0;
    if (this.date != null) {
      var now = new Date();
      duration = now - this.date;
      this.date -= 60000 - (duration % 60000);
      this.date -= this.date % 1000;
      this.date += now % 1000;
    }
  }

  downToZero() {
    var duration = 0;
    if (this.date != null) {
      var now = new Date();
      duration = now - this.date;
      this.date += duration % 60000;
      this.date -= this.date % 1000;
      this.date += now % 1000;
    }
  }

  stop() {
    clearInterval(this.intervalId);
  }
}

customElements.define("clock-face", ClockFace);


function zeroPadSec(i) {
  var s = "00" + Math.floor(i);
  return s.substring(s.length - 2);
}

function zeroPadMin(i) {
  var s;
  if ( i >= 100 ) {
    s = "" + Math.floor(i);
    return s.substring(s.length - 3);
  }
  var s = "00" + Math.floor(i);
  return s.substring(s.length - 2);
}

var intervalConst = 93;
