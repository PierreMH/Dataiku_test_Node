/* Called when the user selects a new column. */
function newData(){
	// Added a test to avoid a query on the selection of the empty option.
	$('#tableResults').empty();
	$('#chartContainer').hide();
	$("#cr").html("-");
	$("#hv").text("-");

	if( $("#selector option:selected").text() !== " " ){
		$.ajax({	type : 'POST',
					datatype: "JSON",
					//url : "execute.php",
					data : { col: $("#selector option:selected").text() },
					success : function(datas){
						parseDatas(datas);
					}
				});
	}
}

/* Callback function of the query. */
function parseDatas( json ){
	if( JSON.parse(json).error ){
		console.log( JSON.parse(json).error );
	}
	else{
		var result = JSON.parse(json).result,
			$row = undefined,
			$name = undefined,
			$count = undefined,
			$age = undefined,
			i = 0;

		// Chart edition from the site https://canvasjs.com/html5-javascript-column-chart/
		var chart = new CanvasJS.Chart("chartContainer", {
				animationEnabled: false,
				theme: "light2", // "light1", "light2", "dark1", "dark2"
				data: [{        
						type: "column",  
						showInLegend: true,
						legendText: " ",
						legendMarkerColor: "grey",
						toolTipContent: "average age: {age}<br/>{label}: {y}",
						dataPoints: result.datas
				}]
		});
		$('#chartContainer').show();
		chart.render();

		// Display indication values about the datas.
		$("#cr").html(result.row_count);
		$("#hv").text(result.values);

		// Construction of the table.
		$row = $('<tr>');
		$name = $('<td>');
		$count = $('<td>');
		$age = $('<td>');

		$name.html( "<span class='title'>Values</span>" );
		$count.html( "<span class='title'>Count</span>" );
		$age.html( "<span class='title'>Average age</span>" );

		$row.append( $name );
		$row.append( $count );
		$row.append( $age );
		$('#tableResults').append($row);

		for( i = 0; i < result.datas.length; i ++ ){
			$row = $('<tr>');
			$name = $('<td>');
			$count = $('<td>');
			$age = $('<td>');
			$name.html( result.datas[i].label );
			$count.html( result.datas[i].y );
			$age.html( result.datas[i].age );
			
			$row.append( $name );
			$row.append( $count );
			$row.append( $age );
			$('#tableResults').append($row);
		}
	}
}