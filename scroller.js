// using d3 for convenience
let main = d3.select("main");
let tablaScore = d3.select("#tablaScore");
let seccionUltima = d3.select("#seccionUltima");
let seccionPrimera = d3.select("#seccionPrimera");
let vis = d3.select("#vis");
let scrolly = main.select("#scrolly");
let figure = scrolly.select("#contentViz");
let article = scrolly.select("article");
let step = article.selectAll(".step");

// initialize the scrollama
let scroller = scrollama();

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  //let stepH = Math.floor(window.innerHeight * 0.75);
  //step.style("height", stepH + "px");
  let currentHeight = parseInt(d3.select('nav').style('height'), 10);
  currentHeight = currentHeight * 1.15;

  let figureHeight = window.innerHeight / 1.13;
  /* let figureMarginTop = (window.innerHeight - figureHeight) / 2; */

  figure
    .style("height", figureHeight + "px")
    .style("top", currentHeight + "px");
  
  tablaScore
    .style("height", figureHeight + "px")
    .style("top", currentHeight + "px");
  
  vis
    .style("height", figureHeight + "px")
    .style("top", currentHeight + "px");
  
  seccionUltima
    .style("min-height", figureHeight + "px");

  seccionPrimera
    .style("min-height", figureHeight + "px");
  
  scrolly
    .style("top", currentHeight + "px");

  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
  //console.log(response.index);
  // response = { element, direction, index }

  // add color to current step only
  step.classed("is-active", function (d, i) {
    return i === response.index;
  });

  // update graphic based on step
  let activationFunctions = [chartTabla, chartMexicoPuntuacion, chartStackedBar, chartNormatividad, chartInfraestructura, chartCapitalHumano, chartMapeoGestion, chartDevMecanismos]
  activationFunctions.forEach((data, index) => {
    if (index === response.index) {
      activationFunctions[index]();
    }
  })
}

/* function setupStickyfill() {
  d3.selectAll(".sticky").each(function () {
    //Stickyfill.add(this);
  });
} */

function init() {
  //setupStickyfill();

  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();

  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller
    .setup({
      step: "#scrolly article .step",
      offset: 0.65,
      debug: false
    })
    .onStepEnter(handleStepEnter);

  // setup resize event
  window.addEventListener("resize", handleResize);
}

// kick things off
init();
