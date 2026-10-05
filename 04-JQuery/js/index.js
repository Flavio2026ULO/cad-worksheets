

$(function () {

  'use strict';


  function twoDigits(n){
    if (n <10) {
      return '0' + n;
    }
    return '' + n;
  }

  function randomTemperature() {
    return (Math.floor(Math.random() * 201) + 100) / 10;
  }



  function createToggleHandler(iconId, iconOn, iconOff, colorOn, colorOff) {

    return function () {

     
      var $icon = $('#' + iconId);

  
      if ($icon.hasClass(iconOn)) {
    
        $icon.removeClass(iconOn + ' ' + colorOn).addClass(iconOff + ' ' + colorOff);
      } else {
        $icon.removeClass(iconOff + ' ' + colorOff).addClass(iconOn + ' ' + colorOn);
      }
    };
  }

 
  $('#kitchen-lights-toggle').on('click',
    createToggleHandler('kitchen-lights-icon', 'fa-solid', 'fa-regular', 'text-warning', 'text-secondary'));

  $('#living-ceiling-lights-toggle').on('click',
    createToggleHandler('living-ceiling-lights-icon', 'fa-solid', 'fa-regular', 'text-warning', 'text-secondary'));

  $('#living-ambient-lights-toggle').on('click',
    createToggleHandler('living-ambient-lights-icon', 'fa-solid', 'fa-regular', 'text-warning', 'text-secondary'));

  $('#living-music-toggle').on('click',
    createToggleHandler('living-music-icon', 'fa-volume-high', 'fa-volume-xmark', 'text-primary', 'text-danger'));



  function updateTemperatures() {
   
    $('#kitchen-temperature').text(randomTemperature() + ' °C');
    $('#living-temperature').text(randomTemperature() + ' °C');
  }

  updateTemperatures();
  setInterval(updateTemperatures, 5000);


 

  function updateDate() {
    var now = new Date();
   
    $('#clock-date').text(
      now.getFullYear() + '-' +
      twoDigits(now.getMonth() + 1) + '-' +
      twoDigits(now.getDate())
    );
  }

  function updateTime() {
    var now = new Date();
   
    $('#clock-time').text(
      twoDigits(now.getHours()) + ':' +
      twoDigits(now.getMinutes()) + ':' +
      twoDigits(now.getSeconds())
    );
  }

  updateDate();
  updateTime();
  setInterval(updateTime, 1000);


  
  
  var API_KEY = "146c7f1861612071896319f4c3aa7d11";

  
  var lastFetch = null;


  function formatHour(unixSeconds) {
    var date = new Date(unixSeconds * 1000);
    return date.getHours() + 'h' + twoDigits(date.getMinutes());
  }


  function timeAgo(seconds) {
    var value;
    var unit;

    if (seconds <60) {
      value = seconds;
      unit = 'second';
    } else if (seconds <3600) {
      value = Math.floor(seconds / 60);
      unit = 'minute';
    } else {
      value = Math.floor(seconds / 3600);
      unit = 'hour';
    }

    if (value !== 1) {
      unit = unit + 's';
    }

    return value + ' ' + unit + ' ago';
  }



  function updateLastUpdate() {

    if (lastFetch === null) {
      return;
    }

    var seconds = Math.floor((new Date() - lastFetch) / 1000);
    $('#weather-last-update').text(timeAgo(seconds));
  }


 
  function fetchWeather(city) {


    var url = 'https://api.openweathermap.org/data/2.5/weather?units=metric' +
      '&q=' + encodeURIComponent(city) +
      '&appid=' + API_KEY;

    
    $.ajax({
      url: url,
      dataType: 'json'
    }).done(function (response) {

      
      $('#weather-temp').text(response.main.temp + ' °C');
      $('#weather-temp-max').text(response.main.temp_max + ' °C');
      $('#weather-temp-min').text(response.main.temp_min + ' °C');
      $('#weather-humidity').text(response.main.humidity + '%');
      $('#weather-sunrise').text(formatHour(response.sys.sunrise));
      $('#weather-sunset').text(formatHour(response.sys.sunset));

     
      lastFetch = new Date();

      updateLastUpdate();

    }).fail(function (xhr, status) {

      
      console.log('Error ' + status + ' (' + xhr.status + ')');

      lastFetch = null;

      $('#weather-last-update').text('Error ' + xhr.status);
    });
  }


  $('#weather-get').on('click', function () {
    var city = $.trim($('#weather-city').val());

    if (city.length > 0) {
      fetchWeather(city);
    }
  });

 
  $('#weather-city').on('keyup', function (e) {
    if (e.key === 'Enter') {
      $('#weather-get').click();
    }
  });


  fetchWeather($('#weather-city').val());

  
  setInterval(updateLastUpdate,1000);

}); 