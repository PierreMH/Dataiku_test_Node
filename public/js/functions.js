/* Called when the user selects a new column. */
function newData(){
	// Added a test to avoid a query on the selection of the empty option.
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
						dataPoints: JSON.parse(json).result.datas
				}]
		});
		chart.render();
		
		// Display indication values about the datas.
		$("#cr").html(JSON.parse(json).result.row_count);
		$("#hv").text(JSON.parse(json).result.values);
	}
}