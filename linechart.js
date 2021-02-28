// Utils
// Race condition
// Obtenido de https://jsfiddle.net/subhaze/EN8nc/6/
var MyRequestsCompleted = (function () {
  var numRequestToComplete, requestsCompleted, callBacks, singleCallBack;

  return function (options) {
    if (!options) options = {};

    numRequestToComplete = options.numRequest || 0;
    requestsCompleted = options.requestsCompleted || 0;
    callBacks = [];
    var fireCallbacks = function () {
      for (var i = 0; i < callBacks.length; i++) callBacks[i]();
    };
    if (options.singleCallback) callBacks.push(options.singleCallback);

    this.addCallbackToQueue = function (isComplete, callback) {
      if (isComplete) requestsCompleted++;
      if (callback) callBacks.push(callback);
      if (requestsCompleted == numRequestToComplete) fireCallbacks();
    };
    this.requestComplete = function (isComplete) {
      if (isComplete) requestsCompleted++;
      if (requestsCompleted == numRequestToComplete) fireCallbacks();
    };
    this.setCallback = function (callback) {
      callBacks.push(callBack);
    };
  };
})();

// Gráficas de Stocks
//
graf = d3.select("#graf");
ancho_total = graf.style("width").slice(0, -2);
alto_total = ancho_total * 0.5625;
margins = {
  top: 30,
  left: 70,
  right: 15,
  bottom: 20,
};
ancho = ancho_total - margins.left - margins.right;
alto = alto_total - margins.top - margins.bottom;

// Area total de visualización
svg = graf
  .append("svg")
  .style("width", `${ancho_total}px`)
  .style("height", `${alto_total}px`);

// Contenedor "interno" donde van a estar los gráficos
g = svg
  .append("g")
  .attr("transform", `translate(${margins.left}, ${margins.top})`)
  .attr("width", ancho + "px")
  .attr("height", alto + "px");

svg
  .append("rect")
  .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
  .attr("fill", "black")
  .attr("fill-opacity", 0.25)
  .attr("width", ancho)
  .attr("height", alto)

focus = g.append("g").attr("class", "focus").style("display", "none");

focus.append("line").attr("class", "y-hover-line hover-line");
focus.append("line").attr("class", "x-hover-line hover-line");

focus.append("circle").attr("r", 7.5);

focus.append("text").attr("x", 15).attr("dy", ".31em");

// Escaladores
x = d3.scaleTime().range([0, ancho]);
y = d3.scaleLinear().range([alto, 0]);
color = d3
  .scaleOrdinal()
  .range(["#bb0000", "#00bb00", "#0000bb"]);

// Ejes
xAxisCall = d3.axisBottom();
xAxis = g
  .append("g")
  .attr("class", "ejes")
  .attr("transform", `translate(0, ${alto})`);
yAxisCall = d3.axisLeft();
yAxis = g.append("g").attr("class", "ejes");

// Generador de líneas
lineaGen = d3
  .line()
  .x((d) => x(d.Date))
  .y((d) => y(d.Close));
linea = g.append("path");

lineaGenPasado = d3
  .line()
  .x((d) => x(d.Date))
  .y((d) => y(d.Close));
lineaPasado = g.append("path");

var data = [];
function setData(e) {
  this.data = e;
}
var dataPasado = [];
function setDataPasado(e) {
  this.dataPasado = e;
}

// parser para fechas
//
// documentación de formato:
// https://d3-wiki.readthedocs.io/zh_CN/master/Time-Formatting/
//
// Documentación de la librería de D3:
// https://github.com/d3/d3-time-format
parser = d3.timeParse(d3.timeParse("%Y-%m-%d"));
parserPlusOneMonth = d3.timeParse(d3.timeParse("%Y-%m-%d") + 1);

function load(symbol = "AMZN") {
  firstData = [];
  secondData = [];

  var requestCallback = new MyRequestsCompleted({
    numRequest: 2,
    singleCallback: function () {
      firstData.forEach((d) => {
        d.Close = +d.adj_close;
        d.Date = parser(d.date.split("T")[0]);
      });

      secondData.forEach((d) => {
        dt = new Date(d.date);
        dt.setMonth(dt.getMonth() + 2);
        d.Close = +d.adj_close;
        d.Date = parser(dt.toISOString().split("T")[0]);
      });

      x.domain(d3.extent(firstData, (d) => d.Date));

      y.domain([
        d3.min([...firstData, ...secondData], (d) => d.Close) * 0.95,
        d3.max([...firstData, ...secondData], (d) => d.Close) * 1.05,
      ]);

      // Ejes
      xAxis.transition().duration(500).call(xAxisCall.scale(x));
      yAxis.transition().duration(500).call(yAxisCall.scale(y));

      // setData(firstData);
      // setDataPasado(secondData);
      render(
        {
          first: firstData,
          second: secondData,
        },
        symbol
      );
    },
  });

  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];

  now.setMonth(now.getMonth() - 2);
  const threeMonthsBack = now.toISOString().split("T")[0];

  now.setMonth(now.getMonth() - 2);
  const sixMonthsBack = now.toISOString().split("T")[0];

  const firstCall = {
    url: `https://us-central1-inmuebles-gdl.cloudfunctions.net/stock?symbols=${symbol}&date_from=${threeMonthsBack}&date_to${currentDate}`,
    method: "GET",
    timeout: 0,
    success: function (data) {
      firstData = data.data;
      requestCallback.requestComplete(true);
    },
    cache: true,
  };

  const secondCall = {
    url: `https://us-central1-inmuebles-gdl.cloudfunctions.net/stock?symbols=${symbol}&date_from=${sixMonthsBack}&date_to${threeMonthsBack}`,
    method: "GET",
    timeout: 0,
    success: function (data) {
      secondData = data.data;
      requestCallback.requestComplete(true);
    },
    cache: true,
  };

  $.ajax(firstCall);
  $.ajax(secondCall);
}

function render(data, symbol) {
  linea
    .attr("fill", "none")
    .attr("stroke-width", 3)
    .transition()
    .duration(500)
    .attr("stroke", color(symbol))
    .attr("d", lineaGen(data.first));

  lineaPasado
    .attr("fill", "none")
    .attr("stroke-width", 3)
    .style("stroke-dasharray", "3, 3")
    .transition()
    .duration(500)
    .attr("stroke", color(symbol))
    .attr("d", lineaGen(data.second));
}

load();

function cambio() {
  load(d3.select("#stock").node().value);
}

