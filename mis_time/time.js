if (document.getElementById("header")) {
    var wrap = document.getElementById("header");
    var serverTimeLabel = "<p id='serverTimeIndi' style='color: white; background-color: black;'></p>"
    var tmp = wrap.innerHTML;
    wrap.innerHTML = tmp + serverTimeLabel;
}

function onServerResponseWithTime(time) {
    serverTime = time;
    setInterval(() => {
        serverTime.setMilliseconds( serverTime.getMilliseconds() + 100 );
        document.getElementById('serverTimeIndi').innerHTML = 'Current MIS(hk) Time: ' + serverTime;
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
            var serverTime = new Date(timeString);
            onServerResponseWithTime(serverTime);
        }
    });
});