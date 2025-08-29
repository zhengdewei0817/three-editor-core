import * as THREE from 'three';
window.THREE = THREE;
function Player() {
    
    var renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio ); // TODO: Use player.setPixelRatio()

    var loader = new THREE.ObjectLoader();
    var camera, scene;
    
    // 添加动画相关变量
    var mixer = null;
    var clock = new THREE.Clock();
    var animations = {};
    var animationActions = {};

    var events = {};
    var customEvents = Object.create(null);

    var dom = document.createElement( 'div' );
    dom.appendChild( renderer.domElement );

    this.dom = dom;
    this.canvas = renderer.domElement;

    this.width = 500;
    this.height = 500;
    

    this.load = function ( json ) {

        var project = json.project;

        if ( project.shadows !== undefined ) renderer.shadowMap.enabled = project.shadows;
        if ( project.shadowType !== undefined ) renderer.shadowMap.type = project.shadowType;
        if ( project.toneMapping !== undefined ) renderer.toneMapping = project.toneMapping;
        if ( project.toneMappingExposure !== undefined ) renderer.toneMappingExposure = project.toneMappingExposure;

        this.setScene( loader.parse( json.scene ) );
        this.setCamera( loader.parse( json.camera ) );

        // 处理动画
        if ( json?.scene?.animations ) {
            this.loadAnimations( json.scene.animations );
        }

        events = {
            init: [],
            start: [],
            stop: [],
            keydown: [],
            keyup: [],
            pointerdown: [],
            pointerup: [],
            pointermove: [],
            update: [],
            __root__: []
        };

        var scriptWrapParams = 'player,renderer,scene,camera';
        var scriptWrapResultObj = {};

        for ( var eventKey in events ) {

            scriptWrapParams += ',' + eventKey;
            scriptWrapResultObj[ eventKey ] = eventKey;

        }

        var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

        for ( var uuid in json.scripts ) {

            if (uuid === '__root__') {
                var scripts = json.scripts[ uuid ];

                for ( var i = 0; i < scripts.length; i ++ ) {

                    var script = scripts[ i ];
    
                    var functions = ( new Function( scriptWrapParams, script.source ).bind( scene ) )( this, renderer, scene, camera );
    
                    for ( var name in functions ) {
    
                        if ( functions[ name ] === undefined ) continue;
                        if ( events['__root__'][ name ] === undefined ) {
                            events['__root__'][ name ] = [];
                        }
                        events['__root__'][ name ].push( functions[ name ].bind( scene ) );
    
                    }
    
                }

                continue;
            }

            var object = scene.getObjectByProperty( 'uuid', uuid, true );

            if ( object === undefined ) {

                console.warn( 'APP.Player: Script without object.', uuid );
                continue;

            }

            var scripts = json.scripts[ uuid ];

            for ( var i = 0; i < scripts.length; i ++ ) {

                var script = scripts[ i ];

                var functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, renderer, scene, camera );

                for ( var name in functions ) {

                    if ( functions[ name ] === undefined ) continue;

                    if ( events[ name ] === undefined ) {

                        console.warn( 'APP.Player: Event type not supported (', name, ')' );
                        continue;

                    }

                    events[ name ].push( functions[ name ].bind( object ) );

                }

            }

        }

        dispatch( events.init, arguments );

    };

    // 新增：加载动画的方法
    this.loadAnimations = function ( animationsData ) {
        if ( !scene ) return;

        mixer = new THREE.AnimationMixer( scene );
        animations = {};
        animationActions = {};

        for ( let i = 0; i < animationsData.length; i++ ) {
            const animData = animationsData[i];
            const clip = THREE.AnimationClip.parse( animData );
            animations[clip.name] = clip;
            
            // 创建动画动作但不立即播放
            const action = mixer.clipAction( clip );
            animationActions[clip.name] = action;
        }
    };

    // 新增：播放指定动画
    this.playAnimation = function ( animationName, options = {} ) {
        if ( !mixer || !animationActions[animationName] ) {
            console.warn( 'Animation not found:', animationName );
            return;
        }

        const action = animationActions[animationName];
        
        // 停止其他动画（如果需要）
        if ( options.stopOthers !== false ) {
            mixer.stopAllAction();
        }

        // 设置动画属性
        action.reset();
        if ( options.loop !== undefined ) {
            action.setLoop( options.loop );
        }
        if ( options.timeScale !== undefined ) {
            action.setEffectiveTimeScale( options.timeScale );
        }
        if ( options.weight !== undefined ) {
            action.setEffectiveWeight( options.weight );
        }

        action.play();
    };

    // 新增：停止指定动画
    this.stopAnimation = function ( animationName ) {
        if ( !mixer || !animationActions[animationName] ) {
            console.warn( 'Animation not found:', animationName );
            return;
        }

        animationActions[animationName].stop();
    };

    // 新增：停止所有动画
    this.stopAllAnimations = function () {
        if ( mixer ) {
            mixer.stopAllAction();
        }
    };

    // 新增：暂停/恢复动画
    this.pauseAnimation = function ( animationName ) {
        if ( !mixer || !animationActions[animationName] ) {
            console.warn( 'Animation not found:', animationName );
            return;
        }

        animationActions[animationName].paused = true;
    };

    this.resumeAnimation = function ( animationName ) {
        if ( !mixer || !animationActions[animationName] ) {
            console.warn( 'Animation not found:', animationName );
            return;
        }

        animationActions[animationName].paused = false;
    };

    // 新增：获取动画列表
    this.getAnimations = function () {
        return Object.keys( animations );
    };

    // 新增：检查动画是否在播放
    this.isAnimationPlaying = function ( animationName ) {
        if ( !mixer || !animationActions[animationName] ) {
            return false;
        }

        return animationActions[animationName].isRunning();
    };

    // 新增：设置动画时间
    this.setAnimationTime = function ( animationName, time ) {
        if ( !mixer || !animationActions[animationName] ) {
            console.warn( 'Animation not found:', animationName );
            return;
        }

        const action = animationActions[animationName];
        action.time = time;
    };

    this.setCamera = function ( value ) {
        console.log('当前设置了setCamera', value)
        camera = value;
        camera.aspect = this.width / this.height;
        camera.updateProjectionMatrix();

    };

    this.setScene = function ( value ) {

        scene = value;

    };

    this.setPixelRatio = function ( pixelRatio ) {

        renderer.setPixelRatio( pixelRatio );

    };

    this.setSize = function ( width, height ) {

        this.width = width;
        this.height = height;

        if ( camera ) {

            camera.aspect = this.width / this.height;
            camera.updateProjectionMatrix();

        }

        renderer.setSize( width, height );

    };

    function dispatch( array, event ) {

        for ( var i = 0, l = array.length; i < l; i ++ ) {

            array[ i ]( event );

        }

    }

    var time, startTime, prevTime;

    function animate() {

        time = performance.now();

        try {
            // 更新动画混合器
            if ( mixer ) {
                const delta = clock.getDelta();
                mixer.update( delta );
            }

            dispatch( events.update, { time: time - startTime, delta: time - prevTime } );

        } catch ( e ) {

            console.error( ( e.message || e ), ( e.stack || '' ) );

        }

        renderer.render( scene, camera );

        prevTime = time;

    }

    this.play = function () {

        startTime = prevTime = performance.now();

        document.addEventListener( 'keydown', onKeyDown );
        document.addEventListener( 'keyup', onKeyUp );
        document.addEventListener( 'pointerdown', onPointerDown );
        document.addEventListener( 'pointerup', onPointerUp );
        document.addEventListener( 'pointermove', onPointerMove );

        dispatch( events.start, arguments );

        renderer.setAnimationLoop( animate );

    };

    this.stop = function () {

        document.removeEventListener( 'keydown', onKeyDown );
        document.removeEventListener( 'keyup', onKeyUp );
        document.removeEventListener( 'pointerdown', onPointerDown );
        document.removeEventListener( 'pointerup', onPointerUp );
        document.removeEventListener( 'pointermove', onPointerMove );

        dispatch( events.stop, arguments );

        renderer.setAnimationLoop( null );

    };

    this.render = function ( time ) {

        dispatch( events.update, { time: time * 1000, delta: 0 /* TODO */ } );

        renderer.render( scene, camera );

    };

    this.dispose = function () {

        renderer.dispose();

        // 清理动画资源
        if ( mixer ) {
            mixer.stopAllAction();
            mixer = null;
        }
        animations = {};
        animationActions = {};

        camera = undefined;
        scene = undefined;

    };

    //

    function onKeyDown( event ) {

        dispatch( events.keydown, event );

    }

    function onKeyUp( event ) {

        dispatch( events.keyup, event );

    }

    function onPointerDown( event ) {

        dispatch( events.pointerdown, event );

    }

    function onPointerUp( event ) {

        dispatch( events.pointerup, event );

    }

    function onPointerMove( event ) {

        dispatch( events.pointermove, event );

    }

    this.callMethod = function (methodName, ...args) {
        if (Array.isArray(events['__root__'][methodName]) && events['__root__'][methodName].length > 0) {
            dispatch(events['__root__'][methodName], args);
        } else {
            console.error(`Method ${methodName} not found`);
        }
    }

    function dispatchArgs(list, argsArray) {
        for (var i = 0, l = list.length; i < l; i++) {
          try { list[i].apply(undefined, argsArray); }
          catch (e) { console.error(e); }
        }
    }

    this.addEventListener = function (name, callback, options) {
        options = options || {};
        if (!customEvents[name]) customEvents[name] = [];
      
        if (options.once) {
          var wrapped = function () {
            try { callback.apply(undefined, arguments); }
            finally { this.removeEventListener(name, wrapped); }
          }.bind(this);
          customEvents[name].push(wrapped);
          return () => this.removeEventListener(name, wrapped);
        } else {
          customEvents[name].push(callback);
          return () => this.removeEventListener(name, callback);
        }
      };
      
      this.removeEventListener = function (name, callback) {
        var list = customEvents[name];
        if (!Array.isArray(list)) return;
        var i = list.indexOf(callback);
        if (i !== -1) list.splice(i, 1);
      };
      
      // 只触发“自定义事件”的 invoke（与 __root__ 完全无关）
      this.invoke = function (methodName, ...args) {
        var list = customEvents[methodName];
        if (Array.isArray(list) && list.length > 0) {
          dispatchArgs(list, args);
        } else {
          // 可选：保留 silent，或提示
          // console.warn(`No listeners for "${methodName}"`);
        }
      };

}

export { Player };