describe("Team.initialize", function() { 
	var teamResponse;

	beforeEach(function() {
		jasmine.getFixtures().fixturesPath = 'base/spec';
		loadFixtures('firstTest.html');

		$('<div>').css('display', 'none').attr('id', 'burndown-chart').appendTo('body');

		jasmine.Ajax.install();

		teamResponse = {
			'_id': 6,
			'companyId': 6000,
			'name': 'david team',
			'columnNames': ['Not Started', 'In Progress', 'To Be Verified', 'Done'],
			'people': [
			{
				'_id' : 17,
				'name': 'DZ',
		        	'taskId': 2000 //nullable
		        }
		        ]
	    };

	    jasmine.Ajax.stubRequest('/getTeamDetails?teamId=6').andReturn({
			"status": 200,
			"responseText": JSON.stringify({
				type: 'success',
				team: teamResponse
			})
		});

		jasmine.Ajax.stubRequest('/getBurndown?teamId=6').andReturn({
			"status": 200,
			"responseText": JSON.stringify({type: "success", chartLabels: [], hoursData: [], pointsData: []})
		});

		jasmine.Ajax.stubRequest('/getStories?teamId=6').andReturn({
			"status": 200,
			"responseText": JSON.stringify({type: "success", stories: []})
		});

		team.initialize(teamResponse);
	});

	afterEach(function() {
		jasmine.Ajax.uninstall();
		$("#board").remove();
		$('#unassignedPeople').remove();
	});

	it ("should load a single board div and a single unassignedPeople div", function() {
		expect($("#board").length).toBe(1);
		expect($("#unassignedPeople").length).toBe(1);
	});
});