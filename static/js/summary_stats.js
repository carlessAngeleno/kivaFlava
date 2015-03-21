/********************************************************************************

            summary_stats.js
    
    PURPOSE:
        Kiva visualization summary statistics and storytelling mode
        
    AUTHOR: 
        - Han Kim
        
    LAST UPDATED:
        - 05/02/2013

*********************************************************************************/


/*  storytelling feature
      The base code for using tabs for storytelling is based on the example from this link
      http://stackoverflow.com/questions/8700263/trying-to-implement-a-next-button-using-twitter-bootstrap-tabs-js
      Implementing map drawing based on tab setting was my doing */
$(document).ready(function() {
    
    var tabIndex;
    tabs = $('a[data-toggle="tab"]');
  
    // make sure user doesn't try to skip ahead and messiing up the app
    $("#previous_button").hide();
    $("#next_button").hide();
    story_tabs = tabs.slice(1, tabs.length);
    story_tabs.hide();

    // storytelling "scenes" are triggered based on tab showing event
    // these event handlers control the way maps are drawn in each scene
    tabs.on('shown', function(e) {
        tabIndex = $(e.target).closest('li').index();
        
        if (tabIndex == 1) {
            $("#summary_stats").hide();
            setTimeout(function(){$("#summary_stats").fadeIn();}, 500);  
        }        
        if (tabIndex == 2) {
            $("#search_button_2007").click();
        }
        else if (tabIndex == 3) {
            $("#search_button_2008").click();
        }
        else if (tabIndex == 4) {
            $("#search_button_2009").click();
        }        
        else if (tabIndex == 5) {
            $("#search_button_2010").click();           
            setTimeout(function(){$("#search_button_2011").click();}, 3000);   
            setTimeout(function(){$("#search_button_2012").click();}, 6000);
        }   
        else if (tabIndex == 6) {
          $("#next_button").hide();
          $("#search_box").val("farmer");
          setTimeout(function(){            
            $("#summary_stats_button").click();      
          }, 1000);  
        }  
        else if (tabIndex == 7) {
            $("#summary_stats").hide();
            setTimeout(function(){$("#summary_stats").fadeIn();}, 500);                                   
            $("#search_button_2007").click();                
            setTimeout(function(){$("#search_button_2008").click();}, 3000);   
            setTimeout(function(){$("#search_button_2009").click();}, 6000);            
        }      
        else if (tabIndex == 8) {     
            $("#search_button_2010").click();    
            setTimeout(function(){$("#search_button_2011").click();}, 3000);
            setTimeout(function(){$("#search_button_2012").click();}, 6000);
        }         
    }).eq(0).trigger('shown');
    
    // clicking on tab head shows tab
    $('._tabs_navigation').on('click', 'a', function() {
        var index = tabIndex + ($(this).index() ? 1 : -1);
        if (index >= 0 && index < tabs.length) {
            tabs.eq(index).tab('show');
        }        
        return false;
    });
});





/********************************************************************************/

  /*** summary stats chart ***/

/*  Returns settings for the summary stats svg
    (based on Sofia's example code for D3 lab) */
function call_settings_summary_stats() {
    var margin = {top: 10, right: 50, bottom: 50, left: 50}, 
        width = $("#summary_stats").width() - margin.left - margin.right,
        height = $("#summary_stats").height() - margin.top - margin.bottom - 20;    

    var x = d3.scale.ordinal()
        .domain(["2007", "2008", "2009", "2010", "2011", "2012"])
        .rangePoints([50, width]);

    var y = d3.scale.linear()
        .domain([0, 80])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
            
    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(4);
            
    return({
        "margin": margin,
        "width": width,
        "height": height,
        "x": x,
        "y": y,
        "xAxis": xAxis,
        "yAxis": yAxis
    }); 
}

/* draws an empty summary stats chart canvas
    (based on Sofia's example code for D3 lab) */
function initialize_summary_stats() {
    
    var settings = call_settings_summary_stats();    
    var margin = settings.margin;
    var width = settings.width;
    var height = settings.height;
    var x = settings.x;
    var y = settings.y;
    var xAxis = settings.xAxis;
    var yAxis = settings.yAxis;
    
    var svg = d3.select("#summary_stats").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")    
        .call(xAxis);
        
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em") 
        .style("text-anchor", "end")
        .text("(%)");
}

// draws actual data on the summary stats chart, with the current
//   occupation highlighted
function draw_summary_stats(selector_for_svg) {
    
    var settings = call_settings_summary_stats();    
    var margin = settings.margin;
    var width = settings.width;
    var height = settings.height;
    var x = settings.x;
    var y = settings.y;
    var xAxis = settings.xAxis;
    var yAxis = settings.yAxis;  
    
    var svg = d3.select(selector_for_svg)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")    
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    var line = d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); });  
   
    // load summary stats data
    d3.csv("/kivaflava/static/data/agr_food_counts.csv",
        function(occs) {                        
            occ = occs.filter(function(occ) {
                // special switch condition for farmers
                if (cat_1_switch.indexOf("farm") !== -1) {
                    cat_1_switch = "farmer/farmers";
                }                            
                
                // format data so it's compatible with d3
                var data = [
                    {x: "2007", y: occ.perc_agr_2007, occupation: occ.occupation},
                    {x: "2008", y: occ.perc_agr_2008, occupation: occ.occupation},
                    {x: "2009", y: occ.perc_agr_2009, occupation: occ.occupation},
                    {x: "2010", y: occ.perc_agr_2010, occupation: occ.occupation},
                    {x: "2011", y: occ.perc_agr_2011, occupation: occ.occupation},
                    {x: "2012", y: occ.perc_agr_2012, occupation: occ.occupation}
                ];
                
                // draw lines - highlight the currently selected occupation
                svg.append("path")
                    .datum(data)
                    .attr("class", "line")
                    .attr("stroke", function(d, i) {
                      if (d[i].occupation.toLowerCase() == cat_1_switch) {
                        return("#ff0000");
                      }
                      else {
                        return("#666666");
                      }                                  
                      })
                    .attr("stroke-width", 1.5)
                    .style("opacity", function(d, i) {
                      if (d[i].occupation.toLowerCase() == cat_1_switch) {
                        return(1);
                      }
                      else {
                        return(0.1);
                      }                                  
                      })                                
                    .attr("d", line);
            });       
        }
    ); 
}

/* define mouseover functions */
function mouseover (d) {
    // console.log(d);
     d3.select(this)
        .style("fill", "red")
        .attr("r", 5);
}

function mouseout (d) {
    d3.select(this)
        .style("fill", "black")
        .attr("r", 3);
}

 /* helper to check if element is in document */
function isInDocument (el) {
    var html = document.body.parentNode;
    while (el) {
        if (el === html) {
            return true;
        }
        
        el = el.parentNode;
    }
    return false;
}

// all years of dataset
var hk_list = [
    "2007",
    "2008",
    "2009",
    "2010",
    "2011",
    "2012"
];





/********************************************************************************/

  /*** data handling - note this is very different/more advanced than in P2 ***/
    
/*    Load multiple datasets asynchronously, making sure to queue the calls and not mess up the app (using queue.js)
          - example
          http://stackoverflow.com/questions/13425987/how-do-i-ensure-d3-finishes-loading-several-csvs-before-javascript-runs
          - documentation
          https://github.com/mbostock/queue
          - troubleshooting (finally got it!)
          http://stackoverflow.com/questions/14008868/how-does-queue-js-work
*/
function parseList(file_years) {
    
    // input validation
    var cat_1 = $("#search_box").val();    
    if (cat_1 === "") {
        alert("select first");
    }    
    cat_1_switch = cat_1.toLowerCase();
    
    // sometimes it takes a while to load data
    // for UI reasons, show button as loading
    show_button_loading();
    
    var q = queue();
    
    file_years.forEach(function(d) {  
        
        // add the following to the queue
        q.defer(function(callback) {
        
            d3.csv("/kivaflava/static/data/final_" + d + "_us_geo_" + "04" + ".csv",                                            
                function(flights) {
                        
                        // we'll calculate some metrics that might be nice to have down the road
                        var lender_counter = {};
                        
                        flights = flights.filter(function(flight) {
                            if (cat_1_switch == 'total') {
                                lender_counter[flight.lender_id] = lender_counter[flight.lender_id] + 1 || 1;                                
                                return true;                              
                            } 
                            else if (flight.occupation.toLowerCase() == cat_1_switch) {  
                                lender_counter[flight.lender_id] = lender_counter[flight.lender_id] + 1 || 1;                                
                                return true;                
                            }   
                        });       
                    
                    var flights_cf = crossfilter(flights);
                    var n_links = flights_cf.size();
                    
                    var avg_loan_count = n_links / Object.keys(lender_counter).length;
                    
                    return_obj = {
                        "raw_data": flights,
                        "n_links": flights_cf.size(),
                        "summary_stats": avg_loan_count
                    };                    
                    
                    // this is the real gem - return raw datato window so the map part can accessed
                    window["data_" + d] = return_obj;
                    
                    // this allows the whole queue thing work
                    callback(null, d);
                }
            ); 
                        
        });
    });    
    // once queued functions finish, execute the next stage
    q.awaitAll(restOfCode);
    
}               

// only takes place once the queue from parseList is completed
function restOfCode(error, results) {
    
    // remove any lines and circles from svg
    // exit existing elements
    var svg = d3.select("#summary_stats svg");
    var old_circles = svg.selectAll("circle")
        .data([]);    
    old_circles.exit().remove();
    
    var old_arcs = svg.selectAll("g path")
        .data([]);    
    old_arcs.exit().remove();    
    
    // no longer loading data - return to normal
    $("#summary_stats_button").button('reset');
    story_tabs.fadeIn();
    $("#next_button").fadeIn();
    
    // and of course, draw the actual chart
    draw_summary_stats("#summary_stats svg");
}


// helper functions
function show_button_loading() {
    $("#summary_stats_button").button('loading'); 
}

function close_storyboard() {
    $("#storyboard").hide(); 
}





/********************************************************************************/

// initialize the storytelling mode on page load
initialize_summary_stats();

$(document).ready(function() {
    setTimeout(function(){
      $("#search_box").val("photographer");
      $("#summary_stats_button").click();      
    }, 2000);  
});
