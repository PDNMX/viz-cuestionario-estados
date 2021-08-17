let mexico, svg
let sizeScale
let simulation, nodes;

var dataMaxMinInfraestructura = [];
var dataMaxMinNormatividad = [];
var dataMaxMinCapitalHumano = [];
var dataMaxMinMapeoGestion = [];
var dataMaxDevMinMecanismos = [];

var dataPictogram = [];


// Colores base para categorias 
// Normatividad, Infraestructura, Capital Humano, Mapeo y gestión, Dev Mecanismos de comunicación
const colorsCategorias = ['#34B3EB', '#34a853', '#674ea7', '#ff6d01', '#fbbc04'];

Promise.all([
    // dataset de trimestres
    fetch('https://raw.githubusercontent.com/ch3k0/temp-data/master/reportes-edos.json'),
    //fetch('https://spreadsheets.google.com/feeds/list/1x17q4Ny8ENBniRT0WrlIVLU7LEs2fU1u7q2rxEypMNg/1/public/values?alt=json'),
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
            drawInitial(data.feed.entry);
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
    let divVis = document.getElementById('vis');
    divVis.innerHTML = '';
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
            $('#modalTitle').text(d.properties.entidad);
            $('#modalHeader').css('background-color', d.color);
            $('#mapaModal').modal('toggle');
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
   let topData = dataset.sort(function (a, b) {
        return d3.descending(+a.gsx$puntajetotal.$t, +b.gsx$puntajetotal.$t);
    }).slice(0, 10);
    //console.log("topData:", topData);

    let tableTop10 = document.getElementById('tableTop10');
    tableTop10.innerHTML = '';
    topData.forEach(function (d) {
        let estado = d.gsx$estado.$t
        let puntaje = d.gsx$puntajetotal.$t;
        tableTop10.innerHTML += `<tr class="table-light">
         <td>${estado}</td>
         <td>${puntaje}</td>
       </tr>`
    });

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
        let txtTotal;
        switch (tooltipData.key) {
            case 'Normatividad':
            case 'Capital humano':
              txtTotal = 10;
              break;
            case 'Infraestructura':
                txtTotal = 20;
              break;
            case 'Mapeo y gestión de datos':
            case 'Desarrollo de mecanismos de comunicación':
                txtTotal = 30;
              break;
        }
        d3.selectAll("#recttooltipText_" + mainDivName).append("tspan").attr("x", 0).attr("y", 2).attr("dy", "1.9em").text(tooltipData.key + ":  " + tooltipData.value + " de " + txtTotal);
        yPos = yPos + 1;
        //CBT:calculate width of the text based on characters
        let dims = helpers.getDimensions("recttooltipText_" + mainDivName);
        d3.selectAll("#recttooltipText_" + mainDivName + " tspan")
            .attr("x", dims.w + 4);

        d3.selectAll("#recttooltipRect_" + mainDivName)
            .attr("width", dims.w + 10)
            .attr("height", dims.h + 20);
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
        .text("Puntaje Total");

    let ele = svg.select(".stackedBar").append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));
    ele.selectAll("text")

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
        .attr("font-family", 'Noto Sans SC')
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

    let textTotal = svg.select(".stackedBar").selectAll(".text")
        .data(dataStacked, d => d.Entidad);

    //textTotal.exit().remove();
    textTotal.enter().append("text")
        .attr("text-anchor", "start")
        .merge(textTotal)
        .attr("font-family", 'Noto Sans SC')
        .attr("font-size", 8)
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
        INICIO --> chartPictogram
    */
   dataPictogram = [];
   dataset.forEach(function(d) {
        let tempData = {
            'entidad': d.gsx$estado.$t,
            'cat1': Number.parseFloat(d.gsx$puntajenormatividad.$t),
            'cat1_dif': Number.parseFloat(d.gsx$difnormatividad.$t),
            'cat2': Number.parseFloat(d.gsx$puntajeinfraestructura.$t),
            'cat2_dif': Number.parseFloat(d.gsx$difinfra.$t),
            'cat3': Number.parseFloat(d.gsx$puntajecapitalhumano.$t),
            'cat3_dif': Number.parseFloat(d.gsx$difcapitalh.$t),
            'cat4': Number.parseFloat(d.gsx$puntajemapeoygestióndedatos.$t),
            'cat4_dif': Number.parseFloat(d.gsx$difmapeo.$t),
            'cat5': Number.parseFloat(d.gsx$puntajedesarrollodemecanismosdecomunicación.$t),
            'cat5_dif': Number.parseFloat(d.gsx$difdev.$t)
        };
        dataPictogram.push(tempData);
    });
    

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

function chartNormatividad() {
    let classShow = 'chartNormatividad';
    clean(classShow);
    chartPictograma(dataPictogram, 'cat1');
    document.getElementById('pictograma').style.display = "block";
    document.getElementById('vis').style.display = "none";
}

function chartInfraestructura() {
    let classShow = 'chartInfraestructura';
    clean(classShow);
    chartPictograma(dataPictogram, 'cat2');
    document.getElementById('pictograma').style.display = "block";
    document.getElementById('vis').style.display = "none";
    //dataMaxMinInfraestructura = [];
}

function chartCapitalHumano() {
    let classShow = 'chartCapitalHumano';
    clean(classShow);
    chartPictograma(dataPictogram, 'cat3');
    document.getElementById('pictograma').style.display = "block";
    document.getElementById('vis').style.display = "none";
}

function chartMapeoGestion() {
    let classShow = 'chartMapeoGestion';
    clean(classShow);
    chartPictograma(dataPictogram, 'cat4');
    document.getElementById('pictograma').style.display = "block";
    document.getElementById('vis').style.display = "none";
}

function chartDevMecanismos() {
    let classShow = 'chartDevMecanismos';
    clean(classShow);
    chartPictograma(dataPictogram, 'cat5');
    document.getElementById('pictograma').style.display = "block";
    document.getElementById('vis').style.display = "none";
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
        //lastValue = theSelect.options[theSelect.options.length - 1].value;
        console.log(selectElement.options[selectElement.options.length - 1].value)
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
    $('#modalTitle').text('Aviso');
    $('#mapaModal').modal('toggle');
    $(document).on('hidden.bs.modal', '#mapaModal', function () {
        document.getElementById('txtAviso').innerHTML = '';
    });
    
});

