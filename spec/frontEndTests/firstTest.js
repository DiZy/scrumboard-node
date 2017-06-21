describe("First test", function() {     
  beforeEach(function() {
    setUpHTMLFixture();

    jasmine.Ajax.install();
  });
  
  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it ("init team", function() {

    jasmine.Ajax.stubRequest('/getTeamDetails?teamId=test').andReturn({
        "status": 200,
        "responseText": JSON.stringify({
          type: "error",
          error: "test"
        })
      });
    team.initialize({_id: 'test'});
    expect(jasmine.Ajax.requests.mostRecent().url).toBe('/getTeamDetails?teamId=test');
  });
});