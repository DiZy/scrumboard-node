burndown = (function() {
	var _teamId;
	var hoursData = [];
	var burndownChart;

	function retrieveDataAndRenderChart() {
		$.ajax({
		    type: 'GET',
		    url: '/getBurndown',
		    data: {
		        teamId: _teamId
		    },
		    dataType: "json",
		    contentType: "application/x-www-form-urlencoded"

		})
		.done(function(data) {
		    console.log(data);
		    if(data.type == 'success'){
		        renderChart(data.chartLabels, data.chartData);
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

	function renderChart(labels, data) {
		burndownChart = new Chart(document.getElementById("burndown-chart"), {
		    type: 'line',
		    data: {
		        labels: labels,
		        datasets: [{
		            label: 'Hours',
		            data: data,
		            backgroundColor: 'rgba(255, 99, 132, 0.2)',
		            borderColor: 'rgba(255,99,132,1)',
		            borderWidth: 1
		        }]
		    },
		    options: {
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero:true
		                }
		            }]
		        }
		    }
		});
	}


	function addEventHandlers() {
		$('#burndown-toggle').click(function() {
			$('#burndown').slideToggle({ direction: "up" }, 300);
			var glyphiconSpan = $('#burndown-toggle>.glyphicon');
			if(glyphiconSpan.hasClass('glyphicon-collapse-up')) {
				glyphiconSpan.removeClass('glyphicon-collapse-up');
				glyphiconSpan.addClass('glyphicon-collapse-down');
			} else {
				glyphiconSpan.removeClass('glyphicon-collapse-down');
				glyphiconSpan.addClass('glyphicon-collapse-up');
			}
		});


		$('#burndown-start').click(function() {
			var confirmation = confirm("Are you sure you want to reset the sprint data?");
			if (confirmation) {
				start();
			}
		});
		$('#burndown-mark').click(mark);
		$('#burndown-undo').click(undo);
	}

	function start() {
		$.ajax({
		    type: 'POST',
		    url: '/startBurndown',
		    data: {
		        teamId: _teamId
		    },
		    dataType: "json",
		    contentType: "application/x-www-form-urlencoded"

		})
		.done(function(data) {
		    console.log(data);
		    if(data.type == 'success'){
		        burndownChart.data.labels = [];
		        burndownChart.data.datasets[0].data = [];
		        burndownChart.update();
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

	function mark() {
		$.ajax({
		    type: 'POST',
		    url: '/markBurndown',
		    data: {
		        teamId: _teamId
		    },
		    dataType: "json",
		    contentType: "application/x-www-form-urlencoded"

		})
		.done(function(data) {
		    console.log(data);
		    if(data.type == 'success'){
		    	var currentSet = burndownChart.data.datasets[0].data;
		        burndownChart.data.labels.push(currentSet.length);
		        currentSet.push(data.newPoint);
		        burndownChart.update();
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

	function undo() {
		$.ajax({
		    type: 'POST',
		    url: '/undoBurndown',
		    data: {
		        teamId: _teamId
		    },
		    dataType: "json",
		    contentType: "application/x-www-form-urlencoded"

		})
		.done(function(data) {
		    console.log(data);
		    if(data.type == 'success'){
		    	burndownChart.data.labels.pop();
		    	burndownChart.data.datasets[0].data.pop();
		        burndownChart.update();
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

	return {
		initialize: function(teamId) {
			_teamId = teamId;
			retrieveDataAndRenderChart();
			addEventHandlers();
		}

	}
})();