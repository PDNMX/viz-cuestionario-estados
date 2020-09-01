let dataset, mexico, svg
let sizeScale
let simulation, nodes

const margin = {
    left: 170,
    top: 80,
    bottom: 50,
    right: 20
}
const width = 1000 - margin.left - margin.right
const height = 950 - margin.top - margin.bottom

const dataMaxMinInfraestructura = [];
const dataMaxMinNormatividad = [];
const dataMaxMinCapitalHumano = [];
const dataMaxMinMapeoGestion = [];
const dataMaxDevMinMecanismos = [];

Promise.all([
    fetch('https://spreadsheets.google.com/feeds/list/1fGCwueHVG-26Fwn0aLBN_wrpsD_aNfMWqrKN4y-MGIE/1/public/values?alt=json'),
    fetch('data/map.topojson')
]).then(async ([aa, bb]) => {
    const a = await aa.json();
    const b = await bb.json();
    return [a, b]
})
    .then((responseText) => {
        //console.log(responseText[0]);
        //console.log(responseText[1]);
        dataset = responseText[0].feed.entry;
        mexico = responseText[1];
        createScales();
        createTabla(dataset);
        setTimeout(drawInitial(), 100);
    }).catch((err) => {
    console.log(err);
});

///const colors = ['#ffcc00', '#ff6666', '#cc0066', '#66cccc', '#f688bb', '#65587f', '#baf1a1', '#333333', '#75b79e',  '#66cccc', '#9de3d0', '#f1935c', '#0c7b93', '#eab0d9', '#baf1a1', '#9399ff']

function createScales() {
    sizeScale = d3.scaleLinear(d3.extent(dataset, d => d.gsx$puntajetotal.$t), [5, 35])
    /* salaryXScale = d3.scaleLinear(d3.extent(dataset, d => d.gsx$puntajetotal.$t), [margin.left, margin.left + width])
    salaryYScale = d3.scaleLinear([20000, 110000], [margin.top + height, margin.top]); */
}

function drawInitial() {
    console.log("Entre");
    let svg = d3.select("#vis")
        .append('svg')
        .attr('width', 1000)
        .attr('height', 950)
        .attr('opacity', 1)
    /*
        INICIO --> chartBurbujas
    */
    // Filtra el top 10 con mayor puntuación
    let topData = dataset.sort(function (a, b) {
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
    }).force('x', d3.forceX(500))
        .force('y', d3.forceY(500))
        .force('collide', d3.forceCollide(d => sizeScale(d.gsx$puntajetotal.$t) * 2.9))
        .alpha(0.6).alphaDecay(0.05);
    // Stop the simulation until later

    simulation.stop()
    // Selection of all the circles

    let colorScaleBlue =  ["#1f6e89","#317a93","#43869d","#5592a7","#669db1","#78a9bb","#8ab5c5","#9cc1cf","#a5c7d4", "#ADCCD8"];

    nodes = svg
        .append("g")
        .attr('class', 'burbujas')
        .attr('visibility', 'hidden')
        .selectAll('circle')
        .data(topData)
        .enter()
        .append('circle')
        .attr('r', d => sizeScale(d.gsx$puntajetotal.$t) * 2.8)
        .attr('fill', (d, i) => {
            return colorScaleBlue[i]
        });

    labels = svg.select('.burbujas').selectAll('circle')
        .data(topData, d => d)
        .enter()
        .append('text')
        .text(d => d.gsx$estado.$t)
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .style("font-size", function (d) {
            return Math.min(2 * d.gsx$puntajetotal.$t, (2 * d.gsx$puntajetotal.$t - 8) / this.getComputedTextLength() * 10) + "px";
        });

    // Add mouseover and mouseout events for all circles
    // Changes opacity and adds border
    svg.select('.burbujas').selectAll('circle')
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut);

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
        .text((d) => Math.round(d.properties.calificacion))
        .attr('transform', (d) => {
            const centroid = path.centroid(d)
            //console.log(centroid)
            return `translate(${centroid[0]}, ${centroid[1]})`
        })
    let dataLegend = [{"color": "#b64547", "value": 0}, {"color": "#b64547", "value": 10}, {
        "color": "#cb5859",
        "value": 20
    }, {"color": "#f06c6e", "value": 30},
        {"color": "#f49899", "value": 40}, {"color": "#efbcbd", "value": 50}, {"color": "#adccd9", "value": 60},
        {"color": "#58accf", "value": 70}, {"color": "#519ebe", "value": 80}, {
            "color": "#3887a8",
            "value": 90
        }, {"color": "#1f6e89", "value": 100}];
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
        INICIO --> chart MAX y MIN
    */
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
                    tipoCat: 'max',
                    tipoMedalla: index === 0 ? 'oroNor' :
                        index === 1 ? 'plataNor' :
                            index === 2 ? 'bronceNor' : ''
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
                    tipoCat: 'min',
                    tipoMedalla: index === 0 ? 'oroNor' :
                        index === 1 ? 'plataNor' :
                            index === 2 ? 'bronceNor' : ''
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
                    tipoCat: 'max',
                    tipoMedalla: index === 0 ? 'oroInf' :
                        index === 1 ? 'plataInf' :
                            index === 2 ? 'bronceInf' : ''
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
                    tipoCat: 'min',
                    tipoMedalla: index === 0 ? 'oroInf' :
                        index === 1 ? 'plataInf' :
                            index === 2 ? 'bronceInf' : ''
                };
                dataMaxMinInfraestructura.push(tempData);
            }
        });
        maxCapitalHumano.forEach(function (d, index) {
            //console.log(index);
            if (d.gsx$puntajecapitalhumano.$t === tempDataset.gsx$puntajecapitalhumano.$t) {
                let tempData = '';
                tempData = {
                    entidad: tempDataset.gsx$estado.$t,
                    puntajeTop: Number.parseFloat(d.gsx$puntajecapitalhumano.$t),
                    tipoCat: 'max',
                    tipoMedalla: index === 0 ? 'oroCH' :
                        index === 1 ? 'plataCH' :
                            index === 2 ? 'bronceCH' : ''
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
                    tipoCat: 'min',
                    tipoMedalla: index === 0 ? 'oroCH' :
                        index === 1 ? 'plataCH' :
                            index === 2 ? 'bronceCH' : ''
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
                    tipoCat: 'max',
                    tipoMedalla: index === 0 ? 'oroGD' :
                        index === 1 ? 'plataGD' :
                            index === 2 ? 'bronceGD' : ''
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
                    tipoCat: 'min',
                    tipoMedalla: index === 0 ? 'oroGD' :
                        index === 1 ? 'plataGD' :
                            index === 2 ? 'bronceGD' : ''
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
                    tipoCat: 'max',
                    tipoMedalla: index === 0 ? 'oroMC' :
                        index === 1 ? 'plataMC' :
                            index === 2 ? 'bronceMC' : ''
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
                    tipoCat: 'min',
                    tipoMedalla: index === 0 ? 'oroMC' :
                        index === 1 ? 'plataMC' :
                            index === 2 ? 'bronceMC' : ''
                };
                dataMaxDevMinMecanismos.push(tempData);
            }
        });
    });
}

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

function chartMaxMin(data, classObject) {
    let categories = ['max', 'min'];
    let categoriesXY = {'max': [200, 500], 'min': [500, 500]};
    let svg = d3.select("#vis").select('svg');
    svg.select(`.${classObject}`).remove();
    let dataset = data;
    tempEscala = d3.scaleLinear([5, 7])
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
        .attr('fill', 'black')
        .attr('r', 4)
    /* .attr('cx', (d, i) => (d.puntajeTop)) */
    svg.select(`.${classObject}`).selectAll('.lab-text')
        .data(categories).enter()
        .append('text')
        .attr('class', 'lab-text')
        .style('pointer-events', 'none')
        .attr('opacity', 1)
        .raise()
    svg.select(`.${classObject}`).selectAll('.lab-text')
        .attr('font-family', 'Noto Sans SC')
        .attr('font-size', '14px')
        .attr('fill', 'black')
        .attr('text-anchor', 'middle');

    svg.select(`.${classObject}`).selectAll('circle')
        .transition().duration(500).delay((d, i) => i * 50)
        .attr('r', d => tempEscala(d.puntajeTop) * 1.2)
        .attr('fill', d => {
            //categoryColorScale(d.tipoCat)
            return d.tipoMedalla === 'oro' ? '#1f6e89' :
                d.tipoMedalla === 'plata' ? '#519ebe' :
                    d.tipoMedalla === 'bronce' ? '#adccd9' :
                        d.tipoMedalla === 'oroNor' ? '#34B3EB':
                            d.tipoMedalla === 'plataNor' ? '#8BCBD3':
                                d.tipoMedalla === 'bronceNor' ? '#C4E3E4':
                                    d.tipoMedalla === 'oroInf' ? '#34A853':
                                        d.tipoMedalla === 'plataInf' ? '#8BCE9D':
                                            d.tipoMedalla === 'bronceInf' ? '#E1F4E7':
                                                d.tipoMedalla === 'oroCH' ? '#674EA7':
                                                    d.tipoMedalla === 'plataCH' ? '#737FA6':
                                                        d.tipoMedalla === 'bronceCH' ? '#96A0BD':
                                                            d.tipoMedalla === 'oroGD' ? '#FF6D01':
                                                                d.tipoMedalla === 'plataGD' ? '#EC9054':
                                                                    d.tipoMedalla === 'bronceGD' ? '#F1AE82':
                                                                        d.tipoMedalla === 'oroMC' ? '#FBBC04':
                                                                            d.tipoMedalla === 'plataMC' ? '#FAD15A':
                                                                                d.tipoMedalla === 'bronceMC' ? '#FAE9B2':
                        '#fff';
        });
    svg.select(`.${classObject}`).selectAll('.lab-text').transition().duration(300).delay((d, i) => i * 30)
        .text(d => {
            return d === 'max' ? 'Mejores Puntados' :
                d === 'min' ? 'Peores Puntuados' :
                    '?';
        })
        // posicionan las burbujas y titulos
        .attr('x', d => categoriesXY[d][0] + 200)
        .attr('y', d => categoriesXY[d][1] + 100)
        .attr('opacity', 1)
    svg.select(`.${classObject}`).selectAll('circle')
        .on('mouseover', mouseOver2)
        .on('mouseout', mouseOut2)
    tempSimulation
        /* .force('charge', d3.forceManyBody().strength([2])) */
        // posicionan las burbujas y titulos
        .force('x', d3.forceX(d => categoriesXY[d.tipoCat][0] + 200))
        .force('y', d3.forceY(d => categoriesXY[d.tipoCat][1] - 100))
        .force('collide', d3.forceCollide(d => tempEscala(d.puntajeTop) + 6))
        .alphaDecay([0.02]);
    tempSimulation.restart();
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
}

function createTabla(data) {
    let idShow = 'tablaScore';
    clean(idShow);
    document.getElementById(idShow).style.display = "block";

    let sortData = data.sort(function (a, b) {
        return d3.descending(+a.gsx$puntajetotal.$t, +b.gsx$puntajetotal.$t);
    });
    //console.log(sortData);
    let targetNode = document.getElementById(idShow);
    sortData.forEach(function (d) {
        //console.log(d);
        targetNode.innerHTML += `<div class="row centerProgress" style="margin-top: 9px">
        <div class="col-md-2">${d.gsx$estado.$t}</div>
            <div class="col-md-2">
                <div class="progress" style="height: 15px;">
                    <div class="barraNor progress-bar" role="progressbar" style="width: ${d.gsx$porcentajenormatividad.$t}%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${d.gsx$porcentajenormatividad.$t}%</div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="progress" style="height: 15px;">
                    <div class="barraInf progress-bar" role="progressbar" style="width: ${d.gsx$porcentajeinfraestructura.$t}%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${d.gsx$porcentajeinfraestructura.$t}%</div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="progress" style="height: 15px;">
                    <div class="barraCH progress-bar" role="progressbar" style="width: ${d.gsx$porcentajecapitalhumano.$t}%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${d.gsx$porcentajecapitalhumano.$t}%</div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="progress" style="height: 15px;">
                    <div class="barraGD progress-bar" role="progressbar" style="width: ${d.gsx$porcentajemapeoygestióndedatos.$t}%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${d.gsx$porcentajemapeoygestióndedatos.$t}%</div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="progress" style="height: 15px;">
                    <div class="barraMC progress-bar" role="progressbar" style="width: ${d.gsx$porcentajedesarrollodemecanismosdecomunicación.$t}%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${d.gsx$porcentajedesarrollodemecanismosdecomunicación.$t}%</div>
                </div>
            </div>
      </div>`
    });
}

function intro() {
    let classShow = 'intro';
    clean(classShow);
    document.getElementById("intro").style.display = "block";
}

function chartTabla() {
    let classShow = 'tablaScore';
    clean(classShow);
    document.getElementById("tablaScore").style.display = "block";
}

function chartNormatividad() {
    let classShow = 'chartNormatividad';
    clean(classShow);
    chartMaxMin(dataMaxMinNormatividad, classShow);
}

function chartInfraestructura() {
    let classShow = 'chartInfraestructura';
    clean(classShow);
    chartMaxMin(dataMaxMinInfraestructura, classShow);
}

function chartCapitalHumano() {
    let classShow = 'chartCapitalHumano';
    clean(classShow);
    chartMaxMin(dataMaxMinCapitalHumano, classShow);
}

function chartMapeoGestion() {
    let classShow = 'chartMapeoGestion';
    clean(classShow);
    chartMaxMin(dataMaxMinMapeoGestion, classShow);
}

function chartDevMecanismos() {
    let classShow = 'chartDevMecanismos';
    clean(classShow);
    chartMaxMin(dataMaxDevMinMecanismos, classShow);
}

function chartStackedBar() {
    clean('chartStackedBar');
    let svg = d3.select("#vis").select('svg');
    svg.selectAll('.stackedBar').attr('visibility', 'visible');
}

// Mapa MEX 
function chartMexicoPuntuacion() {
    clean('chartMexicoPuntuacion');
    let svg = d3.select("#vis").select('svg');
    svg.selectAll('.entidad')
        .attr("fill", function (d) {
            return d.properties.calificacion > 90 ? '#3887a8' :
                d.properties.calificacion > 80 ? '#519ebe' :
                    d.properties.calificacion > 70 ? '#58accf' :
                        d.properties.calificacion > 60 ? '#adccd9' :
                            d.properties.calificacion > 50 ? '#efbcbd' :
                                d.properties.calificacion > 40 ? '#f49899' :
                                    d.properties.calificacion > 30 ? '#f06c6e' :
                                        d.properties.calificacion > 20 ? '#cb5859' :
                                            d.properties.calificacion > 10 ? '#b64547' :
                                                d.properties.calificacion > 0 ? '#b64547' :
                                                    d.properties.calificacion === 0 ? '#DC143C' :
                                                        'rgba(255, 255, 255, 0)';
        })
        /*let dataLegend = [{"color":"#b64547","value":0},{"color":"#b64547","value":10},{"color":"#cb5859","value":20},{"color":"#f06c6e","value":30},
            {"color":"#f49899","value":40},{"color":"#efbcbd","value":50},{"color":"#adccd9","value":60},
            {"color":"#58accf","value":70},{"color":"#519ebe","value":80},{"color":"#3887a8","value":90},{"color":"#1f6e89","value":100}];
    */
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

let activationFunctions = [chartTabla, chartMexicoPuntuacion, chartBurbujas, chartNormatividad, chartInfraestructura, chartCapitalHumano, chartMapeoGestion, chartDevMecanismos]
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
    console.log(sign)
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        //i = i+2;
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

