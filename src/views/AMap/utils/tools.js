var maptool = {
	poltarr: [],
	scale:function(map,type){
		let zoom=map.getZoom();
		map.setZoom(zoom+type)
	},
	drawPolyline: function (map) {
	  var point = [];
	  var that = this;
	  var label;
	  var myIcon = L.divIcon({
		html: "",
		className: "my-div-icon",
		iconSize: 30
	  });
	  var dis = 0;
	  var sum = 0;
	  var lines = new L.polyline(point);
	  var tempLines = new L.polyline([]);
	  map.on("click", function (e) {
		var dd = L.circle(e.latlng, {
		  color: "#ff0000",
		  fillColor: "#ff0000",
		  fillOpacity: 1
		});
		dd.addTo(map);
		that.poltarr.push(dd);
		point.push([e.latlng.lat, e.latlng.lng]);
		if (point.length >= 2) {
		  var line = L.polyline(point).addTo(map);
		  that.poltarr.push(line);
		  sum = sum + dis;
		} else if (point.length > 0) {
		  label = L.marker(e.latlng, {
			icon: myIcon
		  }).addTo(map);
		  that.poltarr.push(label)
		}
		map.on("mousemove", mouse);
	  });
  
	  function mouse(e) {
		if (point.length > 0) {
		  var linearr = [point[point.length - 1],
			[e.latlng.lat, e.latlng.lng]
		  ];
		  tempLines.setLatLngs(linearr);
		  dis = that.getFlatternDistance(linearr);
		  var str = that.formatedis(dis + sum);
		  var icon = L.divIcon({
			html: str,
			className: "my-div-icon",
			iconSize: 30
		  });
		  label.setIcon(icon);
		  label.setZIndexOffset(1);
		  label.setLatLng(linearr[1]);
		  tempLines.addTo(map);
		  that.poltarr.push(tempLines);
		}
		map.on("dblclick", function (e) {
		  var polyline = L.polyline([point]).addTo(map);
		  that.poltarr.push(polyline);
		  point = [];
		  map.off("click");
		});
	  }
	},
	drawPolygon: function (map) {
	  var point = [];
	  var path = [];
	  var that = this;
	  var label;
	  var myIcon = L.divIcon({
		html: "",
		className: "my-div-area",
		iconSize: 30
	  });
	  var lines = new L.polyline(point);
	  var tempLines = new L.polyline([], {
		showMeasurements: true,
		measurementOptions: {
		  imperial: true
		}
	  });
	  var temppgon = new L.polygon([], {
		showMeasurements: true
	  });
	  map.on("click", function (e) {
		var dd = L.circle(e.latlng, {
		  color: '#ff0000',
		  fillColor: '#ff0000',
		  fillOpacity: 1
		});
		dd.addTo(map);
		that.poltarr.push(dd);
		point.push([e.latlng.lat, e.latlng.lng]);
		path.push({
		  lat: e.latlng.lat,
		  lng: e.latlng.lng
		});
		if (point.length >= 2) {
		  var line = L.polyline(point).addTo(map);
		  that.poltarr.push(line);
		}
		if (point.length > 3) {
		  temppgon.setLatLngs(point);
		  temppgon.addTo(map);
		  that.poltarr.push(temppgon);
		  var area = that.computeSignedArea(path);
		  var str = that.formatearea(area);
		  var icon = L.divIcon({
			html: str,
			className: "my-div-icon",
			iconSize: 30
		  });
		  label.setIcon(icon);
		  label.setZIndexOffset(1);
		  label.setLatLng(e.latlng);
		} else if (point.length == 3) {
		  temppgon.setLatLngs(point);
		  temppgon.addTo(map);
		  that.poltarr.push(temppgon);
		  label = L.marker(e.latlng, {
			icon: myIcon
		  }).addTo(map);
		  that.poltarr.push(label);
		  var area = that.computeSignedArea(path);
		  var str = that.formatearea(area);
		  var icon = L.divIcon({
			html: str,
			className: "my-div-icon",
			iconSize: 30
		  });
		  label.setIcon(icon);
		  label.setZIndexOffset(1);
		}
		map.on("mousemove", mouse)
	  });
  
	  function mouse(e) {
		if (point.length > 0) {
		  var linearr = [point[point.length - 1],
			[e.latlng.lat, e.latlng.lng]
		  ];
		  tempLines.setLatLngs(linearr);
		  tempLines.addTo(map);
		  that.poltarr.push(tempLines);
		}
		map.on("dblclick", function (e) {
		  tempLines.remove();
		  point = [];
		  map.off("click");
		})
	  }
	},
	clearplot: function () {
	  var that = this;
	  that.poltarr.forEach(function (item) {
		item.remove()
	  })
	},
	getRad(d) {
	  return d * Math.PI / 180.0;
	},
  
	formatedis: function (dis) {
	  var str = "";
	  if (dis < 1000) {
		str = dis.toFixed(2) + "m";
	  } else {
		str = (dis / 1000).toFixed(2) + "km"
	  }
	  return str;
	},
	formatearea: function (area) {
	  var str = "";
	  if (area < 1000000) {
		str = area.toFixed(3) + "m²";
	  } else {
		str = (area / 1000000).toFixed(3) + "km²"
	  }
	  return str;
	},
	getFlatternDistance: function (arr) {
	  var that = this;
	  var lat1 = arr[0][0];
	  var lng1 = arr[0][1];
	  var lat2 = arr[1][0];
	  var lng2 = arr[1][1];
	  var f = that.getRad((lat1 + lat2) / 2);
	  var g = that.getRad((lat1 - lat2) / 2);
	  var l = that.getRad((lng1 - lng2) / 2);
  
	  var sg = Math.sin(g);
	  var sl = Math.sin(l);
	  var sf = Math.sin(f);
  
	  var s, c, w, r, d, h1, h2;
	  var a = 6378137.0;
	  var fl = 1 / 298.257;
  
	  sg = sg * sg;
	  sl = sl * sl;
	  sf = sf * sf;
  
	  s = sg * (1 - sl) + (1 - sf) * sl;
	  c = (1 - sg) * (1 - sl) + sf * sl;
  
	  w = Math.atan(Math.sqrt(s / c));
	  r = Math.sqrt(s * c) / w;
	  d = 2 * w * a;
	  h1 = (3 * r - 1) / 2 / c;
	  h2 = (3 * r + 1) / 2 / s;
	  var dis = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
  
	  if (isNaN(dis)) {
		dis = 0;
	  }
  
	  return dis;
	},
	computeSignedArea: function (path) {
	  let that = this;
	  let radius = 6371009;
	  let len = path.length;
	  if (len < 3) {
		return 0;
	  }
	  let total = 0;
	  let prev = path[len - 1];
	  let prevTanLat = Math.tan(((Math.PI / 2 - prev.lat / 180 * Math.PI) / 2));
	  let prevLng = (prev.lng) / 180 * Math.PI;
	  for (let i in path) {
		let tanLat = Math.tan((Math.PI / 2 - (path[i].lat) / 180 * Math.PI) / 2);
		let lng = (path[i].lng) / 180 * Math.PI;
		total += that.polarTriangleArea(tanLat, lng, prevTanLat, prevLng);
		prevTanLat = tanLat;
		prevLng = lng;
	  };
	  return Math.abs(total * (radius * radius));
	},
	polarTriangleArea: function (tan1, lng1, tan2, lng2) {
	  let deltaLng = lng1 - lng2;
	  let t = tan1 * tan2;
	  return 2 * Math.atan2(t * Math.sin(deltaLng), 1 + t * Math.cos(deltaLng));
	}
  };
  export default maptool;
  