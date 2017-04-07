//基本定義

//長寬及留白
var width = 1200;
var height = 800;
var padding = {
    left: 50,
    right: 50,
    top: 50,
    bottom: 50
};

//比例尺

//x比例尺
var xScale = d3.scale.linear()
    .rangeRound([
        padding.left,
        width - padding.right
    ])
    .clamp(true);

//y比例尺
var yScale = d3.scale.linear()
    .rangeRound([
        height - padding.bottom,
        padding.top
    ])
    .clamp(true);

//半徑
var rScale = d3.scale.linear()
    .rangeRound([0, 15]);

var asixX = d3.svg.axis()
    .orient("bottom");

var asixY = d3.svg.axis()
    .orient("left");

//畫布
function svg() {
    //新增畫布
    var svg = d3.select("svg")
        .attr({
            "width": width,
            "height": height
        })
        .style({
            "padding-left": "10%"
        });

    //底層
    svg.append("g")
        .append("rect")
        .attr({
            "width": "90%",
            "height": "90%",
            "fill": "#ffffff "
        });

    //增加x,y軸
    svg.append("g")
        .attr("class", "axis axisX");

    svg.append("text")
        .attr({
            "x": padding.left - 60,
            "y": padding.top,
            "stroke": "gray",
            "stroke-width": 0.5,
            "font-size": 12
        })
        .text("PM2.5");

    svg.append("g")
        .attr("class", "axis axisY");

    svg.append("text")
        .attr({
            "x": width - padding.right,
            "y": height - padding.bottom + 30,
            "stroke": "gray",
            "stroke-width": 0.5,
            "font-size": 12

        })
        .text("O3");

    svg.append("text")
        .attr({
            "x": "40%",
            "y": padding.top - 25,
            "stroke": "red",
            "fill": "red",
            "stroke-width": "none",
            "font-size": "1.5em"
        })
        .text("臺灣各區空氣指標呈現");
}

//將csv數據轉換成int
function mid(data) {
    var newData = data.filter(function (d) {
        return d.Status !== "設備維護" && d.AQI !== "-" && d.O3 !== "-" && d.PM2 !== "";
    });
    newData.AQI = +newData.AQI;
    newData.O3 = +newData.O3;
    newData["PM2.5"] = +newData["PM2.5"];
    return newData;
}

//建置比例尺的domain
function setDomain(data) {
    xScale.domain([
        d3.min(data, function (d) {
            return d.O3
        }),
        d3.max(data, function (d) {
            return d.O3;
        })
    ]);
    //    console.log(xScale(10));
    yScale.domain([
        0,
        d3.max(data, function (d) {
            return d["PM2.5"];
        })
    ]);
    //    console.log(yScale(10));
    rScale.domain([
        0,
        d3.max(data, function (d) {
            return d.AQI;
        })
    ]);
    //    console.log(rScale(10));
    asixX.scale(xScale)
        .ticks(6);

    asixY.scale(yScale)
        .ticks(6);
}

//建置binder 函數
function binder(data) {
    var selection = d3.select("svg")
        .selectAll("circle")
        .data(data);

    selection.enter().append("circle");
    selection.exit().remove();
}

//範圍
function range(num) {
    if (num >= 0 && num <= 50) {
        return "green";
    } else if (num >= 51 && num <= 100) {
        return "yellow";
    } else if (num >= 101 && num <= 150) {
        return "orange";
    } else if (num >= 151 && num <= 200) {
        return "red";
    } else if (num >= 201 && num <= 300) {
        return "purple";
    } else {
        return "gray";
    }
}

//圓半徑
function radius(num) {
    if (num >= 0 && num <= 50) {
        return 6;
    } else if (num >= 51 && num <= 100) {
        return 8;
    } else if (num >= 101 && num <= 150) {
        return 10;
    } else if (num >= 151 && num <= 200) {
        return 12;
    } else if (num >= 201 && num <= 300) {
        return 14;
    } else {
        return 20;
    }
}

//給定數值
function render() {
    var circle = d3.selectAll("circle");

    circle.transition()
        .duration(2000)
        .ease("bounce")
        .attr({
            "cx": function (d) {
                return xScale(d.O3);
            },
            "cy": function (d) {
                return yScale(d["PM2.5"]);
            },
            "r": function (d) {
                return radius(d.AQI);
            },
            "fill": function (d) {
                return range(+d.AQI);
            },
            "stroke": "#aa6969",
            "stroke-width": 1.5
        });

    circle.on("mouseover", function (d) {
            var posiX = d3.select(this).attr("cx");
            //console.log(posiX);
            var posiY = d3.select(this).attr("cy");

            var tooltip = d3.select("#tooltip");

            tooltip.style({
                "left": (+posiX + 250) + "px",
                "top": (+posiY + 250) + "px"
            });

            tooltip.classed("hidden", false);

            tooltip.select(".County")
                .text("縣市:" + d.County);

            tooltip.select(".SiteName")
                .text("觀測站:" + d.SiteName);

            tooltip.select(".Status")
                .text("狀況:" + d.Status);
        })
        .on("mouseout", function (d) {
            d3.select("#tooltip")
                .classed("hidden", true);
        });

    d3.select(".axisX")
        .attr("transform", "translate(" + 0 + "," + (height - padding.bottom + 10) +
            ")")
        .call(asixX);

    d3.select(".axisY")
        .attr("transform", "translate(" + (padding.left - 10) + "," + 0 +
            ")")
        .call(asixY);
}

function unique(dataSet) {
    var newData = [];
    for (var n = 0; n < dataSet.length; n++) {
        if (newData.indexOf(dataSet[n]) === -1) {
            newData.push(dataSet[n]);
        }
    }
    return newData;
}

//按鈕
function btnList(dataSet) {
    var data = dataSet.map(function (d) {
        return d.County;
    });

    var finalData = unique(data);

    d3.select(".buttonCollect")
        .attr({
            "width": 100,
            "height": height
        });

    var selection = d3.select(".buttunCollect")
        .selectAll("button")
        .data(finalData);

    selection.enter().append("button");

    d3.selectAll("button")
        .attr("type", "button")
        //        .attr("value", function (d) {
        //            return d;
        //        });

        .text(function (d) {
            return d;
        });

    //    d3.selectAll("button")
    //        .style({
    //            "padding": "5px";
    //        });

    var input = d3.selectAll("button");

    input.on("click", function (d) {
        var county = d3.select(this).text();
        var newData = dataSet.filter(function (d) {
            return d.County === county;
        });
        binder(newData);
        render();
    });
}

svg();

d3.csv("data/data.csv", function (d) {
    var newData = mid(d);
    //console.table(newData);
    setDomain(newData);
    binder(newData);
    render();
    btnList(newData);
});
