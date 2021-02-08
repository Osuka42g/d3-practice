const graf = d3.select("#graf");

const ancho_total = graf.style("width").slice(0, -2);
const alto_total = (ancho_total * 9) / 16;

graf.style("width", `${ancho_total}px`).style("height", `${alto_total}px`);

const margins = { top: 30, left: 50, right: 15, bottom: 120 };

const ancho = ancho_total - margins.left - margins.right;
const alto = alto_total - margins.top - margins.bottom;

const svg = graf
  .append("svg")
  .style("width", `${ancho_total}px`)
  .style("height", `${alto_total}px`)
  .append("g")
  .attr("transform", `translate(${margins.left}, ${margins.top})`)
  .attr("width", ancho + "px")
  .attr("height", alto + "px");

x = d3.scaleLinear().domain([0, 250]).range([0, ancho]);
svg
  .append("g")
  .attr("transform", "translate(0," + alto + ")")
  .call(d3.axisBottom(x));

y = d3.scaleLinear().domain([0, 250]).range([alto, 0]);
svg.append("g").call(d3.axisLeft(y));

color = d3.scaleOrdinal().range(d3.schemeCategory10);

const titulo = svg  
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

const highlight = (_, el) => {

  d3.selectAll(".dot")
  .transition()
    .duration(200)
    .style("fill", "lightgrey")
    .attr("r", 3);

  d3.selectAll("." + el.type)
    .transition()
    .duration(200)
    .style("fill", colorMapping[el.type])
    .attr("r", 12);
};

const unhighlight = (_, el) => {

  d3.selectAll(".dot")
  .transition()
    .duration(200)
    .style("fill", (d) => colorMapping[d.type])
    .attr("r", 5);
};

function render(data) {
  chart = svg.selectAll("circle").data(data, (d) => d.name);

  chart
    .enter()
    .append("circle")
    .attr("class", (d) => "dot " + d.type + " " + d.name)
    .attr("cx", (d) => x(d[metrica2]))
    .attr("cy", (d) => y(d[metrica1]))
    .attr("r", 5)
    .style("fill", (d) => colorMapping[d.type]);
    
  chart.transition()
    .duration(1000)
    .attr("cx", (d) => x(d[metrica2]))
    .attr("cy", (d) => y(d[metrica1]));
    
  chart.on("mouseover", highlight);
  chart.on("mouseleave", unhighlight);
    
}

const toInt = (v) => parseInt(v, 10);

d3.csv("pokemon.csv")
  .then((data) => {
    dataArray = data.map((e) => ({
      type: e["Type 1"],
      name: e.Name,
      total: toInt(e.Total),
      HP: toInt(e.HP),
      Attack: toInt(e.Attack),
      Defense: toInt(e.Defense),
      SpAtk: toInt(e.SpAtk),
      SpDef: toInt(e.SpDef),
    }));

    color.domain(data.map((d) => d.type));

    frame();
  })
  .catch((e) => {
    console.log("Error loading data " + e.message);
  });

function frame() {
  dataframe = dataArray.filter((e) => tipos[e.type]);

  dataframe = dataframe.slice(0, 151);

  maxy = d3.max(dataframe, (d) => d[metrica1]);
  maxx = d3.max(dataframe, (d) => d[metrica2]);

  y.domain([0, maxy]);
  x.domain([0, maxx]);

  render(dataframe);
}

// UI Interaction
let metrica1 = "SpAtk";
let metrica1Select = d3.select("#metrica1");

let metrica2 = "SpDef";
let metrica2Select = d3.select("#metrica2");

metrica1Select.on("change", (e) => {
  metrica1 = e.target.value;
  frame();
});

metrica2Select.on("change", (e) => {
  metrica2 = e.target.value;
  frame();
});
