angular
.module('legapp')
.controller('actividadController',function($scope,$rootScope,$http,$session){
	
	$scope.routes = {
		get:{
			actividades:'/rest/ful/adminadd/index.php/actividades',
			actividad  :'/rest/ful/adminadd/index.php/actividad/'
		},
		post:{
			actividad  :'/rest/ful/adminadd/index.php/actividad'
		},
		put:{
			actividad  :'/rest/ful/adminadd/index.php/actividad/'
		},
		delete:{
			actividad  :'/rest/ful/adminadd/index.php/actividad/',
			archivo    :'/rest/ful/adminadd/index.php/actividad/archivo/'
		}
	};

	$scope.modelo = {
		key:'',
		id:'',
		titulo:'',
		actividad:'',
		requisitos:'',
		estado:'',
		fecha:'',
		archivos:[]
	};

	$scope.lista = [];

	// Estructura de control de la presentacion.
	$scope.statusbar = {
		display:false,
		progress:'0'
	};

	$scope.dialogs = {
		autorizarModificar:{
			display:false,
			no:()=>{
				$scope.modelo.key=null;
				$scope.modelo.id=null;
				$scope.displayFalse();
				$scope.forms.actividadListar.display=true;
			},
			si:()=>{
				$scope.displayFalse();
				$http
					.get($scope.routes.get.actividad+$scope.modelo.id)
					.error(()=>{console.log($scope.routes.get.actividad+$scope.modelo.id+' : No Data');})
					.success((json)=>{if(json.result){
						$scope.modelo.tipo=json.rows.tipo;
						$scope.modelo.titulo=json.rows.titulo;
						$scope.modelo.actividad=json.rows.actividad;
						$scope.modelo.requisitos=json.rows.requisitos;
						$scope.modelo.estado=json.rows.estado;
						$scope.modelo.fecha=json.rows.fecha;
						$scope.modelo.archivos=json.rows.archivos;
						$scope.forms.actividadModificar.display=true;
					}});
			}
		},
		autorizarActivar:{
			display:false,
			no:()=>{
				$scope.displayFalse();
				$scope.forms.actividadListar.display=true;
			},
			si:()=>{
				$scope.displayFalse();
				uri = $scope.routes.put.actividad+$scope.modelo.id+'/activar';
				$http
					.put(uri,{estado:$scope.lista[$scope.modelo.key].estado})
					.error(()=>{console.log(uri+' : No Data');})
					.success((json)=>{if(json.result){
						$scope.lista[$scope.modelo.key].estado=json.rows;
						$scope.modelo.key=null;
						$scope.modelo.id=null;
					}});
				$scope.forms.actividadListar.display=true;
			}
		},
		autorizarEliminar:{
			display:false,
			no:()=>{
				$scope.displayFalse();
				$scope.forms.actividadListar.display=true;
			},
			si:()=>{
				$scope.displayFalse();
				uri = $scope.routes.delete.actividad+$scope.modelo.id;
				$http
					.delete(uri)
					.error(()=>{console.log(uri+' : No Data')})
					.success((json)=>{if(json.result){
						$scope.lista.splice($scope.modelo.key,1);
						$scope.modelo.key=null;
						$scope.modelo.id=null;
						$scope.forms.actividadListar.display=true;
					}});
			}
		},
		autorizarSubirArchivo:{
			display:false,
			input:null,
			tmp:[],
			no:()=>{
				$scope.dialogs.autorizarSubirArchivo.tmp.splice(0);
				if($scope.dialogs.autorizarSubirArchivo.input) $scope.dialogs.autorizarSubirArchivo.input.value='';
				$scope.dialogs.autorizarSubirArchivo.display=false;
			},
			si:()=>{
				if($scope.dialogs.autorizarSubirArchivo.tmp.length){
					for(i in $scope.dialogs.autorizarSubirArchivo.tmp){
						$scope.modelo.archivos.unshift($scope.dialogs.autorizarSubirArchivo.tmp[i]);
					}
					$scope.dialogs.autorizarSubirArchivo.input.value='';
					$scope.dialogs.autorizarSubirArchivo.tmp.splice(0);
				}
				$scope.dialogs.autorizarSubirArchivo.display=false;
			},
			onchange:(input)=>{
				$scope.dialogs.autorizarSubirArchivo.input = input;
				for(i in input.files){
					if(input.files[i].type.toString().substring(0,5)==='image'){
						reader = new FileReader();
						reader.onload = (img)=>{
							imgstr = img.target.result.toString(); 
							x = imgstr.indexOf(';');
							tipo = imgstr.substring(5,x);
							archivo = {
								id:null,
								archivo:imgstr,
								tipo:tipo,
								resource:'local'
							};
							$scope.dialogs.autorizarSubirArchivo.tmp.push(archivo);
						};
						reader.readAsDataURL(input.files[i]);
					}
				}
			},
		},
		autorizarEliminarArchivo:{
			key:null,
			display:false,
			no:()=>{
				$scope.dialogs.autorizarEliminarArchivo.display=false;
			},
			si:()=>{
				key = $scope.dialogs.autorizarEliminarArchivo.key;
				if($scope.modelo.archivos[key].resource==='local'){
					$scope.modelo.archivos.splice(key,1);
				}
				if($scope.modelo.archivos[key].resource==='remote'){
					id = $scope.modelo.archivos[key].id;
					$http
						.delete($scope.routes.delete.archivo+id)
						.error(()=>{console.log($scope.routes.delete.archivo+id+' : No Data');})
						.success((json)=>{if(json.result) $scope.modelo.archivos.splice(key,1); });
				}
				$scope.dialogs.autorizarEliminarArchivo.display=false;
			}
		}
	};

	$scope.forms  = {
		actividadNuevo:{
			display:false,
			cancelar:()=>{
				$scope.modelo.key=null;
				$scope.modelo.id=null;
				$scope.displayFalse();
				$scope.forms.actividadListar.display=true;
			},
			aceptar:()=>{
				$scope.displayFalse();
				$session.autorize(()=>{
					$http
						.post($scope.routes.post.actividad,$scope.modelo)
						.error(()=>{console.log($scope.routes.post.actividad+' : No Data');})
						.success((json)=>{if(json.result){
							$scope.lista.unshift({
								id:json.rows.id,
								titulo:json.rows.titulo,
								fecha:json.rows.fecha,
								requisitos:json.rows.requisitos,
								estado:json.rows.estado
							});
						}});
				});
				$scope.forms.actividadListar.display=true;
			},
			subirArchivos:()=>{
				$scope.dialogs.autorizarSubirArchivo.display=true;
			},
			eliminarArchivos:(key)=>{
				$scope.dialogs.autorizarEliminarArchivo.key=key;
				$scope.dialogs.autorizarEliminarArchivo.display=true;
			}
		},
		actividadModificar:{
			display:false,
			cancelar:()=>{
				$scope.modelo.id=null;
				$scope.displayFalse();
				$scope.forms.actividadListar.display=true;
			},
			aceptar:()=>{
				$scope.displayFalse();
				uri = $scope.routes.put.actividad+$scope.modelo.id;
				tmp = [];
				for(i in $scope.modelo.archivos) if($scope.modelo.archivos[i].resource=='local') tmp.push($scope.modelo.archivos[i]);
				$scope.modelo.archivos = tmp;
				$http
					.put(uri,$scope.modelo)
					.error(()=>{console.log(uri+' : No Data');})
					.success((json)=>{if(json.result){
						$scope.lista.splice($scope.modelo.key,1);
						$scope.lista.unshift({
							id:json.rows.id,
							titulo:json.rows.titulo,
							fecha:json.rows.fecha,
							requisitos:json.rows.requisitos,
							estado:json.rows.estado
						});
						$scope.forms.actividadListar.display=true;
					}});
			},
			subirArchivos:()=>{
				$scope.dialogs.autorizarSubirArchivo.display=true;
			},
			eliminarArchivos:(key)=>{
				$scope.dialogs.autorizarEliminarArchivo.key=key;
				$scope.dialogs.autorizarEliminarArchivo.display=true;
			}
		},
		actividadVisualizar:{
			display:false,
			aceptar:()=>{
				$scope.displayFalse();
				$scope.forms.actividadListar.display=true;
			},
		
		},
		actividadListar:{
			display:false,
			nuevaActividad:()=>{
				d = new Date();
				$scope.displayFalse();
				$scope.modelo.id='';
				$scope.modelo.titulo='';
				$scope.modelo.actividad='';
				$scope.modelo.requisitos='';
				$scope.modelo.estado='INACTIVO';
				$scope.modelo.fecha='';
				$scope.modelo.fecha += d.getFullYear().toString()+'-';
				$scope.modelo.fecha += (d.getMonth() +1).toString()+'-';
				$scope.modelo.fecha += d.getDate().toString()+' ';
				$scope.modelo.fecha += d.getHours().toString()+':';
				$scope.modelo.fecha += d.getMinutes().toString()+':';
				$scope.modelo.fecha += d.getSeconds().toString();
				$scope.modelo.archivos=[];
				$scope.forms.actividadNuevo.display=true;
			},
			visualizarActividad:(k)=>{
				id = $scope.lista[k].id;
				$scope.displayFalse();
				$http
					.get($scope.routes.get.actividad+id)
					.error(()=>{console.log($scope.routes.get.actividad+id+' : No Data');})
					.success((json)=>{if(json.result){
						$scope.modelo.id=json.rows.id;
						$scope.modelo.tipo=json.rows.tipo;
						$scope.modelo.titulo=json.rows.titulo;
						$scope.modelo.actividad=json.rows.actividad;
						$scope.modelo.requisitos=json.rows.requisitos;
						$scope.modelo.estado=json.rows.estado;
						$scope.modelo.fecha=json.rows.fecha;
						$scope.modelo.archivos=json.rows.archivos;
						$scope.forms.actividadVisualizar.display=true;
					}});
			},
			modificarActividad:(k)=>{
				$scope.modelo.key=k;
				$scope.modelo.id=$scope.lista[k].id;
				$scope.displayFalse();
				$scope.dialogs.autorizarModificar.display=true;
			},
			activarActividad:(k)=>{
				$scope.modelo.key=k;
				$scope.modelo.id=$scope.lista[k].id
				$scope.displayFalse();
				$scope.dialogs.autorizarActivar.display=true;
			},
			eliminarActividad:(k)=>{
				$scope.modelo.key=k;
				$scope.modelo.id=$scope.lista[k].id
				$scope.displayFalse();
				$scope.dialogs.autorizarEliminar.display=true;
			}
		},
	};

	$scope.displayFalse = ()=>{
		$scope.statusbar.display=false;
		$scope.dialogs.autorizarModificar.display=false;
		$scope.dialogs.autorizarActivar.display=false;
		$scope.dialogs.autorizarEliminar.display=false;
		$scope.dialogs.autorizarSubirArchivo.display=false,
		$scope.dialogs.autorizarEliminarArchivo.display=false;
		$scope.forms.actividadNuevo.display=false;
		$scope.forms.actividadModificar.display=false;
		$scope.forms.actividadVisualizar.display=false;
		$scope.forms.actividadListar.display=false;
	};

	$scope.init = ()=>{
		data = $session.get('user');
		$scope.user = JSON.parse(data);
		$rootScope.usuario = $scope.user.usuario;
		$rootScope.stage=true;
		$scope.displayFalse();
		uri = $scope.routes.get.actividades;
		$http
			.get(uri)
			.error(()=>{console.log(uri+' : No Data');})
			.success((json)=>{if(json.result){
				for(i in json.rows){
					$scope.lista.push({
						id:json.rows[i].id,
						titulo:json.rows[i].titulo,
						fecha:json.rows[i].fecha,
						requisitos:json.rows[i].requisitos,
						estado:json.rows[i].estado
					});
				}
				$scope.forms.actividadListar.display=true;
			}});
	};

	$session.autorize(()=>{
		$scope.init();
	});	

});