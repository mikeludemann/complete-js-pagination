/** Include this JS on each HTML that needs pagination **/
var pagination = {

	// How many pages to display before / after the current page
	MORE_PAGES_TO_DISPLAY: 2,
	// Current page number
	CURRENT_PAGE_NUMBER: 1,
	// Last page number
	LAST_PAGE_NUMBER: 1,
	// Number of elements to be displayed on the page
	NUMBER_OF_ELEMENTS_PER_PAGE: 0,
	// Total number of elements
	TOTAL_NUMBER_OF_ELEMENTS: 0,
	// Name of the function that will retrieve list data for the current 'entity'
	CALLBACK: null,

	/**
		* Function that initializes the pagination and performs an initial call to the listing of the desired entity.
		* @param listEntityFunction callback function that performs a Listing of the desired entity
		*/
	listItems: function listItems(listEntityFunction) {
		// Save the CALLBACK function used
		pagination.CALLBACK = listEntityFunction;

		// Get pagination parameters from the URL
		var currentPage = (new RegExp('page=' + '(.+?)(&|$)').exec(location.search || location.hash) || [, null])[1];
		var noOfElements = (new RegExp('elems=' + '(.+?)(&|$)').exec(location.search || location.hash) || [, null])[1];

		// If the URL contains pagination information, save it
		if (currentPage != null && noOfElements != null) {
			pagination.setPaginationInformationFromTheURL(currentPage, noOfElements);
		}
		// Else, take the pagination information from the UI
		else {
			pagination.getNumberOfElementsPerPage();
		}

		// Call the function that lists the current entity with default values
		pagination.callListItems();
	},

	/**
		* Reset the pagination parameters to their initial values and paginate the elements
		*/
	resetPaginationParameters : function resetPaginationParameters() {
		pagination.CURRENT_PAGE_NUMBER = 1;
		pagination.LAST_PAGE_NUMBER = 1;
		pagination.NUMBER_OF_ELEMENTS_PER_PAGE = 0;
		pagination.TOTAL_NUMBER_OF_ELEMENTS = 0;

		// List the items
		pagination.getNumberOfElementsPerPage();
		pagination.callListItems();
	},

	/** Call the CALLBACK function that Lists the desired entity **/
	callListItems: function callListItems() {
		pagination.CALLBACK(pagination.startFrom(), pagination.NUMBER_OF_ELEMENTS_PER_PAGE);
		pagination.updateURL();
	},

	/**
		* First construct, and then display the Pages Navigation
		* @param currentPage current page
		* @param total total number of elements (count)
		*/
	displayPagination: function displayPagination(currentPage, total) {
		pagination.CURRENT_PAGE_NUMBER = currentPage;
		pagination.TOTAL_NUMBER_OF_ELEMENTS = total;
		pagination.setLastPageNumber();

		pagination.constructPagination();
		document.getElementById('list-pagination').style.visibility = 'visible';
	},

	/** Construct the contents of the Pages Navigation, depending on the current page and the total number of pages **/
	constructPagination: function constructPagination() {

		var pagesBefore = '';
		var pagesAfter = '';
		var displayFrom = 1;
		var displayUntil = pagination.LAST_PAGE_NUMBER;

		// What to display before the current page
		if (pagination.CURRENT_PAGE_NUMBER - pagination.MORE_PAGES_TO_DISPLAY > 1) {
			//pagesBefore = '... ';
			displayFrom = pagination.CURRENT_PAGE_NUMBER - pagination.MORE_PAGES_TO_DISPLAY;
		}
		for (var i = displayFrom; i < pagination.CURRENT_PAGE_NUMBER; i++) {
			pagesBefore += '<div class="list-pagination-element" onclick="pagination.getCustomPage(' + i + ')">' + i + '</div>';
		}

		// Display the current page
		var currentPageHtml = '<div class="list-pagination-element-unavailable">' + pagination.CURRENT_PAGE_NUMBER + '</div>';

		// What to display after the last page
		if (pagination.CURRENT_PAGE_NUMBER + pagination.MORE_PAGES_TO_DISPLAY < displayUntil) {
			displayUntil = pagination.CURRENT_PAGE_NUMBER + pagination.MORE_PAGES_TO_DISPLAY;
		}
		for (var j = pagination.CURRENT_PAGE_NUMBER + 1; j <= displayUntil; j++) {
			pagesAfter += '<div class="list-pagination-element" onclick="pagination.getCustomPage(' + j + ')">' + j + '</div>';
		}
		if (pagination.CURRENT_PAGE_NUMBER + pagination.MORE_PAGES_TO_DISPLAY < pagination.LAST_PAGE_NUMBER) {
			//pagesAfter += ' ...';
		}

		// Put everything in the pagination
		document.getElementById('list-pagination-pages').innerHTML = pagesBefore + currentPageHtml + pagesAfter;

		// Furthermore, check if <<First, <Previous, Next> and Last>> should be grayed out
		if (pagination.CURRENT_PAGE_NUMBER == 1) {
			document.getElementById('list-pagination-first').className = 'list-pagination-element-unavailable';
			document.getElementById('list-pagination-prev').className = 'list-pagination-element-unavailable';
		}
		else {
			document.getElementById('list-pagination-first').className = 'list-pagination-element';
			document.getElementById('list-pagination-prev').className = 'list-pagination-element';
		}
		if (pagination.CURRENT_PAGE_NUMBER == pagination.LAST_PAGE_NUMBER) {
			document.getElementById('list-pagination-next').className = 'list-pagination-element-unavailable';
			document.getElementById('list-pagination-last').className = 'list-pagination-element-unavailable';
		}
		else {
			document.getElementById('list-pagination-next').className = 'list-pagination-element';
			document.getElementById('list-pagination-last').className = 'list-pagination-element';
		}
	},


	/**
		* Start fetching items starting with this position
		* @returns Number representing starting position from which items should be retrieved
		*/
	startFrom: function startFrom() {
		var itemsPerPage = pagination.NUMBER_OF_ELEMENTS_PER_PAGE;
		return ( itemsPerPage * pagination.CURRENT_PAGE_NUMBER ) - itemsPerPage + 1;
	},

	/** Get number of elements to be displayed **/
	getNumberOfElementsPerPage: function getNumberOfElementsPerPage() {
		var selectBox = document.getElementById('items-per-page');
		pagination.NUMBER_OF_ELEMENTS_PER_PAGE = parseInt(selectBox.options[selectBox.selectedIndex].value);
	},

	/** Get pagination information (CURRENT_PAGE_NUMBER and NUMBER_OF_ELEMENTS_PER_PAGE) from the URL **/
	setPaginationInformationFromTheURL: function setPaginationInformationFromTheURL(currentPage, noOfElements) {
		pagination.CURRENT_PAGE_NUMBER = parseInt(currentPage);
		pagination.NUMBER_OF_ELEMENTS_PER_PAGE = parseInt(noOfElements);

		// Also, update the select-box to point to the new value
		var select = document.getElementById('items-per-page');
		for (var i = 0; i < select.options.length; i++) {
			select.options[i].selected = (select.options[i].value == pagination.NUMBER_OF_ELEMENTS_PER_PAGE);
		}
	},

	/** Set the LAST_PAGE_NUMBER depending on the total number of items and the number of items per page **/
	setLastPageNumber: function setLastPageNumber() {
		var total = pagination.TOTAL_NUMBER_OF_ELEMENTS;
		if (total > 0) {
			var itemsPerPage = pagination.NUMBER_OF_ELEMENTS_PER_PAGE;
			// If Total MOD ItemsPerPage is 0, the last page is the division between them. Else, it is the division + 1
			// Math.floor takes the largest integer less or equal to the parameter it takes; this is needed because else we end up with numbers with decimals
			pagination.LAST_PAGE_NUMBER = Math.floor( (total % itemsPerPage == 0) ? total / itemsPerPage : total / itemsPerPage + 1 );
		}
	},

	/** Navigate to the first page **/
	getFirstPage: function getFirstPage() {
		// Only perform function if the navigation link available
		if (document.getElementById('list-pagination-first').className != 'list-pagination-element-unavailable') {
			pagination.CURRENT_PAGE_NUMBER = 1;
			pagination.callListItems();
		}
	},

	/** Navigate to the last page **/
	getLastPage: function getLastPage() {
		// Only perform function if the navigation link available
		if (document.getElementById('list-pagination-last').className != 'list-pagination-element-unavailable') {
			pagination.CURRENT_PAGE_NUMBER = pagination.LAST_PAGE_NUMBER;
			pagination.callListItems();
		}
	},

	/** Navigate to the previous page **/
	getPreviousPage: function getPreviousPage() {
		// Only perform function if the navigation link available
		if (document.getElementById('list-pagination-prev').className != 'list-pagination-element-unavailable') {
			pagination.CURRENT_PAGE_NUMBER = (pagination.CURRENT_PAGE_NUMBER - 1 > 0) ? pagination.CURRENT_PAGE_NUMBER - 1 : 1;
			pagination.callListItems();
		}
	},

	/** Navigate to the next page **/
	getNextPage: function getNextPage() {
		// Only perform function if the navigation link available
		if (document.getElementById('list-pagination-next').className != 'list-pagination-element-unavailable') {
			pagination.CURRENT_PAGE_NUMBER = (pagination.CURRENT_PAGE_NUMBER + 1 < pagination.LAST_PAGE_NUMBER) ? pagination.CURRENT_PAGE_NUMBER + 1 : pagination.LAST_PAGE_NUMBER;
			pagination.callListItems();
		}
	},

	/** Navigate to a custom page **/
	getCustomPage: function getCustomPage(pageNumber) {
		pagination.CURRENT_PAGE_NUMBER = pageNumber;
		pagination.callListItems();
	},

	/** Function triggered when the number of elements to be displayed per page was changed **/
	numberOfElementsChanged: function numberOfElementsChanged() {
		// Update the NUMBER_OF_ELEMENTS_PER_PAGE
		pagination.getNumberOfElementsPerPage();
		// Check for overflow (and fix it)
		pagination.fixOverflow();
		// Update the URL
		pagination.updateURL();
		// And list the items
		pagination.callListItems();
	},

	/**
		* When NUMBER_OF_ELEMENTS_PER_PAGE is updated to a greater value than before, the total number of pages will decrease.
		* In case we are on one of the last pages when it happens, we might end up on an nonexistent page w.r.t.
		* the new NUMBER_OF_ELEMENTS_PER_PAGE value
		* This function makes sure to check for this case, and update the CURRENT_PAGE_NUMBER accordingly
		*/
	fixOverflow: function fixOverflow() {
		if (pagination.startFrom() > pagination.TOTAL_NUMBER_OF_ELEMENTS) {
			// Calculate the number of overflow elements
			var noOfOverflowElements = pagination.startFrom() - pagination.TOTAL_NUMBER_OF_ELEMENTS;
			// Calculate the number of overflow pages, and subtract them from the CURRENT_PAGE_NUMBER to obtain the "new" current page
			pagination.CURRENT_PAGE_NUMBER -= Math.floor( noOfOverflowElements / pagination.NUMBER_OF_ELEMENTS_PER_PAGE ) + 1;
		}

		// Current page should always be at least 1
		if (pagination.CURRENT_PAGE_NUMBER < 1) {
			pagination.CURRENT_PAGE_NUMBER = 1;
		}
	},

	/** Update the pagination information in the URL, keeping other parameters **/
	updateURL: function updateURL() {

		var initialURL = window.location.href.split('#');
		var hostName = initialURL[0];

		// Define the new pagination parameters. Existing non-pagination params will be appended to this variable
		var newParameters = '#page=' + pagination.CURRENT_PAGE_NUMBER + '&elems=' + pagination.NUMBER_OF_ELEMENTS_PER_PAGE;

		// Parse all the parameters and remove the pagination ones, if they exist. Keep the rest
		if (initialURL[1] != undefined && initialURL[1].length > 0) {
			var parameters = initialURL[1].split('&');
			for (var i = 0; i < parameters.length; i++) {
				if (parameters[i].indexOf('page=') == -1 && parameters[i].indexOf('elems') == -1) {
					newParameters += '&' + parameters[i];
				}
			}
		}
		window.location.href = hostName + newParameters;
	}
};

window.onload = function(){
	pagination.listItems(myListFunction);
};
