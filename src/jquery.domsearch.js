;(function ( $, window, document, undefined ) {
	var pluginName = "domsearch",
			defaults = {
					results: {},
					filters: {},
					resultsVisible: 8,
					filtersVisible: 3
			};

	/**
	 * Plugin constructor
	 *
	 * @param {object} element Object plugin is attached to
	 * @param {object} options Options object
	 *
	 * @return {null}
	 */
	function Plugin ( element, options ) {
		this.element = element;
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;

		this.filters = this.options.response.filterFamilies;
		this.results = this.options.response.searchResults;

		this.error = this.options.response.error;
		this.notice = this.options.response.notice;

		this.paginated = {
			page: 1,
			pages:[],
			results: []
		};
		this.active = [];

		this.init();
	}

	Plugin.prototype = {
		init: function() {
			this.attachListeners();
			this.renderFilters(this.filters);
			this.prerender(this.results).paginate().renderResults(this.paginated);
		},

		/**
		 * Attaches all event listeners on init
		 *
		 * @return {null}
		 */
		attachListeners: function() {
			$("#search-filters").on("change", ".search-filter", {plugin:this}, function(e){
				e.data.plugin.filter($(this));
			});

			$("#search-filters").on("x-filters-rendered", {plugin:this}, function(e) {
				var filtersVisible = e.data.plugin.options.filtersVisible;
				$(".filter-family").each(function() {
					$(this).find(".checkbox").slice(filtersVisible).hide();
				});
			});

			$("#search-filters").on("click", ".filters-show", {plugin:this}, function(e) {
				e.data.plugin.toggleFilterVisibility($(this));
			});

			$("#search-filters").on("click", ".filters-toggleall", {plugin:this}, function(e) {
				e.data.plugin.toggleFilterAll($(this));
			});

			$("#search-results").on("click", ".search-next", {plugin:this}, function(e) {
				e.data.plugin.pageAdvance();
			});

			$("#search-results").on("click", ".search-prev", {plugin:this}, function(e) {
				e.data.plugin.pageReverse();
			});
		},

		/**
		 * Filters the results array based on filter event
		 *
		 * @param  {object} e Element that triggered filter event
		 *
		 * @return {null}
		 */
		filter: function(e) {
			var filterId			= e.attr("id"),
					isChecked			= e.is(":checked"),
					obj						= this.results[i],
					isHidden,
					isFilterable,
					i;

			for (i in this.results) {
				isHidden			= (obj.hasOwnProperty("hiddenBy") && $.inArray(filterId, obj.hiddenBy) !== -1);
				isFilterable	= (obj.hasOwnProperty("filters") && $.inArray(filterId, obj.filters) !== -1);

				if (isChecked && isHidden) {
					obj.hiddenBy.splice($.inArray(filterId, obj.hiddenBy), 1);
					if (obj.hiddenBy.length < 1) {
						delete obj.hiddenBy;
					}
				} else {
					if (isFilterable && isHidden === false) {
						if (obj.hasOwnProperty("hiddenBy") === false) {
							obj.hiddenBy = [];
						}

						obj.hiddenBy.push(filterId);
					}
				}
			}

			this.prerender(this.results).paginate().renderResults(this.paginated);
		},

		/**
		 * Rebuilds active element array after filtering is complete
		 *
		 * @param  {array} results Array of results (usually this.results)
		 *
		 * @return {object} Plugin object to facilitate method chaining
		 */
		prerender: function(results) {
			var hasOwnProperty,
					i;

			this.paginated.page = 1;

			this.active = [];
			for (i in results) {
				hasOwnProperty = results[i].hasOwnProperty("hiddenBy");
				if (hasOwnProperty === false || results[i].hiddenBy.length <= 0) {
					this.active.push(results[i]);
				}
			}
			return this;
		},

		/**
		 * Generates base pagination environment variables along with an
		 * array of result objects that match the current pagination page.
		 *
		 * @return {object} Plugin instance
		 */
		paginate: function() {
			var offset = (this.paginated.page * this.options.resultsVisible);
			this.paginated.pages = Math.ceil(this.active.length / this.options.resultsVisible);
			this.paginated.results = this.active.slice((offset - this.options.resultsVisible), offset);
			return this;
		},

		/**
		 * Renders the given result set using the provided dust.js template
		 *
		 * @param  {object} options Hash of options to use in template render
		 *
		 * @return {null}
		 */
		renderResults: function(options) {
			var defaults = {
				error:			this.error,
				notice:			this.notice,
				page:				this.paginated.page,
				pages:			this.paginated.totalPages,
				results:		this.results
			};
			data = $.extend({}, defaults, options);

			dust.render("results", data, function(err, out) {
				$("#search-results").html(out).trigger("x-results-rendered");
			});
		},

		/**
		 * Renders a list of filter families and options
		 *
		 * @param  {array} data Array of filter family objects
		 *
		 * @return {null}
		 */
		renderFilters: function(data) {
			data = {families:data};
			dust.render("filters", data, function(err, out) {
				$("#search-filters").html(out).trigger("x-filters-rendered");
			});
		},

		/**
		 * Advances pagination cross-section ahead one page
		 *
		 * @return {null}
		 */
		pageAdvance: function() {
			if (this.paginated.page < this.paginated.pages) {
				this.paginated.page++;
			}

			this.paginate().renderResults(this.paginated);
		},

		/**
		 * Reverses pagination cross-section by one page
		 *
		 * @return {null}
		 */
		pageReverse: function() {
			if (this.paginated.page > 1) {
				this.paginated.page--;
			}

			this.paginate().renderResults(this.paginated);
		},

		/**
		 * Toggles the visibility of filters in each filter family
		 * based on the number set in the plugin options
		 *
		 * @param  {object} e Element which triggered the toggle event
		 *
		 * @return {null}
		 */
		toggleFilterVisibility: function(e) {
			if (e.data("state") === "more") {
				e.parent().find(".checkbox").slice(this.options.filtersVisible).hide();
				e.data("state", "less").text("Show more").attr("data-state","");
			} else {
				e.parent().find(".checkbox").show();
				e.data("state", "more").text("Show less");
			}
		}
	};

	$.fn[ pluginName ] = function ( options ) {
		return this.each(function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		});
	};
})( jQuery, window, document );
