angular.module('storyCtrl',['storyService'])

	.controller('StoryControllerbla',function(Story,socketio){

		var vm = this;
		Story.all()
			.success(function(data){
				vm.stories = data;
			});

		vm.createStory = function() {
			vm.processing = true;

			vm.message = "";
			Story.createStory(vm.storyData)
				.success(function(data){

					vm.processing = false;

					vm.storyData = {};

					vm.message = data.message;

						
				});
				socketio.on('story',function(data){
					vm.stories.push(data);

				});
		};
		

	
	})

	.controller("AllStoriesController" , function(stories,socketio){

		var vm = this;

		vm.stories = stories.data;

		socketio.on('story',function(data){
			vm.stories.push(data);

		});
	});