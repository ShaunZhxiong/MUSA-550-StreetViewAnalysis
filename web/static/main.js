// map functions
let clearMap = function (map, basemap) {
    map.eachLayer(function (layer) {
        if (layer != basemap) {
            map.removeLayer(layer);
        }
    });
}

let addDataToMap = function (map, layer, basemap) {
    clearMap(map, basemap);
    if (layer instanceof Array) {
        layer.forEach(l => l.addTo(map))
    } else layer.addTo(map)
}

let getQuantileBreaks = function (geojson, propertyName, breakNum) {
    let classData = [];
    geojson.features.forEach(feature => {
        classData.push(feature.properties[propertyName]);
    });
    return chroma.limits(classData, "q", breakNum);
}

let generatePopup = function (name, value) {
    return "<p><strong>" + name + "</strong>:" + value + "</p>"
}

// define basemap
let basemap01 = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">Carto</a>'
})

let basemap02 = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">Carto</a>'
})

let basemap03 = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">Carto</a>'
})

let basemap04 = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">Carto</a>'
})


// ======= map01 ======
var map01 = L.map('map01').setView([39.9597471840457, -75.17893127441406], 14)
basemap01.addTo(map01);

// Add roads
$.getJSON('data/roads.geojson', function (geojson) {
    let quantileBreaks = getQuantileBreaks(geojson, "CLASS", 6);
    L.geoJSON(geojson, {
        style: (feature) => {
            let classNum = feature.properties["CLASS"];
            let c = chroma.scale("viridis").classes(quantileBreaks)(feature.properties["CLASS"])
            let w = classNum > 8 ? 0 :
                classNum >= 5 ? 0.5 :
                    classNum >= 3 ? 1 :
                        1.5
            let o = (w / 2.5) / 1

            return {
                weight: .9,
                color: c,
                opacity: o,
            };
        }
    }).bringToBack().addTo(map01)
})
// Add street view points
$.getJSON('data/streetViewPoints.geojson', function (geojson) {
    L.geoJSON(geojson, {
        pointToLayer: function (feature, latlng) {
            return L.circle(latlng, {
                color: chroma.scale("viridis")(0),
                opacity: 1,
                weight: 1,
                radius: 20,
            })
        },
    }).bringToFront().addTo(map01)
})

// ======= map02 ======

var map02 = L.map('map02').setView([39.97, -75.17893127441406], 12)
basemap02.addTo(map02);

let pointsWithSeg;
let renderMap02 = function (layerId) {
    // let layerName = ['green', 'wall', 'lives', 'building', 'infrastructure', 'road', 'sidewalk',
    //     'sky', 'green', 'transportation', 'publicservice'][layerId];
    let layerName = layerId;
    let q_layer = layerName + "_q";
    if (pointsWithSeg === undefined) { console.log("loading...."); return }
    let layer = L.geoJSON(pointsWithSeg, {
        pointToLayer: function (feature, latlng) {
            let q = feature.properties[q_layer];
            return L.circle(latlng, {
                color: chroma.scale("viridis")(q),
                opacity: 1,
                weight: 1,
                radius: 20,
            })
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                generatePopup("Segment Elements", layerName) +
                generatePopup("Percentage", (feature.properties[layerName] * 100).toFixed(2) + "%")
            );
        }
    });
    addDataToMap(map02, layer, basemap02);
}

$.getJSON('data/pointsWithSeg.geojson', function (geojson) {
    pointsWithSeg = geojson;
    renderMap02('green');
})

$(".map02-btn").on('click', function () {
    let t = $(this).text();
    renderMap02(t);
    $("b.map02-text").text(t)
})

// ======= map03 ======
var map03 = L.map('map03').setView([39.9698, -75.1791], 12)
basemap03.addTo(map03);

let cluster_pt_layer, cluster_poly_layer;

let renderMap03 = function (layerName) {
    let layer = {
        "map03-1": cluster_pt_layer,
        "map03-2": cluster_poly_layer
    }[layerName];
    addDataToMap(map03, layer, basemap03);
}

$.getJSON('data/p3-clustering-point.geojson', function (geojson) {
    cluster_pt_layer = L.geoJSON(geojson, {
        pointToLayer: function (feature, latlng) {
            let c = feature.properties.color;
            return L.circle(latlng, {
                color: c,
                opacity: 1,
                weight: 1,
                radius: 90,
            })
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                generatePopup("Clustering Label", feature.properties.label) +
                generatePopup("ID", feature.properties.id)
            );
        }
    });
    renderMap03("map03-1");
})

$.getJSON('data/p3-clustering-polygon.geojson', function (geojson) {
    cluster_poly_layer = L.geoJSON(geojson, {
        style: (feature) => {
            let c = feature.properties.color;
            return {
                color: c,
                weight: .8,
                opacity: 1,
            };
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                generatePopup("Block Group Name", feature.properties.NAME) +
                generatePopup("Clustering Label", feature.properties.label)
            );
        }
    });
})

$(".map03-btn").on('click', function () {
    let t = $(this).attr("id");
    renderMap03(t);
    // change the legend
    $('.map03-legend div .legend').toggleClass('circle');
})

var chart03_conf = "data/p3-clustering-bar-chart.json";
vegaEmbed('#chart-03', chart03_conf, { "actions": false }).then(function (result) {
}).catch(console.error);

// ======= map3.5 ======
var map04 = L.map('map-35', { scrollWheelZoom: false }).setView([39.9698, -75.1791], 11)
basemap04.addTo(map04);
vegaEmbed('#chart-35', "data/p3.5-chart.json").then(function (result) {
}).catch(console.error);

$.getJSON('data/p3.5-map.geojson', function (geojson) {

    L.geoJSON(geojson, {
        style: (feature) => {
            let n = feature.properties.whitePercep;
            let c = chroma.scale("viridis")(n);
            return {
                color: c,
                weight: .8,
                opacity: 1,
            };
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties.whitePercep === null) { return };
            layer.bindPopup(
                generatePopup("Block Group Name", feature.properties.NAME) +
                generatePopup("Total Population", feature.properties.totalPop) +
                generatePopup("White Percentage", (feature.properties.whitePercep * 100).toFixed(4) + "%") +
                generatePopup("Non-White Percentage", (feature.properties.nonwhitePercep * 100).toFixed(4) + "%")
            );
        },

    }).addTo(map04);
})


// ======= map04 ======
vegaEmbed('#chart04-1', "data/p4-correlation-chart.json").then(function (result) {
}).catch(console.error);
vegaEmbed('#chart04-2', "data/p4-correlation-ci.json").then(function (result) {
}).catch(console.error);

// ======= page05 ======
var chart05_conf = "data/p5-SV-Crime-chart.json";
vegaEmbed('#chart-05', chart05_conf).then(function (result) {
}).catch(console.error);


$(window).on("scroll", () => {
    let n = window.scrollY / 800;
    // let c = chroma.scale(["white", "#f0c5fa"])(n).hex();
    $(".web-title").css('opacity', 1 - n);
    // console.log(c, $(".webtitle").css('color'))
})






