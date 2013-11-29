/********************************************************************************

            hk_js.js
    
    PURPOSE:
        Kiva visualization map interactivity and styling
        
    AUTHOR: 
        - Han Kim
        
    LAST UPDATED:
        - 05/02/2013

    NOTES: 
        - Probably a good idea tofactor out common commands from draw()
        - There are Pros/Cons for both 
            * exact string match
            * "string containing text input" logic 
          for the occupation filter. I chose to do "containing" for Project 3

*********************************************************************************/

    /*** initial variables/settings ***/

// categorize borrower's business 
var sector_list = ["Food", "Agriculture", "Clothing", "Construction",
                "Health", "Retail", "Services", "Arts", "Housing", 
                "Transportation", "Manufacturing"];

// colorbrewer's recommended qualitative scheme 
//   to match number of sectors in our universe
var sector_colors = {
        Food: "#a6cee3", Agriculture: "#1f78b4", Clothing: "#b2df8a",
        Construction: "#33a02c", Health: "#fb9a99", 
        Retail: "#e31a1c", Services: "#fdbf6f", Arts: "#ff7f00",
        Housing: "#cab2d6", Transportation: "#6a3d9a", Manufacturing: "#ffff99"
};

var sector_colors_array = [
        "#a6cee3", "#1f78b4", "#b2df8a",
        "#33a02c", "#fb9a99", 
        "#e31a1c", "#fdbf6f", "#ff7f00",
        "#cab2d6", "#6a3d9a", "#ffff99"
];

// variable used to filter the dataset
cat_1_switch = "initializing_the_app";

// set dimensions and projection type of svg
var w = screen.availWidth * 0.9,
    h = screen.availHeight * 0.9;

var projection = d3.geo.equirectangular()
    .scale(280)
    .translate([w / 2, h / 2])
    .precision(10);

// maps coordinate to map canvas
var path = d3.geo.path()
    .projection(projection);

/********************************************************************************/

	/*** prepare high level elements ***/
	
// prepare svg container
svg = d3.select("#map_container").insert("svg:svg")
    .attr("viewBox", "0 0 " + w + " " + h )
    .attr("preserveAspectRatio", "xMidYMid meet");

/********************************************************************************/

	/*** prepare base map ***/

// graticule
var graticule = d3.geo.graticule();

svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);    

// draw the base world map
d3.json("/kivaflava/static/data/world-50m.json", function(error, world) { 
	
	// first, land
	svg.insert("path", ".graticule")
		.datum(topojson.object(world, world.objects.land))
		.attr("class", "land")
		.attr("d", path);

	// now borders
	svg.insert("path", ".graticule")
		.datum(topojson.mesh(world, world.objects.countries, 
                function(a, b) { return a !== b; }))
		.attr("class", "boundary")
		.attr("d", path);
});
  
/********************************************************************************/

	/*** prepare data representations ***/

// lenders
var l_circles_g = svg.append("svg:g")
    .attr("class", "lender");

// borrowers
var b_circles_g = svg.append("svg:g")
    .attr("class", "borrower");

// arcs to visually link lenders to borrowers
var arcs = svg.append("g")
    .attr("class", "arcs");

/********************************************************************************/

    /*** prepare legend box ***/
     
var legend = svg.append("g")
    .attr("class", "legend")
    .attr("height", 100)
    .attr("width", 100)  
    .attr('transform', 'translate(-' + (w - 50) + ', ' + (h - 300) + ')');

legend.selectAll('rect')
    .data(sector_colors_array)
    .enter()
    .append("rect")
    .attr("x", w - 65)
    .attr("y", function(d, i){ return i *  20;})
    .attr("width", 20)
    .attr("height", 20)
    .attr('stroke','rgb(0,0,0)')
	.attr('stroke-width','0.75')    
    .style("fill", function(d) { 
        var color = d;
        return color;
    });
      
legend.selectAll('text')
    .data(sector_list)
    .enter()
    .append("text")
    .attr("x", w - 42)
    .attr("y", function(d, i){ return i *  20 + 16;})
    .text(function(d) {
        var text = d;
        return text;
    });

/*******************************************************************************

file_year = '2008';
file_month = '04';*/



/********************************************************************************/

	/*** workhorse draw function ***/

function draw(data_obj) { 
        
        flights = data_obj["raw_data"];
        
        // unless calling total statistics or initializing
        if (cat_1_switch != 'total' && cat_1_switch != 'initializing_the_app') {
                   
            // filter by category_1 (occupation)
            flights = flights.filter(function(flight) {
                if (flight.occupation.toLowerCase().indexOf(cat_1_switch) !== -1) {
                    return true;                
                }   
            });       
        }
        // remove data if initializing (so we start with an empty map)
        else if (cat_1_switch == "initializing_the_app") {
            flights = [];   
        }
        
        // if data meeting condition does not exist, prompt another search
        if (flights.length === 0 && cat_1_switch != 'initializing_the_app') {
            alert("No loans found - wanna try another search? :)");   
        }
    
        var l_loc_list = [],
            b_loc_list = [];
    
        // build up link calculation
        flights.forEach(function(flight) {

            // coordinates of lender and borrower
            var l_location = [+flight.lender_lng, +flight.lender_lat];
            var b_location = [+flight.geo_lng, +flight.geo_lat];            
            
            // also store projection mapping
            l_loc_list.push(projection(l_location));  
            b_loc_list.push(projection(b_location));
        });
        
        // w circles for lenders
        l_circles = l_circles_g.selectAll("circle")
            .data(flights)
            .enter().append("svg:circle")
            .attr("class", "lender")
            .attr("cx", function(d, i) { return l_loc_list[i][0]; })
            .attr("cy", function(d, i) { return l_loc_list[i][1]; })
            .attr("r", 0)   // r = 0 for now so we can do animation later
            .attr("stroke", "#000000")
            .style("fill", "#ffffff") 
            .style("opacity", 0.3)
            .on("mouseover", function(d, i) {  
                
                // detail box's border color matches current circle's
                $("#lender_desc").css("border-color","#ffffff");

                // update detail box's contents
                d3.select("#lender_desc h4")
                    .text("  " + d.lender_id + 
                            ", in occupation (" + d.occupation + ") from " + 
                            d.whereabouts + " participates because..."                
                );    
                
                d3.select("#lender_desc p")   
                    .text('"' + d.loan_because + '"');  
                
                // circle gets highlighted
                d3.select(this)
                    .style('opacity', 1);                
            })
            .on("mouseout", function(d, i) { 
                
                // remove color from detail box
                $("#lender_desc").css("border-color", "transparent");

                // remove detail box contents
                d3.select("#lender_desc h4")
                    .text("lender participates because...");
                    
                d3.select("#lender_desc p")
                    .text(""); 
                                         
                // remove highlight on circle
                d3.select(this)
                    .style('opacity', 0.3);
            });

        // animation used to show the circles
        l_circles_g.selectAll("circle.lender")
            .data(flights)
            .transition()
            .duration(1000)
            .attr("r", 2);           

        // draw arrows shooting out from lender to borrower
        arcs.selectAll("path") 
            .data(flights)
            .enter().append("path");              

        arcs.selectAll("path")
            .attr("d", function(d, i) {
                var dx = b_loc_list[i][0] - l_loc_list[i][0],
                    dy = b_loc_list[i][1] - l_loc_list[i][1],
                    dr = Math.sqrt(dx * dx + dy * dy);
                // lender to borrower
                return "M" + l_loc_list[i][0] + "," + 
                        l_loc_list[i][1] + "A" + dr + "," + dr +
                        " 0 0,1 " + b_loc_list[i][0] + "," + b_loc_list[i][1];
            })
            // trick for the arrow shooting effect
            .attr("stroke-dasharray", function(d, i) {
                return d3.selectAll("g.arcs path")[0][i].getTotalLength() + 
                        " " + d3.selectAll("g.arcs path")[0][i].getTotalLength();
            })
            .attr("stroke-dashoffset", function(d, i) {
                return d3.selectAll("g.arcs path")[0][i].getTotalLength();
            })              
            .transition()
            .duration(2000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);
 
            // draw circles for borrowers
            b_circles = b_circles_g.selectAll("circle")
                .data(flights)
                .enter().append("svg:circle")
                .attr("class", "borrower")
                .attr("cx", function(d, i) { return b_loc_list[i][0]; })
                .attr("cy", function(d, i) { return b_loc_list[i][1]; })
                .attr("r", 0)   // r = 0 for now so we can do animation later
                .style("fill", function(d) {return sector_colors[d.sector];})
                .on("mouseover", function(d, i) {  
                    
                    // detail box's border color matches current circle's                    
                    $("#borrower_desc").css("border-color", $(this).css("fill"));
                    
                    // update detail box's contents                        
                    d3.select("#borrower_desc h4")
                        .text("  " + d.borrower_name + 
                                ", in sector (" + d.sector + ") from " + 
                                d.country + " needs a loan of $" + d.funded_amount + " for..."                
                    );                          
                    
                    d3.select("#borrower_desc p")   
                        .text('"' + d.used_for + '"');
                    
                    // circle gets highlighted
                    d3.select(this)
                        .style('opacity', 1);
                })
                .on("mouseout", function(d, i) { 

                    // remove color from detail box
                    $("#borrower_desc").css("border-color", "transparent");
                
                    // remove detail box contents                
                    d3.select("#borrower_desc h4")   
                        .text("borrower needs a loan for...");                        
                        
                    d3.select("#borrower_desc p")
                        .text(""); 
                        
                    // remove highlight on circle
                    d3.select(this)
                        .style('opacity', 0.8);
                        
                });

            // animation used to show the circles
            b_circles_g.selectAll("circle.borrower")
                .data(flights)
                .transition()
                .duration(3000)
                .attr("r", function(d, i) {
                    /* normalize value by factor of 20 BEFORE taking the square root
                       this way we preserve the relationship between 
                       data value and circle area without overwhelming 
                       the map with hugh circles */
                    //r = Math.sqrt(countByAirport[d.id] / 20);
                    r = Math.sqrt(d.funded_amount / 30);
                    return r;
                });           
}    
    
/********************************************************************************/

    /*** helper functions ***/

// redraws map with new category filter
function change_cat(cat_1, data_obj) {
    
    cat_1_switch = cat_1.toLowerCase();
  
    // exit existing elements
    old_circles = svg.selectAll("circle")
        .data([]);    
    old_circles.exit().remove();
    
    old_arcs = svg.selectAll("g path")
        .data([]);    
    old_arcs.exit().remove();    

    // re-draw
    draw(data_obj);
    
}

// redraws map with updated filter info from search box
function change_cat_search(data_obj) {
    // update filter    
    var cat_1 = $("#search_box").val();    
    change_cat(cat_1, data_obj);
}

// updates filter info from drop-down menu
$("#menu_occupation a").click(function(e) {
    var txt = $(e.target).text();
    $("#search_box").val(txt); 
});

// search box enter = click on button
$("#search_box").keyup(function(event){
    if (event.keyCode == 13){
        d3.select("#borrower_desc p").text("");
        d3.select("#lender_desc p").text("");  
        $("#summary_stats_button").click();
        return false;
    }
});

/********************************************************************************/

    /*** initialize the visualization ***/
//draw();

/********************************************************************************/
