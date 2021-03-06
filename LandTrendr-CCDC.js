//######################################################################################################## 
//#                                                                                                    #\\
//#                             JOINT CCDC - LANDTRENDR PIXEL TIME SERIES PLOTTER GUI                  #\\
//#                                                                                                    #\\
//########################################################################################################b


// LANDTRENDR UTILITIES
// date: 2018-06-11
// author: Justin Braaten | jstnbraaten@gmail.com
//         Zhiqiang Yang  | zhiqiang.yang@oregonstate.edu
//         Robert Kennedy | rkennedy@coas.oregonstate.edu
// website: https://github.com/eMapR/LT-GEE

// CCDC UTILITIES
// date: 2020-03-12
// author: Paulo Arévalo | parevalo@bu.edu
// author: Eric Bullock | bullocke@bu.edu
// contributors: Noel Gorelick, Zhiqiang Yang
// website: https://gee-ccdc-tools.readthedocs.io/en/latest/

// Module imports. 
// Uses modified version of the official LandTrendr.js that replaces
// bands names with their actual spectral names (e.g. "SWIR1" instead of "B5")
var ltgee = require('users/parevalo_bu/landtrendr-ccdc:LandTrendr.js');  
var uiUtils = require('users/parevalo_bu/gee-ccdc-tools:ccdcUtilities/ui');
var horizontalStyle = {stretch: 'horizontal', width: '100%'};
 
/// GLOBAL VARS
// Visualization parameters
var visLabels = {
    fontWeight: 'bold', 
    fontSize: '14px', 
    padding: '4px 4px 4px 4px',
    border: '1px solid black',
    color: 'white',
    backgroundColor: 'black',
    textAlign: 'left',
    stretch: 'horizontal'};

  
var INDICES = ['NDVI', 'NBR', 'EVI', 'EVI2', 'NDFI', 'GREENNESS', 'BRIGHTNESS', 'WETNESS'];
var BANDS = ['BLUE','GREEN','RED', 'NIR', 'SWIR1', 'SWIR2'];
var FULLBANDS = BANDS.concat(INDICES);
var BPBANDS = ['GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2'];
var TMBANDS = ['GREEN', 'SWIR2'];
var dateFormat = 1;


//####################################################################################
//########### FUNCTIONS ##############################################################
//####################################################################################

// function to get LT parameter setting
var getParams = function(){
  var prevOneYrRec = paramBoxes[3].getValue();
  if(typeof(prevOneYrRec) !== "boolean"){
    prevOneYrRec = prevOneYrRec.toLowerCase() != 'false';
  }
  
  return { 
    maxSegments:            parseInt(paramBoxes[0].getValue()),
    spikeThreshold:         parseFloat(paramBoxes[1].getValue()),
    vertexCountOvershoot:   parseInt(paramBoxes[2].getValue()),
    preventOneYearRecovery: prevOneYrRec,
    recoveryThreshold:      parseFloat(paramBoxes[4].getValue()),
    pvalThreshold:          parseFloat(paramBoxes[5].getValue()),
    bestModelProportion:    parseFloat(paramBoxes[6].getValue()),
    minObservationsNeeded:  parseInt(paramBoxes[7].getValue())
  };
};

// function to create a plot of source and fitted time series
var chartPoint = function(lt, pixel, index, indexFlip) {
  var pixelTimeSeriesData = ltgee.ltPixelTimeSeriesArray(lt, pixel, indexFlip);
  return ui.Chart(pixelTimeSeriesData.ts, 'LineChart',
            {
              'title' : 'Landtrendr plot for '+index + ' | Fit RMSE: '+ (Math.round(pixelTimeSeriesData.rmse * 100) / 100).toString(),
              'hAxis': 
                {
                  'format':'####'
                },
              'vAxis':
                {
                  'maxValue': 1000,
                  'minValue': -1000   
                }
            },
            {'columns': [0, 1, 2]}
          );
};


// function to draw plots of source and fitted time series to panel
var plotTimeSeries = function(x, y){  
  var point = ee.Geometry.Point(x, y);
  var pixel = point.buffer(15).bounds();
  
  // add a red pixel to the map where the user clicked or defined a coordinate
  // map.layers().set(0, ui.Map.Layer(point, {color: 'FF0000'}));
  
  // get values to define year and date window for image collection
  var startYear = startYearslider.getValue();
  var endYear = endYearslider.getValue();
  var startDay = startDayBox.getValue();
  var endDay = endDayBox.getValue();
  
  // get the indices that are checked
  var doTheseIndices = [];
  indexBox.forEach(function(name, index) {
    var isChecked = indexBox[index].getValue();
    if(isChecked){
      doTheseIndices.push([indexList[index][0],indexList[index][1]]);
    }
  });
  
  // make an annual SR collection
  var annualSRcollection = ltgee.buildSRcollection(startYear, endYear, startDay, endDay, pixel);
  
  // for each selected index, draw a plot to the plot panel
  doTheseIndices.forEach(function(name, index) {
    var annualLTcollection = ltgee.buildLTcollection(annualSRcollection, name[0], []);
    runParams.timeSeries = annualLTcollection;
    var lt = ee.Algorithms.TemporalSegmentation.LandTrendr(runParams);
    var chart = chartPoint(lt, pixel, name[0], name[1]);
    plotPanel.add(chart);
  });
  
};



//####################################################################################
//########### DEFINE UI COMPONENTS ###################################################
//####################################################################################

// SET UP PRIMARY PANELS
// control panel
var controlPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {width: '340px'},
  widgets: [ui.Label('🎛️ LandTrendr controls', visLabels)]
});


// plot panel
var plotsPanelLabel = ui.Label('📈 Time series charts', visLabels);
var plotsPanelInstruc = ui.Label({
  value: 'Click the map to run LandTrendr and CCDC temporal segmentation ' +
      'and chart results for a single Landsat pixel.',
  style: {
    fontSize: '12px',
    padding: '4px',
    color: 'grey',
    stretch: 'horizontal'
  } 
});
var plotPanel = ui.Panel(null, null, {stretch: 'horizontal'}).add(plotsPanelInstruc);
var plotPanelParent = ui.Panel([plotsPanelLabel, plotPanel], null, {width: '480px'});


// map panel
var map = ui.Map();
map.style().set({cursor:'crosshair'});
map.setOptions('HYBRID');
var processingLabel = ui.Label('Processing, please wait...', {shown:false, position: 'top-center'});
map.add(processingLabel);



// SET UP SECONDARY PANELS
// years panel
var yearSectionLabel = ui.Label('Define Year Range',{fontWeight: 'bold'});

var startYearLabel = ui.Label('Start Year');
var startYearslider = ui.Slider({min:1984, max:2021, value:1985, step:1});
startYearslider.style().set('stretch', 'horizontal');

var endYearLabel = ui.Label('End Year');
var endYearslider = ui.Slider({min:1984, max:2021, value:2020, step:1});
endYearslider.style().set('stretch', 'horizontal');

var yearsPanel = ui.Panel(
  [
    yearSectionLabel,
    ui.Panel([startYearLabel, startYearslider], ui.Panel.Layout.Flow('horizontal'), {stretch: 'horizontal'}), //
    ui.Panel([endYearLabel  , endYearslider], ui.Panel.Layout.Flow('horizontal'), {stretch: 'horizontal'})
  ] 
);


// date panel
var dateSectionLabel = ui.Label('Define Date Range (mm-dd)',{fontWeight: 'bold'});
var startDayLabel = ui.Label('Start Date:');
var startDayBox = ui.Textbox({value:'06-10'});
startDayBox.style().set('stretch', 'horizontal');

var endDayLabel = ui.Label('End Date:');
var endDayBox = ui.Textbox({value:'09-20'});
endDayBox.style().set('stretch', 'horizontal');

var datesPanel = ui.Panel(
  [
    dateSectionLabel,
    ui.Panel(
      [startDayLabel, startDayBox, endDayLabel, endDayBox],
      ui.Panel.Layout.Flow('horizontal'), {stretch: 'horizontal'}
    )
  ]
);

// index panel
var indexList = [['NBR',-1], ['NDVI',-1], ['NDMI',-1], ['TCB',1], ['TCG',-1],
                 ['TCW',-1], ['TCA' ,-1], ['BLUE' ,1], ['GREEN' , 1],
                 ['RED' , 1], ['NIR'  ,-1], ['SWIR1'  , 1], ['SWIR2' ,1]];

var indexBox = [];
indexList.forEach(function(name, index) {
  var checkBox = ui.Checkbox(name[0]);
  indexBox.push(checkBox);
});

var indexPanelLabel = ui.Label('Select Indices', {fontWeight : 'bold'});
var indexPanel = ui.Panel(
  [
    ui.Panel([indexBox[0], indexBox[4], indexBox[8], indexBox[12]], null, {stretch: 'horizontal'}),
    ui.Panel([indexBox[1], indexBox[5], indexBox[9]], null, {stretch: 'horizontal'}),
    ui.Panel([indexBox[2], indexBox[6], indexBox[10]], null, {stretch: 'horizontal'}),
    ui.Panel([indexBox[3], indexBox[7], indexBox[11]], null, {stretch: 'horizontal'})
  ],
  ui.Panel.Layout.Flow('horizontal'), {stretch: 'horizontal'}
);

indexBox[5].setValue(1);


// params panel
var runParams = [
  {label: 'Max Segments:', value: 8},
  {label: 'Spike Threshold:', value: 0.9},
  {label: 'Vertex Count Overshoot:', value: 3},
  {label: 'Prevent One Year Recovery:', value: false},
  {label: 'Recovery Threshold:', value: 0.25},
  {label: 'p-value Threshold:', value: 0.1},
  {label: 'Best Model Proportion:', value: 0.75},
  {label: 'Min Observations Needed:', value: 6},
];

var paramBoxes = [];
var paramPanels = [ui.Label('Define Segmentation Parameters',{fontWeight: 'bold'})];
runParams.forEach(function(param, index){
  var paramLabel = ui.Label(param.label);
  var paramBox = ui.Textbox({value:param.value});
  paramBox.style().set('stretch', 'horizontal');
  var paramPanel = ui.Panel([paramLabel,paramBox], ui.Panel.Layout.Flow('horizontal'));
  paramBoxes.push(paramBox);
  paramPanels.push(paramPanel);
});

var paramPanel = ui.Panel(paramPanels,null,{stretch: 'horizontal'});


// submit panel
var submitButton = ui.Button({label: 'Submit'});
submitButton.style().set('stretch', 'horizontal');


///////////////////////// SET UP CCDC PANELS

var app = {};
app.ccd = [];
app.viz = [];

// Start date for ccdc
app.ccd.sDate = ui.Panel(
    [
      ui.Label({value:'Start date' , style:{stretch: 'horizontal',color:'black'}}),
      ui.Textbox({value:'1985-01-01', style:{stretch: 'horizontal'}}) 
    ],
    ui.Panel.Layout.Flow('horizontal'),
    {stretch: 'horizontal'}
);
  
//End date for ccdc
app.ccd.eDate = ui.Panel(
    [
      ui.Label({value:'End date' , style:{stretch: 'horizontal',color:'black'}}),
      ui.Textbox({value:'2021-01-01', style:{stretch: 'horizontal'}}) 
    ],
    ui.Panel.Layout.Flow('horizontal'),
    {stretch: 'horizontal'}
);

// Lambda
app.ccd.lambda = ui.Panel(
    [
      ui.Label({value:'Lambda', style:{stretch: 'horizontal',color:'black'}}),
      ui.Textbox({value: 0.002, style:{stretch: 'horizontal'}}) 
    ],
    ui.Panel.Layout.Flow('horizontal'),
    {stretch: 'horizontal'}
);

// maxIterations
app.ccd.maxIter = ui.Panel(
    [
      ui.Label({value:'Max iterations', style:{stretch: 'horizontal',color:'black'}}),
      ui.Textbox({value: 10000, style:{stretch: 'horizontal'}}) 
    ],
    ui.Panel.Layout.Flow('horizontal'),
    {stretch: 'horizontal'}
);


// minObservations
app.ccd.minObs = ui.Panel(
    [
      ui.Label({value:'Min observations', style:{stretch: 'horizontal',color:'black'}}),
      ui.Textbox({value: 6, style:{stretch: 'horizontal'}}) 
    ],
    ui.Panel.Layout.Flow('horizontal'),
    {stretch: 'horizontal'}
);

// chiSquareProbability
app.ccd.chiSq = ui.Panel(
    [
      ui.Label({value:'Chi square prob', style:{stretch: 'horizontal',color:'black'}}),
      ui.Textbox({value: 0.99, style:{stretch: 'horizontal'}}) 
    ],
    ui.Panel.Layout.Flow('horizontal'),
    {stretch: 'horizontal'}
);

// minNumOfYearsScaler
app.ccd.minYears = ui.Panel(
    [
      ui.Label({value:'Min years scaler', style:{stretch: 'horizontal',color:'black'}}),
      ui.Textbox({value: 1.33, style:{stretch: 'horizontal'}}) 
    ],
    ui.Panel.Layout.Flow('horizontal'),
    {stretch: 'horizontal'}
);

// numSegs
app.viz.nSegs = ui.Panel(
    [
      ui.Label({value:'Num segments' , style:{stretch: 'horizontal',color:'black'}}),
      ui.Textbox({value:6, style:{stretch: 'horizontal'}}) 
    ],
    ui.Panel.Layout.Flow('horizontal'),
    {stretch: 'horizontal'}
);

var coefBandPanelGenerator = function(){ return ui.Panel([
      ui.Select({items:FULLBANDS, style:{stretch: 'horizontal'}}),
      ui.Textbox({value: 0, style:{stretch: 'horizontal'}}) ,
      ui.Textbox({value: 0.6, style:{stretch: 'horizontal'}}) 
    ],
    ui.Panel.Layout.Flow('horizontal'),
    horizontalStyle)};  
  
app.viz.redBox = coefBandPanelGenerator();
app.viz.greenBox = coefBandPanelGenerator();
app.viz.blueBox = coefBandPanelGenerator();

app.viz.redBox.widgets().get(0).setValue('SWIR1');
app.viz.greenBox.widgets().get(0).setValue('NIR');
app.viz.blueBox.widgets().get(0).setValue('RED');


// Band selector
app.ccd.bandSelector = ui.Panel(
    [
      ui.Label({value: 'Select band', style:{stretch: 'horizontal', color:'black'}}),
      ui.Select({items: FULLBANDS, value: 'WETNESS', style:{stretch: 'horizontal'}}) 
    ],
    ui.Panel.Layout.Flow('horizontal'),
    {stretch: 'horizontal'}
  );

// Make CCDC control Panel
app.ccd.controlPanel = ui.Panel({style: {width: '100%'},
                          widgets: [ui.Label('🎛️ CCDC controls', visLabels),
                          app.ccd.bandSelector, app.ccd.sDate, app.ccd.eDate, app.ccd.lambda,
                          app.ccd.maxIter, app.ccd.minObs, app.ccd.chiSq, app.ccd.minYears]});
                      
  
// app.viz.controlPanel = ui.Panel({style: {width: '100%'},
//                           widgets: [ui.Label('CCDC visualization params', visLabels), app.viz.nSegs,
//                           app.viz.redBox, app.viz.greenBox, app.viz.blueBox]});


//####################################################################################
//########### BIND FUNCTIONS TO ACTIONS ##############################################
//####################################################################################

// plot time series for clicked point on map
var ccdParams = {};
var ccdRunParams = {};
var vizParams = {};

map.onClick(function(coords) {
  map.layers().reset();
  plotPanel.clear();
  ccdChartPanel.clear();
  var x = coords.lon;
  var y = coords.lat;
  // lonBox.setValue(x);
  // latBox.setValue(y);
  
  var geometry = ee.Geometry.Point([coords.lon, coords.lat]);
  var startYear = startYearslider.getValue();
  var endYear = endYearslider.getValue();
  var startDay = startDayBox.getValue();
  var endDay = endDayBox.getValue();
  

  // Retrieve CCDC params
  ccdParams.breakpointBands = BPBANDS;
  ccdParams.tmaskBands= TMBANDS;
  ccdParams.dateFormat = dateFormat;
  ccdParams.lambda = parseFloat(app.ccd.lambda.widgets().get(1).getValue());
  ccdParams.maxIterations = parseInt(app.ccd.maxIter.widgets().get(1).getValue());
  ccdParams.minObservations = parseInt(app.ccd.minObs.widgets().get(1).getValue());
  ccdParams.chiSquareProbability = parseFloat(app.ccd.chiSq.widgets().get(1).getValue());
  ccdParams.minNumOfYearsScaler = parseFloat(app.ccd.minYears.widgets().get(1).getValue());

  ccdRunParams.bandSelect = app.ccd.bandSelector.widgets().get(1).getValue();
  ccdRunParams.sDate = app.ccd.sDate.widgets().get(1).getValue();
  ccdRunParams.eDate = app.ccd.eDate.widgets().get(1).getValue();
  ccdRunParams.nSegs = parseInt(app.viz.nSegs.widgets().get(1).getValue());
  
  vizParams.red = app.viz.redBox.widgets().get(0).getValue();
  vizParams.green = app.viz.greenBox.widgets().get(0).getValue();
  vizParams.blue = app.viz.blueBox.widgets().get(0).getValue();
  vizParams.redMin = app.viz.redBox.widgets().get(1).getValue();
  vizParams.greenMin = parseFloat(app.viz.greenBox.widgets().get(1).getValue());
  vizParams.blueMin = parseFloat(app.viz.blueBox.widgets().get(1).getValue());
  vizParams.redMax = parseFloat(app.viz.redBox.widgets().get(2).getValue());
  vizParams.greenMax = parseFloat(app.viz.greenBox.widgets().get(2).getValue());
  vizParams.blueMax = parseFloat(app.viz.blueBox.widgets().get(2).getValue());
  vizParams.tsType = "Time series";
  
  
  runParams = getParams();
  plotTimeSeries(x, y);
});



//####################################################################################
//########### ADD PANELS TO INTERFACE ################################################
//####################################################################################

controlPanel.add(yearsPanel);
controlPanel.add(datesPanel);
controlPanel.add(indexPanelLabel);
controlPanel.add(indexPanel);
controlPanel.add(paramPanel);
controlPanel.add(app.ccd.controlPanel);
// controlPanel.add(app.viz.controlPanel);

map.add(ui.Label({
  value: 'https://github.com/parevalo/landtrendr-ccdc',
  style: {
    position: 'bottom-right',
    fontSize: '12px', 
    padding: '6px',
    backgroundColor: 'white',
    stretch: 'horizontal'
  }
}).setUrl('https://github.com/parevalo/landtrendr-ccdc'));


ui.root.clear();
var leftPanel = ui.Panel({style: {width: '60%'},
  widgets: [controlPanel, map],
  layout: ui.Panel.Layout.Flow('horizontal')
});

var fullPanel = ui.SplitPanel(leftPanel, plotPanelParent, 'horizontal');
ui.root.add(fullPanel);

// Retrieve CCDC panel and add to plot panel
var ccdChartPanel = uiUtils.getTSChart(map, ccdParams, ccdRunParams, vizParams);
plotPanelParent.add(ccdChartPanel);
