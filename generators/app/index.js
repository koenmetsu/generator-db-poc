'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');

module.exports = generators.Base.extend({
    prompting: function(){
        var self = this,
            done = self.async();

        self.log(yosay('Welcome to our magnificent db-poc!'));

        this.prompt({
            type    : 'input',
            name    : 'connectionString',
            message : 'The connectionString to be used'
        }, function (answers) {
            self.connectionString = answers.connectionString;
            done();
        }.bind(this));
    },
    writing: function(){
        var self = this;

        self.log('I am connecting to ' + self.connectionString);
    }
});