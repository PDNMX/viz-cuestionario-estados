let dataset, mexico, svg
let sizeScale
let simulation, nodes

const margin = {
    left: 170,
    top: 80,
    bottom: 50,
    right: 20
}


/* const width = 1000 - margin.left - margin.right
const height = 950 - margin.top - margin.bottom */

const dataMaxMinInfraestructura = [];
const dataMaxMinNormatividad = [];
const dataMaxMinCapitalHumano = [];
const dataMaxMinMapeoGestion = [];
const dataMaxDevMinMecanismos = [];

// Colores para categorias 
// Normatividad, Infraestructura, Capital Humano, Mapeo y gestión, Dev Mecanismos de comunicación
const colorsCategorias = ['#34B3EB', '#34a853', '#674ea7', '#ff6d01', '#fbbc04'];

Promise.all([
    fetch('https://spreadsheets.google.com/feeds/list/1fGCwueHVG-26Fwn0aLBN_wrpsD_aNfMWqrKN4y-MGIE/1/public/values?alt=json'),
    fetch('data/mexico.json')
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

function createScales() {
    //console.log(dataset)
    sizeScale = d3.scaleLinear(d3.extent(dataset, d => d.gsx$puntajetotal.$t), [5, 35])
}

function drawInitial() {
    let svg = d3.select("#vis")
        .append('svg')
        .attr("viewBox", `0 0 1000 950`)
        .attr('preserveAspectRatio','xMinYMin')
        .attr('opacity', 1)
        .attr('display', 'none');
    /* const params = svg.attr('viewBox').split(' ').map((n) => parseInt(n, 10))
    const width = params[2]
    const height = params[3] */
    /*
        INICIO --> chartBurbujas
    */
    // Filtra el top 10 con mayor puntuación
    let topData = dataset.sort(function (a, b) {
        return d3.descending(+a.gsx$puntajetotal.$t, +b.gsx$puntajetotal.$t);
    }).slice(0, 10);
    // console.log("topData:", topData)
    simulation = d3.forceSimulation(topData)
    // Define each tick of simulation
    simulation.on('tick', () => {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
        labels
            .attr('x', d => d.x)
            .attr('y', d => d.y)
    }).force('x', d3.forceX(450))
        .force('y', d3.forceY(450))
        .force('collide', d3.forceCollide(d => sizeScale(d.gsx$puntajetotal.$t) * 2.9))
        .alpha(0.6).alphaDecay(0.02);
    // Stop the simulation until later

    simulation.stop()
    // Selection of all the circles
    let colorScaleBlue = ["#1f6e89", "#317a93", "#43869d", "#5592a7", "#669db1", "#78a9bb", "#8ab5c5", "#9cc1cf", "#a5c7d4", "#ADCCD8"];

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
    labels = svg.select('.burbujas').selectAll('text')
        .data(topData)
        .enter()
        .append('text')
        .text(function (d) {
            return d.gsx$estado.$t;
        })
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .style("font-size", function (d) {
            let sizeLetter = Math.min(0.3 * d.gsx$puntajetotal.$t, (2 * d.gsx$puntajetotal.$t - 8) / this.getComputedTextLength() * 0.5);
            return  `${sizeLetter}px`;
        })
    ;

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
            .attr('stroke-width', 3)
            .attr('stroke', '#154B5F')

        d3.select('#tooltip')
            .style('left', (d3.event.pageX + 10) + 'px')
            .style('top', (d3.event.pageY - 25) + 'px')
            .style('display', 'inline-block')
            .html(`<strong>Estado:</strong> ${d.gsx$estado.$t[0] + d.gsx$estado.$t.slice(1,).toLowerCase()} 
                <br> <strong>Puntuación:</strong> ${Math.round(d.gsx$puntajetotal.$t)}/100`)
    }

    function mouseOut(d, i) {
        d3.select('#tooltip')
            .style('display', 'none')

        d3.select(this)
            .transition('mouseout').duration(100)
            /*.attr('opacity', 0.8)*/
            .attr('stroke-width', 0)
    }

    /*
        FIN --> chartBurbujas
    */
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
            }
        });
        
    }); 
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
            $('#mapaModal').modal('toggle')
            $('#modalTitle').text(d.properties.entidad);
            $('#pntTotal').text(`${Math.round(d.properties.calificacion)}/100`); // Total 100
            $('#pntNormatividad').val(`${Math.round(d.properties.pntNor)}/10`); // Total 10
            $('#pntInf').val(`${Math.round(d.properties.pntInf)}/20`); // Total 20
            $('#pntCH').val(`${Math.round(d.properties.pntCH)}/10`); // Total 10
            $('#pntGD').val(`${Math.round(d.properties.pntGD)}/30`); // Total 30
            $('#pntMC').val(`${Math.round(d.properties.pntMC)}/30`); // Total 30
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
        .html(`<strong>Estado:</strong> ${d.entidad[0] + d.entidad.slice(1,).toLowerCase()} 
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
            return value ? domainFill(value):"#ccc";
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

    let sortData = data.sort(function (a, b) {
        return d3.descending(+a.gsx$puntajetotal.$t, +b.gsx$puntajetotal.$t);
    });
    //console.log(sortData);
    let targetNode = document.getElementById('tablaData');
    sortData.forEach(function (d) {
        let barraNor = d.gsx$porcentajenormatividad.$t > 0 ? `<div class="barraNor progress-bar" role="progressbar" style="width: ${d.gsx$porcentajenormatividad.$t}%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><small>${d.gsx$porcentajenormatividad.$t}%</small></div>`
            :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;

        let barraInf =  d.gsx$porcentajeinfraestructura.$t > 0 ? `<div class="barraInf progress-bar" role="progressbar" style="width: ${d.gsx$porcentajeinfraestructura.$t}%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><small>${d.gsx$porcentajeinfraestructura.$t}%</small></div>`
            :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;

        let barraMGD = d.gsx$porcentajemapeoygestióndedatos.$t > 0 ? `<div class="barraGD progress-bar" role="progressbar" style="width: ${d.gsx$porcentajemapeoygestióndedatos.$t}%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><small>${d.gsx$porcentajemapeoygestióndedatos.$t}%</small></div>`
            :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;

        let barraCH = d.gsx$porcentajecapitalhumano.$t > 0 ? `<div class="barraCH progress-bar" role="progressbar" style="width: ${d.gsx$porcentajecapitalhumano.$t}%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><small>${d.gsx$porcentajecapitalhumano.$t}%</small></div>`
            :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;

        let barraDMC = d.gsx$porcentajedesarrollodemecanismosdecomunicación.$t > 0 ? `<div class="barraMC progress-bar" role="progressbar" style="width: ${d.gsx$porcentajedesarrollodemecanismosdecomunicación.$t}%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><small>${d.gsx$porcentajedesarrollodemecanismosdecomunicación.$t}%</small></div>`
            :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;

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
    let colorBurbujas = colorsCategorias[0];
    chartMaxMin(dataMaxMinNormatividad, classShow, colorBurbujas);
}

function chartInfraestructura() {
    let classShow = 'chartInfraestructura';
    clean(classShow);
    let colorBurbujas = colorsCategorias[1];
    chartMaxMin(dataMaxMinInfraestructura, classShow, colorBurbujas);
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
                    break;
                case  d.properties.calificacion > 80:
                    d.color = '#519ebe';
                    return '#519ebe';
                    break;
                case  d.properties.calificacion > 70:
                    d.color = '#58accf';
                    return '#58accf';
                    break;
                case  d.properties.calificacion > 60:
                    d.color = '#adccd9';
                    return '#adccd9';
                    break;
                case  d.properties.calificacion > 50:
                    d.color = '#efbcbd';
                    return '#efbcbd';
                    break;
                case  d.properties.calificacion > 40:
                    d.color = '#f49899';
                    return '#f49899';
                    break;
                case  d.properties.calificacion > 30:
                    d.color = '#f06c6e';
                    return '#f06c6e';
                    break;
                case  d.properties.calificacion > 20:
                    d.color = '#cb5859';
                    return '#cb5859';
                    break;
                case  d.properties.calificacion > 10:
                    d.color = '#b64547';
                    return '#b64547';
                    break;
                case  d.properties.calificacion > 0:
                    d.color = '#b64547';
                    return '#b64547';
                    break;
                case  d.properties.calificacion === 0:
                    d.color = '#b64547';
                    return '#b64547';
                    break;
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
    //console.log(sign)
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        //i = i+2;
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

$(document).ready(function () {
    // Handler for .ready() called.
    $('html, body').animate({
        scrollTop: 0
    }, 'slow');
});

