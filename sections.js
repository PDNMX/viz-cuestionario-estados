let dataset, mexico, svg
let salarySizeScale, salaryXScale
let simulation, nodes
let categoryLegend, salaryLegend

const margin = {
    left: 170,
    top: 80,
    bottom: 50,
    right: 20
}
const width = 1000 - margin.left - margin.right
const height = 950 - margin.top - margin.bottom

Promise.all([
    fetch('https://spreadsheets.google.com/feeds/list/1fGCwueHVG-26Fwn0aLBN_wrpsD_aNfMWqrKN4y-MGIE/1/public/values?alt=json'),
    fetch('data/map.topojson')
  ]).then(async([aa, bb]) => {
    const a = await aa.json();
    const b = await bb.json();
    return [a, b]
  })
  .then((responseText) => {
    //console.log(responseText[0]);
    //console.log(responseText[1]);
    dataset = responseText[0].feed.entry;
    mexico = responseText[1];
    createScales()
    setTimeout(drawInitial(), 100);
  }).catch((err) => {
    console.log(err);
}); 

const categories = ['maxNormatividad', 'maxInfraestructura', 'maxCapitalHumano', 'maxMapeoGestion', 'maxDevMecanismos', 'minNormatividad', 'minInfraestructura', 'minCapitalHumano', 'minMapeoGestion', 'minDevMecanismos']

const categoriesXY = {'maxNormatividad': [0, 800, 57382, 23.9],
        'maxInfraestructura': [0, 600, 43538, 48.3],
        'maxCapitalHumano': [0, 400, 41890, 50.9],
        'maxMapeoGestion': [0, 200, 42200, 48.3],
        'maxDevMecanismos': [300, 400, 42745, 31.2],
        'minNormatividad': [300, 600, 36900, 40.5],
        'minInfraestructura': [300, 200, 36342, 35.0],
        'minCapitalHumano': [600, 200, 33062, 60.4],
        'minMapeoGestion': [600, 400, 36825, 79.5],
        'minDevMecanismos': [600, 600, 37344, 55.4],}


const colors = ['#ffcc00', '#ff6666', '#cc0066', '#66cccc', '#f688bb', '#65587f', '#baf1a1', '#333333', '#75b79e',  '#66cccc', '#9de3d0', '#f1935c', '#0c7b93', '#eab0d9', '#baf1a1', '#9399ff']
 
function createScales() {
    salarySizeScale = d3.scaleLinear(d3.extent(dataset, d => d.gsx$puntajetotal.$t), [5, 35])
    salaryXScale = d3.scaleLinear(d3.extent(dataset, d => d.gsx$puntajetotal.$t), [margin.left, margin.left + width])
    salaryYScale = d3.scaleLinear([20000, 110000], [margin.top + height, margin.top]);
    categoryColorScale = d3.scaleOrdinal(categories, colors);
}

function createLegend(x, y){
    let svg = d3.select('#legend')

    svg.append('g')
        .attr('class', 'categoryLegend')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend = d3.legendColor()
                            .shape('path', d3.symbol().type(d3.symbolCircle).size(150)())
                            .shapePadding(10)
                            .scale(categoryColorScale)
    
    d3.select('.categoryLegend')
        .call(categoryLegend)
}

/* function createChartLegend(mainDiv, group) {
    let z = d3.scaleOrdinal(d3.schemeCategory10);
    let mainDivName = mainDiv.substr(1, mainDiv.length);
    $(mainDiv).before("<div id='Legend_" + mainDivName + "' class='pmd-card-body' style='position: absolute; margin-top:0; margin-bottom:0;'></div>");
    let keys = group;
    keys.forEach(function(d) {
        let cloloCode = z(d);
        $("#Legend_" + mainDivName).append("<span class='team-graph team1' style='display: inline-block; margin-right:10px;'>\
              <span style='background:" + cloloCode +
            ";width: 10px;height: 10px;display: inline-block;vertical-align: middle;'>&nbsp;</span>\
              <span style='padding-top: 0;font-family:Source Sans Pro, sans-serif;font-size: 13px;display: inline;'>" + d +
            " </span>\
          </span>");
    });
} */

function drawInitial() {
    let svg = d3.select("#vis")
        .append('svg')
        .attr('width', 1000)
        .attr('height', 950)
        .attr('opacity', 1)

    /*
        INICIO --> chartBurbujas
    */
   // Filtra el top 10 con mayor puntuación
   let topData = dataset.sort(function(a, b) {
        return d3.descending(+a.gsx$puntajetotal.$t, +b.gsx$puntajetotal.$t);
    }).slice(0, 10);

    //console.log(topData)

    simulation = d3.forceSimulation(topData)
    // Define each tick of simulation
    simulation.on('tick', () => {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
        labels
            .attr('x', d => d.x)
            .attr('y', d => d.y)
    }).force('forceX', d3.forceX(500))
    .force('forceY', d3.forceY(500))
    .force('collide', d3.forceCollide(d => salarySizeScale(d.gsx$puntajetotal.$t) * 2.9))
    .alpha(0.6).alphaDecay(0.05);
    // Stop the simulation until later
    
    simulation.stop()
    // Selection of all the circles 
    
    nodes = svg
        .append("g")
        .attr('class', 'burbujas')
        .attr('visibility', 'hidden')
        .selectAll('circle')
        .data(topData)
        .enter()
        .append('circle')
        .attr('r', d => salarySizeScale(d.gsx$puntajetotal.$t) * 2.8)
        .attr('fill', '#34b3eb');
        /* .attr('cx', (d, i) => salaryXScale(d.PuntacionTotal))
        .attr('cy', (d, i) => i * 10); */
    
    //console.log(topData)
    labels = svg.select('.burbujas').selectAll('circle')
        .data(topData, (d) => {
            //console.log(d);
            return d.loquesea;
        })
        .enter()
        .append('text')
        .text(d => d.gsx$estado.$t)
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .style("font-size", function(d) { return Math.min(2 * d.gsx$puntajetotal.$t, (2 * d.gsx$puntajetotal.$t - 8) / this.getComputedTextLength() * 10) + "px"; })
        .attr("dy", ".35em");
        

    // Add mouseover and mouseout events for all circles
    // Changes opacity and adds border
    svg.select('.burbujas').selectAll('circle')
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)

    function mouseOver(d, i) {
        //console.log('hi')
        d3.select(this)
            .transition('mouseover').duration(100)
            .attr('opacity', 1)
            .attr('stroke-width', 5)
            .attr('stroke', 'black')

        d3.select('#tooltip')
            .style('left', (d3.event.pageX + 10) + 'px')
            .style('top', (d3.event.pageY - 25) + 'px')
            .style('display', 'inline-block')
            .html(`<strong>Estado:</strong> ${d.gsx$estado.$t[0] + d.gsx$estado.$t.slice(1,).toLowerCase()} 
                <br> <strong>Puntuación:</strong> ${d.gsx$puntajetotal.$t}`)
    }

    function mouseOut(d, i) {
        d3.select('#tooltip')
            .style('display', 'none')

        d3.select(this)
            .transition('mouseout').duration(100)
            .attr('opacity', 0.8)
            .attr('stroke-width', 0)
    }
    /*
        FIN --> chartBurbujas
    */
    ///////////////////////////////////////////////
    /*
        INICIO --> chartMexicoPuntuacion
    */
    let projection = d3.geoMercator()
        .scale(1800)
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
            alert(d.properties.entidad)
        })
        .attr("d", path);
        
    svg.select('.mapa')
        .selectAll('.label')
        .data(topojson.feature(mexico, mexico.objects.collection).features)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr("font-size", 10)
        .text((d)=> Math.round(d.properties.calificacion))
        .attr('transform', (d)=> {
            const centroid = path.centroid(d)
            //console.log(centroid)
            return `translate(${centroid[0]}, ${centroid[1]})`
        })
    let dataLegend = [{"color":"#FFFFFF","value":0},{"color":"#E5FFF2","value":10},{"color":"#CCFFE5","value":20},{"color":"#B2FFD8","value":30},{"color":"#99FFCB","value":40},{"color":"#7FFFBF","value":50},{"color":"#66FFB2","value":60},{"color":"#4CFFA5","value":70},{"color":"#33FF98","value":80},{"color":"#19FF8B","value":90},{"color":"#00FF7F","value":100}];
    let extent = d3.extent(dataLegend, d => d.value);
    
    let padding = 9;
    let width = 320;
    let innerWidth = width - (padding * 5);
    let barHeight = 12;
    let height = 28;

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

    let defs = svg.append("defs");
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
            cat1: Number.parseFloat(d.gsx$puntajenormatividad.$t),
            cat2: Number.parseFloat(d.gsx$puntajeinfraestructura.$t),
            cat3: Number.parseFloat(d.gsx$puntajecapitalhumano.$t),
            cat4: Number.parseFloat(d.gsx$puntajemapeoygestióndedatos.$t),
            cat5: Number.parseFloat(d.gsx$puntajedesarrollodemecanismosdecomunicación.$t),
            total: d.gsx$puntajetotal.$t
        };
        dataStacked.push(tempData);
    });
    // console.log(dataStacked);

    let group = ["cat1", "cat2", "cat3", "cat4", "cat5"];
    //let mainDiv = "#vis";
    let mainDivName = "vis";
    /* 
    salesData.forEach(function(d) {
        d.total = d3.sum(group, k => +d[k])
        return d
    }); */
    width = +svg.attr("width"),
    height = +svg.attr("height");
    //console.log(salesData);
    let layers = d3.stack()
        .keys(group)
        .offset(d3.stackOffsetDiverging)
        (dataStacked);          
    let x = d3.scaleLinear().rangeRound([margin.left, width - margin.right]);
    x.domain(['0', '100']);

    let y = d3.scaleBand().rangeRound([height - margin.bottom, margin.top]).padding(0.1);
    y.domain(dataStacked.map(function(d) {
        return d.Entidad;
    }))

    let z = d3.scaleOrdinal(d3.schemeCategory10);

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
        yPos = yPos + 1;
        d3.selectAll("#recttooltipText_" + mainDivName).append("tspan").attr("x", 0).attr("y", yPos * 10).attr("dy", "1.9em").text("Puntuación Total" + ":  " + tooltipData.total);
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
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", width / 1.8)
        .attr("y", margin.bottom)
        .attr("dx", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Puntuación Total");

    let ele = svg.select(".stackedBar").append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));
    ele.selectAll("text")

    // Stacked -> Etiqueta Eje Y
    ele.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", 50 - (margin.left))
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

    let colorLegend = d3.legendColor()
        .scale(z)
        .shapePadding(6.24)
        .shapeWidth(25)
        .shapeHeight(25)
        .labelOffset(5);
    let colorLegendG = svg.select(".stackedBar").append("g")
        .attr("class", "color-legend")
        //.attr("transform", "translate(596, 0)")
        .attr("transform", "translate(" + (width - 100) + ", 85)")
    colorLegendG.call(colorLegend);
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
    /////////////////////////
    /*
        INICIO --> chartTop3
    */
   // Categorias Max
   let maxNormatividad = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajenormatividad.$t), x])).values()].sort(function(a, b) {
        return d3.descending(+a.gsx$puntajenormatividad.$t, +b.gsx$puntajenormatividad.$t);
    }).slice(0, 3);  
    let maxInfraestructura = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajeinfraestructura.$t), x])).values()].sort(function(a, b) {
        return d3.descending(+a.gsx$puntajeinfraestructura.$t, +b.gsx$puntajeinfraestructura.$t);
    }).slice(0, 3);
    let maxCapitalHumano = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajecapitalhumano.$t), x])).values()].sort(function(a, b) {
        return d3.descending(+a.gsx$puntajecapitalhumano.$t, +b.gsx$puntajecapitalhumano.$t);
    }).slice(0, 3);
    let maxMapeoGestion = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajemapeoygestióndedatos.$t), x])).values()].sort(function(a, b) {
        return d3.descending(+a.gsx$puntajemapeoygestióndedatos.$t, +b.gsx$puntajemapeoygestióndedatos.$t);
    }).slice(0, 3);
    let maxDevMecanismos = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajedesarrollodemecanismosdecomunicación.$t), x])).values()].sort(function(a, b) {
        return d3.descending(+a.gsx$puntajedesarrollodemecanismosdecomunicación.$t, +b.gsx$puntajedesarrollodemecanismosdecomunicación.$t);
    }).slice(0, 3);

    let minNormatividad = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajenormatividad.$t), x])).values()].sort(function(a, b) {
        return d3.ascending(+a.gsx$puntajenormatividad.$t, +b.gsx$puntajenormatividad.$t);
    }).slice(0, 3); 
    let minInfraestructura = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajeinfraestructura.$t), x])).values()].sort(function(a, b) {
        return d3.ascending(+a.gsx$puntajeinfraestructura.$t, +b.gsx$puntajeinfraestructura.$t);
    }).slice(0, 3);
    let minCapitalHumano = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajecapitalhumano.$t), x])).values()].sort(function(a, b) {
        return d3.ascending(+a.gsx$puntajecapitalhumano.$t, +b.gsx$puntajecapitalhumano.$t);
    }).slice(0, 3);
    let minMapeoGestion = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajemapeoygestióndedatos.$t), x])).values()].sort(function(a, b) {
        return d3.ascending(+a.gsx$puntajemapeoygestióndedatos.$t, +b.gsx$puntajemapeoygestióndedatos.$t);
    }).slice(0, 3);
    let minDevMecanismos = [...new Map(dataset.map(x => [parseFloat(x.gsx$puntajedesarrollodemecanismosdecomunicación.$t), x])).values()].sort(function(a, b) {
        return d3.ascending(+a.gsx$puntajedesarrollodemecanismosdecomunicación.$t, +b.gsx$puntajedesarrollodemecanismosdecomunicación.$t);
    }).slice(0, 3);

    /* console.log(minNormatividad);
    console.log(minInfraestructura);
    console.log(minCapitalHumano);
    console.log(minMapeoGestion);
    console.log(minDevMecanismos);  */

    //console.log(catMax1);
    let dataTop3 = [];
    dataset.forEach((d) => {
        let tempDataset = d;
        //console.log(tempDataset.gsx$estado.$t);
        maxNormatividad.forEach(function(d, index) {
            //console.log(index);
            if (d.gsx$puntajenormatividad.$t === tempDataset.gsx$puntajenormatividad.$t) {
                //console.log(tempDataset.gsx$puntajenormatividad.$t);
                //console.log(d);
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajenormatividad.$t),
                    tipoCat: 'maxNormatividad',
                    tipoMedalla:  index === 0  ? 'oro' :
                                    index === 1  ? 'plata' :
                                    index === 2  ? 'bronce' : ''
                };
                dataTop3.push(tempData);
            }
        });
        maxInfraestructura.forEach(function(d, index) {
            //console.log(index);
            if (d.gsx$puntajeinfraestructura.$t === tempDataset.gsx$puntajeinfraestructura.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajeinfraestructura.$t),
                    tipoCat: 'maxInfraestructura',
                    tipoMedalla:  index === 0  ? 'oro' :
                                    index === 1  ? 'plata' :
                                    index === 2  ? 'bronce' : ''
                };
                dataTop3.push(tempData);
            }
        });
        maxCapitalHumano.forEach(function(d, index) {
            //console.log(index);
            if (d.gsx$puntajecapitalhumano.$t === tempDataset.gsx$puntajecapitalhumano.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajecapitalhumano.$t),
                    tipoCat: 'maxCapitalHumano',
                    tipoMedalla:  index === 0  ? 'oro' :
                                    index === 1  ? 'plata' :
                                    index === 2  ? 'bronce' : ''
                };
                dataTop3.push(tempData);
            }
        });
        maxMapeoGestion.forEach(function(d, index) {
            //console.log(d);
            if (d.gsx$puntajemapeoygestióndedatos.$t === tempDataset.gsx$puntajemapeoygestióndedatos.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajemapeoygestióndedatos.$t),
                    tipoCat: 'maxMapeoGestion',
                    tipoMedalla:  index === 0  ? 'oro' :
                                    index === 1  ? 'plata' :
                                    index === 2  ? 'bronce' : ''
                };
                dataTop3.push(tempData);
            }
        });
        maxDevMecanismos.forEach(function(d, index) {
            //console.log(index);
            if (d.gsx$puntajedesarrollodemecanismosdecomunicación.$t === tempDataset.gsx$puntajedesarrollodemecanismosdecomunicación.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajedesarrollodemecanismosdecomunicación.$t),
                    tipoCat: 'maxDevMecanismos',
                    tipoMedalla:  index === 0  ? 'oro' :
                                    index === 1  ? 'plata' :
                                    index === 2  ? 'bronce' : ''
                };
                dataTop3.push(tempData);
            }
        });


        minNormatividad.forEach(function(d, index) {
            //console.log(index);
            if (d.gsx$puntajenormatividad.$t === tempDataset.gsx$puntajenormatividad.$t) {
                //console.log(tempDataset.gsx$puntajenormatividad.$t);
                //console.log(d);
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajenormatividad.$t),
                    tipoCat: 'minNormatividad',
                    tipoMedalla:  index === 0  ? 'oro' :
                                    index === 1  ? 'plata' :
                                    index === 2  ? 'bronce' : ''
                };
                dataTop3.push(tempData);
            }
        });
        minInfraestructura.forEach(function(d, index) {
            //console.log(index);
            if (d.gsx$puntajeinfraestructura.$t === tempDataset.gsx$puntajeinfraestructura.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajeinfraestructura.$t),
                    tipoCat: 'minInfraestructura',
                    tipoMedalla:  index === 0  ? 'oro' :
                                    index === 1  ? 'plata' :
                                    index === 2  ? 'bronce' : ''
                };
                dataTop3.push(tempData);
            }
        });
        minCapitalHumano.forEach(function(d, index) {
            //console.log(index);
            if (d.gsx$puntajecapitalhumano.$t === tempDataset.gsx$puntajecapitalhumano.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajecapitalhumano.$t),
                    tipoCat: 'minCapitalHumano',
                    tipoMedalla:  index === 0  ? 'oro' :
                                    index === 1  ? 'plata' :
                                    index === 2  ? 'bronce' : ''
                };
                dataTop3.push(tempData);
            }
        });
        minMapeoGestion.forEach(function(d, index) {
            //console.log(d);
            if (d.gsx$puntajemapeoygestióndedatos.$t === tempDataset.gsx$puntajemapeoygestióndedatos.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajemapeoygestióndedatos.$t),
                    tipoCat: 'minMapeoGestion',
                    tipoMedalla:  index === 0  ? 'oro' :
                                    index === 1  ? 'plata' :
                                    index === 2  ? 'bronce' : ''
                };
                dataTop3.push(tempData);
            }
        });
        minDevMecanismos.forEach(function(d, index) {
            //console.log(index);
            if (d.gsx$puntajedesarrollodemecanismosdecomunicación.$t === tempDataset.gsx$puntajedesarrollodemecanismosdecomunicación.$t) {
                let tempData = {};
                //console.log(tempDataset.gsx$estado.$t)
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajedesarrollodemecanismosdecomunicación.$t),
                    tipoCat: 'minDevMecanismos',
                    tipoMedalla:  index === 0  ? 'oro' :
                                    index === 1  ? 'plata' :
                                    index === 2  ? 'bronce' : ''
                };
                dataTop3.push(tempData);
            }
        });
    }); 
    //console.log(dataTop3);
    function mouseOver2(d, i) {
        //console.log('hi')
        d3.select(this)
            .transition('mouseover').duration(100)
            .attr('opacity', 1)
            .attr('stroke-width', 5)
            .attr('stroke', 'black')

        d3.select('#tooltip')
            .style('left', (d3.event.pageX + 10) + 'px')
            .style('top', (d3.event.pageY - 25) + 'px')
            .style('display', 'inline-block')
            .html(`<strong>Estado:</strong> ${d.entidad[0] + d.entidad.slice(1,).toLowerCase()} 
                <br> <strong>Puntuación por categoría:</strong> ${d.puntajeTop}`)
    }

    function mouseOut2(d, i) {
        d3.select('#tooltip')
            .style('display', 'none')

        d3.select(this)
            .transition('mouseout').duration(100)
            .attr('opacity', 0.8)
            .attr('stroke-width', 0)
    }
 
    salarySizeScale2 = d3.scaleLinear(d3.extent(dataTop3, d => d.puntajeTop), [5, 28])
    simulation2 = d3.forceSimulation(dataTop3)
    simulation2.on('tick', () => {
        nodes2
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
    })
    nodes2 = svg
    .append("g")
    .attr('class', 'top3')
    .attr('visibility', 'hidden')
    .selectAll('circle')
    .data(dataTop3)
    .enter()
    .append('circle')
        .attr('fill', 'black')
        .attr('r', 3)
        .attr('cx', (d, i) => (d.puntajeTop))
    svg.select('.top3').selectAll('.lab-text')
        .data(categories).enter()
        .append('text')
        .attr('class', 'lab-text')
        .attr('opacity', 1)
        .raise()
    svg.select('.top3').selectAll('.lab-text')
        .attr('font-family', 'Noto Sans SC')
        .attr('font-size', '14px')
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')       
    simulation2
        .force('charge', d3.forceManyBody().strength([2]))
        // posicionan las burbujas y titulos
        .force('forceX', d3.forceX(d => categoriesXY[d.tipoCat][0] + 200))
        .force('forceY', d3.forceY(d => categoriesXY[d.tipoCat][1] - 50))
        .force('collide', d3.forceCollide(d => salarySizeScale2(d.puntajeTop) + 4))
        .alphaDecay([0.02])

    svg.select('.top3').selectAll('circle')
        .transition().duration(400).delay((d, i) => i * 5)
        .attr('r', d => salarySizeScale2(d.puntajeTop) * 1.2)
        .attr('fill', d => {
            //categoryColorScale(d.tipoCat)
            return d.tipoMedalla === 'oro' ? '#ffcc01' :
                    d.tipoMedalla === 'plata' ? '#b4b8bc' :
                    d.tipoMedalla === 'bronce' ? '#d1a684' :
                                '#fff';
        });

    svg.select('.top3').selectAll('.cat-rect').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1);            
    svg.select('.top3').selectAll('.lab-text').transition().duration(300).delay((d, i) => i * 30)
        .text(d => {
            return d === 'maxNormatividad' ? 'Max Normatividad' :
                    d === 'maxInfraestructura' ? 'Max Infraestructura' :
                    d === 'maxCapitalHumano' ? 'Max Capital Humano' :
                    d === 'maxMapeoGestion' ? 'Max Mapeo y gestión de datos' :
                    d === 'maxDevMecanismos' ? 'Max Desarrollo de mecanismos de comunicación' :
                    d === 'minNormatividad' ? 'Min Normatividad' :
                    d === 'minInfraestructura' ? 'Min Infraestructura' :
                    d === 'minCapitalHumano' ? 'Min Capital Humano' :
                    d === 'minMapeoGestion' ? 'Min Mapeo y gestión de datos' :
                    d === 'minDevMecanismos' ? 'Min Desarrollo de mecanismos de comunicación' :
                                '?';
        })
        // posicionan las burbujas y titulos
        .attr('x', d => categoriesXY[d][0] + 200)   
        .attr('y', d => categoriesXY[d][1] + 50)
        .attr('opacity', 1)
    svg.select('.top3').selectAll('circle')
        .on('mouseover', mouseOver2) 
        .on('mouseout', mouseOut2) 
    simulation2.stop()
    
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
    if (chartType !== "chartTop3") {
        svg.select('.top3').transition().attr('visibility', 'hidden');
    }
}

function chartTop3() {
    clean('chartTop3');
    let svg = d3.select("#vis").select('svg');   
    svg.selectAll('.top3').attr('visibility', 'visible');
    simulation2.alpha(0.9).restart();
}

function chartStackedBar() {
    clean('chartStackedBar');
    let svg = d3.select("#vis").select('svg');   
    svg.selectAll('.stackedBar').attr('visibility', 'visible');
}

// Máxima Puntuación - TopoJSON
function chartMaxPuntuacion() {
    let svg = d3.select("#vis").select('svg');
    clean('chartMexicoPuntuacion');
    svg.selectAll('.entidad')
        .attr("fill", function(d){
            return d.properties.clave === 15 ? '#00FF7F' : 'black';
        })
        .attr("stroke-width", 3)
        .attr("stroke-opacity", function(d){
            return d.properties.clave === 15 ? 0.8 : 0.2;
        })
        .attr("fill-opacity", function(d){
            return d.properties.clave === 15 ? 0.8 : 0.2;
        })
        .attr("stroke", function(d){
            return d.properties.clave === 15 ? '#000' : 'white';
        });
    svg.select('.mapa').transition().duration(300).delay((d, i) => i * 30)
        .attr('visibility', 'visible');  
}

// Mínima Puntuación - TopoJSON
function chartMinPuntuacion() {
    clean('chartMinPuntuacion');
    let svg = d3.select("#vis").select('svg');
    svg.selectAll('.entidad')
        .attr("fill", function(d){
            return d.properties.clave === 23 ? '#FFD700' : 'black';
        })
        .attr("stroke-width", 3)
        .attr("stroke-opacity", function(d){
            return d.properties.clave === 23 ? 0.8 : 0.2;
        })
        .attr("fill-opacity", function(d){
            return d.properties.clave === 23 ? 0.8 : 0.2;
        })
        .attr("stroke", function(d){
            return d.properties.clave === 23 ? '#000' : 'white';
        });
    svg.select('.mapa').transition().duration(300).delay((d, i) => i * 30)
        .attr('visibility', 'visible');
}

// Mapa MEX 
function chartMexicoPuntuacion() {
    clean('chartMexicoPuntuacion');
    let svg = d3.select("#vis").select('svg');
    svg.selectAll('.entidad')
        .attr("fill", function(d){
            return d.properties.calificacion > 90 ? '#00FF7F' :
                        d.properties.calificacion > 80  ? '#19FF8B' :
                        d.properties.calificacion > 70  ? '#33FF98' :
                        d.properties.calificacion > 60  ? '#4CFFA5' :
                        d.properties.calificacion > 50  ? '#66FFB2' :
                        d.properties.calificacion > 40  ? '#7FFFBF' :
                        d.properties.calificacion > 30  ? '#99FFCB' :
                        d.properties.calificacion > 20  ? '#B2FFD8' :
                        d.properties.calificacion > 10  ? '#CCFFE5' :
                        d.properties.calificacion > 0  ? '#E5FFF2' :
                        d.properties.calificacion === 0  ? '#DC143C' :
                                    'rgba(255, 255, 255, 0)';
        })
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#666666");
    svg.select('.mapa').transition().duration(300).delay((d, i) => i * 30)
        .attr('visibility', 'visible');
    svg.select('.leyendas').transition().duration(300).attr('visibility', 'visible');
}

// BURBUJAS
function chartBurbujas() {
    clean('chartBurbujas');
    let svg = d3.select('#vis').select('svg');
    svg.selectAll('.burbujas').attr('visibility', 'visible');
    simulation.restart()
}

let activationFunctions = [ chartStackedBar, chartMexicoPuntuacion, chartBurbujas, chartTop3, chartMaxPuntuacion, chartMinPuntuacion ]
let scroll = scroller().container(d3.select('#graphic'));
scroll();

let lastIndex, activeIndex = 0;

scroll.on('active', function (index) {
    d3.selectAll('.step')
        .transition().duration(500)
        .style('opacity', function (d, i) {
            return i === index ? 1 : 0.1;
    });
    activeIndex = index;
    let sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    //console.log(sign)
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        //i = i+2;
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

