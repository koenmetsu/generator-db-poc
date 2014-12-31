var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var util = require('util');

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
            connection.close();
            return callback(databases);
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
            connection.close();
            return callback(tables);
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

exports.getDatabases = getDatabases;
exports.getTables = getTables;
exports.showColumns = showColumns;
