'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');

var prompts = require('./prompts');
var config = require('./config.js');
var mssql = require('./mssql');

var SqlGenerator = generators.Base.extend({
});

module.exports = SqlGenerator.extend({
    prompting: function(){
        var self = this;
        var done = self.async();
        var answers = null;

        function combineAnswers(answers, moreAnswers){
            if(moreAnswers !== null){
                answers.user = moreAnswers.user;
                answers.password = moreAnswers.password;
            }

            return answers;
        }

        var promptForCredentials = function (serverAnswers){
            answers = serverAnswers;
            self.prompt(prompts.forCredentials(serverAnswers), getDatabases);
        };

        var getDatabases = function(credentialAnswers){
            answers = combineAnswers(answers, credentialAnswers);
            var myConfig = config.createFrom(answers);
            mssql.getDatabases(myConfig, promptForDatabases);
        };

        var promptForDatabases = function(databases){
            self.prompt(prompts.forDatabase(databases), getTables);
        };

        var getTables = function(finalAnswers){
            answers.database = finalAnswers.database;
            mssql.getTables(config.createFrom(answers), promptForTable);
        };

        var promptForTable = function(tables){
            self.prompt(prompts.forTable(tables), showTables);
        };

        var showTables = function(tableAnswers){
            mssql.showColumns(config.createFrom(answers), tableAnswers.table);
            done();
        };

        self.log(yosay('Welcome to our magnificent db-poc!'));
        self.prompt(prompts.forServer, (promptForCredentials).bind(self));
    },
    writing: function(){
        var self = this;
    }
});
