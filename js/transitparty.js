;var TransitParty = (function (L, $, topojson) {

  var hexLayer;
  var baseLayer;
  var map;
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
    address += ', omaha ne';
    var url = 'http://open.mapquestapi.com/nominatim/v1/search?format=json&json_callback=?&limit=1&location=Omaha, NE&q=' + address;
    url = encodeURI(url);

    $.getJSON(url, function(data){
      if (!_.has(data,0)){
        return;
      }

      var lat = data[0].lat;
      var lon = data[0].lon;

      var whichHex = leafletPip.pointInLayer([lon, lat],  hexLayer, true);
      map.panTo([lat, lon]);
      if (whichHex.length == 0)
      {
        return;
      }
      setPoly(whichHex[0].feature.properties.pid);
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

  function setPoly(polyId) {
    console.log(polyId);
    $.getJSON('data/json/' + polyId + '.json?' + Math.random(), function(data){
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
      }) 
    });
  }

  function onPolyClick(e) {
    setPoly(e.target.feature.properties.pid);
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
