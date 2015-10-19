var gatewayURL = 'http://<none>/test-api';
var x86Response = [], p8Response = [];
var x86_users, p8_users, timeInterval;
var x86progress = 0, p8progress = 0;
var isx86Complete =false, isp8Complete = false;
var x86CompleteResponse = [], p8CompleteResponse = [];
//var p8_users = document.getElementById('p8_uph').value;



function ajaxErrorHandler(xhr, ajaxOptions, thrownError) {
	jQuery.mobile.hidePageLoadingMsg();
	var msg = 'Ajax error. ';
	if (ajaxOptions.statusText != null && ajaxOptions.statusText != '')
		msg = msg + '<br/>' + ajaxOptions.statusText + '<br/>';
	else if (thrownError != null && thrownError != '')
		msg = msg + '<br/>' + thrownError + '<br/>';
	else if (xhr != null && xhr.statusText != null && xhr.statusText != '')
		msg = msg + '<br/>' + xhr.statusText + '<br/>';
	msg = msg + 'Trying static data!';
	$('#errorMessage').html(msg).show('slow', function() {
		onGetCustomers(customers);
		setTimeout(function() {
			$('#errorMessage').hide('slow');
		}, 1000);
	});
}

$(document).ready(function() {
	$('#startTestBtn').bind('click', getPerfGraph);
	//$('#getListBtn').bind('click', getSummary(x86CompleteResponse,p8CompleteResponse));
	jQuery.support.cors = true;
	$('#customers li[role!=heading]').remove();
	$('#getListBtn').click(function(){
		getSummary(x86CompleteResponse,p8CompleteResponse);
	});
});

function getPerfGraph() {
   clearGlobalVariables();
   postUPH();
   //getX86Summary(1, x86Stat);
   //getP8Summary(1);
   
}

function clearGlobalVariables() {
	x86Response = [], p8Response = [];
	x86_users ='', p8_users ='', timeInterval ='';
	x86progress = 0, p8progress = 0;
	isx86Complete =false, isp8Complete = false;
	x86CompleteResponse = [], p8CompleteResponse = [];
	var response = JSON.parse('{"averageTransactionTime":  "0", "transactionsPerSecond":  "0"}');
    angularGauge("#container-speed", "#container-rpm", response);
    angularGauge("#container-speed1", "#container-rpm1", response);
	progressBar(x86progress, p8progress);
}

function postUPH() {

  x86_users = document.getElementById('x86_uph').value;
  p8_users = document.getElementById('p8_uph').value;
  timeInterval = parseInt(document.getElementById('interval').value, 10) * 60;


  var x86Data = JSON.stringify({"noOfUsers": x86_users, "durationOfTests": timeInterval});

  var p8Data = JSON.stringify({"noOfUsers": p8_users, "durationOfTests": timeInterval});

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
	if (xhttp.readyState == 4 && (xhttp.status == 200 || xhttp.status == 201)) {
		setTimeout(getX86Summary, 7000, 1);
		//setInterval(getX86Summary(1), 6000);

	}
}
xhttp.open("POST", "http://169.55.87.104:26199/trigger-magento-bench-marking-onx86", true);
xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhttp.send(x86Data);

var xhttp1 = new XMLHttpRequest();
xhttp1.onreadystatechange = function() {
     if (xhttp1.readyState == 4 && xhttp1.status == 201) { 
 		setTimeout(getP8Summary, 7000,1);
		// setInterval(getP8Summary(1), 6000);

	}
}
xhttp1.open("POST", "http://172.26.48.31:26199/trigger-magento-bench-marking-on-p8", true);
xhttp1.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhttp1.send(p8Data);
}

function initGraphValues(avgValue, transPerSec){
	avgValue = 0;
	transPerSec = 0;
}

function angularGauge(containerSpeed, containerRpm, stats) {
	
   var avgValue, transPerSec;
   
   var avgValue = parseInt(stats["averageTransactionTime"], 10);
   //avgValue = Math.floor(rpmValue/1000);
   transPerSec = parseInt(stats["transactionsPerSecond"], 10);
   var gaugeOptions = {

        chart: {
            type: 'solidgauge'
        },

        title: null,

        pane: {
            center: ['50%', '85%'],
            size: '140%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor: '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
            }
        },

        tooltip: {
            enabled: false
        },

        // the value axis
        yAxis: {
            stops: [
                [0.1, '#55BF3B'], // green
                [0.5, '#DDDF0D'], // yellow
                [0.9, '#DF5353'] // red
            ],
            lineWidth: 0,
            minorTickInterval: null,
            tickPixelInterval: 400,
            tickWidth: 0,
            title: {
                y: -70
            },
            labels: {
                y: 16
            }
        },

        plotOptions: {
            solidgauge: {
                dataLabels: {
                    y: 5,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        }
    };

    // The speed gauge
    $(containerSpeed).highcharts(Highcharts.merge(gaugeOptions, {
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'TPS'
            }
        },

        credits: {
            enabled: false
        },

        series: [{
            name: 'TPS',
            data: [transPerSec],
            dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                       '<span style="font-size:12px;color:black">TPS</span></div>'
            },
            tooltip: {
                valueSuffix: ' TPS'
            }
        }]

    }));

	var chart = $(containerSpeed).highcharts(),
            point,
            newVal,
            inc;

    // The RPM gauge
    $(containerRpm).highcharts(Highcharts.merge(gaugeOptions, {
        yAxis: {
            min: 500,
            max: 2000,
            title: {
                text: 'Trnx Time'
            }
        },

        series: [{
            name: 'Trnx Time',
            data: [avgValue],
            dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y:.1f}</span><br/>' +
                       '<span style="font-size:12px;color:black">* ATT</span></div>'
            },
            tooltip: {
                valueSuffix: ' Trans /ms'
            }
        }]

    }));

    

}

//function progressBar(x86Response, p8Response) {
function progressBar(x86Percent, p8Percent) {

  /* tempX86 = x86Response["percentComplete"].replace( /[^\d.]/g, '')
  var x86Percent = 10; //parseInt(tempX86, 10);
  var tempP8 = p8Response["percentComplete"].replace( /[^\d.]/g, '');
  var p8Percent = parseInt( tempP8, 10);
  x86Percent = parseInt(x86Response["percentComplete"], 10);
  p8Percent = parseInt(p8Response["percentComplete"], 10);*/
  //x86Percent = x86Response["percentComplete"];
  //p8Percent = p8Response["percentComplete"];
  
  $('#stat-container').highcharts({
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Progress Bar'
    },
    subtitle: {
      text: ' % Complete'
    },
    xAxis: {
      categories: [], 
      title: {
	text: null
      }
    },
    yAxis: {     
	  max: 100,
      title: {
	text: '',
	align: 'high'
      },
      labels: {
	overflow: 'justify'
      } 
    },
    tooltip: {
      valueSuffix: ' %'
    },
    plotOptions: {
      bar: {
	dataLabels: {
	    enabled: true
	}
      }
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'top',
      x: -20,
      y: 10,
      floating: true,
      borderWidth: 1,
      backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
      shadow: true
    },
    credits: {
      enabled: false
    },	
    series: [{
      name: 'Power8',
      data: [p8Percent]
      }, {
      name: 'X86',
      data: [x86Percent]
    }]
  });	
   //setTimeout(progressBar, 5000);
}

function getSummary(x86Response, p8Response){
	var tableData= "<table border='1'> <tr> <th> Parameter </th> <th> X86 </th> <th> Power8 </th> </tr>";
	tableData = tableData + "<tr><td>User Count</td><td>"+x86_users+"</td><td>"+p8_users+"</td></tr>";
	tableData = tableData + "<tr><td>Total Transaction</td><td>"+x86Response["totalTransaction"]+"</td><td>"+p8Response["totalTransaction"]+"</td></tr>";
	tableData = tableData + "<tr><td>Total RunTime</td><td>"+x86Response["totalRunTime"]+"</td><td>"+p8Response["totalRunTime"]+"</td></tr>";
	tableData = tableData + "<tr><td>Transactions/Second</td><td>"+x86Response["transactionsPerSecond"]+"</td><td>"+p8Response["transactionsPerSecond"]+"</td></tr>";
	tableData = tableData + "<tr><td>Avg Transaction Time(msec)</td><td>"+x86Response["averageTransactionTime"]+"</td><td>"+p8Response["averageTransactionTime"]+"</td></tr>";
	tableData = tableData + "<tr><td>Min Transaction time(msec)</td><td>"+x86Response["minTransactionTime"]+"</td><td>"+p8Response["minTransactionTime"]+"</td></tr>";
	tableData = tableData + "<tr><td>Max Transaction time(msec)</td><td>"+x86Response["maxTransactionTime"]+"</td><td>"+p8Response["maxTransactionTime"]+"</td></tr>";
	tableData = tableData + "<tr><td>Total Errors</td><td>"+x86Response["totalNumberOfErrors"]+"</td><td>"+p8Response["totalNumberOfErrors"]+"</td></tr>";
	tableData = tableData + "<tr><td>Errors Percentage</td><td>"+x86Response["errorPercentage"]+"</td><td>"+p8Response["errorPercentage"]+"</td></tr>";
	
	tableData= tableData+"</table>";
	
	$('#container').html(tableData);

}

function getX86Summary(isSingle){
  var items = [];
  var xhttp = new XMLHttpRequest();  
  //alert('px86');
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {   
	 x86Response =  JSON.parse(xhttp.responseText);
	 console.log('x86Response :'+x86Response);
	 if(isSingle == 0) {
	 	//var p8Response = {};
	 	getP8Summary(0);
	 	getSummary(x86Response, p8Response);	 
	 }
	 else{
	    var x86Gauge1 = "#container-speed";
	    var x86Gauge2 = "#container-rpm";
		//alert(x86Response);
	    angularGauge(x86Gauge1, x86Gauge2, x86Response);
		
 	    if(x86Response["percentComplete"] != "100%"){
			x86progress = x86Response["percentComplete"];
			console.log('x86progress :'+x86progress);
			progressBar(x86progress, p8progress);
			setTimeout(getX86Summary, 6000, 1);
		}else{
			isx86Complete = true;
			x86CompleteResponse =  x86Response;
			x86progress = 100;
			progressBar(x86progress, p8progress);
            if(isx86Complete && isp8Complete){
					$('#loadingIcon').hide();
				
				}
		}
	 }
	 }
  }
  
  xhttp.open("GET", "http://169.55.87.104:26199/haswell-statistics", true);
  xhttp.send();

}

function getP8Summary(isSingle){
	//alert('p8');
  var xhttpP8 = new XMLHttpRequest();
  xhttpP8.onreadystatechange = function() {
  	if (xhttpP8.readyState == 4 && xhttpP8.status == 200) { 
		console.log(xhttpP8.responseText);
		p8Response = JSON.parse(xhttpP8.responseText);
		console.log('p8Response :'+p8Response);
		if(isSingle == 1) {
			var p8Gauge1 = "#container-speed1";
	    	var p8Gauge2 = "#container-rpm1";
			//alert(p8Response);
	   		angularGauge(p8Gauge1, p8Gauge2, p8Response);
			if(p8Response["percentComplete"] != "100%"){
				//p8progress = p8Response["percentComplete"].replace( /[^\d.]/g, '');
				p8progress = p8Response["percentComplete"];
				console.log('p8progress :'+p8progress);
				progressBar(x86progress, p8progress);
				setTimeout(getP8Summary, 6000, 1);
			}else{
				isp8Complete = true;
				p8CompleteResponse = p8Response;
				p8progress = 100;
				progressBar(x86progress, p8progress);
                if(isx86Complete && isp8Complete){
					$('#loadingIcon').hide();
				
				}
			}
			
		}
		
	}
   }
   xhttpP8.open("GET", "http://172.26.48.31:26199/power8-statistics", true);
   xhttpP8.send();

}

$(document).bind(
		'pagebeforechange',
		function(e, data) {
			if (typeof data.toPage === 'string') {
				var r = data.toPage.match(/page2\?empId=(.*)/);
				if (r) {
					var customer = customers[r[1]];
					if (customer) {
						$("#customername").html(customer.name);
						$("#customeractivity").html(
								'Is currently ' + (customer.activity || '') + ' in:');
						if (customer.phone) {
							$("#customercall").attr('href', 'tel:' + customer.phone)
									.show().trigger('enhance');
						} else {
							$("#customercall").hide();
						}
						var location = customer.location;
						$("#locationMap").attr(
								"src",
								"https://maps.googleapis.com/maps/api/staticmap?center="
										+ location
										+ "&zoom=14&size=288x200&markers="
										+ location + "&sensor=false");
					}
				}
			}
		});

//TabBar support

window.CodiqaControls = {
  types: {},
  instances: {},

  define: function(type, control) {
    control._type = type;
    this.types[type] = control;
  },

  register: function(type, id, opts) {
    var instance = new this.types[type]();
    instance._type = type;
    instance._id = id;
    instance._opts = opts;
    this.instances[id] = instance;

    if(!this.types[type].prototype._isInited) {
      this.types[type].prototype.initType();
    }
    return instance;
  },

  init: function() {
    for(var type in this.types) {
      this.types[type].prototype.initType();
    }
  },

  refresh: function() {
    for(var x in this.instances) {
      this.instances[x].refresh && this.instances[x].refresh();
    }
  },

  callbackInit: function() {

  },

  getInstances: function(type) {
    var x, instance, instances = [];
    for(x in this.instances) {
      instance = this.instances[x];
      if(instance._type === type) {
        instances.push(instance);
      }
    }
    return instances;
  }

};


CodiqaControls.GoogleMap = function () {};
CodiqaControls.GoogleMap.prototype.initType = function() {
  if( window.CodiqaControls.getInstances('googlemaps').length ) {
    if(this._isInited) {
      if(window.google && window.google.maps) {
        CodiqaControls.GoogleMap.prototype.callbackInit();
      }
    } else {
      var script = document.createElement('script');
      script.type = "text/javascript";
      script.src = "https://maps.googleapis.com/maps/api/js?sensor=true&callback=CodiqaControls.types.googlemaps.prototype.callbackInit";
      document.getElementsByTagName("head")[0].appendChild(script);
      this._isInited = true;
    }
  }
};
CodiqaControls.GoogleMap.prototype.callbackInit = function() {
  var x, instances = window.CodiqaControls.getInstances('googlemaps');
  for(x = 0; x < instances.length; x++) {
    instances[x]._opts.ready(instances[x]);
  }
};
CodiqaControls.GoogleMap.prototype.refresh = function() {
  if( this.map && this.el && $(this.el).closest('.ui-page-active').length ) {
    google.maps.event.trigger(this.map, 'resize');
    this.center && this.map.setCenter(this.center);
  }
};
window.CodiqaControls.define('googlemaps', CodiqaControls.GoogleMap);


(function($) {
  $.widget('mobile.tabbar', $.mobile.navbar, {
    _create: function() {
      // Set the theme before we call the prototype, which will 
      // ensure buttonMarkup() correctly grabs the inheritied theme.
      // We default to the "a" swatch if none is found
      var theme = this.element.jqmData('theme') || "a";
      this.element.addClass('ui-footer ui-footer-fixed ui-bar-' + theme);

      // Make sure the page has padding added to it to account for the fixed bar
      this.element.closest('[data-role="page"]').addClass('ui-page-footer-fixed');


      // Call the NavBar _create prototype
      $.mobile.navbar.prototype._create.call(this);
    },

    // Set the active URL for the Tab Bar, and highlight that button on the bar
    setActive: function(url) {
      // Sometimes the active state isn't properly cleared, so we reset it ourselves
      this.element.find('a').removeClass('ui-btn-active ui-state-persist');
      this.element.find('a[href="' + url + '"]').addClass('ui-btn-active ui-state-persist');
    }
  });

  $(document).on('pagecreate create', function(e) {
    return $(e.target).find(":jqmData(role='tabbar')").tabbar();
  });
  
  $(document).on('pageshow', ":jqmData(role='page')", function(e) {
    // Grab the id of the page that's showing, and select it on the Tab Bar on the page
    var tabBar, id = $(e.target).attr('id');

    tabBar = $.mobile.activePage.find(':jqmData(role="tabbar")');
    if(tabBar.length) {
      tabBar.tabbar('setActive', '#' + id);
    }

    window.CodiqaControls.refresh();
  });

  window.CodiqaControls.init();
  
})(jQuery);
