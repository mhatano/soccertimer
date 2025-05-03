# Soccer Timer 1.03 early access
## Purpose of this web application
Soccer timer v1.0x is for forty-five minutes half associate football game. Extend time is not supported.

* Click "START" to start first half clock. The button caption is changed to "1st HALF STARTED".
* Click "HALF TIME" to stop and reset half clock to 0, total clock to 45. Start button caption will be changed to "2nd HALF START", and stop button caption will be "FULL TIME".
* Additional time for the first half is cleared when half time.
* Click "2nd HALF START" to start the second half clock. Half clock is counting from 0, total clock is couting from 45. Caption is changed to "2nd HALF STARTED"
* Click "FULL TIME" to stop all clocks. Button changed to "RESET".
* Click "RESET" will change all clocks to 0 and button captions to "START", "HALF TIME". (Initial State)

To support smartphone browsers, local storage is used.
* "Adjust+" button will set the clock to next minute. For example, when the clock is "23:58", it will be "24:00". If your start button click was incorrect by some reason like fake kick-off motion, you can use this to adjust to the stadium, or live cast clock.
* "Adjust-" will set the clock to the same minute, zero second. For example, when the clock is "23:03", it will go back to "23:00". You can use this to adjust to the official clock.

This clock shows the clock counting even after the regulation time is passed. Normally stadium clock is off after 45 minutes passed, so you can use to check the game time with this application.
