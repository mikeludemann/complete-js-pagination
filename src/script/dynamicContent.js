var all = [
	{id: 1, text: "Element 1", sub: [
		{
			content: "Element 1.1"
		},
		{
			content: "Element 1.2"
		}
		]},
	{"id": 2, "text": "Element 2"},
	{"id": 3, "text": "Element 3"},
	{"id": 4, "text": "Element 4"},
	{"id": 5, "text": "Element 5"},
	{"id": 6, "text": "Element 6"},
	{"id": 7, "text": "Element 7"},
	{"id": 8, "text": "Element 8"},
	{"id": 9, "text": "Element 9"},
	{"id": 10, "text": "Element 10", sub: [
		{
			content: "Element 1.1"
		},
		{
			content: "Element 1.2"
		}
		]},
	{"id": 11, "text": "Element 11"},
	{"id": 12, "text": "Element 12"},
	{"id": 13, "text": "Element 13"},
	{"id": 14, "text": "Element 14"},
	{"id": 15, "text": "Element 15"},
	{"id": 16, "text": "Element 16"},
	{"id": 17, "text": "Element 17"},
	{"id": 18, "text": "Element 18"},
	{"id": 19, "text": "Element 19"},
	{"id": 20, "text": "Element 20"}
];

/*
const newArr = all.reduce((arr, el) => { 
	arr.push(el);
	el.sub && el.sub.forEach(sub => arr.push(sub));
	return arr;
}, []);
*/

var response = {
	currentPage: 0,
	total: 0,
	list: []
};

var server = {

	getListResponse: function(startFrom, numberOfElements) {

		// Reset list on response
		response.list = [];
		// Set total number of items
		response.total = all.length;
		// Set current page
		response.currentPage = parseInt(startFrom / numberOfElements) + 1;

		// We take the startFrom - 1 element because the pagination starts from index 1
		var i = startFrom - 1;
		var j = 0;

		// Fetch numberOfElements items (while there still are items) 
		while (i < all.length && j < numberOfElements) {

			// Add it to the response list
			response.list[j] = all[i];

			i++;
			j++;
		}
		return response;
	}
}

function myListFunction(startFrom, numberOfElements) {

	var listHtml = '';

	// Get mock server response (contains the list, current page and total number of elements)
	var response = server.getListResponse(startFrom, numberOfElements);

	// Construct the List HTML
	for (var i = 0; i < response.list.length; i++) {
		listHtml += '<div id="element--' + (i+1) + '"><div>' + response.list[i].text + '</div>';
		if (response.list[i].sub) {
			for (var j = 0; j < response.list[i].sub.length; j++) {
				listHtml += '<div id="element--' + (i+1) + "-" + (j+1) +'">' + response.list[i].sub[j].content + '</div>';
			}
		}
		listHtml += '</div>';
	}

	// Set the List HTML
	document.getElementById('list-container').innerHTML = listHtml;

	// Call the displayPagination function that adjusts the plugin to the current page
	pagination.displayPagination(response.currentPage, response.total);
}
