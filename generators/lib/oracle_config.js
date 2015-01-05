function createFrom(answers){
    return {
        'tns': answers.tns,
        'user': answers.user,
        'password': answers.password,
        'database': answers.database,
    };
}

exports.createFrom = createFrom;
