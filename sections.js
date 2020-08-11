let dataset, svg
let salarySizeScale, salaryXScale
let simulation, nodes
let categoryLegend, salaryLegend

const margin = {
    left: 170,
    top: 50,
    bottom: 50,
    right: 20
}
const width = 1000 - margin.left - margin.right
const height = 950 - margin.top - margin.bottom

/* Promise.all([
    fetch('edoMex.json'),
    fetch('mexico.json')
  ]).then(async([aa, bb]) => {
    const a = await aa.json();
    const b = await bb.json();
    return [a, b]
  })
  .then((responseText) => {
    //console.log(responseText[0]);
    //console.log(responseText[0]);
    dataset = data;
    //console.log(dataset)
    createScales()
    setTimeout(drawInitial(), 100)

  }).catch((err) => {
    console.log(err);
}); */

d3.csv('data/data.csv', function (d) {
    return {
        Entidad: d.entidad,
        PuntacionTotal: +d.puntacionTotal
    };
}).then(data => {
    dataset = data;
    createScales()
    setTimeout(drawInitial(), 100)
})


function createScales() {
    salarySizeScale = d3.scaleLinear(d3.extent(dataset, d => d.PuntacionTotal), [5, 35])
    salaryXScale = d3.scaleLinear(d3.extent(dataset, d => d.PuntacionTotal), [margin.left, margin.left + width])
    salaryYScale = d3.scaleLinear([20000, 110000], [margin.top + height, margin.top])
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
        return d3.descending(+a.PuntacionTotal, +b.PuntacionTotal);
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
    .force('collide', d3.forceCollide(d => salarySizeScale(d.PuntacionTotal) * 2.9))
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
        .attr('r', d => salarySizeScale(d.PuntacionTotal) * 2.8)
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
        .text(d => d.Entidad)
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .style("font-size", function(d) { return Math.min(2 * d.PuntacionTotal, (2 * d.PuntacionTotal - 8) / this.getComputedTextLength() * 10) + "px"; })
        .attr("dy", ".35em");
        

    // Add mouseover and mouseout events for all circles
    // Changes opacity and adds border
    svg.selectAll('circle')
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
            .html(`<strong>Estado:</strong> ${d.Entidad[0] + d.Entidad.slice(1,).toLowerCase()} 
                <br> <strong>Puntuación:</strong> ${d.PuntacionTotal}`)
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

    // mapa completo
    d3.json("map.topojson")
        .then(function (data) {
            mexico = data;
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
                .on('click', function (d) {
                    /* svg.select('.mapa').append("circle")
                    .attr("cx", 30)
                    .attr("cy", 30)
                    .attr("r", 20); */
                    // get the data
                    var x = d3.scaleBand()
                            .range([0, width])
                            .padding(0.1);
                    var y = d3.scaleLinear()
                            .range([height, 0]);
                    d3.csv('data/sales.csv').then(data2 => {
                        //if (error) throw error;
                    
                        // format the data
                        console.log(data2);
                       
                    })
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
        });

    /*
        FIN --> chartMexicoPuntuacion
    */
    ///////////////////////////////////////////////
    /*
        INICIO --> chartStackedBar
    */
    let group = ["a", "b", "c", "d", "e"];
    //let mainDiv = "#vis";
    let mainDivName = "vis";
    let salesData = [
        {
            "groups": "Quintana Roo",
            "a": 1,
            "b": 0,
            "c": 5,
            "d": 0,
            "e": 0
        },
        {
            "groups": "Baja California Sur",
            "a": 5,
            "b": 0,
            "c": 2,
            "d": 0,
            "e": 0
        },
        {
            "groups": "Querétaro",
            "a": 0,
            "b": 7,
            "c": 0,
            "d": 0,
            "e": 0
        },
        {
            "groups": "Tamaulipas",
            "a": 6,
            "b": 0,
            "c": 4,
            "d": 2,
            "e": 0
        },
        {
            "groups": "Veracruz",
            "a": 0,
            "b": 6,
            "c": 6,
            "d": 3,
            "e": 0
        },
        {
            "groups": "Coahuila",
            "a": 0,
            "b": 13,
            "c": 5,
            "d": 4,
            "e": 0
        },
        {
            "groups": "Guanajuato",
            "a": 6,
            "b": 6,
            "c": 10,
            "d": 0,
            "e": 0
        },
        {
            "groups": "Nayarit",
            "a": 6,
            "b": 6,
            "c": 10,
            "d": 1,
            "e": 0
        },
        {
            "groups": "Hidalgo",
            "a": 6,
            "b": 0,
            "c": 5,
            "d": 12.66,
            "e": 0
        },
        {
            "groups": "Baja California",
            "a": 6,
            "b": 6,
            "c": 7,
            "d": 0,
            "e": 5
        },
        {
            "groups": "Oaxaca",
            "a": 8,
            "b": 6,
            "c": 7,
            "d": 6,
            "e": 5
        },
        {
            "groups": "Colima",
            "a": 6,
            "b": 6,
            "c": 10,
            "d": 7.99,
            "e": 5
        },
        {
            "groups": "Yucatan",
            "a": 6,
            "b": 13,
            "c": 9,
            "d": 2,
            "e": 5
        },
        {
            "groups": "Guerrero",
            "a": 6,
            "b": 6,
            "c": 10,
            "d": 0,
            "e": 14.16
        },
        {
            "groups": "Sinaloa",
            "a": 6,
            "b": 6,
            "c": 5,
            "d": 9.33,
            "e": 11.66
        },
        {
            "groups": "Campeche",
            "a": 6,
            "b": 13,
            "c": 8,
            "d": 6,
            "e": 10
        },
        {
            "groups": "Chihuahua",
            "a": 8,
            "b": 14,
            "c": 10,
            "d": 2,
            "e": 11.66
        },
        {
            "groups": "Durango",
            "a": 10,
            "b": 20,
            "c": 7,
            "d": 6,
            "e": 11.66
        },
        {
            "groups": "Zacatecas",
            "a": 6,
            "b": 20,
            "c": 8,
            "d": 12,
            "e": 20
        },
        {
            "groups": "Aguascalientes",
            "a": 10,
            "b": 20,
            "c": 10,
            "d": 2,
            "e": 26.66
        },
        {
            "groups": "Jalisco",
            "a": 6,
            "b": 20,
            "c": 10,
            "d": 9,
            "e": 25
        },
        {
            "groups": "Sonora",
            "a": 6,
            "b": 20,
            "c": 10,
            "d": 8.99,
            "e": 26.66
        },
        {
            "groups": "Puebla",
            "a": 8,
            "b": 20,
            "c": 10,
            "d": 19,
            "e": 20
        },
        {
            "groups": "Tabasco",
            "a": 6,
            "b": 20,
            "c": 10,
            "d": 13,
            "e": 30
        },
        {
            "groups": "Tlaxcala",
            "a": 6,
            "b": 20,
            "c": 10,
            "d": 13,
            "e": 30
        },
        {
            "groups": "Michoacán",
            "a": 6,
            "b": 20,
            "c": 7,
            "d": 18,
            "e": 30
        },
        {
            "groups": "México",
            "a": 10,
            "b": 20,
            "c": 8,
            "d": 25.66,
            "e": 30
        }
    ];
    salesData.forEach(function(d) {
        d.total = d3.sum(group, k => +d[k])
        return d
    });
    //console.log(salesData);
    let layers = d3.stack()
        .keys(group)
        .offset(d3.stackOffsetDiverging)
        (salesData);       

    
    let x = d3.scaleLinear().rangeRound([margin.left, width - margin.right]);
    x.domain(['0', '100']);

    let y = d3.scaleBand().rangeRound([height - margin.bottom, margin.top]).padding(0.1);
    y.domain(salesData.map(function(d) {
        return d.groups;
    }))

    let z = d3.scaleOrdinal(d3.schemeCategory10);

    let maing = svg.append("g")
        .attr('class', 'stackedBar')
        .selectAll("g")
        .data(layers);
        
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
            return JSON.stringify(data);
        })
        .attr("width", function(d) {
            return x(d[1]) - x(d[0]);
        })
        .attr("x", function(d) {
            return x(d[0]);
        })
        .attr("y", function(d) {
            return y(d.data.groups);
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
        let tooltipsText = "";
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
        .text("Puntuación");

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
    
    let textTotal = svg.select(".stackedBar").selectAll(".text")
        .data(salesData, d => d.groups);

    textTotal.exit().remove();
    textTotal.enter().append("text")
        .attr("class", "text")
        .attr("text-anchor", "start")
        .merge(textTotal)
        .attr("font-size", 12)
        .attr("y", d => y(d.groups) + y.bandwidth() / 1.5)
        .attr("x", d => x(d.total) + 5)
        .text(d => d.total.toFixed(1))

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
}

//Cleaning Function
function clean(chartType) {
    let svg = d3.select('#vis').select('svg')
    if (chartType !== "chartStackedBar") {
        svg.select('.stackedBar').transition().attr('visibility', 'hidden')
    }
    if (chartType !== "chartBurbujas") {
        svg.selectAll('.burbujas').transition().attr('visibility', 'hidden');
    }
    if (chartType !== "chartMexicoPuntuacion") {
        svg.select('.mapa').transition().attr('visibility', 'hidden')
        svg.select('.leyendas').transition().attr('visibility', 'hidden')
    }
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

let activationFunctions = [ chartStackedBar, chartMexicoPuntuacion, chartBurbujas, chartMaxPuntuacion, chartMinPuntuacion ]
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
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

