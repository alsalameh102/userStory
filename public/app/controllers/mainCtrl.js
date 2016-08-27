angular.module('mainCtrl',[])

.controller('MainController',function($rootScope,$location,Auth,$route){

	var vm = this;

	vm.loggedIn = Auth.isLoggedIn();

	$rootScope.$on("$routeChangeStart",function(event,next,current){
		// if(next.templateUrl == 'app/views/pages/login.html' && vm.loggedIn){
		// 	event.preventDefault();
		// 	$location.path('/');
		// }

		vm.loggedIn = Auth.isLoggedIn();

		Auth.getUser()
			.then(function(data){
			vm.user = data.data;
		});
	});

	vm.doLogin = function(){

		vm.processing = true;

		vm.error = '';

		Auth.login(vm.loginData.username,vm.loginData.password)
			.success(function(data){

				vm.processing = false;


				Auth.getUser()
					.then(function(data){
						vm.user = data.data;
					});

				

				if(data.success){
					$location.path('/');
				}
					
				else
				{
					vm.error = data.message;
				}
					
			});
	}

	vm.doLogout = function(){
		Auth.logout();
		$route.reload();
		
	}
	
})

