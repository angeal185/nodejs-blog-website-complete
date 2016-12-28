//knockout declarations

// what's a task? class declaration
function todoTask(task, rawDate, dat){
	var self = this;
	//test for saved data
	if(dat == null){
		self.completion = ko.observable(false);
		self.completeContent = ko.observable("&nbsp;");
	}
	else{
		console.log(dat);
		self.completion = ko.observable(dat.completion);
		self.completeContent = ko.observable(dat.completeContent);
	}
	
	self.task = task;
	// needs to be parsed to be viewed
	self.rawDate = rawDate;
	self.raw = rawDate;
	// parsing the rawDate into a nicer format
	self.date = ko.computed(function(){
		var day = rawDate.getDate();
		var month = rawDate.getMonth()+1;
		var year = rawDate.getFullYear();
		var dateFull = month + '/' + day + '/' + year;
		return dateFull;
	});
	
	//task completion toggle
	self.completeTask = function(){
		if(self.completion() == false){
			self.completion(true);
		//set symbol to show completed. I used the empty symbol
		self.completeContent("&empty;");
	}
	else{
		self.completion(false);
		self.completeContent("&nbsp;");
	}
};
}

// what are we looking at again?
function taskViewModel(){
	var self = this;
	self.tasks = ko.observableArray([]);
	self.saveText = ko.observable('');
	// task array and defaults
	if(typeof(Storage) !== undefined){
		if(localStorage.todoTasks !== undefined){
			var mappedTasks = $.map(JSON.parse(localStorage.todoTasks), function(item){
				var pack = {
					'completion': item.completion,
					'completeContent': item.completeContent
				};
				return new todoTask(item.task, new Date(item.date), pack);
			});
			self.tasks(mappedTasks);
			self.saveText('save');
		}
	}
	// let's count completed tasks
	self.completedTasks = ko.computed(function(){
		var total = 0;
		var i = 0;
		for (i; i < self.tasks().length; i++){
			if(self.tasks()[i].completion() == false){
				total++;	
			}
		}
		
		return total;
	});
	
	
	// Input Data - Observable so that it can be reset
	self.newTask = ko.observable('');
	
	//Let's add some data
	self.addTask = function() {
		self.tasks.push(new todoTask(self.newTask(), new Date()));
		//input reset after submit
		self.newTask('');
	}
	
	//remove task
	self.removeTask = function(){
		self.tasks.remove(this);
	}

	self.saveState = function(){
		if(typeof(Storage) !== "undefined"){
			//local storage support
			var data = $.map(self.tasks(), function(item){
				
				var pack = {
					'task': item.task,
					'date': item.raw.toUTCString(),
					'completion': item.completion(),
					'completeContent': item.completeContent()
				};
				self.saveText('saved');
				$('#saving').fadeOut('400', function(){
					self.saveText('save');
				}).fadeIn('400');
				return pack;
			});
			localStorage.todoTasks = JSON.stringify(data);
			console.log(data);
		}
		else{
			//error
		}
	}
}

// fire it up!
ko.applyBindings(new taskViewModel());

//fade in initial list 