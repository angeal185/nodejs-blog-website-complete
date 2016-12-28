NEWSCHEMA('Todo').make(function(schema) {

	schema.define('id', 'UID');
	schema.define('language', 'Lower(2)');
	schema.define('name', 'String(80)', true);
	schema.define('linker', 'String(100)');
	schema.define('picture', 'String');
	schema.define('tags', '[Lower]');
	schema.define('draft', Boolean);
	schema.define('draft_old', Boolean);
	schema.define('body', String);
	schema.define('datecreated', Date);

	NOSQL('todo').view('listing').make(function(filter) {
		filter.fields('id', 'name', 'datecreated', 'linker', 'picture', 'tags', 'draft', 'search');
		filter.sort('datecreated', true);
	});

	schema.setQuery(function(error, controller, callback) {

		var options = controller.query;

		options.page = U.parseInt(options.page) - 1;
		options.max = U.parseInt(options.max, 20);

		if (options.page < 0)
			options.page = 0;

		var take = U.parseInt(options.max);
		var skip = U.parseInt(options.page * options.max);
		var filter = NOSQL('todo').find('listing');

		options.language && filter.where('language', options.language);
		options.search && filter.like('search', options.search.keywords(true, true));

		if (options.tag) {
			var tag = F.global.todotags.findItem('linker', options.tag);
			tag && filter.in('tags', tag.name);
		}

		options.draft === false && filter.in('draft', false);
		options.linker && filter.where('linker', '<>', options.linker);

		filter.take(take);
		filter.skip(skip);

		filter.callback(function(err, docs, count) {

			var data = {};
			data.count = count;
			data.items = docs;
			data.limit = options.max;
			data.pages = Math.ceil(data.count / options.max) || 1;
			data.page = options.page + 1;

			// Returns data
			callback(data);
		});
	});

	// Gets a specific todo
	schema.setGet(function(error, model, controller, callback) {
		var options = controller.query;
		var filter = NOSQL('todo').one();
		options.linker && filter.where('linker', options.linker);
		controller.id && filter.where('id', controller.id);
		filter.callback(callback, 'error-404-todo');
	});

	schema.setRemove(function(error, id, callback) {
		NOSQL('todo').remove().make(function(builder) {
			builder.where('id', id);
			builder.callback(function(err, count) {
				callback(SUCCESS(true));
				setTimeout(refresh, 1000);
			});
		});
	});

	schema.setSave(function(error, model, controller, callback) {

		var newbie = model.id ? false : true;

		if (newbie) {
			model.id = UID();
			model.datecreated = F.datetime;
			model.datecommented = null;
		} else
			model.dateupdated = F.datetime;

		if (!model.draft && model.draft_old) {
			model.datecreated = F.datetime;
			model.linker = F.datetime.format('yyyyMMdd') + '-' + model.name.slug();
		}

		model.search = ((model.name || '') + ' ' + (model.body || '')).keywords(true, true).join(' ').max(1000);
		model.author = controller.user.name || '';


		var fn = function(err, count) {

			// Returns response
			callback(SUCCESS(true));

			if (!count)
				return;

			F.emit('todo.save', model);
			setTimeout(refresh, 1000);

			if (newbie)
				return;

			model.datebackup = new Date();
			NOSQL('todo_backup').insert(model);
		};

		if (newbie)
			return NOSQL('todo').insert(model).callback(fn);

		NOSQL('todo').modify(model).where('id', model.id).callback(fn);

		// Refreshes cache
		F.cache.removeAll(model.linker);
	});
});

// Refreshes internal informations
function refresh() {

	var tags = {};
	var latest = [];


	var prepare = function(doc) {

		doc.tags && doc.tags.forEach(function(name) {

			if (doc.draft) {
				if (tags[name] === undefined)
					tags[name] = 0;
				return;
			}

			if (tags[name] === undefined)
				tags[name] = 1;
			else
				tags[name] += 1;
		});
	};

	NOSQL('todo').find('listing').prepare(prepare).callback(function() {

		var output = [];
		Object.keys(tags).forEach(key => output.push({ name: key, linker: key.slug(), count: tags[key] }));
		output.quicksort('count', true);

		F.global.todotags = output;

		// Refreshes cache
		F.cache.remove('partial-menu');
		F.cache.remove('partial-tags');
		F.cache.remove('partial-latest');
		F.cache.remove('homepage');
	});

	NOSQL('todo').find('listing').make(function(builder) {
		builder.limit(5);
		builder.where('draft', false);
		builder.sort('datecreated', true);
		builder.callback((err, response) => F.global.todolatest = response);
	});
}

F.on('settings', refresh);