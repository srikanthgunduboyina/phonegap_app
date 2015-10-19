var gatewayURL = 'http://<none>/test-api';



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
//	$('#getListBtn').bind('click', getCustomers);
	$('#startTestBtn').bind('click', getPerfGraph);
	$('#getListBtn').bind('click', getSummary);
	jQuery.support.cors = true;
	$('#customers li[role!=heading]').remove();
	
});

function getPerfGraph() {
   postUPH();

   var x86Gauge1 = "#container-speed";
   var x86Gauge2 = "#container-rpm";
   angularGauge(x86Gauge1, x86Gauge2);

   var p8Gauge1 = "#container-speed1";
   var p8Gauge2 = "#container-rpm1";
   angularGauge(p8Gauge1, p8Gauge2);

   progressBar();
}

function postUPH() {
	$.ajax({
		url : "http://169.55.87.104:8888/trigger-magento-bench-marking-onx86",
		cache : false,
		type : 'POST',
		contentType : 'application/json',
		data : JSON.stringify({
			'noOfUsers' : $('#uph').val(),
		}),
		success : function(data, status, xhr) {
			jQuery.mobile.hidePageLoadingMsg();
			alert("success");
			//onPostCustomers(data);
		},
		error : function(xhr, status, errorThrown) {
			jQuery.mobile.hidePageLoadingMsg();
			//onPostCustomers(xhr);
		}
	});
}

function angularGauge(containerSpeed, containerRpm) {
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
                text: 'Speed'
            }
        },

        credits: {
            enabled: false
        },

        series: [{
            name: 'Speed',
            data: [80],
            dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                       '<span style="font-size:12px;color:silver">users/h</span></div>'
            },
            tooltip: {
                valueSuffix: ' users/h'
            }
        }]

    }));

    // The RPM gauge
    $(containerRpm).highcharts(Highcharts.merge(gaugeOptions, {
        yAxis: {
            min: 0,
            max: 5,
            title: {
                text: 'RPM'
            }
        },

        series: [{
            name: 'RPM',
            data: [1],
            dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y:.1f}</span><br/>' +
                       '<span style="font-size:12px;color:silver">* trans / s</span></div>'
            },
            tooltip: {
                valueSuffix: ' Trans Time'
            }
        }]

    }));

    // Bring life to the dials
    setInterval(function () {
        // Speed
        var chart = $(containerSpeed).highcharts(),
            point,
            newVal,
            inc;

        if (chart) {
            point = chart.series[0].points[0];
            inc = Math.round((Math.random() - 0.5) * 100);
            newVal = point.y + inc;

            if (newVal < 0 || newVal > 100) {
                newVal = point.y - inc;
            }

            point.update(newVal);
        }

        // RPM
        chart = $(containerRpm).highcharts();
        if (chart) {
            point = chart.series[0].points[0];
            inc = Math.random() - 0.5;
            newVal = point.y + inc;

            if (newVal < 0 || newVal > 5) {
                newVal = point.y - inc;
            }

            point.update(newVal);
        }
    }, 2000);

}

function progressBar() {

	// Ajax call to get the %completion 
//  var jsonVal = $.getJSON("http://169.55.87.104:8888/haswell-statistics")

  $('#stat-container').highcharts({
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Progress Bar'
    },
    subtitle: {
      text: 'No of Users Finished %'
    },
    xAxis: {
      categories: ['Test Status'], 
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
      data: [65]
    }, {
      name: 'Power8',
      data: [84]
    }]
  });	
   //setTimeout(progressBar, 5000);
}

function getSummary(){
  var items = [];
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      //document.getElementById("container").innerHTML = xhttp.responseText;
	//alert(xhttp.responseText);
	var x86Response =  JSON.parse(xhttp.responseText);
	console.log(x86Response);
	//$.each( x86Response, function( index, item ) {
	for(index in x86Response) {
		var table = document.getElementById("container");	
		var row = table.insertRow(1);
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		cell1.innerHTML = index;
		cell2.innerHTML = x86Response[index];    	
   
    	}

	 //document.getElementById("container").appendChild(items);
    	//$('#container').append(items);
    }
  }
  xhttp.open("GET", "http://169.55.87.104:8888/haswell-statistics", true);
  var response = xhttp.send();
  console.log(xhttp.responseText);
     
  //var jsonVal = $.getJSON("summary_data.json", function( result ) //{
// var result2 = "response for p8 server";

  //var jsonVal = $.getJSON("http://169.55.87.104:8888/haswell-statistics", function(result) {
//	console.log(result);
var x86_result = {"totalTransaction":"682","totalRunTime":"60.3s","transactionsPerSecond":"11.3\/s","averageTransactionTime":"185","minTransactionTime":"0","maxTransactionTime":"10809","totalNumberOfErrors":"2","errorPercentage":"(0.29%)","percentComplete":"100%","_links":{"self":{"href":"http:\/\/169.55.87.104:8888\/haswell-statistics"}}};
var p8_result = {"totalTransaction":"600","totalRunTime":"62.3s","transactionsPerSecond":"14.3\/s","averageTransactionTime":"150","minTransactionTime":"0","maxTransactionTime":"10809","totalNumberOfErrors":"4","errorPercentage":"(0.29%)","percentComplete":"80%","_links":{"self":{"href":"http:\/\/169.55.87.104:8888\/haswell-statistics"}}};

 	 
    	
 			
	//});
	//if(x86_result[percentComplete] != 100) {
	// setTimeout(getSummary, 5000);
	//}
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
