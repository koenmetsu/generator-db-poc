'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');

var prompts = require('../lib/prompts');
var config = require('../lib/oracle_config.js');
var oracle = require('../lib/oracle.js');


module.exports = generators.Base.extend({
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
            oracle.getDatabases(myConfig, promptForDatabases);
        };

        var promptForDatabases = function(databases){
            self.prompt(prompts.forDatabase(databases), getTables);
        };

        var getTables = function(finalAnswers){
            answers.database = finalAnswers.database;
            oracle.getTables(config.createFrom(answers), promptForTable);
        };

        var promptForTable = function(tables){
            self.prompt(prompts.forTable(tables), showColumns);
        };

        var showColumns = function(tableAnswers){
            oracle.showColumns(config.createFrom(answers), tableAnswers.table);
            done();
        };

        self.log(yosay('Welcome to our magnificent ORACLE db-poc!'));
        self.prompt(prompts.forOracle, (promptForCredentials).bind(self));

    },
    writing: function(){
        var self = this;
    }
});
