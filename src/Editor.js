import * as THREE from 'three';

import { Config } from './Config.js';
import { Loader } from './Loader.js';
import { History as _History } from './History.js';
import { Strings } from './Strings.js';
import { Storage as _Storage } from './Storage.js';
import { Selector } from './Selector.js';
import { Signal } from './libs/signals.min.js';
import { diffString, diff } from 'json-diff';
import { splitPath } from './utils/fs.js';
import { createMesh, setProps as setMeshProps, updataUI as updataMeshUI } from './components/Mesh.js';
import { SidebarSettingsShortcuts } from './Shortcuts';
import { createPointLight, setProps as setPointLightProps, updataUI as updataPointLightUI } from './components/PointLight.js';
import { createAmbientLight, setProps as setAmbientLightProps, updataUI as updataAmbientLightUI } from './components/AmbientLight.js';
import { createDirectionalLight, setProps as setDirectionalLightProps, updataUI as updataDirectionalLightUI } from './components/DirectionalLight.js';
import { createModel, updataUI as updataModelUI } from './components/Model.js';
import { createCamera, setProps as setCameraProps, updataUI as updataCameraUI } from './components/Camera.js';
import methodsApi from './methodsApi/index';
import { CSS3DRenderer, CSS3DSprite } from './jsm/renderers/CSS3DRenderer.js';
import { pxToWorld, getObjectWorldHeight } from './utils/index.js';
import { Sky } from './jsm/objects/Sky.js';
import { GroundedSkybox } from './jsm/objects/GroundedSkybox.js';
import { HDRLoader } from './jsm/loaders/HDRLoader.js';
import { EquirectangularReflectionMapping } from 'three';

var _DEFAULT_CAMERA = new THREE.PerspectiveCamera(50, 1, 0.01, 5000);
_DEFAULT_CAMERA.name = 'Camera';
_DEFAULT_CAMERA.position.set(0, 5, 10);
_DEFAULT_CAMERA.lookAt(new THREE.Vector3());


function Editor(options) {

	this.options = options || {};
	
	this.signals = {

		// script

		editScript: new Signal(),

		// player

		startPlayer: new Signal(),
		stopPlayer: new Signal(),

		// xr

		enterXR: new Signal(),
		offerXR: new Signal(),
		leaveXR: new Signal(),

		// notifications

		editorCleared: new Signal(),

		savingStarted: new Signal(),
		savingFinished: new Signal(),

		transformModeChanged: new Signal(),
		snapChanged: new Signal(),
		spaceChanged: new Signal(),
		rendererCreated: new Signal(),
		rendererUpdated: new Signal(),
		rendererDetectKTX2Support: new Signal(),

		sceneBackgroundChanged: new Signal(),
		sceneEnvironmentChanged: new Signal(),
		sceneFogChanged: new Signal(),
		sceneFogSettingsChanged: new Signal(),
		sceneGraphChanged: new Signal(),
		sceneRendered: new Signal(),

		cameraChanged: new Signal(),
		cameraResetted: new Signal(),

		geometryChanged: new Signal(),

		objectSelected: new Signal(),
		objectFocused: new Signal(),

		objectAdded: new Signal(),
		objectChanged: new Signal(),
		objectRemoved: new Signal(),

		cameraAdded: new Signal(),
		cameraRemoved: new Signal(),

		helperAdded: new Signal(),
		helperRemoved: new Signal(),

		materialAdded: new Signal(),
		materialChanged: new Signal(),
		materialRemoved: new Signal(),

		scriptAdded: new Signal(),
		scriptChanged: new Signal(),
		scriptRemoved: new Signal(),

		windowResize: new Signal(),

		showHelpersChanged: new Signal(),
		refreshSidebarObject3D: new Signal(),
		refreshSidebarEnvironment: new Signal(),
		historyChanged: new Signal(),

		viewportCameraChanged: new Signal(),
		viewportShadingChanged: new Signal(),

		intersectionsDetected: new Signal(),

		pathTracerUpdated: new Signal(),

		updataSchema: new Signal(),

		// loading

		loadingProgressChanged: new Signal(),

	};
	this.data = {};
	this.oloData = {};
	this.controlsCenter = null;
	this.renderer = null;
	this.cssRenderer = null;
	this.config = new Config();
	this.history = new _History(this);
	this.selector = new Selector(this);
	this.storage = new _Storage();
	this.strings = new Strings(this.config);

	this.loader = new Loader(this);

	this.camera = _DEFAULT_CAMERA.clone();

	this.scene = new THREE.Scene();
	console.log('this.scene', this)
	this.scene.name = 'Scene';

	this.sceneHelpers = new THREE.Scene();
	this.sceneHelpers.add(new THREE.HemisphereLight(0xffffff, 0x888888, 2));

	this.object = {};
	this.geometries = {};
	this.materials = {};
	this.textures = {};
	this.scripts = {};

	this.materialsRefCounter = new Map(); // tracks how often is a material used by a 3D object

	this.mixer = new THREE.AnimationMixer(this.scene);

	this.selected = null;
	this.helpers = {};

	this.cameras = {};

	this.viewportCamera = this.camera;
	this.viewportShading = 'default';

	this.addCamera(this.camera);
	this.addEvent();
	this.addThreePrototype();
	if (this.options.callback) {
		this.options.callback(this);
	}
	this.signals.cameraAdded.dispatch(this.camera);
	setTimeout(() => {
		new SidebarSettingsShortcuts(this);
	}, 3000)
}

Editor.prototype = {
	addSkyToScene: function (hdrPath, options = {}) {
		if (!hdrPath) {
			console.warn('请提供 HDR 文件路径');
			return;
		}
		
		const height = options.height || 50;
		const radius = options.radius || 100;
		this.skyOptions = {
			height,
			radius,
		};
		const loader = new HDRLoader();
		loader.load(
			hdrPath,  // 由使用者提供可访问的路径
			(texture) => {
				texture.mapping = EquirectangularReflectionMapping;
				const skybox = new GroundedSkybox(texture, height, radius);
				skybox.position.y = height;
				skybox.name = 'Sky';
				this.sky = skybox;
				this.scene.add(skybox);
				this.scene.environment = texture;
				this.scene.background = texture;  
				// this.scene.environmentIntensity = 0.1;
  // 背景天空
				this.signals.sceneGraphChanged.dispatch(this.scene);

			},
			undefined,
			(error) => {
				console.error('加载 HDR 失败:', error);
			}
		);
	},
	removeSkyFromScene: function () {
		this.scene.remove(this.scene.getObjectByProperty('name', 'Sky'));
		this.scene.environment = null;
		this.signals.sceneGraphChanged.dispatch(this.scene);
	},
	addThreePrototype: function () {
		const markFactory = this.options.markFactory || function () {};
		THREE.Object3D.prototype.addMarker = function (editor, targetUUID, type, data) {
			if (this.hasMarker){
				return true;
			}
			const mark = markFactory(editor, targetUUID, type, data);
			if (!mark?.container) return false;
			const sprite = new CSS3DSprite(mark?.container, { pointerEvents: 'none' });
			const height = getObjectWorldHeight(this);
			sprite.position.set(0, height, 0);
			sprite.scale.set(0.01, 0.01, 0.01);
			this.add(sprite);
			this.marker = sprite;
			this.hasMarker = true;
			this.__removeMark__ = mark?.remove || function () {};
			return true;
		}
		THREE.Object3D.prototype.removeMarker = function () {
			if (!this.hasMarker) return true;
			// 删除这个div
			if (this.__removeMark__) {
				this.__removeMark__();
			}
			this.marker.element.remove();
			this.remove(this.marker);
			this.hasMarker = false;
			return true;
		}
	},
	addEvent: function () {
		this.signals.objectChanged.add((object) => {
			const type = object.type;
			const uuid = object.uuid;
			let res;
			if (/^Model_/.test(uuid)) {
				this.signals.updataSchema.dispatch({
					uuid: object.uuid,
					props: updataModelUI(object),
				});
				return;
			}
			
			switch (type) {
				case 'Mesh':
					res = updataMeshUI(object);
					this.signals.updataSchema.dispatch({
						uuid: object.uuid,
						props: res,
					});
					break;
				case 'PointLight':
					res = updataPointLightUI(object);
					this.signals.updataSchema.dispatch({
						uuid: object.uuid,
						props: res,
					});
					break;
				case 'AmbientLight':
					res = updataAmbientLightUI(object);
					this.signals.updataSchema.dispatch({
						uuid: object.uuid,
						props: res,
					});
					break;
				case 'DirectionalLight':
					res = updataDirectionalLightUI(object);
					this.signals.updataSchema.dispatch({
						uuid: object.uuid,
						props: res,
					});
					break;
				case 'Camera':
					res = updataCameraUI(object);
					this.signals.updataSchema.dispatch({
						uuid: object.uuid,
						props: res,
					});
					break;
				default:
					break;
			}
		});
	},
	setScene: function (scene) {

		this.scene.uuid = scene.uuid;
		this.scene.name = scene.name;

		this.scene.background = scene.background;
		this.scene.environment = scene.environment;
		this.scene.fog = scene.fog;
		this.scene.backgroundBlurriness = scene.backgroundBlurriness;
		this.scene.backgroundIntensity = scene.backgroundIntensity;

		this.scene.userData = JSON.parse(JSON.stringify(scene.userData));

		http://www.baidu.com/index.php?tn=site888_pg// avoid render per object

		this.signals.sceneGraphChanged.active = false;

		while (scene.children.length > 0) {

			this.addObject(scene.children[0]);

		}

		this.signals.sceneGraphChanged.active = true;
		this.signals.sceneGraphChanged.dispatch(this.scene);

	},

	//

	addObject: function (object, parent, index) {

		var scope = this;

		object.traverse(function (child) {

			if (child.geometry !== undefined) scope.addGeometry(child.geometry);
			if (child.material !== undefined) scope.addMaterial(child.material);

			scope.addCamera(child);
			scope.addHelper(child);

		});

		if (parent === undefined) {

			this.scene.add(object);

		} else {

			parent.children.splice(index, 0, object);
			object.parent = parent;

		}

		this.signals.objectAdded.dispatch(object);
		this.signals.sceneGraphChanged.dispatch(this.scene);

	},

	nameObject: function (object, name) {

		object.name = name;
		this.signals.sceneGraphChanged.dispatch(this.scene);

	},

	removeObject: function (object) {

		if (object.parent === null) return; // avoid deleting the camera or scene

		var scope = this;

		object.traverse(function (child) {

			scope.removeCamera(child);
			scope.removeHelper(child);

			if (child.material !== undefined) scope.removeMaterial(child.material);

		});

		object.parent.remove(object);

		this.signals.objectRemoved.dispatch(object);
		this.signals.sceneGraphChanged.dispatch(this.scene);

	},

	addGeometry: function (geometry) {

		this.geometries[geometry.uuid] = geometry;

	},

	setGeometryName: function (geometry, name) {

		geometry.name = name;
		this.signals.sceneGraphChanged.dispatch(this.scene);

	},

	addMaterial: function (material) {

		if (Array.isArray(material)) {

			for (var i = 0, l = material.length; i < l; i++) {

				this.addMaterialToRefCounter(material[i]);

			}

		} else {

			this.addMaterialToRefCounter(material);

		}

		this.signals.materialAdded.dispatch();

	},

	addMaterialToRefCounter: function (material) {

		var materialsRefCounter = this.materialsRefCounter;

		var count = materialsRefCounter.get(material);

		if (count === undefined) {

			materialsRefCounter.set(material, 1);
			this.materials[material.uuid] = material;

		} else {

			count++;
			materialsRefCounter.set(material, count);

		}

	},

	removeMaterial: function (material) {

		if (Array.isArray(material)) {

			for (var i = 0, l = material.length; i < l; i++) {

				this.removeMaterialFromRefCounter(material[i]);

			}

		} else {

			this.removeMaterialFromRefCounter(material);

		}

		this.signals.materialRemoved.dispatch();

	},

	removeMaterialFromRefCounter: function (material) {

		var materialsRefCounter = this.materialsRefCounter;

		var count = materialsRefCounter.get(material);
		count--;

		if (count === 0) {

			materialsRefCounter.delete(material);
			delete this.materials[material.uuid];

		} else {

			materialsRefCounter.set(material, count);

		}

	},

	getMaterialById: function (id) {

		var material;
		var materials = Object.values(this.materials);

		for (var i = 0; i < materials.length; i++) {

			if (materials[i].id === id) {

				material = materials[i];
				break;

			}

		}

		return material;

	},

	setMaterialName: function (material, name) {

		material.name = name;
		this.signals.sceneGraphChanged.dispatch(this.scene);

	},

	addTexture: function (texture) {

		this.textures[texture.uuid] = texture;

	},

	//

	addCamera: function (camera) {

		if (camera.isCamera) {

			this.cameras[camera.uuid] = camera;

			this.signals.cameraAdded.dispatch(camera);

		}

	},
	setCamera: function (cameraOptions) {
		const camera = this.camera;
		Object.keys(cameraOptions).forEach((key) => {
			setCameraProps(camera, key, cameraOptions[key], this);
		});
	},
	removeCamera: function (camera) {

		if (this.cameras[camera.uuid] !== undefined) {

			delete this.cameras[camera.uuid];

			this.signals.cameraRemoved.dispatch(camera);

		}

	},

	//

	addHelper: function () {

		var geometry = new THREE.SphereGeometry(2, 4, 2);
		var material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });

		return function (object, helper) {
			if (this.options.isPlayer) return;
			if (helper === undefined) {

				if (object.isCamera) {
					
					helper = new THREE.CameraHelper(object);

				} else if (object.isPointLight) {

					helper = new THREE.PointLightHelper(object, 1);

				} else if (object.isDirectionalLight) {

					helper = new THREE.DirectionalLightHelper(object, 1);

				} else if (object.isSpotLight) {

					helper = new THREE.SpotLightHelper(object);

				} else if (object.isHemisphereLight) {

					helper = new THREE.HemisphereLightHelper(object, 1);

				} else if (object.isSkinnedMesh) {
					helper = new THREE.SkeletonHelper(object.skeleton.bones[0]);

				} else if (object.isBone === true && object.parent && object.parent.isBone !== true) {
					
					helper = new THREE.SkeletonHelper(object);
				} else {

					// no helper for this object type
					return;

				}

				const picker = new THREE.Mesh(geometry, material);
				picker.name = 'picker';
				picker.userData.object = object;
				helper.add(picker);

			}

			this.sceneHelpers.add(helper);
			this.helpers[object.id] = helper;

			this.signals.helperAdded.dispatch(helper);

		};

	}(),

	removeHelper: function (object) {

		if (this.helpers[object.id] !== undefined) {

			var helper = this.helpers[object.id];
			helper.parent.remove(helper);
			helper.dispose();

			delete this.helpers[object.id];

			this.signals.helperRemoved.dispatch(helper);

		}

	},

	//

	addScript: function (object, script) {

		if (this.scripts[object.uuid] === undefined) {

			this.scripts[object.uuid] = [];

		}

		this.scripts[object.uuid].push(script);

		this.signals.scriptAdded.dispatch(script);

	},

	removeScript: function (object, script) {

		if (this.scripts[object.uuid] === undefined) return;

		var index = this.scripts[object.uuid].indexOf(script);

		if (index !== - 1) {

			this.scripts[object.uuid].splice(index, 1);

		}

		this.signals.scriptRemoved.dispatch(script);

	},

	getObjectMaterial: function (object, slot) {

		var material = object.material;

		if (Array.isArray(material) && slot !== undefined) {

			material = material[slot];

		}

		return material;

	},

	setObjectMaterial: function (object, slot, newMaterial) {

		if (Array.isArray(object.material) && slot !== undefined) {

			object.material[slot] = newMaterial;

		} else {

			object.material = newMaterial;

		}

	},

	setViewportCamera: function (uuid) {

		this.viewportCamera = this.cameras[uuid];
		this.signals.viewportCameraChanged.dispatch();

	},

	setViewportShading: function (value) {

		this.viewportShading = value;
		this.signals.viewportShadingChanged.dispatch();

	},

	//

	select: function (object) {

		this.selector.select(object);

	},

	selectById: function (id) {

		if (id === this.camera.id) {

			this.select(this.camera);
			return;

		}

		this.select(this.scene.getObjectById(id));

	},

	selectByUuid: function (uuid) {

		var scope = this;

		this.scene.traverse(function (child) {

			if (child.uuid === uuid) {

				scope.select(child);

			}

		});

	},

	deselect: function () {

		this.selector.deselect();

	},

	focus: function (object) {

		if (object !== undefined) {

			this.signals.objectFocused.dispatch(object);

		}

	},

	focusById: function (id) {

		this.focus(this.scene.getObjectById(id));

	},


	clearObjects: function () {
		this.signals.sceneGraphChanged.active = false;
		while (this.scene.children.length > 0) {
			this.removeObject(this.scene.children[0]);
		}
		this.signals.sceneGraphChanged.active = true;
		this.signals.sceneGraphChanged.dispatch(this.scene);
	},

	clear: function () {

		this.history.clear();
		this.storage.clear();

		this.camera.copy(_DEFAULT_CAMERA);
		this.signals.cameraResetted.dispatch();

		this.scene.name = 'Scene';
		this.scene.userData = {};
		this.scene.background = null;
		this.scene.environment = null;
		this.scene.fog = null;

		var objects = this.scene.children;

		this.signals.sceneGraphChanged.active = false;

		while (objects.length > 0) {

			this.removeObject(objects[0]);

		}

		this.signals.sceneGraphChanged.active = true;

		this.geometries = {};
		this.materials = {};
		this.textures = {};
		this.scripts = {};

		this.materialsRefCounter.clear();

		this.animations = {};
		this.mixer.stopAllAction();

		this.deselect();

		this.signals.editorCleared.dispatch();

	},

	//

	fromJSON: async function (json) {

		var loader = new THREE.ObjectLoader();
		var camera = await loader.parseAsync(json.camera);

		const existingUuid = this.camera.uuid;
		const incomingUuid = camera.uuid;

		// copy all properties, including uuid
		this.camera.copy(camera);
		this.camera.uuid = incomingUuid;

		delete this.cameras[existingUuid]; // remove old entry [existingUuid, this.camera]
		this.cameras[incomingUuid] = this.camera; // add new entry [incomingUuid, this.camera]

		this.signals.cameraResetted.dispatch();

		this.history.fromJSON(json.history);
		this.scripts = json.scripts;

		this.setScene(await loader.parseAsync(json.scene));

		if (json.environment === 'Room' ||
			json.environment === 'ModelViewer' /* DEPRECATED */) {

			this.signals.sceneEnvironmentChanged.dispatch(json.environment);
			this.signals.refreshSidebarEnvironment.dispatch();

		}

	},

	toJSON: function () {

		// scripts clean up

		var scene = this.scene;
		var scripts = this.scripts;

		for (var key in scripts) {

			var script = scripts[key];

			if (script.length === 0 || scene.getObjectByProperty('uuid', key) === undefined) {

				delete scripts[key];

			}

		}

		// honor neutral environment

		let environment = null;

		if (this.scene.environment !== null && this.scene.environment.isRenderTargetTexture === true) {

			environment = 'Room';

		}

		//

		return {

			metadata: {},
			project: {
				shadows: this.config.getKey('project/renderer/shadows'),
				shadowType: this.config.getKey('project/renderer/shadowType'),
				toneMapping: this.config.getKey('project/renderer/toneMapping'),
				toneMappingExposure: this.config.getKey('project/renderer/toneMappingExposure')
			},
			camera: this.viewportCamera.toJSON(),
			scene: this.scene.toJSON(),
			scripts: this.scripts,
			history: this.history.toJSON(),
			environment: environment

		};

	},

	objectByUuid: function (uuid) {

		return this.scene.getObjectByProperty('uuid', uuid, true);

	},

	execute: function (cmd, optionalName) {

		this.history.execute(cmd, optionalName);

	},

	undo: function () {

		this.history.undo();

	},

	redo: function () {

		this.history.redo();

	},

	utils: {

		save: save,
		saveArrayBuffer: saveArrayBuffer,
		saveString: saveString,
		formatNumber: formatNumber

	},

	init: function (options) {
		const width = options.width || window.innerWidth;
		const height = options.height || window.innerHeight;
		console.log(width, height, options);
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(width, height);
		renderer.shadowMap.enabled = true;
 		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.domElement.setAttribute('tabindex', '0');
		renderer.domElement.style.outline = 'none';
		let cssRenderer = null;
		if (this.options.useCSS3D) {
			// 创建独立的 CSS3DRenderer
			cssRenderer = new CSS3DRenderer();
			cssRenderer.setSize(width, height);
			this.cssRenderer = cssRenderer;
		}
		
		this.renderer = renderer;
		this.signals.rendererCreated.dispatch(renderer, cssRenderer);
	},
	destroy: function () {
		this.signals.rendererCreated.removeAll();
		this.signals.rendererUpdated.removeAll();
		this.signals.rendererDetectKTX2Support.removeAll();
		this.signals.sceneGraphChanged.removeAll();
		this.signals.cameraChanged.removeAll();
		this.signals.objectSelected.removeAll();
		this.signals.objectFocused.removeAll();
	},

	/**
	 * 这是一个更新的方法  我需要几个功能
	 * 1 对比我当前data跟我系统存储的旧的data的区别 找到不同
	 * 2 明确当前是新增还是删除还是修改
	 * 3 针对不同的逻辑  实现添加、删除、修改逻辑
	 * options: {
	 * 	// 合并更新
	 * 	mergeUpdate
	 * }
	 * @param {*} data 
	 */
	setData: async function (data, options = {}, callback) {
		const { mergeUpdate = false } = options;
		this.data = data;
		
		// 收集所有需要加载的 Model
		const modelLoadPromises = [];
		this._modelLoadPromises = modelLoadPromises;
		
		// 执行 diff 和添加操作
		this.diffData(this.data, this.oloData, true);
		
		this.oloData = JSON.parse(JSON.stringify(data));
		
		// 等待所有 Model 加载完成
		if (modelLoadPromises.length > 0) {
			try {
				await Promise.all(modelLoadPromises);
			} catch (error) {
				console.error('加载 Model 时出错:', error);
			}
		} else {
			// 如果没有需要加载的 Model，直接通知加载完成
			this.signals.loadingProgressChanged.dispatch({
				total: 0,
				current: 0,
				percent: 100,
				status: 'complete',
				fileName: '',
				fileProgresses: []
			});
		}
		
		// 清理临时数组
		this._modelLoadPromises = null;
		
		if (callback){
			callback();
		}
	},
	diffData: function (data, oldData, isRoot, rootName, rootData) {
		const res = diff(oldData, data, { full: true });

		Object.keys(res).forEach(key => {
			const value = res[key];
			const splitResult = splitPath(key);
			if (isRoot) {
				rootName = key;
				rootData = data;
			}
			// === 检查新增字段 ===
			if (splitResult && isRoot) {
				const { type, name } = splitResult;
				if (type === 'added' && value) {
					this._addByData(name, value);
				}
			} else {
				// === 检查是否是被修改字段 ===
				if (
					value &&
					typeof value === 'object' &&
					Object.prototype.hasOwnProperty.call(value, '__old') &&
					Object.prototype.hasOwnProperty.call(value, '__new')
				) {
					// console.log(
					// 	`字段被修改: ${rootName}.${key}，旧值=${value.__old}，新值=${value.__new}`
					// );

					// 👉 这里可以根据你的业务逻辑进一步处理
					this._updateByField?.(rootName, key, value.__new, value.__old, rootData);
				}
				else if (value && Array.isArray(value)) {
					// console.log('array', value); // 这个暂时不处理
					// this.diffData(value, [], false, rootName, rootData); 
				}
				// 如果是对象但不是__old/__new结构，可以继续递归进入子层
				else if (value && typeof value === 'object') {
					this.diffData(value, {}, false, rootName, rootData); // 可选：递归查找更深层的__old/__new
				}
			}
		});

		return res;
	},
	_updateByField(rootName, key, newVal, oldVal, rootData) {
		const type = rootData[rootName]?.type || '';
		const object = this.objectByUuid(rootName)
		switch (type) {
			case "Mesh":
				setMeshProps(object, key, newVal, this);
				break;	
			case "PointLight":
				setPointLightProps(object, key, newVal, this);
				break;
			case "AmbientLight":
				setAmbientLightProps(object, key, newVal, this);
				break;
			case "DirectionalLight":
				setDirectionalLightProps(object, key, newVal, this);
				break;
			case "Camera":
				setCameraProps(object, key, newVal, this);
				break;
			default:
				break;
		}
	},
	_addByData(name, value) {
		// console.log(name, value);
		const type = value?.type || '';
		let object = null;
		switch (type) {
			case "Mesh":
				object = createMesh(name, value, this);
				this.addObject(object);
				break;
			case "PointLight":
				createPointLight(name, value, this);
				break;
			case "AmbientLight":
				createAmbientLight(name, value, this);
				break;
			case "DirectionalLight":
				createDirectionalLight(name, value, this);
				break;
			case "Model":
				// createModel 是异步的，需要收集 Promise
				const modelPromise = createModel(name, value, this);
				// 如果正在收集 Model 加载 Promise，则添加到数组
				if (this._modelLoadPromises) {
					this._modelLoadPromises.push(modelPromise);
				}
				break;
			case "Camera":
				createCamera(name, value, this);
				break;
			default:
				break;
		}
	},
	async callFun (methodName, targetUUID, type, data) {
		const ingoringMethods = ['addMarker', 'removeMarker'];
		if (ingoringMethods.includes(methodName)) {
			await this.objectByUuid(targetUUID)?.[methodName](this, targetUUID, type, data);
			this.signals.sceneGraphChanged.dispatch(this.scene);
			return;
		}
		const method = methodsApi[methodName];
		if (method) {
			await method(this, targetUUID, type, data);
		}
	}
};

const link = document.createElement('a');

function save(blob, filename) {

	if (link.href) {

		URL.revokeObjectURL(link.href);

	}

	link.href = URL.createObjectURL(blob);
	link.download = filename || 'data.json';
	link.dispatchEvent(new MouseEvent('click'));

}

function saveArrayBuffer(buffer, filename) {

	save(new Blob([buffer], { type: 'application/octet-stream' }), filename);

}

function saveString(text, filename) {

	save(new Blob([text], { type: 'text/plain' }), filename);

}

function formatNumber(number) {

	return new Intl.NumberFormat('en-us', { useGrouping: true }).format(number);

}

export { Editor };
