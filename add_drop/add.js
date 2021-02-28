// ==UserScript==
// @name         UIC Course Add/Drop Helper
// @namespace    https://uic.edu.hk/
// @require      http://code.jquery.com/jquery-1.8.3.min.js
// @version      1.3
// @description  Select the ******* course
// @author       CST Student
// @match        *://mis.uic.edu.hk/mis/student/as/*
// @match        *://mis.uic.edu.cn/mis/student/as/*
// @compatible   chrome
// @compatible   firefox
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var myTimer;
    var serverTime;
    var formalRunTime = new Date('28 Sep 2020 19:00:02 GMT+0800');
    var maxIter = 1;
    var iterCount = 0;
    var scheduled = false;
    var type = 'add';

    if (document.getElementById("header")) {
        var wrap = document.getElementById("header");
        var button = "<button type='button' id='myschedule'>Schedule</button>"
        button += "<button type='button' id='mystart'>Start</button>";
        button += "<button type='button' id='mystop'>Stop</button><br>";
        var radios = "Type: <input type='radio' id='typeAdd' name='actionType' value='add' checked='checked'>Add"
        radios += "<input type='radio' id='typeDrop' name='actionType' value='drop'>Drop<br>"
        var classIdTextField = "<input type='text' id='courseIdTextField'></input><br>"
        var serverTimeLabel = "<p id='serverTimeIndi' style='color: white; background-color: black;'></p>"
        var scheduledTimeLabel = "<p id='scheduledTimeLabel' style='color: white; background-color: black;'></p>"
        var tmp = wrap.innerHTML;
        wrap.innerHTML = tmp + button + radios + classIdTextField + serverTimeLabel + scheduledTimeLabel;
    }

    function modifyCourse(type) {

        var form = document.getElementById('frm');

        if (document.getElementById('typeAdd').checked) {
            form.action = '/mis/student/as/addSubject.do';
        } else {
            // type is drop
            form.action = '/mis/student/as/dropSubject.do';
        }
        
        form.submit();
        console.log('Request Submitted');

        iterCount++;
        if (iterCount >= maxIter) {
            stop();
        }

    }

    function schedule() {
        scheduled = !scheduled;
        console.log('Scheduled: ' + scheduled);
    }

    function start() {
        document.frm.id.value = document.getElementById('courseIdTextField').value;
        console.log('courseId: ' + document.frm.id.value);
        console.log('Service State: Running');
        myTimer = setInterval(modifyCourse, 250);
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
