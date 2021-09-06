var scene : GameObject[];
var Time: _Time;
var Input: _Input;

var superCollider: THREE.Mesh;
var textures: Record<string, THREE.Texture> = {};
var cannon_world: CANNON.World;

var debugOut:HTMLElement;

window.onload = (async function(){
    debugOut = document.getElementById("debug");

    var wrapper = document.getElementById("textures");
    var texes = Array.from(wrapper.children);
    for (let i = 0; i < texes.length; i++) {
        var img = <HTMLImageElement>texes[i];
        img.parentElement.removeChild(img);
        /*await new Promise(function(accept, reject){
            img.onload = function(){
                accept(null);
            };
        });*/
        var rootAbsPath = location.href.replace("main.html","");
        var relativePath = img.src.replace(rootAbsPath, "");
        var texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        textures[relativePath] = texture;
    }
    wrapper.parentElement.removeChild(wrapper);


    const three_scene = new THREE.Scene();
    var camera: THREE.PerspectiveCamera = null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById("renderer").appendChild(renderer.domElement);
    renderer.domElement.onclick = function(){
        renderer.domElement.requestPointerLock();
    };

    Input = new _Input();
    Input.Init(renderer.domElement);

    scene = CreateScene();
    for (let i = 0; i < scene.length; i++) {
        if(scene[i].Object3D == null)
            continue;
        three_scene.add(scene[i].Object3D);
        if(scene[i].Object3D instanceof THREE.PerspectiveCamera)
            camera = <THREE.PerspectiveCamera>scene[i].Object3D;
    }

    var components : MonoBehaviour[];
    function CreateComponentCache(){
        components = [];
        for (let i = 0; i < scene.length; i++) {
            scene[i].scene = scene;
            for (let ii = 0; ii < scene[i].Components.length; ii++) {
                scene[i].Components[ii].gameObject = scene[i];
                components.push(scene[i].Components[ii]);
            }
        }
    }

    var time = new _Time();
    Time = time;

    var physicsObjects: MonoBehaviour[];
    time.OnPhysicsStart = function(){
        physicsObjects = components.filter(p=>p.FixedUpdate != null);
    }
    time.OnPhysicsStep = function(){
        cannon_world.step(Time.fixedDeltaTime, Time.fixedDeltaTime, 0);
        for (let i = 0; i < physicsObjects.length; i++) {
            physicsObjects[i].FixedUpdate();
        }
    }

    // Setup our world
    cannon_world = new CANNON.World();
    cannon_world.gravity.set(0, -9.82, 0); // m/s²

    /*var tex2 = new THREE.Texture(textures["base.marble.jpg"]);
    tex2.needsUpdate = true;

    const geometry = new THREE.SphereGeometry(0.2, 64, 64);
    const material = new THREE.MeshLambertMaterial({ color: 0x999999, map: tex2});
    const sphere = new THREE.Mesh(geometry, material);
    three_scene.add(sphere);


    // Create a sphere
    var radius = 0.2; // m
    var sphereBody = new CANNON.Body({
        mass: 0.2, // kg
        position: new CANNON.Vec3(0, 10, 0), // m
        shape: new CANNON.Sphere(radius),
        velocity: new CANNON.Vec3(0,0,0.5)
    });    
    world.addBody(sphereBody);

    // Create a plane
    var groundBody = new CANNON.Body({
        mass: 0, // mass == 0 makes the body static
        position: new CANNON.Vec3(0,-.5,0),
        quaternion: new CANNON.Quaternion().setFromEuler(-Math.PI/2,0,0)
    });
    var groundShape = new CANNON.Plane();
    groundBody.addShape(groundShape);
    cannon_world.addBody(groundBody);*/

    time.Init();
    function animate() {
        CreateComponentCache();
        components.forEach(p=>{
            if(p.Start != null && p._started == false){
                p._started = true;
                p.Start();
            }
        });
        time.OnFrame();
        components.forEach(p=>{
            if(p.Update != null)
                p.Update();
        });

        /*world.step(0.016, Time.deltaTime, 1);
        sphere.position.x = sphereBody.position.x;
        sphere.position.y = sphereBody.position.y;
        sphere.position.z = sphereBody.position.z;
        sphere.quaternion.x = sphereBody.quaternion.x;
        sphere.quaternion.y = sphereBody.quaternion.y;
        sphere.quaternion.z = sphereBody.quaternion.z;
        sphere.quaternion.w = sphereBody.quaternion.w;*/

        requestAnimationFrame(animate);
        renderer.render(three_scene, camera);
        components.forEach(p=>{
            if(p.LateUpdate != null)
                p.LateUpdate();
        });
        Input.OnFrameEnd();
    };
    requestAnimationFrame(animate);
});