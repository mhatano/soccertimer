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
import { LitElement, html } from 'https://esm.sh/lit@2.8.0';

let currentHalfDuration = 45;

const ONE_MINUTE_MS = 60000;
const ONE_SECOND_MS = 1000;
const ONE_MINUTES_SEC = 60;

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
          font-weight: normal;
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
    const thisHalfClock = document.getElementById("this-half");
    const totalClock = document.getElementById("total");
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
    
    // Restore state from localStorage if it exists
    const savedState = localStorage.getItem(`controller-${this.id}`);
    if (savedState) {
      const state = JSON.parse(savedState);
      this.label = state.label;
    } else {
      this.label = this.getAttribute("label") || "Click Me";
    }
  }

  saveState() {
    const state = {
      label: this.label
    };
    localStorage.setItem(`controller-${this.id}`, JSON.stringify(state));
  }

  setAttribute(name, value) {
    super.setAttribute(name, value);
    if (name === "label") {
      this.label = value;
      this.saveState();
    }
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
    const kickoffButton = document.getElementById("kickoff-button");
    const timeupButton = document.getElementById("timeup-button");
    const thisHalfClock = document.getElementById("this-half");
    const totalClock = document.getElementById("total");
    if (this == kickoffButton) {
      if (
        this.getAttribute("label") == "START" ||
        this.getAttribute("label") == "2nd HALF START"
      ) {
        const date = new Date();
        thisHalfClock.setTime(date);
        if (timeupButton.getAttribute("label") == "HALF TIME") {
          this.setAttribute("label", "1st HALF STARTED");
          totalClock.setTime(date);
        } else {
          this.setAttribute("label", "2nd HALF STARTED");
          totalClock.setTimeDiff(date, currentHalfDuration);
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
        totalClock.setAttribute("text", zeroPadMin(currentHalfDuration) + ":00");
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
  running = false;

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
    
    // Restore state from localStorage if it exists
    const savedState = localStorage.getItem(`clockface-${this.id}`);
    if (savedState) {
      const state = JSON.parse(savedState);
      this.date = state.date ? new Date(state.date).getTime() : null;
      this.text = state.text;
      this.color = state.color;
      if (this.date && this.running ) {
        this.intervalId = setInterval(() => {
          this.setText();
        }, intervalConst);
      }
    } else {
      this.date = Date.now();
    }
  }

  saveState() {
    const state = {
      date: this.date,
      text: this.text,
      color: this.color,
      running: this.running
    };
    localStorage.setItem(`clockface-${this.id}`, JSON.stringify(state));
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
    let duration = 0;
    if (this.date != null) {
      const now = new Date();
      duration = Math.floor((now - this.date) / ONE_SECOND_MS);
      this.text = zeroPadMin(duration / ONE_MINUTES_SEC) + ":" + zeroPadSec(duration % ONE_MINUTES_SEC);
    }
    const timeupButton = document.getElementById("timeup-button");
    const duration_min = duration / ONE_MINUTES_SEC;
    if (
      (this.id == "this-half" && duration_min > currentHalfDuration) ||
      (this.id == "total" &&
        ((timeupButton.getAttribute("label") == "HALF TIME" &&
          duration_min > currentHalfDuration) ||
          (timeupButton.getAttribute("label") == "FULL TIME" &&
            duration_min > currentHalfDuration * 2)))
    ) {
      this.color = "red";
    } else {
      this.color = "black";
    }
    // Performance fix: Do not save state on every tick (10 times/sec).
    // State is already saved when start/stop/adjust happens.
  }

  setTimeDiff(_date, min) {
    this.date = _date - min * ONE_MINUTE_MS;
    this.intervalId = setInterval(() => {
      this.setText();
    }, intervalConst);
    this.running = true;
    this.saveState();
  }

  setTime(_date) {
    if (_date != null) {
      this.setTimeDiff(_date, 0);
    } else {
      this.date = null;
      this.running = true;
      this.saveState();
    }
  }

  upToZero() {
    let duration = 0;
    if (this.date != null) {
      const now = new Date();
      duration = now - this.date;
      this.date -= ONE_MINUTE_MS - (duration % ONE_MINUTE_MS);
      this.saveState();
      this.setText();
    }
  }

  downToZero() {
    let duration = 0;
    if (this.date != null) {
      const now = new Date();
      duration = now - this.date;
      this.date += duration % ONE_MINUTE_MS;
      this.saveState();
      this.setText();
    }
  }

  stop() {
    clearInterval(this.intervalId);
    this.running = false;
    this.saveState();
  }
}

customElements.define("clock-face", ClockFace);


function zeroPadSec(i) {
  const s = "00" + Math.floor(i);
  return s.substring(s.length - 2);
}

function zeroPadMin(i) {
  if ( i >= 100 ) {
    const s = "" + Math.floor(i);
    return s.substring(s.length - 3);
  }
  const s = "00" + Math.floor(i);
  return s.substring(s.length - 2);
}

const intervalConst = 97;

// Initialize configuration
const durationSelect = document.getElementById("half-duration-select");
if (durationSelect) {
  const savedDuration = localStorage.getItem("soccer-timer-duration");
  if (savedDuration || savedDuration != currentHalfDuration.toString()) {
    currentHalfDuration = parseInt(savedDuration, 10);
    durationSelect.value = savedDuration;
  }
  
  durationSelect.addEventListener("change", (e) => {
    currentHalfDuration = parseInt(e.target.value, 10);
    localStorage.setItem("soccer-timer-duration", currentHalfDuration);
  });
}
