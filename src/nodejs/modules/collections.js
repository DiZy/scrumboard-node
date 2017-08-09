const MongoCollection = require('./MongoCollection');
const usersCollection = new MongoCollection('users');
const companiesCollection = new MongoCollection('companies');
const teamsCollection = new MongoCollection('teams');
const storiesCollection = new MongoCollection('stories');
const burndownsCollection = new MongoCollection('burndowns');

module.exports = {
    users: usersCollection,
    companies: companiesCollection,
    teams: teamsCollection,
    stories: storiesCollection,
    burndowns: burndownsCollection
};