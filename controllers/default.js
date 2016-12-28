exports.install = function() {
	// COMMON
	F.route('/', 'index');
	F.route('/about', 'about');
	F.route('/portfolio', 'portfolio');
	F.route('/portfolio/portfolio-project', 'portfolio-project');
	F.route('/gallery', 'gallery');
	F.route('/gallery/gallery-item', 'gallery-item');
	F.route('/blog', view_blog, ['*Blog']);
	F.route('#contact', 'contact');
	

	
	// FILES
	F.file('/download/', file_read);
};

// ==========================================================================
// COMMON
// ==========================================================================

// blog
function view_blog() {
	var self = this;
	self.memorize('blog', '1 minute', DEBUG, function() {
		self.query.max = 10;
		self.query.draft = false;
		self.$query(self, self.callback('blog'));
	});
}


// ==========================================================================
// FILES
// ==========================================================================

function file_read(req, res) {

	var id = req.split[1].replace('.' + req.extension, '');

	F.exists(req, res, function(next, filename) {
		DB('files').binary.read(id, function(err, stream, header) {

			if (err) {
				next();
				return res.throw404();
			}

			var writer = require('fs').createWriteStream(filename);

			CLEANUP(writer, function() {
				res.file(filename);
				next();
			});

			stream.pipe(writer);
		});
	});
}