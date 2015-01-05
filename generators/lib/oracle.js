var oracle = require('oracle');
var util = require('util');

function getDatabases(config, callback){
    oracle.connect(config, function(err, connection) {
        if (err) { console.log('Error connecting to db:', err); return; }

        connection.execute('SELECT USERNAME FROM ALL_USERS ORDER BY USERNAME', [], function(err, results) {
            if (err) {
                console.log('Error executing query:', err); return;
            }

            var databases = [];
            results.forEach(function(result){
                databases.push(result.USERNAME);
            });
            connection.close();
            callback(databases);
        });
    });
}

function getTables(config,  callback){
    oracle.connect(config, function(err, connection) {
        if (err) {
            console.log('Error connecting to db:', err); return;
        }

        connection.execute(
            'SELECT distinct TABLE_NAME FROM ALL_TAB_COLUMNS where owner = :1',
            [config.database],
            function(err, results) {
                if (err) {
                    console.log('Error executing query:', err); return;
                }

                var tables = [];
                results.forEach(function(result){
                    tables.push(result.TABLE_NAME);
                });
                connection.close();
                callback(tables);
        });
    });
}

function showColumns(config, table){
    oracle.connect(config, function(err, connection) {
        if (err) {
            console.log('Error connecting to db:', err); return;
        }

        connection.execute(
            'select COLUMN_NAME, DATA_TYPE, DATA_LENGTH from all_tab_columns where TABLE_NAME = :1',
            [table],
            function(err, results) {
                if (err) {
                    console.log('Error executing query:', err); return;
                }

                results.forEach(function(result){
                    console.log(
                        util.format(
                            'Column: %s, %s PRECISION %s',
                            result.COLUMN_NAME,
                            result.DATA_TYPE,
                            result.DATA_LENGTH));
                });
                connection.close();
                callback(results);
        });
    });
}

exports.getDatabases = getDatabases;
exports.getTables = getTables;
exports.showColumns = showColumns;
