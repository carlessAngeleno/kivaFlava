README

Kiva.org Lending Activities

Han Kim
daydream.han@gmail.com


CONTENTS:
        
    I.	index.html  visualization page

    II.	js 
        I.	hk_js.js  custom js specific to the map portion of visualization
            I. Visualization code
                I. Loading data
                II. Binding data to DOM elements using d3
                III. Enabling interactions
            II. Helper functions for drawing the map
        II. summary_stats.js  custom js specific to the summary statistics and storytelling portions of visualization
        III.	also includes libraries:
            I.	jquery: general purpose
            II.	d3: visualization
            III.	twitter bootstrap: style / interactivity
            IV. queue.min.js: allows asynchronous loading of multiple datasets without executing other js commands
            V. crossfilter.min.js: allows counting and filtering of datasets
            
    III.	css 
        I.	style.css  custom css
            I. Uses classes and ids to enable visualization
        II.	also includes libraries:
            I.	twitter bootstrap: style
            
    IV.	data 
        I.	agr_food_counts.csv: summary statistics on % agriculture/food projects supported (out of all types) by different lender groups (by occupation)
        II. final_{year}_us_geo{month}.csv: raw data used for the map part of the visualization
        III.	us-states.json: path data of US states for svg (NOT USED)
        IV.	world50m.json: path data of world map for svg 
        V. MASTER_loans_and_locations.csv: lending data used for Project 2
        VI.	Also includes:
            I.	OLD_ITERATION: old iterations of Kiva data (NOT USED)
            
    V.	img 
        I.	(NOT USED)
        
    VI.	old  old iterations of scripts and data files used for exploration
        I.	(NOT USED)

USAGE:
    - Open up index.html

LIBRARIES:
    - All libraries are hosted in subfolders locally based on their file extensions (i.e. javascript files in "js")

DATA FILES USED & INTERACTION WITH CODE:
    - JSON: loaded with d3.json() in hk_js.js
    - CSV: loaded with d3.csv() in hk_js.js and summary_stats.js
    
OTHER:
    - Thanks! 