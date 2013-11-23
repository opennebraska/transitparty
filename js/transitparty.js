;var TransitParty = (function (L, $, topojson) {

  var hexLayer;
  var baseLayer;
  var map;
  var mapmargin = 50;

  function resize(){
    var selector = $('#legend');
    var mapWidth = $(document).width();

    selector.each(function(i, elt){
        var $elt = $(elt);
        if ($elt.is(":visible"))
        {
            mapWidth -= $elt.outerWidth(true);
        }

    });
    mapWidth -= 50;
    $('#map').width(mapWidth);
    $('#map').height($(document).height());
  }


  function colorize(duration) {
    if(duration > 120) {
      return '#980043';
    } else if (duration > 60) {
      return '#DD1C77';
    } else if (duration > 30) {
      return '#DF65B0';
    } else if (duration > 6) {
      return '#D7B5D8';
    } else {
      return '#F1EEF6';
    }
  }

  function loadHexes() {
    $.getJSON('data/metro.topojson', function(data){
      layer = L.geoJson(topojson.feature(data, data.objects['metro']),{
        style: {
            fill: true,
            fillOpacity: 0,
            stroke: false
        },
        onEachFeature: function (feature, layer) {
            layer.on('click', onPolyClick);
        }
      });
      layer.addTo(map);
    });
  }

  function setPoly(polyId) {
    console.log(polyId);
    $.getJSON('data/json/' + polyId + '.json?' + Math.random(), function(data){
      _.each(layer._layers, function(hex){
        var polyId = hex.feature.properties.pid;
        if (_.has(data, polyId)) {
          hex.setStyle({
            fill: true,
            fillColor: colorize(data[polyId]),
            fillOpacity: 1
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
        center: new L.LatLng(41.238883, -96.089233),
        zoom: 11,
        attributionControl: false,
        scrollWheelZoom: false
    });

    baseLayer = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      subdomains: '1234'
    }).addTo(map);

    loadHexes();
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
