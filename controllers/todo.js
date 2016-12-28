exports.install = function() {
	F.route('#todo', view_todo, ['*Todo']);
	F.route('#detail', view_todo_detail, ['*Todo']);
	F.route('/rss/', rss, ['*Todo']);
};

function view_todo() {
	var self = this;
	self.query.max = 10;
	self.query.draft = false;
	self.$query(self, self.callback('all'));
}



function view_todo_detail(linker) {
	var self = this;


	self.memorize('detail.{0}.{1}'.format(linker), '5 minutes', DEBUG, function() {

		self.query.linker = linker;

		self.$get(self, function(err, response) {

			if (err || !response)
				return self.throw404(err);

			if (!self.robot) {
				NOSQL('todo').counter.hit(response.id);
				MODULE('webcounter').increment('todo');
			}

			response.body = markdown(response.body);
			self.view('detail', response);
		});
	});
}

function rss() {
	var self = this;
	self.query.max = 30;
	self.query.draft = false;
	self.$query(self, function(err, docs) {
		var builder = [];
		for (var i = 0, length = docs.items.length; i < length; i++) {
			var doc = docs.items[i];
			builder.push('<item><title>{0}</title><link>{1}/</link><description>{2}</description><pubDate>{3}</pubDate></item>'.format(doc.name.encode(), self.hostname(self.sitemap_url('detail', doc.linker)), doc.perex.encode(), doc.datecreated));
		}
		self.content('<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>bufferwall</title><link>{0}</link><description>{1}</description>{2}</channel></rss>'.format(self.hostname(), F.config.description, builder.join('')), 'text/xml');
	});
}
