window.onload = init;

function init(){
    const map = new ol.Map({
        view: new ol.View({
            center:[27336.300604078097, -27336.300604078097],
            zoom:7,
            maxZoom:10,
            minZoom:4,
            rotation:0.5
        }),
        /*
        layers:[
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],*/
        target: 'js-map'
    });

   /* map.on('click',(e)=>{
        console.log(e);
        console.log(e.frameState.pixelToCoordinateTransform);
    })*/

    //base map layer
    const openStreetMapStandard = new ol.layer.Tile({
        source: new ol.source.OSM(),
        visible:false,
        title:"OSMStandard"
    });

    const openStreetMapHumanitarian = new ol.layer.Tile({
        source: new ol.source.OSM({
            url:'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
        }),
        visible:false,
        title:"OSMHumanitarian"
    });

    const stamenTerrain = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
            attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
        }),
        visible:true,
        title: "StamenTerrain"
    })

    //map.addLayer(stamenTerrain);

    const baseLayerGroup = new ol.layer.Group({
        layers:[openStreetMapStandard, openStreetMapHumanitarian, stamenTerrain]
    })

    map.addLayer(baseLayerGroup);

    //Layer switcher logic for Map
    const baseLayerElements = document.querySelectorAll('.sidebar > input[type=radio]');
    for(let baseLayerElement of baseLayerElements){
        //console.log(baseLayerElement);
        baseLayerElement.addEventListener('change', function(){
            let baseLayerElementValue = this.value;
            baseLayerGroup.getLayers().forEach((element, index, array)=>{
                //console.log(element.getKeys());
                let baseLayerTitle = element.get('title');
                element.setVisible(baseLayerTitle === baseLayerElementValue);
                //console.log(baseLayerTitle === baseLayerElementValue);
                //console.log("baseLayerTitle: " + baseLayerTitle + " baseLayerElementValue: " + baseLayerElementValue);
                //console.log(element.get('title'), element.get('visible'));
            });
        });
    }


    //vector layers
    const fillStyle = new ol.style.Fill({
        color: [84, 118, 255, 1]
    });

    const strokeStyle = new ol.style.Stroke({
        color: [45, 46, 46, 1],
        width: 1.2
    });

    const circleStyle = new ol.style.Circle({
        fill: new ol.style.Fill({
            color: [245, 49, 5, 1]
        }),
        radius: 7,
        stroke:strokeStyle
    });

    const EUcountriesGeoJSON = new ol.layer.VectorImage({
        source: new ol.source.Vector({
            url: './map.geojson',
            format: new ol.format.GeoJSON()
        }),
        visible:true,
        title:"EUCountriesJeoJSON",
        style: new ol.style.Style({
            fill: fillStyle,
            stroke: strokeStyle,
            image:circleStyle
        })
    });
    map.addLayer(EUcountriesGeoJSON);

    //overlay container
    const overlayContainerElement = document.querySelector('.overlay-container');
    const overlayLayer = new ol.Overlay({
        element:overlayContainerElement
    });
    map.addOverlay(overlayLayer);

    const overlayFeatureName = document.getElementById('feature-name');
    const overlayFeatureAdditionalInfo = document.getElementById('feature-additional-info');

    //Vector feature popup logic
    map.on('click', function(e){
        //console.log(e);
        overlayLayer.setPosition(undefined);
        map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
            //console.log(feature.getKeys())
            let clickedCoordinate = e.coordinate;
            let clickedFeatureName = feature.get('Name');
            let clickedAdditionalInfo = feature.get('Additonal Info');
            //console.log(clickedFeatureName, clickedAdditionalInfo);
            overlayLayer.setPosition(clickedCoordinate);

            overlayFeatureName.innerHTML = clickedFeatureName
            overlayFeatureAdditionalInfo.innerHTML = clickedAdditionalInfo;

        },
        {
            layerFilter: function(layerCandidate){
                return layerCandidate.get('title') === 'EUCountriesJeoJSON'
            }
        }
        )
    })
}
