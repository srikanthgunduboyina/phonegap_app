var gatewayURL = 'http://<none>/test-api';
var x86Response, p8Response;
var x86_users, p8_users, timeInterval;
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
	$('#getListBtn').bind('click', getX86Summary(0));
	jQuery.support.cors = true;
	$('#customers li[role!=heading]').remove();
	
});

function getPerfGraph() {
   postUPH();   
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
		setInterval(getX86Summary(1), 5000);
	}
}
xhttp.open("POST", "http://169.55.87.104:26199/trigger-magento-bench-marking-onx86", false);
xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhttp.send(x86Data);

var xhttp1 = new XMLHttpRequest();
xhttp1.onreadystatechange = function() {
     if (xhttp1.readyState == 4 && xhttp1.status == 201) { 
 		setInterval(getP8Summary(1), 5000);
	}
}
xhttp1.open("POST", "http://172.26.48.31:26199/trigger-magento-bench-marking-on-p8", false);
xhttp1.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhttp1.send(p8Data);
}

function initGraphValues(avgValue, transPerSec){
	avgValue = 0;
	transPerSec = 0;
}

function angularGauge(containerSpeed, containerRpm, stats) {
	
   var avgValue, transPerSec;
   initGraphValues(avgValue, transPerSec);

   var rpmValue = parseInt(stats["averageTransactionTime"], 10);
   avgValue = isNaN(rpmValue) ? 0 : Math.floor(rpmValue/1000);
   var tempVar = parseInt(stats["transactionsPerSecond"], 10);
   transPerSec = isNaN(tempVar) ? 0 : tempVar;

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
                       '<span style="font-size:12px;color:silver">TPS</span></div>'
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
            min: 0.5,
            max: 2.00,
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
                       '<span style="font-size:12px;color:silver">* Trnx/s</span></div>'
            },
            tooltip: {
                valueSuffix: ' Trans /s'
            }
        }]

    }));

    

}

function progressBar(x86Response, p8Response) {

  var tempX86 = x86Response["percentComplete"].replace( /[^\d.]/g, '')
  var x86Percent = parseInt(tempX86, 10);
  var tempP8 = p8Response["percentComplete"].replace( /[^\d.]/g, '');
  var p8Percent = parseInt( tempP8, 10);

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
      categories: ['Status'], 
      title: {
	text: null
      }
    },
    yAxis: {
      min: 0,
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
      name: 'X86',
      data: [x86Percent]
    }, {
      name: 'Power8',
      data: [p8Percent]
    }]
  });	
   //setTimeout(progressBar, 5000);
}

function getSummary(x86Response, p8Response){
	for(index in x86Response) {
		var table = document.getElementById("container");
		var row1 = table.insertRow(1);
		var cell1 = row1.insertCell(0);
		var cell2 = row1.insertCell(1);
		var cell3 = row1.insertCell(2);
		cell1.innerHTML = "Users Count";
		cell2.innerHTML = x86_users;
		cell3.innerHTML = p8_users;

	
		var row2 = table.insertRow(2);
		var cell4 = row2.insertCell(0);
		var cell5 = row2.insertCell(1);
		var cell6 = row2.insertCell(2);
		cell4.innerHTML = index;
		cell5.innerHTML = x86Response[index];
		cell6.innerHTML = p8Response[index];
    	 }	

}

function getX86Summary(isSingle){
  var items = [];
  var xhttp = new XMLHttpRequest();  
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {   
	 x86Response =  JSON.parse(xhttp.responseText);
	 if(isSingle == 0) {
	 	//var p8Response = {};
	 	getP8Summary(0);
	 	getSummary(x86Response, p8Response);	 
	 }
	 else{
	    var x86Gauge1 = "#container-speed";
	    var x86Gauge2 = "#container-rpm";
	    angularGauge(x86Gauge1, x86Gauge2, x86Response);
	    progressBar(x86Response, p8Response);
 	    if(x86Response["percentComplete"] != "100%"){
				//setTimeout(getX86Summary(1, x86Response), 5000);
	    }
	 }
    }
  }
  xhttp.open("GET", "http://169.55.87.104:26199/haswell-statistics", true);
  xhttp.send();

}

function getP8Summary(isSingle){
  var xhttpP8 = new XMLHttpRequest();
  xhttpP8.onreadystatechange = function() {
  	if (xhttpP8.readyState == 4 && xhttpP8.status == 200) {  
		p8Response = JSON.parse(xhttpP8.responseText);
		if(isSingle == 1) {
			var p8Gauge1 = "#container-speed1";
	    		var p8Gauge2 = "#container-rpm1";
	   		angularGauge(p8Gauge1, p8Gauge2, p8Response);
			progressBar(x86Response, p8Response);
			if(p8Response["percentComplete"] != "100%"){
				//setTimeout(getP8Summary(1, p8Response), 5000);
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
