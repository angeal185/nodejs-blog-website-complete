exports.install = function() {
	// Merging static files
	F.merge('/default/css/default.css', '=default/public/css/default.css');
	F.merge('/default/js/default.js', '/js/jctajr.min.js', '/js/ui.js', '=default/public/js/default.js');

	// UI templates
	F.localize('/default/templates/*.html', ['compress']);
};
