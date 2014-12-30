'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var os = require('os');
var util = require('util');


var serverPrompts = [
            {
                type    : 'input',
                name    : 'server',
                message : 'The server to be used',
                default : os.hostname()
            },
            {
                type    : 'input',
                name    : 'instanceName',
                message : 'The instanceName to be used',
                default : 'SQLEXPRESS'
            }
        ];

function createCredentialPrompts(answers){
    var config = createConfig(answers);

    return [
                {
                    type    : 'input',
                    name    : 'user',
                    message : 'What is the user for ' + answers.server
                },
                {
                    type    : 'password',
                    name    : 'password',
                    message : 'What is the password for ' + answers.server
                }
            ];
}

function createDatabasePrompts(databases){
    return [
                {
                    type    : 'list',
                    name    : 'database',
                    message : 'Which database do you want to use?',
                    choices : databases
                },
            ];
}

function createConfig(answers){
    var resultedAnswers =  {};
    resultedAnswers.server = answers.server;
    resultedAnswers.options = {
        instanceName : answers.instanceName,
        database : answers.database
    };
    resultedAnswers.userName = answers.user;
    resultedAnswers.password = answers.password;

    return resultedAnswers;
}

function combineAnswers(answers, moreAnswers){
    if(moreAnswers !== null){
        answers.user = moreAnswers.user;
        answers.password = moreAnswers.password;
    }

    return answers;
}

function getDatabases(config, callback){
    var connection = new Connection(config);
    var databases = [];
    connection.on('connect', function(err){
        if(err){
            console.log('Errors: ' + err);
        }
        var request = new Request("SELECT name FROM master..sysdatabases;", function(err, rowCount) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' database rows');
            }
        });
        request.on('row', function(columns) {
            columns.forEach(function(column) {
                databases.push(column.value);
            });
        });
        request.on('doneProc', function (rowCount, more, rows) {
            callback(databases);
            connection.close();
        });

        connection.execSql(request);
    });
}

function showTables(config){
    var connection = new Connection(config);
    connection.on('connect', function(err){
        if(err){
            console.log('Errors: ' + err);
        }
        var request = new Request("SELECT * FROM information_schema.tables", function(err, rowCount) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' rows');
            }
        });
        var tables = [];
        request.on('row', function(columns) {
            columns.forEach(function(column) {
                if(column.metadata.colName === 'TABLE_NAME'){
                    tables.push(column.value);
                }
            });
        });
        request.on('doneProc', function(rowCount, more, rows){
            console.log(util.format('The database %s has the following tables: '), config.options.database);
            tables.forEach(function(table){
                console.log(table);
            });
            connection.close();
        });

        connection.execSql(request);
    });
}

module.exports = generators.Base.extend({
    prompting: function(){
        var self = this,
            done = self.async();

        self.log(yosay('Welcome to our magnificent db-poc!'));

        self.prompt(serverPrompts, function (serverAnswers) {
            self.prompt(createCredentialPrompts(serverAnswers), function(credentialAnswers){
                var allAnswers = combineAnswers(serverAnswers, credentialAnswers);
                var config = createConfig(allAnswers);

                getDatabases(config, function(databases){
                    self.prompt(createDatabasePrompts(databases), function(finalAnswers){
                        allAnswers.database = finalAnswers.database;
                        self.answers = allAnswers;
                        done();
                    });

                });
            });
        }.bind(this));
    },
    writing: function(){
        var self = this;

        self.log('I am connecting to ' + self.answers.server + '\\'+ self.answers.instanceName +' with user ' + self.answers.user);

        showTables(createConfig(self.answers));
    }
});
