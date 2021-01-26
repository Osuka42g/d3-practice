const graf = d3.select("#graf");

const ancho_total = graf.style("width").slice(0, -2);
const alto_total = (ancho_total * 9) / 16;

graf.style("width", `${ancho_total}px`).style("height", `${alto_total}px`);

const margins = { top: 30, left: 50, right: 15, bottom: 120 };

const ancho = ancho_total - margins.left - margins.right;
const alto = alto_total - margins.top - margins.bottom;

let ascendente = false;
let rank = 10;

const svg = graf
  .append("svg")
  .style("width", `${ancho_total}px`)
  .style("height", `${alto_total}px`);

g = svg
  .append("g")
  .attr("transform", `translate(${margins.left}, ${margins.top})`)
  .attr("width", ancho + "px")
  .attr("height", alto + "px");

y = d3.scaleLinear().range([alto, 0]);

x = d3.scaleBand().range([0, ancho]).paddingInner(0.1).paddingOuter(0.3);

color = d3
  .scaleOrdinal()
  .range(d3.schemeCategory10);

const xAxisGroup = g
  .append("g")
  .attr("transform", `translate(0, ${alto})`)
  .attr("class", "eje");
yAxisGroup = g.append("g").attr("class", "eje");

const titulo = g
  .append("text")
  .attr("x", `${ancho / 2}px`)
  .attr("y", "-5px")
  .attr("text-anchor", "middle")
  .text("Pokémon stats")
  .attr("class", "titulo-grafica");

let dataArray = [];

let tipos = {
  Grass: true,
  Fire: true,
  Water: true,
  Bug: true,
  Normal: true,
  Poison: true,
  Electric: true,
  Ground: true,
  Fairy: true,
  Fighting: true,
  Psychic: true,
  Rock: true,
  Ghost: true,
  Dragon: true,
  Ice: true,
};

const colorMapping = {
  Grass: "green",
  Fire: "#FF6060",
  Water: "#60ABFF",
  Bug: "lightgreen",
  Normal: "grey",
  Poison: "purple",
  Electric: "#DEE56C",
  Ground: "brown",
  Fairy: "lightpink",
  Fighting: "darkred",
  Psychic: "#BC84B8",
  Rock: "#715757",
  Ghost: "black",
  Dragon: "darkblue",
  Ice: "lightblue",
};

let type = "all";
let typeSelect = d3.selectAll(".type");

let metrica = "total";
let metricaSelect = d3.select("#metrica");

let rankSelect = d3.select("#rank");

function render(data) {
  bars = g.selectAll("rect").data(data, d => d.name);

  bars
    .enter()
    .append("rect")
    .style("width", "0px")
    .style("height", "0px")
    .style("y", `${y(0)}px`)
    .style("fill", "#000")
    .style("x", (d) => x(d.name) + "px")
    .merge(bars)
    .transition()
    .duration(1000)
    .style("x", (d) => x(d.name) + "px")
    .style("y", (d) => y(d[metrica]) + "px")
    .style("height", (d) => alto - y(d[metrica]) + "px")
    .style("fill", (d) => colorMapping[d.type])
    .style("width", (d) => `${x.bandwidth()}px`);

  bars
    .exit()
    .transition()
    .duration(20)
    .style("height", "0px")
    .style("y", d => `${y(0)}px`)
    .style("fill", "#000000")
    .remove();

  yAxisCall = d3
    .axisLeft(y)
    .ticks(10)
    .tickFormat(d => d + (metrica == "total" ? "pts" : ""));
  yAxisGroup.transition().duration(500).call(yAxisCall);

  xAxisCall = d3.axisBottom(x);
  xAxisGroup
    .transition()
    .duration(2000)
    .call(xAxisCall)
    .selectAll("text")
    .attr("x", "-8px")
    .attr("y", "-5px")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)");
}

const toInt = v => parseInt(v, 10)

d3.csv("pokemon.csv")
  .then((data) => {
    dataArray = data.map(e => ({
      type: e["Type 1"],
      name: e.Name,
      total: toInt(e.Total),
      HP: toInt(e.HP),
      Attack: toInt(e.Attack),
      Defense: toInt(e.Defense),
      SpAtk: toInt(e.SpAtk),
      SpDef: toInt(e.SpDef),
    }));

    color.domain(data.map(d => d.type));

    typeSelect.append("option").attr("value", "all").text("all");
    color.domain().forEach(d => {
      typeSelect.append("option").attr("value", d).text(d);
    });

    frame();
  })
  .catch((e) => {
    console.log("No se tuvo acceso al archivo " + e.message);
  });

function frame() {
  dataframe = dataArray.filter((e) => tipos[e.type]);

  dataframe.sort((a, b) =>
    ascendente
      ? d3.ascending(a[metrica], b[metrica])
      : d3.descending(a[metrica], b[metrica])
  );

  dataframe = dataframe.slice(0, rank);

  maxy = d3.max(dataframe, d => d[metrica]);

  y.domain([0, maxy]);
  x.domain(dataframe.map(d => d.name));

  render(dataframe);
}

typeSelect.on("change", () => {
  type = typeSelect.node().value;
  frame();
});

metricaSelect.on("change", e => {
  metrica = e.target.value;
  frame();
});

rankSelect.on("change", (e) => {
  rank = e.target.value;
  frame();
});

typeSelect.on("change", (e) => {
  toggleType(e.target.value);
  frame();
});

function toggleType(t) {
  tipos[t] = !tipos[t];
}

function cambiaOrden() {
  ascendente = !ascendente;
  frame();
}
