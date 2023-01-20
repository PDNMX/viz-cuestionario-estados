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
let versionMetologia;

//const txt1v1 = "<li class='normatividad'><b>Normatividad</b>: ¿la entidad federativa ya cuenta con bases para el funcionamiento de su Plataforma o Sistema de Información y ya analizó su normatividad aplicable?;</li> <li class='infraestructura'><b>Infraestructura</b>: ¿la entidad cuenta con los recursos necesarios para llevar a cabo el desarrollo;</li> <li class='capitalHumano'><b>Capital humano</b>: ¿la entidad cuenta con el personal para llevar a cabo el desarrollo?</li> <li class='mapeoGestion'><b>Mapeo y gestión de datos</b>: ¿cómo van los trabajos para que los datos sean proveídos por las autoridades locales?, y</li> <li class='devMecanismos'><b>Desarrollo de mecanismos de comunicación</b>: ¿cómo van los trabajos para comunicar a la entidad federativa con la PDN? </li>"
//const bulletsV2 = "<li class='normatividad'><b>Normatividad</b>: ¿la entidad federativa ya cuenta con bases para el funcionamiento de su Plataforma o Sistema de Información y ya analizó su normatividad aplicable?;</li> <li class='capitalHumano'><b>Capital Humano</b>: ¿la entidad cuenta con el personal para llevar a cabo el desarrollo?</li> <li class='devMecanismos'><b>Interconexión</b>: ¿la entidad cuenta con ...?</li>"
const labelInterconexión = '<h2 class="tituloSeccion">Interconexión</h2> <p>Esta categoría permite conocer el avance de las Secretarías Ejecutivas de los Sistemas Estatales Anticorrupción y de las instituciones públicas en la incorporación de datos a la PDN.</p>'
const labelCapitalHumano = '<h2 class="tituloSeccion">Capital humano</h2> <p>Esta categoría muestra si la Secretaría Ejecutiva Estatal cuenta con personal suficiente adscrito a su institución o contratado por algún otro mecanismo para el desarrollo de su Plataforma Digital o Sistema de información. Además, en esta categoría se refleja si el equipo técnico cuenta con el grado de conocimiento técnico actual para lograr la interconexión con la PDN. <br>La puntuación máxima para esta categoría es <b>10</b>. </p>'
const puntajeV1 = "<li><b>Normatividad</b>: 10 puntos;</li> <li><b>Infraestructura</b>: 20 puntos;</li> <li><b>Capital humano</b>: 10 puntos;</li> <li><b>Mapeo y gestión de datos</b>: 30 puntos, y</li> <li><b>Desarrollo de mecanismos de comunicación</b>: 30 puntos.</li>"
const puntajeV2 = "<li><b>General</b>: N/A,</li> <li><b>Normatividad</b>: 10 puntos,</li> <li><b>Capital humano</b>: 20 puntos y</li> <li><b>Proceso de interconexión</b>: 70 puntos.</li>"

const txt1v1 = "<h2 class='tituloSeccion'>Avances de interconexión subnacional. Sistemas 2 y 3. </h2> <h3>Puntos por Categoría </h3> <p>Este tablero representa los avances de las Secretarías Ejecutivas de los Sistemas Locales Anticorrupción en el desarrollo de los sistemas (2) de servidores públicos que intervengan en procedimientos de contrataciones públicas y (3) de servidores públicos y particulares sancionados. Trimestralmente, las Secretarías Ejecutivas Locales responden un cuestionario elaborado por la SESNA para reportar sus avances en las siguientes categorías:</p> <ul class='no_bullet'><li class='normatividad'><b>Normatividad</b>: ¿la entidad federativa ya cuenta con bases para el funcionamiento de su Plataforma o Sistema de Información y ya analizó su normatividad aplicable?;</li> <li class='infraestructura'><b>Infraestructura</b>: ¿la entidad cuenta con los recursos necesarios para llevar a cabo el desarrollo;</li> <li class='capitalHumano'><b>Capital humano</b>: ¿la entidad cuenta con el personal para llevar a cabo el desarrollo?</li> <li class='mapeoGestion'><b>Mapeo y gestión de datos</b>: ¿cómo van los trabajos para que los datos sean proveídos por las autoridades locales?, y</li> <li class='devMecanismos'><b>Desarrollo de mecanismos de comunicación</b>: ¿cómo van los trabajos para comunicar a la entidad federativa con la PDN? </li></ul> </div>"
const txt1v2 = "<h2 class='tituloSeccion'>Avances de interconexión subnacional. Sistemas 1, 2 y 3. </h2> <h3>Puntos por Categoría</h3> <p>Este tablero representa los avances trimestrales de las Secretarías Ejecutivas de los Sistemas Locales Anticorrupción en el desarrollo de los sistemas: (1) de evolución patrimonial, de declaración de intereses y constancia de presentación de declaración fiscal, (2) de servidores públicos que intervengan en procedimientos de contrataciones públicas y (3) de servidores públicos y particulares sancionados, con base en un cuestionario que incluye las siguientes categorías: </p> <ul class='no_bullet'> <li class='general'><b>General</b>: permite recabar información para mantener contacto con personal encargado del desarrollo de la Plataforma Digital o un Sistema de Información de las  Secretarías Ejecutivas de los Sistemas Estatales Anticorrupción.</li> <li class='normatividad'><b>Normatividad</b>: permite conocer el avance de las Secretarías Ejecutivas de los Sistemas Estatales Anticorrupción en la elaboración de sus bases para el funcionamiento de su plataforma digital o sistema de información.</li> <li class='capitalHumano'><b>Capital Humano</b>: permite saber si las Secretarías Ejecutivas de los Sistemas Estatales Anticorrupción cuentan con un equipo interno o externo encargado del desarrollo de su plataforma digital o sistema de información.</li> <li class='devMecanismos'><b>Proceso de interconexión</b>: permite conocer el avance de las Secretarías Ejecutivas de los Sistemas Estatales Anticorrupción en la incorporación de datos a la PDN.</li></ul>"
const txt1v1After = "<p><strong>La tabla de la derecha muestra el porcentaje de avance de las entidades federativas que respondieron el cuestionario, para cada una de las categorías evaluadas, de manera independiente.</strong></p> <p>Cada columna corresponde a una categoría evaluada. Es importante considerar que cada categoría implica cumplir con una serie de actividades para estar completa. El cumplimiento del total de las actividades evaluadas, para cada categoría, representa el 100% de avance.</p> <p>Los resultados muestran las categorías donde las Secretarías han avanzado más o, en su caso, deberán concentrar esfuerzos hasta interconectar los datos de su entidad federativa con la PDN.</p>"
const txt1v2After = "<p><strong>La tabla de la derecha muestra el porcentaje de avance de las entidades federativas para cada una de las categorías evaluadas. </strong></p><p>La categoría General, no cuenta con un puntaje asignado, ya que las preguntas que la integran, permiten recabar información sobre el personal encargado del desarrollo de la Plataforma Digital o un Sistema de Información de las Secretarías Ejecutivas de los Sistemas Estatales Anticorrupción.</p>"

const txtMapav1 = "<p>Este mapa muestra el grado de avance general de las entidades federativas en los trabajos para alcanzar la interconexión con la PDN en los sistemas 2 y 3. Da clic en cualquier entidad federativa para consultar su gráfico de radar, en el que los ejes representan cada una de las categorías contempladas para medir los avances.</p>"
const txtMapav2 = "<p>Este mapa muestra el grado de avance de las entidades federativas en los trabajos para alcanzar la interconexión con la PDN en los sistemas 1, 2 y 3. Da clic en cualquier estado para consultar su gráfico de radar, en el que los ejes representan las categorías contempladas para medir los avances.</p>"

const labelInfra = '<h2 class="tituloSeccion">Infraestructura</h2> <p>Esta categoría permite conocer si la Secretaría Ejecutiva Estatal cuenta con la infraestructura necesaria, o con los recursos para rentarla o adquirirla, para almacenar y procesar la información que se desprende de los sistemas 2 y 3. <br> El puntaje total de la categoría <b>son 20 puntos</b>. </p>'
const labelCapitalHumanoV2 = '<h2 class="tituloSeccion">Capital humano</h2> <p>Esta categoría muestra si la Secretaría Ejecutiva Estatal cuenta con personal suficiente adscrito a su institución o contratado por algún otro mecanismo para el desarrollo de su Plataforma Digital o Sistema de información. Además, en esta categoría se refleja si el equipo técnico cuenta con el grado de conocimiento técnico actual para lograr la interconexión con la PDN. <br>La puntuación máxima para esta categoría es <b>20</b>. </p>'
Promise.all([
    // dataset de trimestres
    fetch('https://sheets.googleapis.com/v4/spreadsheets/1x17q4Ny8ENBniRT0WrlIVLU7LEs2fU1u7q2rxEypMNg/values/edos?key=AIzaSyDrvQehuVTPGJVCFVx3FUeAq2zqYbTCFDo'),
    fetch('data/mexico.json')
]).then(async ([aa, bb]) => {
    const a = await aa.json();
    const b = await bb.json();
    return [a, b]
})
    .then((responseText) => {
        let datasetEdos = responseText[0].values;
        datasetEdos.shift(); // elimina el primer row que tiene los encabezados de columna
        datasetEdos = datasetEdos.sort((a, b) => new Date(b[1]) - new Date(a[1]));
        versionMetologia = datasetEdos[0][9]; // SET versión de metodología
        // carga los copys del ultimo registro
        if (versionMetologia == 'v1'){
            document.getElementById("txt1").innerHTML = txt1v1;
            document.getElementById("txt1After").innerHTML = txt1v1After;
            document.getElementById("seccionCapitalHumano").innerHTML = labelCapitalHumano;
            document.getElementById("bulletsPuntaje").innerHTML = puntajeV1;
            document.getElementById("seccionInfra").innerHTML = labelInfra;
            document.getElementById("txtMapa").innerHTML = txtMapav1;
        }
        document.getElementById("copy1").innerHTML = datasetEdos[0][3];
        document.getElementById("copy4").innerHTML = datasetEdos[0][4];
        document.getElementById("copy5").innerHTML = datasetEdos[0][5];
        document.getElementById("copy6").innerHTML = datasetEdos[0][6];
        document.getElementById("copy7").innerHTML = datasetEdos[0][7];
        document.getElementById("copy8").innerHTML = datasetEdos[0][8];

        //console.log(versionMetologia);
        if (versionMetologia == 'v2'){
            document.getElementById("maxMin7").style.display = "none";
            document.getElementById("maxMin8").style.display = "none";
            document.getElementById("txt1").innerHTML = txt1v2;
            document.getElementById("txt1After").innerHTML = txt1v2After; 
            document.getElementById("seccionCapitalHumano").innerHTML = labelInterconexión;
            document.getElementById("bulletsPuntaje").innerHTML = puntajeV2;
            document.getElementById("seccionInfra").innerHTML = labelCapitalHumanoV2;
            document.getElementById("txtMapa").innerHTML = txtMapav2;

        }
        fetch(datasetEdos[0][2])
        .then(response => response.json())
        .then(data => {
            data.values.shift();
            //createScales(data.values);
            createTabla(data.values);
            //setTimeout(drawInitial(data.values), 100);
            drawInitial(data.values);
        }).catch((err) => {
            console.log(err);
        });
        
        let select = document.getElementById("selectTrimestre");
        datasetEdos.map(function(item){
            let option = document.createElement("option");
            option.value = item[2]; // url_data
            option.text  = item[0]; // nombre
            option.dataset.copy1 = item[3]
            option.dataset.copy4 = item[4]
            option.dataset.copy5 = item[5]
            option.dataset.copy6 = item[6]
            option.dataset.copy7 = item[7]
            option.dataset.copy8 = item[8]
            option.dataset.version = item[9]
            select.appendChild(option);
        });

        mexico = responseText[1];
        //createScales(responseText[0].values);
        //createTabla(responseText[0].values);
        //setTimeout(drawInitial(responseText[0].values), 100);
    }).catch((err) => {
    console.log(err);
});

function createScales(dataset) {
    //console.log(dataset);
    sizeScale = d3.scaleLinear(d3.extent(dataset, d => d[17]), [5, 35]);
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
            //console.log(versionMetologia)
            if(parseInt(element.properties.clave)===parseInt(newElement[1])){
                if(versionMetologia == 'v1'){
                    // Set data of Google Spreadsheets
                    element.properties.entidad=newElement[0];
                    element.properties.calificacion=newElement[17];
                    element.properties.pntNor=parseInt(newElement[2]);
                    element.properties.pntInf=parseInt(newElement[5]);
                    element.properties.pntCH=parseInt(newElement[8]);
                    element.properties.pntGD=parseInt(newElement[11]);
                    element.properties.pntMC=parseInt(newElement[14]);
                    // porcentajes
                    element.properties.porcentajeNor=parseInt(newElement[3]);
                    element.properties.porcentajeInf=parseInt(newElement[6]);
                    element.properties.porcentajeCH=parseInt(newElement[9]);
                    element.properties.porcentajeGD=parseInt(newElement[12]);
                    element.properties.porcentajeMC=parseInt(newElement[15]);
                }
                if(versionMetologia == 'v2'){
                    // Set data of Google Spreadsheets
                    element.properties.entidad=newElement[0];
                    element.properties.calificacion=newElement[12];

                    element.properties.pntNor=parseInt(newElement[5]);
                    element.properties.pntInf=parseInt(newElement[8]);
                    element.properties.pntCH=parseInt(newElement[11]);
                    // porcentajes
                    element.properties.porcentajeNor=parseInt(newElement[4]);
                    element.properties.porcentajeInf=parseInt(newElement[7]);
                    element.properties.porcentajeCH=parseInt(newElement[10]);

                }
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
            let dataTest;
            if(versionMetologia == 'v1') {
                dataTest = [
                    [
                        {"area": "Desarrollo de mecanismos de comunicación ", "value": d.properties.porcentajeMC},
                        {"area": "Normatividad ", "value": d.properties.porcentajeNor},
                        {"area": "Mapeo y gestión de datos", "value": d.properties.porcentajeGD},
                        {"area": "Capital humano ", "value": d.properties.porcentajeCH},
                        {"area": "Infraestructura", "value": d.properties.porcentajeInf}
                    ]
                  ];
            }
            if(versionMetologia == 'v2') {
                dataTest = [
                    [
                        {"area": "Normatividad ", "value": d.properties.porcentajeNor},
                        {"area": "Capital humano ", "value": d.properties.porcentajeInf},
                        {"area": "Interconexión", "value": d.properties.porcentajeCH}
                    ]
                  ];
            } 
            
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


    let dataStacked = [];
    let topData
    let group;
    let tableTop10;
    let z;
    if (versionMetologia == 'v1'){
        z = d3.scaleOrdinal(['#34B3EB', '#34a853', '#674ea7', '#ff6d01', '#fbbc04']);
        group = ["Normatividad", "Infraestructura", "Capital humano", "Mapeo y gestión de datos", "Desarrollo de mecanismos de comunicación"];
        topData = dataset.sort(function (a, b) {
            return d3.descending(+a[12], +b[12]);
        }).slice(0, 10);

        tableTop10 = document.getElementById('tableTop10');
        tableTop10.innerHTML = '';
        topData.forEach(function (d) {
            let estado = d[0];
            let puntaje = d[17];
            tableTop10.innerHTML += `<tr>
             <td>${estado}</td>
             <td>${puntaje}</td>
           </tr>`
        });
    }
    if (versionMetologia == 'v2'){
        z = d3.scaleOrdinal(['#34B3EB', '#674ea7', '#fbbc04']);
        group = ["Normatividad", "Capital humano", "Interconexión"];
        topData = dataset.sort(function (a, b) {
            return d3.descending(+a[12], +b[12]);
        }).slice(0, 10);

        tableTop10 = document.getElementById('tableTop10');
        tableTop10.innerHTML = '';
        topData.forEach(function (d) {
            let estado = d[0];
            let puntaje = d[13];
            tableTop10.innerHTML += `<tr>
             <td>${estado}</td>
             <td>${puntaje}</td>
           </tr>`
        });
    }
    //console.log("topData:", topData);

    dataset.forEach(function(d) {
        let tempData;
        if (versionMetologia == 'v1'){
            tempData = {
                Entidad: d[0],
                'Normatividad': Number.parseFloat(d[2]),
                'Infraestructura': Number.parseFloat(d[5]),
                'Capital humano': Number.parseFloat(d[8]),
                'Mapeo y gestión de datos': Number.parseFloat(d[11]),
                'Desarrollo de mecanismos de comunicación': Number.parseFloat(d[14]),
                total: Number.parseFloat(d[17])
            };
        }
        if (versionMetologia == 'v2'){
            tempData = {
                Entidad: d[0],
                'Normatividad': Number.parseFloat(d[5]),
                'Capital humano': Number.parseFloat(d[8]),
                'Interconexión': Number.parseFloat(d[11]),
                total: Number.parseFloat(d[13])
            };
        }
        
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
        .attr('width', function(d) {return x(100);} );
        /* .attr('fill', 'gray')
        .attr("stroke", "#ced8db"); */

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
        /* .attr("stroke", "#ced8db") */
        /* .attr("fill", "#ced8db") */
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
            case 'Interconexión':
                txtTotal = 70;
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
        .attr("fill", "#ced8db")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Puntaje Total");

    let ele = svg.select(".stackedBar").append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        /* .attr("stroke", "#ced8db") */
        .call(d3.axisLeft(y));
    ele.selectAll("text")

    let rectTooltipg = svg.select(".stackedBar").append("g")
        .attr("font-family", 'Roboto')
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
        .attr("font-family", 'Roboto')
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
            return 'Roboto';
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
        .attr("font-family", 'Roboto')
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
   if (versionMetologia == 'v1'){
    dataset.forEach(function(d) {
        let tempData = {
            'entidad': d[0],
            'cat1': Number.parseFloat(d[2]),
            'cat1_dif': Number.parseFloat(d[4]),
            'cat2': Number.parseFloat(d[5]),
            'cat2_dif': Number.parseFloat(d[7]),
            'cat3': Number.parseFloat(d[8]),
            'cat3_dif': Number.parseFloat(d[10]),
            'cat4': Number.parseFloat(d[11]),
            'cat4_dif': Number.parseFloat(d[13]),
            'cat5': Number.parseFloat(d[14]),
            'cat5_dif': Number.parseFloat(d[16])
        };
        dataPictogram.push(tempData);
    });
   }
   if (versionMetologia == 'v2'){ 
    dataset.forEach(function(d) {
        let tempData = {
            'entidad': d[0],
            'cat1': Number.parseFloat(d[5]),
            'cat1_dif': Number.parseFloat(d[3]),
            'catV2-CapitalHumano': Number.parseFloat(d[8]),
            'catV2-CapitalHumano_dif': Number.parseFloat(d[6]),
            'catV2-Interconexion': Number.parseFloat(d[11]),
            'catV2-Interconexion_dif': Number.parseFloat(d[9]),
        };
        dataPictogram.push(tempData);
    });
   }

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
    //console.log(versionMetologia)
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
    if (chartType !== "chartMapeoGestion" || versionMetologia == "v1") {
        svg.select('.chartMapeoGestion').transition().attr('visibility', 'hidden');
    }
    if (chartType !== "chartDevMecanismos" || versionMetologia == "v1") {
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
    /* document.getElementById("colDMC").style.display = "";
    document.getElementById("colMGD").style.display = ""; */
    clean(idShow);
    //console.log(versionMetologia);
    let targetNode = document.getElementById('tablaData');
    // limpia los elementos de la tablas
    targetNode.innerHTML = '';

    if(versionMetologia == 'v1'){
        document.getElementById("encabezadosTabla").innerHTML = `<th scope='col' style='width: 15%;'></th>
        <th id='colNormatividad' scope='col' style='width: 17%;'><small>Normatividad</small></th>
        <th id='colInfra' scope='col' style='width: 17%;'><small>Infraestructura</small></th>
        <th id='colCH' scope='col' style='width: 17%;'><small>Capital humano</small></th>
        <th id='colMGD' scope='col' style='width: 17%;'><small>Mapeo y gestión de datos</small></th>
        <th id='colDMC' scope='col' style='width: 17%;'><small>Desarrollo de mecanismos de comunicación</small></th>`;
        let sortData = data.sort(function (a, b) {
            // ordena la columna de puntaje total de forma descendiente
            return d3.descending(+a[17], +b[18]);
        });
        //console.log(sortData);
        sortData.forEach(function (d) {
            let barraNor = d[3] > 0 ? `<div class="barraNor progress-bar" aria-valuenow="${d[3]}" aria-valuemin="0" aria-valuemax="100"><small>${d[3]}%</small></div>`
                :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d[3]}" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;
    
            let barraInf =  d[6] > 0 ? `<div class="barraInf progress-bar" aria-valuenow="${d[6]}" aria-valuemin="0" aria-valuemax="100"><small>${d[6]}%</small></div>`
                :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d[6]}"><small>0%</small></div>`;
    
            let barraMGD = d[12] > 0 ? `<div class="barraGD progress-bar" role="progressbar" aria-valuenow="${d[12]}" aria-valuemin="0" aria-valuemax="100"><small>${d[12]}%</small></div>`
                :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d[12]}" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;
    
            let barraCH = d[9] > 0 ? `<div class="barraCH progress-bar" role="progressbar" aria-valuenow="${d[9]}" aria-valuemin="0" aria-valuemax="100"><small>${d[9]}%</small></div>`
                :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d[9]}" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;
    
            let barraDMC = d[15] > 0 ? `<div class="barraMC progress-bar" role="progressbar" aria-valuenow="${d[15]}" aria-valuemin="0" aria-valuemax="100"><small>${d[15]}%</small></div>`
                :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d[15]}" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;
    
            targetNode.innerHTML += `
            <tr>
                <td>
                    <small>${d[0]}</small>
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
    if(versionMetologia == 'v2'){
        document.getElementById("colDMC").style.display = "none";
        document.getElementById("colMGD").style.display = "none";

        document.getElementById("encabezadosTabla").innerHTML = `<th scope="col" style="width: 15%;"></th> <th id="colNormatividad" scope="col" style="width: 17%;"><small>Normatividad</small></th> <th id="colInfra" scope="col" style="width: 17%;"><small>Capital humano</small></th> <th id="colCH" scope="col" style="width: 17%;"><small>Interconexión</small></th> <th id="colMGD" scope="col" style="width: 17%; display: none"><small>Mapeo y gestión de datos</small></th> <th id="colDMC" scope="col" style="width: 17%; display: none"><small>Desarrollo de mecanismos de comunicación</small></th>`;
        let sortData = data.sort(function (a, b) {
            // ordena la columna de puntaje total de forma descendiente
            return d3.descending(+a[17], +b[18]);
        });
        //console.log(sortData);
        sortData.forEach(function (d) {
            let barNormatividad = d[4] > 0 ? `<div class="barraNor progress-bar" aria-valuenow="${d[4]}" aria-valuemin="0" aria-valuemax="100"><small>${d[4]}%</small></div>`
                :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d[4]}" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;
    
            let barCH = d[7] > 0 ? `<div class="barraCH progress-bar" role="progressbar" aria-valuenow="${d[7]}" aria-valuemin="0" aria-valuemax="100"><small>${d[7]}%</small></div>`
                :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d[7]}" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;
    
            let barPInterconexion = d[10] > 0 ? `<div class="barraMC progress-bar" role="progressbar" aria-valuenow="${d[10]}" aria-valuemin="0" aria-valuemax="100"><small>${d[10]}%</small></div>`
                :  `<div class="barraCero progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="${d[10]}" aria-valuemin="0" aria-valuemax="100"><small>0%</small></div>`;
    
            targetNode.innerHTML += `
            <tr>
                <td>
                    <small>${d[0]}</small>
                </td>
                <td>
                    <div class="progress" style="height: 15px;">
                        ${barNormatividad}
                    </div>
                </td>
                <td>
                    <div class="progress" style="height: 15px;">
                        ${barCH}            
                    </div>
                </td>
                <td>
                    <div class="progress" style="height: 15px;">
                        ${barPInterconexion}    
                    </div>
                </td>
            </tr>
          `
        });
    }

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
    //console.log(versionMetologia);
    let tipoCat = versionMetologia == 'v1' ? "cat2" : "catV2-CapitalHumano"; // evalua la versión y define el tipo de categoría
    chartPictograma(dataPictogram, tipoCat);
    document.getElementById('pictograma').style.display = "block";
    document.getElementById('vis').style.display = "none";
    //dataMaxMinInfraestructura = [];
}

function chartCapitalHumano() {
    let classShow = 'chartCapitalHumano';
    clean(classShow);
    let tipoCat = versionMetologia == 'v1' ? "cat3" : "catV2-Interconexion";
    chartPictograma(dataPictogram, tipoCat);
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
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", 0.8)
        .attr("stroke", "#ced8db");
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
        //console.log(selectElement.options[selectElement.options.length - 1].value)
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

        versionMetologia = event.target.options[event.target.selectedIndex].dataset.version;
        if (versionMetologia == 'v2'){
            document.getElementById("maxMin7").style.display = "none";
            document.getElementById("maxMin8").style.display = "none";
            document.getElementById("txt1").innerHTML = txt1v2;
            document.getElementById("txt1After").innerHTML = txt1v2After;
            document.getElementById("seccionCapitalHumano").innerHTML = labelInterconexión;
            document.getElementById("bulletsPuntaje").innerHTML = puntajeV2;
            document.getElementById("seccionInfra").innerHTML = labelCapitalHumanoV2;
            document.getElementById("txtMapa").innerHTML = txtMapav2;
            
        }
        if (versionMetologia == 'v1'){
            document.getElementById("maxMin7").style.display = "";
            document.getElementById("maxMin8").style.display = "";
            document.getElementById("txt1").innerHTML = txt1v1;
            document.getElementById("txt1After").innerHTML = txt1v1After;
            document.getElementById("seccionCapitalHumano").innerHTML = labelCapitalHumano;
            document.getElementById("bulletsPuntaje").innerHTML = puntajeV1;
            document.getElementById("seccionInfra").innerHTML = labelInfra;
            document.getElementById("txtMapa").innerHTML = txtMapav1;
        }
        fetch(event.target.value)
        .then(response => response.json())
        .then(data => {
            //console.log(data);
            data.values.shift();
            //createScales(data.values);
            createTabla(data.values);
            //setTimeout(drawInitial(data.values), 100);
            drawInitial(data.values);
        });
    });
    $('#modalTitle').text('Aviso');
    $('#mapaModal').modal('toggle');
    $(document).on('hidden.bs.modal', '#mapaModal', function () {
        document.getElementById('txtAviso').innerHTML = '';
    });
    
});

