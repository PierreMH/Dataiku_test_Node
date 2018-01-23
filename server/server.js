const express = require('express');
const app = express();
const sqlite = require('sqlite3').verbose();
const bodyparser = require("body-parser");

// Constant values to be edited easily.
const MAX_DISPLAYED_VALUES = 100, // Max different values displayed on the chart.
	AGE_APPROX = 2, // Number of digits kept after the coma on the age approximation.
	DB_FILE = './us-census.db',
	DB_TABLE = 'census_learn_sql';

// Count the numbers of rows in the table.
var total_count = 0;

app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

/* Request on the page opening to get the columns names. */
app.get('/', function (req, res) {
	var cols = [], i = 0;
	let db = new sqlite.Database( DB_FILE, sqlite.OPEN_READONLY, (err) => {
		if (err) {
			res.render('index',{ error: err.message });
			return;
		}
	});
	db.all("PRAGMA table_info(" + DB_TABLE + ")", function(err, columns) { 
		if (err) {
			res.render('index',{ error: err.message, columns: null });
		}
		else{
			columns.forEach(function (col){
				cols.push( { id: i, name: col.name } );
				i++;
			});
			res.render('index',{ error: null, columns: cols });
		}
	});
	db.all( "SELECT COUNT(1) AS tot FROM " + DB_TABLE, function(err, rows) {
		if (err) {
			res.end( JSON.stringify( { error: err.message, result: null } ) );
		}
		else{
			total_count = rows[0].tot;
		}
	});
	db.close();
});

/* Request when a column name is chosen to get the informations about the column. */
app.post('/', function (req, res) {
	var result = [],
		row_count = 0,
		values = 0,
		col = '"' + req.body.col + '"';
	let db = new sqlite.Database(DB_FILE, sqlite.OPEN_READONLY, (err) => {
		if (err) {
			res.end( JSON.stringify( { error: err.message, result: null } ) );
			return;
		}
	});
	
	db.all( "SELECT AVG(age) AS avg_age," + col + " AS name,COUNT(" + col + ") AS count_val FROM " + DB_TABLE + " GROUP BY " + col + "ORDER BY count_val DESC", function(err, rows) {
		if (err) {
			res.end( JSON.stringify( { error: err.message, result: null } ) );
		}
		else{
			rows.forEach(function (row){
				if( row.name )
					result.push({y: row.count_val, label: row.name, age: row.avg_age ? row.avg_age.toFixed(AGE_APPROX) : null });
			});
			while( result.length > MAX_DISPLAYED_VALUES ){
				values += result[result.length - 1].y;
				row_count ++;
				result.pop();
			}
			res.end( JSON.stringify( { error: null, result: { row_count: total_count - row_count, values: values, datas: result } } ) );
		}
	});
	db.close();
});

app.listen(8080, function () {
	console.log('Node server listening on port 8080!')
});