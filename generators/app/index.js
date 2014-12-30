'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var os = require('os');

module.exports = generators.Base.extend({
    prompting: function(){
        var self = this,
            done = self.async();

        self.log(yosay('Welcome to our magnificent db-poc!'));

        self.prompt([
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
        ], function (answers) {
            self.server = answers.server;
            self.instanceName = answers.instanceName
            var credentialPrompts = [
                {
                    type    : 'input',
                    name    : 'user',
                    message : 'What is the user for ' + self.server
                },
                {
                    type    : 'password',
                    name    : 'password',
                    message : 'What is the password for ' + self.server
                }    
            ];
            self.prompt(credentialPrompts, function(moreAnswers){
                self.user = moreAnswers.user;
                self.password = moreAnswers.password;
                done();
            });
        }.bind(this));
    },
    writing: function(){
        var self = this;
        
        self.log('I am connecting to ' + self.server + '\\'+ self.instanceName +' with user ' + self.user);
        
        var config = {
            userName : self.user,
            password : self.password,
            server : self.server,
            options: {
                instanceName : self.instanceName
            }
        };

        var connection = new Connection(config);

        connection.on('connect', 
            function(err){
                if(err !== null){
                   self.log('Errors: ' + err);
                }
                var request = new Request("SELECT * FROM information_schema.tables", function(err, rowCount) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(rowCount + ' rows');
                  }
                });

                request.on('row', function(columns) {
                  columns.forEach(function(column) {
                    console.log(column.value);
                  });
                });

                connection.execSql(request);
            }
        );
    }
});