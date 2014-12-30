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

function createTablePrompts(tables){
    return [
                {
                    type    : 'list',
                    name    : 'table',
                    message : 'Which table do you want to use?',
                    choices : tables
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

function getTables(config, callback){
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
            callback(tables);
            connection.close();
        });

        connection.execSql(request);
    });
}

function showColumns(config, table){
    var connection = new Connection(config);
    connection.on('connect', function(err){
        if(err){
            console.log('Errors: ' + err);
        }
        var request = new Request(util.format("exec sp_columns %s;", table), function(err, rowCount) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' rows');
            }
        });
        request.on('row', function(columns) {
            var columnInfo = {};
            columns.forEach(function(column) {
                if(column.metadata.colName === 'COLUMN_NAME'){
                    columnInfo.name = column.value;
                }
                if(column.metadata.colName === 'TYPE_NAME'){
                    columnInfo.type = column.value;
                }
                if(column.metadata.colName === 'PRECISION'){
                    columnInfo.precision = column.value;
                }
                if(column.metadata.colName === 'NULLABLE'){
                    columnInfo.nullable = column.value;
                }
            });
            console.log(util.format('Column: %s, %s PRECISION %s', columnInfo.name, columnInfo.type, columnInfo.precision));
        });
        request.on('doneProc', function(rowCount, more, rows){
            connection.close();
        });
        console.log(util.format('The table %s has the following columns:', table));
        console.log('---------------------');
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
                        var finalConfig = createConfig(allAnswers);
                        getTables(finalConfig, function(tables){
                            self.prompt(createTablePrompts(tables), function(tableAnswers){
                                showColumns(finalConfig, tableAnswers.table);
                                done();
                            });
                        });
                    });

                });
            });
        }.bind(this));
    },
    writing: function(){
        var self = this;
    }
});
