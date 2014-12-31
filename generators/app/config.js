function createFrom(answers){
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

exports.createFrom = createFrom;
