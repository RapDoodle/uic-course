// ==UserScript==
// @name         UIC Course Selection Helper
// @namespace    https://uic.edu.hk/
// @require      http://code.jquery.com/jquery-1.8.3.min.js
// @version      1.4
// @description  Select the ******* course
// @author       CST Student
// @match        *://mis.uic.edu.hk/mis/student/*
// @match        *://mis.uic.edu.cn/mis/student/*
// @compatible   chrome
// @compatible   firefox
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var myTimer;
    var serverTime;
    var formalRunTime = new Date('5 Aug 2021 16:00:02 GMT+0800');
    var maxIter = 2;
    var iterCount = 0;
    var scheduled = false;

    if (document.getElementById("header")) {
        var wrap = document.getElementById("header");
        var button = "<button type='button' id='myschedule'>Schedule</button>"
        button += "<button type='button' id='mystart'>Start</button>";
        button += "<button type='button' id='mystop'>Stop</button><br>";
        var classIdTextField = "<input type='text' id='courseIdTextField'></input><br>";
        var serverTimeLabel = "<p id='serverTimeIndi' style='color: white; background-color: black;'></p>";
        var courseNameLabel = "<p id='courseNameLabel' style='color: white; background-color: black;'></p>";
        var scheduledTimeLabel = "<p id='scheduledTimeLabel' style='color: white; background-color: black;'></p>";
        var tmp = wrap.innerHTML;
        wrap.innerHTML = tmp + button + classIdTextField + serverTimeLabel + courseNameLabel + scheduledTimeLabel;
        document.getElementById('courseIdTextField').addEventListener('input', updateCourseName);
    }

    function updateCourseName() {
        document.electiveform.id.value = document.getElementById('courseIdTextField').value;
        var courseNameLabelValue = document.electiveform.id.value;
        if (courseNameLabelValue.length > 0) {
            var tds = document.getElementsByTagName('td');
            var found = false;
            for(var i=0; i < tds.length; i++) {
                if (courseNameLabelValue === tds[i].id) {
                    document.getElementById('courseNameLabel').innerHTML = 'Selected course name: ' + tds[i].innerText;
                    found = true;
                }
            }

            if (!found) {
                document.getElementById('courseNameLabel').innerHTML = '[WARNING] Invalid course id.';
            }
        } else {
            document.getElementById('courseNameLabel').innerHTML = 'No course selected.';
        }
    }

    function submitSelectedCourse() {
        iterCount++;
        if (iterCount > maxIter) {
            stop();
        }
        var electiveForm = document.getElementById('electiveform');
        electiveForm.submit();
        console.log('Request Submitted');
    }

    function schedule() {
        scheduled = !scheduled;
        if (scheduled) {
            console.log('Please check the following information: ')
            document.electiveform.id.value = document.getElementById('courseIdTextField').value;
            console.log('electiveTypeId: ' + document.electiveform.electiveTypeId.value);
            console.log('courseId: ' + document.electiveform.id.value);
        }
        console.log('Scheduled: ' + scheduled);
    }

    function start() {
        document.electiveform.id.value = document.getElementById('courseIdTextField').value;
        console.log('electiveTypeId: ' + document.electiveform.electiveTypeId.value);
        console.log('courseId: ' + document.electiveform.id.value);
        console.log('Service State: Running');
        myTimer = setInterval(submitSelectedCourse, 250);
    }

    function stop() {
        clearInterval(myTimer);
        console.log('Service State: Stopped');
    }

    if (document.getElementById("mystart")) {
        var myButtonStart = document.getElementById("mystart");
        myButtonStart.addEventListener ("click", start , false);
    }

    if (document.getElementById("mystop")) {
        var myButtonStop = document.getElementById("mystop");
        myButtonStop.addEventListener ("click", stop , false);
    }

    if (document.getElementById("myschedule")) {
        var myschedule = document.getElementById("myschedule");
        myschedule.addEventListener ("click", schedule , false);
    }

    function onServerResponseWithTime(time) {
        serverTime = time;
        setInterval(() => {
            serverTime.setMilliseconds( serverTime.getMilliseconds() + 100 );
            document.getElementById('serverTimeIndi').innerHTML = 'Current Server Time: ' + serverTime;
            if (scheduled) {
                var countDown = (formalRunTime.getTime() - serverTime.getTime()) / 1000;
                document.getElementById('scheduledTimeLabel').innerHTML = 'Scheduled at: ' + formalRunTime + ' Count down: ' + countDown;

                if (serverTime >= formalRunTime) {
                    scheduled = false;
                    console.log('Lift off!!');
                    start();
                }
            } else {
                document.getElementById('scheduledTimeLabel').innerHTML = '';
            }
        }, 100);
    }

    $(function () {
        $.ajax({
          type: 'GET',
          cache: false,
          url: 'https://mis.uic.edu.hk/',
            complete: function (req, textStatus) {
                var timeString = req.getResponseHeader('Date');
                if (timeString.indexOf('GMT') === -1) {
                    timeString += ' GMT';
                }
                console.log('TimeString: ' + timeString);
                var serverTime = new Date(timeString);
                onServerResponseWithTime(serverTime);
            }
        });
    });

})();