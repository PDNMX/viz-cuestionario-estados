let mexico, svg
let sizeScale
let simulation, nodes;


var dataMaxMinInfraestructura = [];
var dataMaxMinNormatividad = [];
var dataMaxMinCapitalHumano = [];
var dataMaxMinMapeoGestion = [];
var dataMaxDevMinMecanismos = [];

// Colores base para categorias 
// Normatividad, Infraestructura, Capital Humano, Mapeo y gestión, Dev Mecanismos de comunicación
const colorsCategorias = ['#34B3EB', '#34a853', '#674ea7', '#ff6d01', '#fbbc04'];

Promise.all([
    // dataset de trimestres
    fetch('https://spreadsheets.google.com/feeds/list/1x17q4Ny8ENBniRT0WrlIVLU7LEs2fU1u7q2rxEypMNg/1/public/values?alt=json'),
    fetch('data/mexico.json')
]).then(async ([aa, bb]) => {
    const a = await aa.json();
    const b = await bb.json();
    return [a, b]
})
    .then((responseText) => {
        // console.log(responseText);
        // console.log(responseText[1]);
        let datasetEdos = responseText[0].feed.entry;
        datasetEdos = datasetEdos.sort((a, b) => new Date(b.gsx$fecha.$t) - new Date(a.gsx$fecha.$t));
        // carga los copys
        document.getElementById("copy1").append(datasetEdos[0].gsx$copy1.$t);
        document.getElementById("copy4").append(datasetEdos[0].gsx$copy4.$t);
        document.getElementById("copy5").append(datasetEdos[0].gsx$copy5.$t);
        document.getElementById("copy6").append(datasetEdos[0].gsx$copy6.$t);
        document.getElementById("copy7").append(datasetEdos[0].gsx$copy7.$t);
        document.getElementById("copy8").append(datasetEdos[0].gsx$copy8.$t);
        //console.log(datasetEdos[0].gsx$copy1.$t);

        fetch(datasetEdos[0].gsx$urldata.$t)
        .then(response => response.json())
        .then(data => {
            //console.log(data);
            createScales(data.feed.entry);
            createTabla(data.feed.entry);
            //setTimeout(drawInitial(data.feed.entry), 100);
            drawInitial(data.feed.entry), 100;
        }).catch((err) => {
            console.log(err);
        });
        
        let select = document.getElementById("selectTrimestre");
        datasetEdos.map(function(item){
            let option = document.createElement("option");
            option.value = item.gsx$urldata.$t;
            option.text  = item.gsx$nombre.$t;
            option.dataset.copy1 = item.gsx$copy1.$t
            option.dataset.copy4 = item.gsx$copy4.$t
            option.dataset.copy5 = item.gsx$copy5.$t
            option.dataset.copy6 = item.gsx$copy6.$t
            option.dataset.copy7 = item.gsx$copy7.$t
            option.dataset.copy8 = item.gsx$copy8.$t
            select.appendChild(option);
        });

        mexico = responseText[1];
        //createScales(responseText[0].feed.entry);
        //createTabla(responseText[0].feed.entry);
        //setTimeout(drawInitial(responseText[0].feed.entry), 100);
    }).catch((err) => {
    console.log(err);
});

function createScales(dataset) {
    //console.log(dataset)
    sizeScale = d3.scaleLinear(d3.extent(dataset, d => d.gsx$puntajetotal.$t), [5, 35]);
}

function drawInitial(dataset) {
    /* let currentWidth = parseInt(d3.select('#contentViz').style('width'), 10);
    let currentHeight = parseInt(d3.select('#contentViz').style('height'), 10); */
    let svg = d3.select("#vis")
        .append('svg')
        .attr("viewBox", `0 0 1000 950`)
        .attr('preserveAspectRatio','xMinYMin')
        /* .attr("width", currentWidth)
        .attr("height", currentHeight) */
        .attr('opacity', 1)
        .attr('display', 'none');
    ///////////////////////////////////////////////
    /*
        INICIO --> chartMexicoPuntuacion
    */
    // Mergea los datos del Google Spreadsheets con el TopoJSON
    mexico.objects.collection.geometries.forEach(function(element){
        // dataset -> Data Google Spreadsheets
        element.properties.calificacion=0;
        element.properties.pntNor=0;
        element.properties.pntInf=0;
        element.properties.pntCH=0;
        element.properties.pntGD=0;
        element.properties.pntMC=0;
        element.properties.porcentajeNor=0;
        element.properties.porcentajeInf=0;
        element.properties.porcentajeCH=0;
        element.properties.porcentajeGD=0;
        element.properties.porcentajeMC=0;
        dataset.forEach(function(newElement) {
            if(parseInt(element.properties.clave)===parseInt(newElement.gsx$clavedeagee.$t)){
                // Set data of Google Spreadsheets
                element.properties.entidad=newElement.gsx$estado.$t;
                element.properties.calificacion=newElement.gsx$puntajetotal.$t;
                element.properties.pntNor=parseInt(newElement.gsx$puntajenormatividad.$t);
                element.properties.pntInf=parseInt(newElement.gsx$puntajeinfraestructura.$t);
                element.properties.pntCH=parseInt(newElement.gsx$puntajecapitalhumano.$t);
                element.properties.pntGD=parseInt(newElement.gsx$puntajemapeoygestióndedatos.$t);
                element.properties.pntMC=parseInt(newElement.gsx$puntajedesarrollodemecanismosdecomunicación.$t);
                // porcentajes
                element.properties.porcentajeNor=parseInt(newElement.gsx$porcentajenormatividad.$t);
                element.properties.porcentajeInf=parseInt(newElement.gsx$porcentajeinfraestructura.$t);
                element.properties.porcentajeCH=parseInt(newElement.gsx$porcentajecapitalhumano.$t);
                element.properties.porcentajeGD=parseInt(newElement.gsx$porcentajemapeoygestióndedatos.$t);
                element.properties.porcentajeMC=parseInt(newElement.gsx$porcentajedesarrollodemecanismosdecomunicación.$t);
            }
        });
        
    }); 
    // Config for the Radar chart
    
    //
    //console.log(mexico);
    let projection = d3.geoMercator()
        .scale(1700)
        .center([-103.34034978813841, 30.012062015793]);
    let path = d3.geoPath(projection);

    svg.append("g")
        .attr('visibility', 'hidden')
        .attr('class', 'mapa')
        .selectAll("path")
        .data(topojson.feature(mexico, mexico.objects.collection).features)
        .join("path")
        .attr('class', 'entidad')
        .on('click', function (d) {
            let dataTest = [
                [
                    {"area": "Desarrollo de mecanismos de comunicación ", "value": d.properties.porcentajeMC},
                    {"area": "Normatividad ", "value": d.properties.porcentajeNor},
                    {"area": "Mapeo y gestión de datos", "value": d.properties.porcentajeGD},
                    {"area": "Capital humano ", "value": d.properties.porcentajeCH},
                    {"area": "Infraestructura", "value": d.properties.porcentajeInf}
                ]
              ];
            let config = {
                w: 300,
                h: 300,
                maxValue: 100,
                levels: 5,
                ExtraWidthX: 300,
                color: d3.scaleOrdinal().range([d.color])
            } 
            RadarChart.draw("#radarChart", dataTest, config);
            $('#mapaModal').modal('toggle')
            $('#modalTitle').text(d.properties.entidad);
            $('#pntTotal').text(`${Math.round(d.properties.calificacion)} de 100`); // Total 100
            $('#pntNormatividad').val(`${Math.round(d.properties.pntNor)} de 10`); // Total 10
            $('#pntInf').val(`${Math.round(d.properties.pntInf)} de 20`); // Total 20
            $('#pntCH').val(`${Math.round(d.properties.pntCH)} de 10`); // Total 10
            $('#pntGD').val(`${Math.round(d.properties.pntGD)} de 30`); // Total 30
            $('#pntMC').val(`${Math.round(d.properties.pntMC)} de 30`); // Total 30
            $('#modalHeader').css('background-color', d.color);
        })
        .attr("d", path);

    let dataLegend = [{
            "color": "#b64547",
            "value": 0
        }, {
            "color": "#b64547",
            "value": 10
        }, {
            "color": "#cb5859",
            "value": 20
        }, {
            "color": "#f06c6e",
            "value": 30
        },
        {
            "color": "#f49899",
            "value": 40
        }, {
            "color": "#efbcbd",
            "value": 50
        }, {
            "color": "#adccd9",
            "value": 60
        },
        {
            "color": "#58accf",
            "value": 70
        }, {
            "color": "#519ebe",
            "value": 80
        }, {
            "color": "#3887a8",
            "value": 90
        }, {
            "color": "#1f6e89",
            "value": 100
        }
    ];
    // Escala de colores
    let extent = d3.extent(dataLegend, d => d.value);
    let padding = 9;
    let width = 320;
    let innerWidth = width - (padding * 5);
    let barHeight = 12;
    /* let height = 28; */

    let xScale = d3.scaleLinear()
        .range([0, innerWidth])
        .domain(extent);

    let xTicks = dataLegend.filter(f => f.value % 10 === 0).map(d => d.value);

    let xAxis = d3.axisBottom(xScale)
        .tickSize(barHeight * 2)
        .tickValues(xTicks);

    let g2 = svg.select('.mapa')
        .append("g")
        .attr("transform", "translate(80, 700)")
        .attr('class', 'leyendas')
        .attr('visibility', 'hidden');

    let defs = svg.select('.mapa').append("defs");
    let linearGradient = defs.append("linearGradient").attr("id", "myGradient");
    linearGradient.selectAll("stop")
        .data(dataLegend)
        .enter().append("stop")
        .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
        .attr("stop-color", d => d.color);

    g2.append("rect")
        .attr("width", innerWidth)
        .attr("height", barHeight)
        .style("fill", "url(#myGradient)");

    g2.append("g")
        .call(xAxis)
        .select(".domain").remove(); 
    
    // console.log(mexico)

    /*
        FIN --> chartMexicoPuntuacion
    */
    ///////////////////////////////////////////////
    /*
        INICIO --> chartStackedBar
    */
   //let puntajeNormatividad = dataset.gsx$puntajenormatividad.$t;
   let dataStacked = [];
   dataset.forEach(function(d) {
        let tempData = {
            Entidad: d.gsx$estado.$t,
            'Normatividad': Number.parseFloat(d.gsx$puntajenormatividad.$t),
            'Infraestructura': Number.parseFloat(d.gsx$puntajeinfraestructura.$t),
            'Capital humano': Number.parseFloat(d.gsx$puntajecapitalhumano.$t),
            'Mapeo y gestión de datos': Number.parseFloat(d.gsx$puntajemapeoygestióndedatos.$t),
            'Desarrollo de mecanismos de comunicación': Number.parseFloat(d.gsx$puntajedesarrollodemecanismosdecomunicación.$t),
            total: Number.parseFloat(d.gsx$puntajetotal.$t)
        };
        dataStacked.push(tempData);
    });
    //console.log(dataStacked);
    let currentWidth = parseInt(d3.select('#contentViz').style('width'), 10);
    let currentHeight = parseInt(d3.select('#contentViz').style('height'), 10);
    const margin = {
        left: 110,
        top: 110,
        bottom: 20,
        right: 150
    }

    let group = ["Normatividad", "Infraestructura", "Capital humano", "Mapeo y gestión de datos", "Desarrollo de mecanismos de comunicación"];
    //let mainDiv = "#vis";
    let mainDivName = "vis";
    /* width = +svg.attr("width"),
    height = +svg.attr("height"); */
    //console.log(salesData);
    let layers = d3.stack()
        .keys(group)
        .offset(d3.stackOffsetDiverging)
        (dataStacked);          
    let x = d3.scaleLinear().rangeRound([margin.left, currentWidth * 0.85]);
    x.domain(['0', '100']);

    let sortFn = (a, b) => d3.ascending(a.total, b.total);

    let y = d3.scaleBand().rangeRound([currentHeight - margin.bottom, margin.top]).padding(0.2);
    y.domain(dataStacked.sort(sortFn).map(function(d) {
        return d.Entidad;
    }))

    let z = d3.scaleOrdinal(['#34B3EB', '#34a853', '#674ea7', '#ff6d01', '#fbbc04']);

    let maing = svg.append("g")
        .attr('class', 'stackedBar')
        .selectAll("g")
        .data(layers);

    // bar background
    let background = svg.select(".stackedBar")
        .append("g")
        .selectAll(".barBG")
        .data(dataStacked, d => d.Entidad);

    background.enter()
        .append('rect')
        .attr("class", "barBG")
        .attr("style", "opacity: 0.08")
        .attr('x', function(d) {return x(0);})
        .attr('y', function(d) {return y(d.Entidad)})
        .attr('height', y.bandwidth)
        .attr('width', function(d) {return x(100);} )
        .attr('fill', 'gray');

    let g = maing.enter().append("g")
        .attr("fill", function(d) {
            return z(d.key);
        });

    let rect = g.selectAll("rect")
        .data(function(d) {
            d.forEach(function(d1) {
                d1.key = d.key;
                return d1;
            });
            return d;
        })
        .enter().append("rect")
        .attr("data", function(d) {
            let data = {};
            data["key"] = d.key;
            data["value"] = d.data[d.key];
            let total = 0;
            group.map(function(d1) {
                total = total + d.data[d1]
            });
            data["total"] = total;
            //console.log(data["total"])
            //console.log(data);
            return JSON.stringify(data);
        })
        .attr("width", function(d) {
            //console.log(x(d[1]))
            return x(d[1]) - x(d[0]);
        })
        .attr("x", function(d) {
            return x(d[0]);
        })
        .attr("y", function(d) {
            return y(d.data.Entidad);
        })
        .attr("height", y.bandwidth);

    rect.on("mouseover", function() {
        let currentEl = d3.select(this);
        let fadeInSpeed = 120;
        d3.select("#recttooltip_" + mainDivName)
            .transition()
            .duration(fadeInSpeed)
            .style("opacity", function() {
                return 1;
            });
        d3.select("#recttooltip_" + mainDivName).attr("transform", function(d) {
            let mouseCoords = d3.mouse(this.parentNode);
            let xCo = 0;
            if (mouseCoords[0] + 10 >= width * 0.80) {
                xCo = mouseCoords[0] - parseFloat(d3.selectAll("#recttooltipRect_" + mainDivName)
                    .attr("width"));
            } else {
                xCo = mouseCoords[0] + 10;
            }
            let x = xCo;
            let yCo = 0;
            if (mouseCoords[0] + 10 >= width * 0.80) {
                yCo = mouseCoords[1] + 10;
            } else {
                yCo = mouseCoords[1];
            }
            x = xCo;
            y = yCo;
            return "translate(" + x + "," + y + ")";
        });
        //CBT:calculate tooltips text
        let tooltipData = JSON.parse(currentEl.attr("data"));
        d3.selectAll("#recttooltipText_" + mainDivName).text("");
        let yPos = 0;
        d3.selectAll("#recttooltipText_" + mainDivName).append("tspan").attr("x", 0).attr("y", yPos * 10).attr("dy", "1.9em").text(tooltipData.key + ":  " + tooltipData.value);
        //yPos = yPos + 1;
        //CBT:calculate width of the text based on characters
        let dims = helpers.getDimensions("recttooltipText_" + mainDivName);
        d3.selectAll("#recttooltipText_" + mainDivName + " tspan")
            .attr("x", dims.w + 4);

        d3.selectAll("#recttooltipRect_" + mainDivName)
            .attr("width", dims.w + 10)
            .attr("height", dims.h + 20);
    });
    rect.on("mousemove", function() {
        let currentEl = d3.select(this);
        currentEl.attr("r", 7);
        d3.selectAll("#recttooltip_" + mainDivName)
            .attr("transform", function(d) {
                let mouseCoords = d3.mouse(this.parentNode);
                let xCo = 0;
                if (mouseCoords[0] + 10 >= width * 0.80) {
                    xCo = mouseCoords[0] - parseFloat(d3.selectAll("#recttooltipRect_" + mainDivName)
                        .attr("width"));
                } else {
                    xCo = mouseCoords[0] + 10;
                }
                let x = xCo;
                let yCo = 0;
                if (mouseCoords[0] + 10 >= width * 0.80) {
                    yCo = mouseCoords[1] + 10;
                } else {
                    yCo = mouseCoords[1];
                }
                x = xCo;
                y = yCo;
                return "translate(" + x + "," + y + ")";
            });
    });
    rect.on("mouseout", function() {
        // let currentEl = d3.select(this);
        d3.select("#recttooltip_" + mainDivName)
            .style("opacity", function() {
                return 0;
            })
            .attr("transform", function(d, i) {
                // klutzy, but it accounts for tooltip padding which could push it onscreen
                let x = -500;
                let y = -500;
                return "translate(" + x + "," + y + ")";
            });
    });

    // Stacked -> Etiqueta Eje X
    svg.select(".stackedBar").append("g")
        .attr("transform", "translate(0," + (currentHeight - margin.bottom) + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", currentWidth / 2)
        .attr("y", margin.bottom + 20)
        .attr("dx", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Puntuación Total");

    let ele = svg.select(".stackedBar").append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));
    ele.selectAll("text")

    // Stacked -> Etiqueta Eje Y
    ele.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (currentHeight / 2))
        .attr("y", 5 - (margin.left))
        .attr("dy", "0.1em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Estados");

    let rectTooltipg = svg.select(".stackedBar").append("g")
        .attr("font-family", 'Noto Sans SC')
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .attr("id", "recttooltip_" + mainDivName)
        .attr("style", "opacity:0")
        .attr("transform", "translate(-500,-500)");

    rectTooltipg.append("rect")
        .attr("id", "recttooltipRect_" + mainDivName)
        .attr("x", 0)
        .attr("width", 120)
        .attr("height", 80)
        .attr("opacity", 0.71)
        .style("fill", "#000000");

    rectTooltipg
        .append("text")
        .attr("id", "recttooltipText_" + mainDivName)
        .attr("x", 30)
        .attr("y", 15)
        .attr("fill", function() {
            return "#fff"
        })
        .style("font-size", function(d) {
            return 10;
        })
        .style("font-family", function(d) {
            return 'Noto Sans SC';
        })
        .text(function(d, i) {
            return "";
        });

    /* let colorLegend = d3.legendColor()
        .scale(z)
        .shapePadding(6.24)
        .shapeWidth(25)
        .shapeHeight(25)
        .labelOffset(5);
    let colorLegendG = svg.select(".stackedBar").append("g")
        .attr("class", "color-legend")
        .attr("transform", "translate(100, 100)")
    colorLegendG.call(colorLegend); */
    // Move the text down a bit.
    //colorLegendG.selectAll("text").attr("y", 4);

    let textTotal = svg.select(".stackedBar").selectAll(".text")
        .data(dataStacked, d => d.Entidad);

    //textTotal.exit().remove();
    textTotal.enter().append("text")
        .attr("class", "text")
        .attr("text-anchor", "start")
        .merge(textTotal)
        .attr("font-size", 12)
        .attr("y", d => y(d.Entidad) + y.bandwidth() / 1.5)
        .attr("x", d => x(d.total) + 5)
        .text(d => d.total);

    let helpers = {
        getDimensions: function(id) {
            let el = document.getElementById(id);
            let w = 0,
                h = 0;
            if (el) {
                let dimensions = el.getBBox();
                w = dimensions.width;
                h = dimensions.height;
            } else {
                console.log("error: getDimensions() " + id + " not found.");
            }
            return {
                w: w,
                h: h
            };
        }
    };
    /*
        FIN --> chartStackedBar
    */
    ///////////////////////////////////////////////
    /*
        INICIO --> chart MAX y MIN
    */
    dataMaxMinNormatividad = [];
    dataMaxMinInfraestructura = [];
    dataMaxMinCapitalHumano = [];
    dataMaxMinMapeoGestion = [];
    dataMaxDevMinMecanismos = [];
    // Categorias Max

    let maxNormatividad = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajenormatividad.$t), x])).values()].sort(function (a, b) {
        return d3.descending(+a.gsx$puntajenormatividad.$t, +b.gsx$puntajenormatividad.$t);
    }).slice(0, 3);

    let minNormatividad = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajenormatividad.$t), x])).values()].sort(function (a, b) {
        return d3.ascending(+a.gsx$puntajenormatividad.$t, +b.gsx$puntajenormatividad.$t);
    }).slice(0, 3);

    let maxInfraestructura = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajeinfraestructura.$t), x])).values()].sort(function (a, b) {
        return d3.descending(+a.gsx$puntajeinfraestructura.$t, +b.gsx$puntajeinfraestructura.$t);
    }).slice(0, 3);
    let minInfraestructura = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajeinfraestructura.$t), x])).values()].sort(function (a, b) {
        return d3.ascending(+a.gsx$puntajeinfraestructura.$t, +b.gsx$puntajeinfraestructura.$t);
    }).slice(0, 3);

    let maxCapitalHumano = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajecapitalhumano.$t), x])).values()].sort(function (a, b) {
        return d3.descending(+a.gsx$puntajecapitalhumano.$t, +b.gsx$puntajecapitalhumano.$t);
    }).slice(0, 3);
    let minCapitalHumano = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajecapitalhumano.$t), x])).values()].sort(function (a, b) {
        return d3.ascending(+a.gsx$puntajecapitalhumano.$t, +b.gsx$puntajecapitalhumano.$t);
    }).slice(0, 3);

    let maxMapeoGestion = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajemapeoygestióndedatos.$t), x])).values()].sort(function (a, b) {
        return d3.descending(+a.gsx$puntajemapeoygestióndedatos.$t, +b.gsx$puntajemapeoygestióndedatos.$t);
    }).slice(0, 3);
    let minMapeoGestion = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajemapeoygestióndedatos.$t), x])).values()].sort(function (a, b) {
        return d3.ascending(+a.gsx$puntajemapeoygestióndedatos.$t, +b.gsx$puntajemapeoygestióndedatos.$t);
    }).slice(0, 3);

    let maxDevMecanismos = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajedesarrollodemecanismosdecomunicación.$t), x])).values()].sort(function (a, b) {
        return d3.descending(+a.gsx$puntajedesarrollodemecanismosdecomunicación.$t, +b.gsx$puntajedesarrollodemecanismosdecomunicación.$t);
    }).slice(0, 3);
    let minDevMecanismos = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajedesarrollodemecanismosdecomunicación.$t), x])).values()].sort(function (a, b) {
        return d3.ascending(+a.gsx$puntajedesarrollodemecanismosdecomunicación.$t, +b.gsx$puntajedesarrollodemecanismosdecomunicación.$t);
    }).slice(0, 3);

    /* console.log(minNormatividad);
    console.log(minInfraestructura);
    console.log(minCapitalHumano);
    console.log(minMapeoGestion);
    console.log(minDevMecanismos);  */

    //console.log(catMax1);
    dataset.forEach((d) => {
        let tempDataset = d;
        //console.log(tempDataset.gsx$estado.$t);
        maxNormatividad.forEach(function (d, index) {
            //console.log(index);
            if (d.gsx$puntajenormatividad.$t === tempDataset.gsx$puntajenormatividad.$t) {
                //console.log(tempDataset.gsx$puntajenormatividad.$t);
                //console.log(d);
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajenormatividad.$t),
                    tipoCat: 'max'
                };
                dataMaxMinNormatividad.push(tempData);
            }
        });
        minNormatividad.forEach(function (d, index) {
            //console.log(index);
            if (d.gsx$puntajenormatividad.$t === tempDataset.gsx$puntajenormatividad.$t) {
                //console.log(tempDataset.gsx$puntajenormatividad.$t);
                //console.log(d);
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajenormatividad.$t),
                    tipoCat: 'min'
                };
                dataMaxMinNormatividad.push(tempData);
            }
        });
        maxInfraestructura.forEach(function (d, index) {
            //console.log(index);
            if (d.gsx$puntajeinfraestructura.$t === tempDataset.gsx$puntajeinfraestructura.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajeinfraestructura.$t),
                    tipoCat: 'max'
                };
                dataMaxMinInfraestructura.push(tempData);
            }
        });
        minInfraestructura.forEach(function (d, index) {
            //console.log(index);
            if (d.gsx$puntajeinfraestructura.$t === tempDataset.gsx$puntajeinfraestructura.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajeinfraestructura.$t),
                    tipoCat: 'min'
                };
                dataMaxMinInfraestructura.push(tempData);
            }
        });
        maxCapitalHumano.forEach(function (d, index) {
            if (d.gsx$puntajecapitalhumano.$t === tempDataset.gsx$puntajecapitalhumano.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajecapitalhumano.$t),
                    tipoCat: 'max'
                };
                dataMaxMinCapitalHumano.push(tempData);
            }
        });
        minCapitalHumano.forEach(function (d, index) {
            //console.log(index);
            if (d.gsx$puntajecapitalhumano.$t === tempDataset.gsx$puntajecapitalhumano.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajecapitalhumano.$t),
                    tipoCat: 'min'
                };
                dataMaxMinCapitalHumano.push(tempData);
            }
        });
        maxMapeoGestion.forEach(function (d, index) {
            //console.log(d);
            if (d.gsx$puntajemapeoygestióndedatos.$t === tempDataset.gsx$puntajemapeoygestióndedatos.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajemapeoygestióndedatos.$t),
                    tipoCat: 'max'
                };
                dataMaxMinMapeoGestion.push(tempData);
            }
        });
        minMapeoGestion.forEach(function (d, index) {
            //console.log(d);
            if (d.gsx$puntajemapeoygestióndedatos.$t === tempDataset.gsx$puntajemapeoygestióndedatos.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajemapeoygestióndedatos.$t),
                    tipoCat: 'min'
                };
                dataMaxMinMapeoGestion.push(tempData);
            }
        });
        maxDevMecanismos.forEach(function (d, index) {
            //console.log(index);
            if (d.gsx$puntajedesarrollodemecanismosdecomunicación.$t === tempDataset.gsx$puntajedesarrollodemecanismosdecomunicación.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajedesarrollodemecanismosdecomunicación.$t),
                    tipoCat: 'max'
                };
                dataMaxDevMinMecanismos.push(tempData);
            }
        });
        minDevMecanismos.forEach(function (d, index) {
            //console.log(index);
            if (d.gsx$puntajedesarrollodemecanismosdecomunicación.$t === tempDataset.gsx$puntajedesarrollodemecanismosdecomunicación.$t) {
                let tempData = {};
                //console.log(tempDataset.gsx$estado.$t)
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajedesarrollodemecanismosdecomunicación.$t),
                    tipoCat: 'min'
                };
                dataMaxDevMinMecanismos.push(tempData);
            }
        });
    });
    /*
        FIN --> chartMaxMin
    */
    ///////////////////////////////////////////////
    /*
        INICIO --> chartPictogram
    */
   let dataPictogram = [];
   dataset.forEach(function(d) {
        let tempData = {
            entidad: d.gsx$estado.$t,
            'emp': Number.parseFloat(d.gsx$puntajenormatividad.$t),
            'emp_pc': Number.parseFloat(d.gsx$puntajenormatividad.$t),
            /* 'Capital humano': Number.parseFloat(d.gsx$puntajecapitalhumano.$t),
            'Mapeo y gestión de datos': Number.parseFloat(d.gsx$puntajemapeoygestióndedatos.$t),
            'Desarrollo de mecanismos de comunicación': Number.parseFloat(d.gsx$puntajedesarrollodemecanismosdecomunicación.$t),
            total: Number.parseFloat(d.gsx$puntajetotal.$t) */
        };
        dataPictogram.push(tempData);
    });
    console.log(dataPictogram)
    ready(dataPictogram);

}

function mouseOver2(d, i) {
    d3.select(this)
        .transition('mouseover').duration(100)
        .attr('opacity', 1)
        .attr('stroke-width', 3)
        .attr('stroke', '#000')

    d3.select('#tooltip')
        .style('left', (d3.event.pageX + 10) + 'px')
        .style('top', (d3.event.pageY - 25) + 'px')
        .style('display', 'inline-block')
        .html(`<strong>Estado:</strong> ${d.entidad[0] + d.entidad.slice(1,)} 
            <br> <strong>Puntuación:</strong> ${d.puntajeTop}`)
}

function mouseOut2(d, i) {
    d3.select('#tooltip')
        .style('display', 'none')

    d3.select(this)
        .transition('mouseout').duration(100)
        .attr('stroke-width', 0)
}

function chartMaxMin(data, classObject, colorBase) {
    let categories = ['max', 'min'];
    let categoriesXY = {'max': [100, 580], 'min': [500, 580]};
    let svg = d3.select("#vis").select('svg');
    svg.select(`.${classObject}`).remove();
    let dataset = data;
    let colorBurbujas = colorBase;
    //tempEscala = d3.scaleLinear(dataset)
    tempSimulation = d3.forceSimulation(dataset)
    tempSimulation.on('tick', () => {
        tempNodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
    })
    tempNodes = svg
        .append("g")
        .attr('class', classObject)
        .attr('visibility', 'visible')
        .selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('r', 5)
        /*.attr('cx', (d, i) => (d.puntajeTop)) */
    svg.select(`.${classObject}`).selectAll('.lab-text')
        .data(categories).enter()
        .append('text')
        .attr('class', 'lab-text')
        .style('pointer-events', 'none')
        .attr('opacity', 1)
        .raise()
    svg.select(`.${classObject}`).selectAll('.lab-text')
        .attr('font-family', 'Noto Sans SC')
        .attr('font-size', '0.9375rem')
        .attr('fill', 'black')
        .attr('text-anchor', 'middle');
    
    let max = d3.max(dataset, d => d.puntajeTop)
    let domainData = d3.scaleLinear()
        .domain([0, max])
        .ticks(6);
    //console.log(domainData);
    let indexToColor = d3.scaleLinear()
        .domain([0, 10])
        .range(['#D3D3D3', colorBurbujas]);
    let range = d3.range(domainData.length).map(indexToColor);
    // Escala de colores
    let dataLegend = [];
    domainData.forEach(function (d, index) {
        //console.log(d);
        let tempData = '';
        tempData = {"color": range[index], "value": domainData[index]}
        dataLegend.push(tempData);
    });

    let extent = d3.extent(dataLegend, d => d.value);
    let padding = 9;
    let width = 320;
    let innerWidth = width - (padding * 5);
    let barHeight = 12;

    let xScale = d3.scaleLinear()
        .range([0, innerWidth])
        .domain(extent);

    let xTicks = dataLegend.map(d => d.value);

    let xAxis = d3.axisBottom(xScale)
        .tickSize(barHeight * 2)
        .tickValues(xTicks);

    let g2 = svg.select(`.${classObject}`)
        .append("g")
        .attr("transform", "translate(360, 630)")
        .attr('class', 'leyendas');
    
    let defs = svg.select(`.${classObject}`).append("defs");
    let linearGradient = defs.append("linearGradient").attr("id", `${classObject}`);
    linearGradient.selectAll("stop")
        .data(dataLegend)
        .enter().append("stop")
        .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
        .attr("stop-color", d => d.color);

    g2.append("rect")
        .attr("width", innerWidth)
        .attr("height", barHeight)
        .style("fill", `url(#${classObject})`);

    g2.append("g")
        .call(xAxis)
        .select(".domain").remove();
    // Termina escala de colores    
    //console.log(range)
    let domainFill = d3.scaleQuantile()
        .range(range)
        .domain(domainData);

    svg.select(`.${classObject}`).selectAll('circle')
        .transition().duration(500).delay((d, i) => i * 50)
        .attr('r', d => (Math.sqrt(d.puntajeTop) + 5) * 4)
        .attr('opacity', 0.8)
        .attr('fill', d => {
            //categoryColorScale(d.tipoCat)
            let value = d.puntajeTop;
            return value ? domainFill(value):"#D3D3D3";
        });

    svg.select(`.${classObject}`).selectAll('.lab-text').transition().duration(300).delay((d, i) => i * 30)
        .text(d => {
            return d === 'max' ? 'Mayor puntaje' :
                d === 'min' ? 'Menor puntaje' :
                '?';
        })
        // posicionan las burbujas y titulos
        .attr('x', d => categoriesXY[d][0] + 200)
        .attr('y', d => categoriesXY[d][1])
        .attr('opacity', 1);
    
    //console.log(range);   
    svg.select(`.${classObject}`).selectAll('circle')
        .on('mouseover', mouseOver2)
        .on('mouseout', mouseOut2);
    
    tempSimulation
        /* .force('charge', d3.forceManyBody().strength([2])) */
        // posicionan las burbujas y titulos
        .force('x', d3.forceX(d => categoriesXY[d.tipoCat][0] + 200))
        .force('y', d3.forceY(d => categoriesXY[d.tipoCat][1] - 250))
        .force('collide', d3.forceCollide(d => ((Math.sqrt(d.puntajeTop) + 5) * 4)))
        .alphaDecay([0.02]);
    tempSimulation.restart();
    document.getElementById('vis').style.display = "block";
}

//Cleaning Function
function clean(chartType) {
    let svg = d3.select('#vis').select('svg')
    if (chartType !== "chartStackedBar") {
        svg.select('.stackedBar').transition().attr('visibility', 'hidden');
    }
    if (chartType !== "chartBurbujas") {
        svg.selectAll('.burbujas').transition().attr('visibility', 'hidden');
    }
    if (chartType !== "chartMexicoPuntuacion") {
        svg.select('.mapa').transition().attr('visibility', 'hidden');
        svg.select('.leyendas').transition().attr('visibility', 'hidden');
    }
    if (chartType !== "chartNormatividad") {
        svg.select('.chartNormatividad').transition().attr('visibility', 'hidden');
    }
    //// CHARTs MAX Y MIN
    if (chartType !== "chartInfraestructura") {
        svg.select('.chartInfraestructura').transition().attr('visibility', 'hidden');
    }
    if (chartType !== "chartCapitalHumano") {
        svg.select('.chartCapitalHumano').transition().attr('visibility', 'hidden');
    }
    if (chartType !== "chartMapeoGestion") {
        svg.select('.chartMapeoGestion').transition().attr('visibility', 'hidden');
    }
    if (chartType !== "chartDevMecanismos") {
        svg.select('.chartDevMecanismos').transition().attr('visibility', 'hidden');
    }
    if (chartType !== "tablaScore") {
        document.getElementById("tablaScore").style.display = "none";
    }
    if (chartType !== "table-container") {
        document.getElementById("pictograma").style.display = "none";
    }
}

function createTabla(data) {
    let idShow = 'tablaScore';
    clean(idShow);

    let sortData = data.sort(function (a, b) {
        return d3.descending(+a.gsx$puntajetotal.$t, +b.gsx$puntajetotal.$t);
    });
    //console.log(sortData);
    let targetNode = document.getElementById('tablaData');
    // limpia los elementos de la tablas
    targetNode.innerHTML = '';
    sortData.forEach(function (d) {
        let barraNor = d.gsx$porcentajenormatividad.$t > 0 ? `<div class="barraNor progress-bar" aria-valuenow="${d.gsx$porcentajenormatividad.$t}" aria-valuemin="0" aria-valuemax="100"><small>${d.gsx$porcentajenormatividad.$t}%</small></div>`
            :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d.gsx$porcentajenormatividad.$t}" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;

        let barraInf =  d.gsx$porcentajeinfraestructura.$t > 0 ? `<div class="barraInf progress-bar" aria-valuenow="${d.gsx$porcentajeinfraestructura.$t}" aria-valuemin="0" aria-valuemax="100"><small>${d.gsx$porcentajeinfraestructura.$t}%</small></div>`
            :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d.gsx$porcentajeinfraestructura.$t}"><small>0%</small></div>`;

        let barraMGD = d.gsx$porcentajemapeoygestióndedatos.$t > 0 ? `<div class="barraGD progress-bar" role="progressbar" aria-valuenow="${d.gsx$porcentajemapeoygestióndedatos.$t}" aria-valuemin="0" aria-valuemax="100"><small>${d.gsx$porcentajemapeoygestióndedatos.$t}%</small></div>`
            :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d.gsx$porcentajemapeoygestióndedatos.$t}" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;

        let barraCH = d.gsx$porcentajecapitalhumano.$t > 0 ? `<div class="barraCH progress-bar" role="progressbar" aria-valuenow="${d.gsx$porcentajecapitalhumano.$t}" aria-valuemin="0" aria-valuemax="100"><small>${d.gsx$porcentajecapitalhumano.$t}%</small></div>`
            :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d.gsx$porcentajecapitalhumano.$t}" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;

        let barraDMC = d.gsx$porcentajedesarrollodemecanismosdecomunicación.$t > 0 ? `<div class="barraMC progress-bar" role="progressbar" aria-valuenow="${d.gsx$porcentajedesarrollodemecanismosdecomunicación.$t}" aria-valuemin="0" aria-valuemax="100"><small>${d.gsx$porcentajedesarrollodemecanismosdecomunicación.$t}%</small></div>`
            :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d.gsx$porcentajedesarrollodemecanismosdecomunicación.$t}" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;

        targetNode.innerHTML += `
        <tr>
            <td>
                <small>${d.gsx$estado.$t}</small>
            </td>
            <td>
                <div class="progress" style="height: 15px;">
                    ${barraNor}
                </div>
            </td>
            <td>
                <div class="progress" style="height: 15px;">
                    ${barraInf}            
                </div>
            </td>
            <td>
                <div class="progress" style="height: 15px;">
                    ${barraCH}    
                </div>
            </td>
            <td>
                <div class="progress" style="height: 15px;">
                    ${barraMGD}    
                </div>
            </td>
            <td>
                <div class="progress" style="height: 15px;">
                    ${barraDMC}
                </div>
            </td>
        </tr>
      `
    });
    $("#tablaScore .progress div").each(function () {
        let display = $(this),
            nextValue = $(this).attr("aria-valuenow");
        if (nextValue !== "0") {
            $(display).css("color", "#fff").animate({
                "width": nextValue + "%"
            }, 900);
        }
    });
}
function chartStackedBar() {
    document.getElementById('vis').style.display = "block";
    clean('chartStackedBar');
    let svg = d3.select("#vis").select('svg');   
    svg.select('.stackedBar').attr('visibility', 'visible');
}

function chartTabla() {
    let classShow = 'tablaScore';
    clean(classShow);
    document.getElementById(classShow).style.display = "block";
    document.getElementById('vis').style.display = "none";
}

function chartPictogram() {
    let classShow = 'table-container';
    clean(classShow);
    document.getElementById('pictograma').style.display = "block";
    document.getElementById('vis').style.display = "none";
}

function chartNormatividad() {
    let classShow = 'chartNormatividad';
    clean(classShow);
    let colorBurbujas = colorsCategorias[0];
    chartMaxMin(dataMaxMinNormatividad, classShow, colorBurbujas);
    //dataMaxMinNormatividad = [];
}

function chartInfraestructura() {
    let classShow = 'chartInfraestructura';
    clean(classShow);
    let colorBurbujas = colorsCategorias[1];
    chartMaxMin(dataMaxMinInfraestructura, classShow, colorBurbujas);
    //dataMaxMinInfraestructura = [];
}

function chartCapitalHumano() {
    let classShow = 'chartCapitalHumano';
    clean(classShow);
    let colorBurbujas = colorsCategorias[2];
    chartMaxMin(dataMaxMinCapitalHumano, classShow, colorBurbujas);
}

function chartMapeoGestion() {
    let classShow = 'chartMapeoGestion';
    clean(classShow);
    let colorBurbujas = colorsCategorias[3];
    chartMaxMin(dataMaxMinMapeoGestion, classShow, colorBurbujas);
}

function chartDevMecanismos() {
    let classShow = 'chartDevMecanismos';
    clean(classShow);
    let colorBurbujas = colorsCategorias[4];
    chartMaxMin(dataMaxDevMinMecanismos, classShow, colorBurbujas);
}

// Mapa MEX 
function chartMexicoPuntuacion() {
    clean('chartMexicoPuntuacion');
    let svg = d3.select("#vis").select('svg');
    svg.attr('display', 'block');
    document.getElementById('vis').style.display = "block";
    svg.selectAll('.entidad')
        .attr("fill", function (d) {
            switch (true) {
                case d.properties.calificacion > 90:
                    d.color = '#3887a8';
                    return '#3887a8';
                case  d.properties.calificacion > 80:
                    d.color = '#519ebe';
                    return '#519ebe';
                case  d.properties.calificacion > 70:
                    d.color = '#58accf';
                    return '#58accf';
                case  d.properties.calificacion > 60:
                    d.color = '#adccd9';
                    return '#adccd9';
                case  d.properties.calificacion > 50:
                    d.color = '#efbcbd';
                    return '#efbcbd';
                case  d.properties.calificacion > 40:
                    d.color = '#f49899';
                    return '#f49899';
                case  d.properties.calificacion > 30:
                    d.color = '#f06c6e';
                    return '#f06c6e';
                case  d.properties.calificacion > 20:
                    d.color = '#cb5859';
                    return '#cb5859';
                case  d.properties.calificacion > 10:
                    d.color = '#b64547';
                    return '#b64547';
                case  d.properties.calificacion >= 0:
                    d.color = '#b64547';
                    return '#b64547';
            }
            return d.color;
        })
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", 0.8)
        .attr("stroke", "#666666");
    svg.select('.mapa').transition().duration(300).delay((d, i) => i * 30)
        .attr('visibility', 'visible');
    svg.select('.leyendas').transition().duration(300).attr('visibility', 'visible');
}

document.addEventListener("DOMContentLoaded", function() {
    /* let elements = document.querySelectorAll('.sticky'); */
    /* Stickyfill.add(elements); */
    window.scrollTo(0, 0);
    new Tablesort(document.getElementById('tablaScore'));
    let selectElement = document.getElementById('selectTrimestre');
    selectElement.addEventListener('change', (event) => {
        // agrega copys a las secciones
        document.getElementById("copy1").innerHTML = '';
        document.getElementById("copy1").append(event.target.options[event.target.selectedIndex].dataset.copy1);

        document.getElementById("copy4").innerHTML = '';
        document.getElementById("copy4").append(event.target.options[event.target.selectedIndex].dataset.copy4);
        document.getElementById("copy5").innerHTML = '';

        document.getElementById("copy5").append(event.target.options[event.target.selectedIndex].dataset.copy5);
        document.getElementById("copy6").innerHTML = '';

        document.getElementById("copy6").append(event.target.options[event.target.selectedIndex].dataset.copy6);
        document.getElementById("copy7").innerHTML = '';

        document.getElementById("copy7").append(event.target.options[event.target.selectedIndex].dataset.copy7);
        document.getElementById("copy8").innerHTML = '';
        document.getElementById("copy8").append(event.target.options[event.target.selectedIndex].dataset.copy8);

        fetch(event.target.value)
        .then(response => response.json())
        .then(data => {
            //console.log(data);
            createScales(data.feed.entry);
            createTabla(data.feed.entry);
            //setTimeout(drawInitial(data.feed.entry), 100);
            drawInitial(data.feed.entry);
        });
    });
    
});

