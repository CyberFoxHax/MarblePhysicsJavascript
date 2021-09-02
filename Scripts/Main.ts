var scene : GameObject[];
var Time: _Time;
var Input: _Input;

var superCollider: THREE.Mesh;
var textures: Record<string, HTMLImageElement> = {}; 

document.addEventListener("DOMContentLoaded", function(){
    const three_scene = new THREE.Scene();
    var camera: THREE.PerspectiveCamera = null;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

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
    time.Init();
    Time = time;

    var physicsObjects: MonoBehaviour[];
    time.PhysicsStart = function(){
        physicsObjects = components.filter(p=>p.FixedUpdate != null);
    }
    time.PhysicsStep = function(){
        for (let i = 0; i < physicsObjects.length; i++) {
            physicsObjects[i].FixedUpdate();
        }
    }

    var wrapper = document.getElementById("textures");
    var texes = wrapper.children;
    for (let i = 0; i < texes.length; i++) {
        var tex = <HTMLImageElement>texes[i];
        var relativePath = tex.src.replace(location.href.replace("main.html",""), "");
        textures[relativePath] = tex;
        tex.parentElement.removeChild(tex);
    }
    wrapper.parentElement.removeChild(wrapper);

    var tex2 = new THREE.Texture(textures["base.marble.jpg"]);
    tex2.needsUpdate = true;


    const geometry = new THREE.SphereGeometry(0.2, 64, 64);
    const material = new THREE.MeshLambertMaterial({ color: 0x999999, map: tex2});
    const sphere = new THREE.Mesh(geometry, material);
    three_scene.add(sphere);

    // Setup our world
    var world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // m/s²

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
    world.addBody(groundBody);



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
        components.forEach(p=>{
            if(p.LateUpdate != null)
                p.LateUpdate();
        });

        world.step(0.016, Time.deltaTime, 1);
        sphere.position.x = sphereBody.position.x;
        sphere.position.y = sphereBody.position.y;
        sphere.position.z = sphereBody.position.z;
        sphere.quaternion.x = sphereBody.quaternion.x;
        sphere.quaternion.y = sphereBody.quaternion.y;
        sphere.quaternion.z = sphereBody.quaternion.z;
        sphere.quaternion.w = sphereBody.quaternion.w;

        requestAnimationFrame(animate);
        renderer.render(three_scene, camera);
        Input.OnFrameEnd();
    };
    animate();
});