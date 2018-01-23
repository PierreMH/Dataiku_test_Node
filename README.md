*************** REQUIREMENTS ****************
- Node.js
	Install the following npm modules in the server directory:
		- sqlite3
		- express
		- body-parser

*************** USAGE ****************

1. Launch the start.bat file
2. Select the colum in the drop box.
3. Hover the bars to get the informations and scroll in the table.

*************** INFORMATIONS ****************
# Time spent
1. Searching Node.js and SQLite documentations + conception: 2h
2. Programming: 3h
3. Cleaning and documentation: 15m
Total: 5h15 

I've tried to change the server to Node.js but I couldn't find a nice way to display the page.

*************** IMPROVEMENTS **************** 

It would be nice to have a list of data files available in the directory to switch from a dataset to another.
The UI could be more beautiful done by some designer.

Maybe we can count the rows and use the LIMIT option in sql to do everything in one query, but my knowledge is limited here.
Display the errors to the user.