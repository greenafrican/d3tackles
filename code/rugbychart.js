function rugbyChart() {
    var margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        },
        width = 1024,
        height = 800,
        center = {
            x: width / 2,
            y: height / 2
        },
        color = d3.scale.category20(),
        group = "all",
        team_centers = {
          "STORMERS": {x: width / 3, y: height / 2},
          "CRUSADERS": {x: width / 1.5, y: height / 2}
        };
        fb_centers = {
          "FORWARDS": {x: width / 3, y: height / 3},
          "BACKS": {x: width / 1.5, y: height / 1.5}
        };
        var target = center;
        var force = d3.layout.force();
        var svg = d3.select("#example")
        var node = svg.selectAll(".node");  
    
    function chart(selection) {
        selection.each(function (d,i) {
            
            force = d3.layout.force()
                .size([width, height]);

            var svg = d3.select("#example").append("svg")
                .attr("width", width)
                .attr("height", height);

            force.nodes(d);

            node = svg.selectAll(".node")
                .data(d)
                .enter().append("g")
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                .call(force.drag);    

            circles = node.append("circle")
                .attr("class", "node")
                .attr("r", 0)
                .style("stroke-width", 2)
                .style("stroke", function(d) { return d3.rgb(color(d.Team)).darker(); })
                .style("fill", function(d) { return color(d.Team); });

            node.append("text")
                .attr("text-anchor", "middle")
                .attr("y", function(d) { return (d.Tack * (80 / d.Mins)) * 0.75;})
                .attr("style", function(d) { 
                  return "font-size:" + ((d.Tack * (80 / d.Mins)) * 2) + "px;";
                   })
                .style("fill","white")
                .text(function(d) { return d.Pos; });

            circles.transition().duration(1000).attr("r", function(d) { return (d.Tack * (80 / d.Mins)) * 4;})

            force.gravity(-0.008)
                    .charge(charge)
                    .friction(0.9);
            
            group_layout(group);
            
        });
    }

    function charge(d) {
        return -Math.pow((d.Tack * (80 / d.Mins)) * 4, 2.0) / 8;
    }

    function move_towards_center(alpha) {
        return function(d) {
          target = center;
          d.x = d.x + (center.x - d.x) * (0.1 + 0.02) * alpha;
          d.y = d.y + (center.y - d.y) * (0.1 + 0.02) * alpha;
        };
    }

    function move_towards_team(alpha) {
        return function(d) {
          target = team_centers[d.Team];
          d.x = d.x + (target.x - d.x) * (0.1 + 0.02) * alpha;
          d.y = d.y + (center.y - d.y) * (0.1 + 0.02) * alpha;
        };
    }

    function move_towards_fb(alpha) {
        var fb;
        return function(d) {
            if (d.Pos >= 9) { fb = "BACKS"; console.log(fb);} else { fb ="FORWARDS"; };
            target = fb_centers[fb];
            d.y = d.y + (target.y - d.y) * (0.1 + 0.02) * alpha;
            d.x = d.x + (center.x - d.x) * (0.1 + 0.02) * alpha;
        };
    }

    function group_layout(group) {
        force.on("tick", function(e) {
            if (group == "team") {
                node.each(move_towards_team(e.alpha))
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            } else if (group == "fb") {
                node.each(move_towards_fb(e.alpha))
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            } else {
                node.each(move_towards_center(e.alpha))
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            }
        });
        force.start();
    }

    chart.group = function (_) {
        if (!arguments.length) return group;
        group = _;
        group_layout(group);
        return chart;
    };

    return chart;
}