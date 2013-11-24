;var TransitParty = (function (L, $, topojson) {

  var hexLayer;
  var baseLayer;
  var map;
  var selectedMarker = false;
  var mapmargin = 50;

  function resize(){
    map.invalidateSize(false);
  }

  function colorize(duration) {
    if(duration > 120) {
      return '#7F81BD';
    } else if (duration > 90) {
      return '#8083F7';
    } else if (duration > 75) {
      return '#81A8FC';
    } else if (duration > 60) {
      return '#83D9FD';
    } else if (duration > 50) {
      return '#98FEE6';
    } else if (duration > 40) {
      return '#B6F2AE';
    } else if (duration > 30) {
      return '#DCF288';
    } else if (duration > 20) {
      return '#FEE085';
    } else if (duration > 15) {
      return '#FDB383';
    } else {
      return '#F68481';
    }
  }

  function geocode(){
    var address = $('#searchBox').val();

    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var lat = results[0].location.lat();
        var lon = results[0].location.lng();
        var whichHex = leafletPip.pointInLayer([lon, lat],  hexLayer, true);
        if (whichHex.length == 0)
        {
          return;
        } 
        setPoly(whichHex[0].feature.properties.pid);
      } else {
        alert('Oops! We couldn't find that place.');
      }
    });
  }

  function loadHexes() {
    $.getJSON('data/metro.topojson', function(data){
      hexLayer = L.geoJson(topojson.feature(data, data.objects['metro']),{
        style: {
            fill: true,
            fillOpacity: 0,
            stroke: false
        },
        onEachFeature: function (feature, layer) {
            layer.on('click', onPolyClick);
        }
      });
      hexLayer.addTo(map);
    });
  }

  function setPoly(selectedPoly) {
    if(selectedMarker) {
      map.removeLayer(selectedMarker);
    }
    $.getJSON('data/json/' + selectedPoly + '.json?' + Math.random(), function(data){
      _.each(hexLayer._layers, function(hex){
        var polyId = hex.feature.properties.pid;
        if (_.has(data, polyId)) {
          hex.setStyle({
            fill: true,
            fillColor: colorize(data[polyId]),
            fillOpacity: 0.7
          });
        } else {
          hex.setStyle({
            fillOpacity: 0
          });
        }
        if(selectedPoly == polyId) {
          var center = hex.getBounds().getCenter();
          selectedMarker = L.marker(center).addTo(map);
        } 
      }) 
    });
  }

  function onPolyClick(e) {
    setPoly(e.target.feature.properties.pid);
  }

  function geolocate(e) {
    var lat = e.coords.latitude;
    var long = e.coords.longitude;

    var whichHex = leafletPip.pointInLayer([long, lat],  hexLayer, true);
    if (whichHex.length == 0)
    {
      return;
    }
    setPoly(whichHex[0].feature.properties.pid);
  }

  function initializeMap() {
    map = new L.map('map',{
      center: new L.LatLng(41.263305, -96.038481),
      zoom: 12,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: false
    });

    baseLayer = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      subdomains: '1234'
    }).addTo(map);

    loadHexes();

    $('#searchBox').keydown(function(event){
      if(event.which == 13)
      {
        // Enter key
        geocode();
      }
    });

    $('#geolocate').click(function(e) {
      navigator.geolocation.getCurrentPosition(geolocate);
    });
  }

  return {

    init : function() {
      initializeMap();
      $(window).on("resize", resize);
      resize();
    }

  }

})(L, $, topojson);

$(document).ready(function () {
  TransitParty.init();
});
