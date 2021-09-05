function CreateScene():GameObject[]{
    function NewGO(f:(p:GameObject)=>void){
        var go = new GameObject();
        f(go);
        return go;
    }
    var scene = [
        NewGO(go=>{
            go.AddComponent(ApiTest);
        }),
        NewGO(go=>{
            go.AddComponent(OrbitCamera);
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = -10;
            camera.position.y = 1;
            go.Object3D = camera;
        }),
        NewGO(go=>{
            go.Name = "Ball";
            var body = go.AddComponent(Rigidbody);
            body.Mass = 0.2;
            body.IsKinematic = true;
            body.Collider = new CANNON.Sphere(0.2);
            go.AddComponent(Movement);
            //go.AddComponent(BallTest);
            var texture = textures["base.marble.jpg"];
            const geometry = new THREE.SphereGeometry(0.2, 64, 64);
            const material = new THREE.MeshPhysicalMaterial({ map: texture, roughness: 0.1, });
            const sphere = new THREE.Mesh(geometry, material);
            go.Object3D = sphere;
            go.Object3D.position.y = 3; 
            go.Object3D.receiveShadow = true;
            go.Object3D.castShadow = true;
        }),
        NewGO(go=>{
            go.Name = "Box";
            var body = go.AddComponent(Rigidbody);
            var size = new THREE.Vector3(10,10,10);
            body.Collider = new CANNON.Box(new CANNON.Vec3(size.x/2, size.y/2, size.z/2));
            body.Mass = 0;
            const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
            const material = new THREE.MeshPhysicalMaterial({ color: 0x999999, map: textures["DefaultTexture.bmp"], roughness: 0.8  });
            const cube = new THREE.Mesh(geometry, material);
            go.Object3D = cube;
            go.Object3D.receiveShadow = true;
            go.Object3D.castShadow = true;
            go.Object3D.position.set(0, -10, 0);
        }),
        NewGO(go=>{
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(0.2, 0.6, 0.9).multiplyScalar(100);
            light.shadow.mapSize.setScalar( 256 );
            light.shadow.radius = 2;
            light.castShadow = true;
            go.Object3D = light;
        }),
        NewGO(go=>{
	        var light = new THREE.HemisphereLight( 0x99eeff, 0x223344, 0.3 );
            go.Object3D = light;
        })
    ];

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {    
            if(x==5 && y == 5)
                continue;
            scene.push(NewGO(go=>{
                go.Name = "Box";
                var body = go.AddComponent(Rigidbody);
                var size = new THREE.Vector3(10,Math.random()*10, 10);
                body.Collider = new CANNON.Box(new CANNON.Vec3(size.x/2, size.y/2, size.z/2));
                body.Mass = 0;
                const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
                const material = new THREE.MeshPhysicalMaterial({ color: 0x999999, map: textures["DefaultTexture.bmp"], roughness: 0.8  });
                const cube = new THREE.Mesh(geometry, material);
                go.Object3D = cube;
                go.Object3D.receiveShadow = true;
                go.Object3D.castShadow = true;
                go.Object3D.position.set((-10/2+x)*10, -5, (-10/2+y)*10);
            }));
        }   
    }
    
    return scene;
}