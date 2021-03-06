burndown = (function() {
	let _teamId;
	let hoursData = [];
	let _burndownChart;
	let _burdownUrl;

	function retrieveDataAndRenderChart() {
		$.ajax({
		    type: 'GET',
		    url: _burdownUrl,
		    /*data: {
		        teamId: _teamId
		    },*/
		    dataType: "json",
		    contentType: "application/x-www-form-urlencoded"

		})
		.done(function(data) {
		    if(data.type === 'success'){
		        renderChart(data.chartLabels, data.hoursData, data.pointsData);
		    }
		    else {
		        alert(data.error);
		    }

		})
		.fail(function(data) {
		    alert("Internal Server Error");
		    console.log(data);
		});
	}

	function renderChart(labels, hoursData, pointsData) {
		$('#burndown-chart').text("");
		_burndownChart = new Chart(document.getElementById("burndown-chart"), {
		    type: 'line',
		    data: {
		        labels: labels,
		        datasets: [{
		            label: 'Task Hours',
		            data: hoursData,
		            borderColor: 'rgba(255,99,132,1)',
		            backgroundColor: 'rgba(255,99,132,1)',
		            borderWidth: 1,
		            fill: false
		        },
		        {
		            label: 'Story Points',
		            steppedLine: true,
		            data: pointsData,
		            borderColor: 'rgba(100, 191, 222, 1)',
		            backgroundColor: 'rgba(100, 191, 222, 1)',
		            borderWidth: 1,
		            fill: false
		        }]
		    },
		    options: {
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero:true
		                },
		                scaleLabel: {
	                        display: true,
	                        labelString: 'Hours/Points'
                      	}
		            }],
		            xAxes: [{
		                scaleLabel: {
	                        display: true,
	                        labelString: 'Day'
                      	}
		            }]
		        }
		    }
		});
	}


	function addEventHandlers() {
		let burndownToggle = $('#burndown-toggle'),
			burndownStart = $('#burndown-start'),
			burndownMark = $('#burndown-mark'),
			burndownUndo = $('#burndown-undo');
		burndownToggle.unbind('click');
        burndownToggle.click(function() {
			$('#burndown').slideToggle({ direction: "up" }, 300);
		});

        burndownStart.unbind('click');
        burndownStart.click(function() {
			let confirmation = confirm("Are you sure you want to reset the sprint data?");
			if (confirmation) {
				start();
			}
		});

        burndownMark.unbind('click');
        burndownMark.click(mark);

        burndownUndo.unbind('click');
        burndownUndo.click(function() {
			let confirmation = confirm("Are you sure you want to undo the last point?");
			if (confirmation) {
				undo();
			}
		});
	}

	function start() {
		$.ajax({
		    type: 'POST',
		    url: _burdownUrl + '/start',
		    /*data: {
		        teamId: _teamId
		    },*/
		    dataType: "json",
		    contentType: "application/x-www-form-urlencoded"

		})
		.done(function(data) {
		    if(data.type === 'success'){
		        //Socket handles
		    }
		    else {
		        alert(data.error);
		    }

		})
		.fail(function(data) {
		    alert("Internal Server Error");
		    console.error(data);
		});
	}

	function mark() {
		$.ajax({
		    type: 'POST',
		    url: _burdownUrl + '/mark',
		    /*data: {
		        teamId: _teamId
		    },*/
		    dataType: "json",
		    contentType: "application/x-www-form-urlencoded"

		})
		.done(function(data) {
		    if(data.type === 'success'){
		    	//Socket handles
		    }
		    else {
		        alert(data.error);
		    }

		})
		.fail(function(data) {
		    alert("Internal Server Error");
		    console.error(data);
		});
	}

	function undo() {
		$.ajax({
		    type: 'POST',
		    url: _burdownUrl + '/undo',
		    /*data: {
		        teamId: _teamId
		    },*/
		    dataType: "json",
		    contentType: "application/x-www-form-urlencoded"

		})
		.done(function(data) {
		    if(data.type === 'success'){
		    	//Socket handles
		    }
		    else {
		        alert(data.error);
		    }

		})
		.fail(function(data) {
		    alert("Internal Server Error");
		    console.error(data);
		});
	}

	return {
		initialize: function(teamId) {
			_teamId = teamId;
			_burdownUrl = '/teams/' + teamId + '/burndown';
			retrieveDataAndRenderChart();
			addEventHandlers();
		},
		handleStart: function() {
			_burndownChart.data.labels = [];
			_burndownChart.data.datasets[0].data = [];
			_burndownChart.data.datasets[1].data = [];
			_burndownChart.update();
		},
		handleMark: function(newHours, newPoints) {
			let hoursDataSet = _burndownChart.data.datasets[0].data;
			let storyPointsDataSet = _burndownChart.data.datasets[1].data;
			_burndownChart.data.labels.push(hoursDataSet.length + 1);
			hoursDataSet.push(newHours);
			storyPointsDataSet.push(newPoints);
			_burndownChart.update();
		},
		handleUndo: function() {
			_burndownChart.data.labels.pop();
			_burndownChart.data.datasets[0].data.pop();
			_burndownChart.data.datasets[1].data.pop();
			_burndownChart.update();
		}

	}
})();