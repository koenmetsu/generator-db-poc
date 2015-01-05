var os = require('os');

var prompts = exports;

prompts.forServer = [
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

prompts.forOracle = [
            {
                type    : 'input',
                name    : 'tns',
                message : 'The tns to be used',
            },
        ];

prompts.forCredentials = function(answers){
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
};

prompts.forDatabase = function(databases){
    return [
                {
                    type    : 'list',
                    name    : 'database',
                    message : 'Which database do you want to use?',
                    choices : databases
                },
            ];
};

prompts.forTable = function(tables){
    return [
                {
                    type    : 'list',
                    name    : 'table',
                    message : 'Which table do you want to use?',
                    choices : tables
                },
            ];
};
