var scene : GameObject[];
var Time: _Time;
var Input: _Input;

var superCollider: THREE.Mesh;

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

    var geometries: THREE.BufferGeometry[] = [];
    for (let i = 0; i < scene.length; i++) {
        var mesh = <THREE.Mesh>scene[i].Object3D;
        if(scene[i].Object3D == null
        || (scene[i].Object3D instanceof THREE.Mesh) == false
        || scene[i].Name == "Ball"
        )
            continue;
        var cloned = mesh.geometry.clone();
        //cloned.applyMatrix(mesh.matrixWorld);
        /*for ( const key in cloned.attributes ) {
            if ( key !== 'position' ) {
                cloned.deleteAttribute( key );
            }
        }*/
        geometries.push(cloned);
    }
    const mergedGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
    mergedGeometry.boundsTree = new MeshBVHLib.MeshBVH( mergedGeometry );
    var collider = new THREE.Mesh( mergedGeometry );
    collider.material.wireframe = true;
    collider.material.opacity = 0.5;
    collider.material.transparent = true;
    superCollider = collider;

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

        requestAnimationFrame(animate);
        renderer.render(three_scene, camera);
        Input.OnFrameEnd();
    };
    animate();
});