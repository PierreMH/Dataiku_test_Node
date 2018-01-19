const express = require('express');
const app = express();
const sqlite = require('sqlite3').verbose();
const bodyparser = require("body-parser");

// Constant values to be edited easily.
const MAX_DISPLAYED_VALUES = 100, // Max different values displayed on the chart.
	AGE_APPROX = 2, // Number of digits kept after the coma on the age approximation.
	DB_FILE = './us-census.db',
	DB_TABLE = 'census_learn_sql';

app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

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
	db.close();
});

app.post('/', function (req, res) {
	var result = [],
		i = 0, j = 0,
		data = [],
		row_count = 0,
		tmp = undefined,
		values = 0,
		found = false,
		col = '"' + req.body.col + '"';
	let db = new sqlite.Database(DB_FILE, sqlite.OPEN_READONLY, (err) => {
		if (err) {
			res.end( JSON.stringify( { error: err.message, result: null } ) );
			return;
		}
	});
	db.all("SELECT age,"+ col +" FROM " + DB_TABLE + "", function(err, rows) { 
		if (err) {
			res.end( JSON.stringify( { error: err.message, result: null } ) );
		}
		else{
			// Count the number of each different values.
			rows.forEach(function (row){
				// Here I remove empty lines.
				if( row[req.body.col] !== null ){
					found = false;
					for( i = 0; i < data.length; i++ ){
						// If the current value is already stored we add the informations.
						if( data[i][0] === row[req.body.col] ){
							data[i][1]++;
							data[i][2] += row.age;
							found = true;
							break;
						}
					}
					// If the value wasn't stored, we create a new data: [ name, count, age sum ]
					if( !found )
						data.push( [ row[req.body.col], 0, row.age ] );
				}
			});

			// Sort the array.
			for( i = 0; i < data.length; i++ ){
				tmp = undefined;
				for( j = i; j < data.length; j++ ){
					if( data[j][1] > data[i][1] ){
						tmp = data[j];
						data[j] = data[i];
						data[i] = tmp;
					}
				}
			}

			// Update information values about the chart.
			if( data.length > MAX_DISPLAYED_VALUES ){
				// Keep the MAX_DISPLAYED_VALUES first values.
				values = data.length - MAX_DISPLAYED_VALUES;
				for( i = data.length - 1; i >= MAX_DISPLAYED_VALUES; i-- ){
					row_count += data[i][1];
					data.pop();
				}
			}

			// Count displayed rows.
			row_count = rows.length - row_count;

			// Create the array usable by the chart.
			for( i = 0; i < data.length; i++ ){
				result.push({y: data[i][1], label: data[i][0], age:(data[i][2]/data[i][1]).toFixed(AGE_APPROX)});
			}	
			
			res.end( JSON.stringify( { error: null, result: { row_count: row_count, values: values, datas: result } } ) );
		}
	});
	db.close();
});

app.listen(8080, function () {
	console.log('Node server listening on port 8080!')
});