function CreateScene():GameObject[]{
    function NewGO(f:(p:GameObject)=>void){
        var go = new GameObject();
        f(go);
        return go;
    }
    return [
        NewGO(go=>{
            go.AddComponent(ApiTest);
        }),
        NewGO(go=>{
            go.AddComponent(OrbitCamera);
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 10;
            go.Object3D = camera;
        }),
        NewGO(go=>{
            go.Name = "Ball";
            var body = go.AddComponent(Rigidbody);
            body.Collider = new CANNON.Sphere(0.2);
            body.Mass = 0.2;
            //go.AddComponent(Movement);
            go.AddComponent(BallTest);
            var tex2 = new THREE.Texture(textures["base.marble.jpg"]);
            tex2.needsUpdate = true;
            const geometry = new THREE.SphereGeometry(0.2, 64, 64);
            const material = new THREE.MeshLambertMaterial({ color: 0x999999, map: tex2});
            const sphere = new THREE.Mesh(geometry, material);
            go.Object3D = sphere;
            go.Object3D.receiveShadow = true;
            go.Object3D.castShadow = true;
        }),
        NewGO(go=>{
            go.Name = "Box";
            var body = go.AddComponent(Rigidbody);
            body.Collider = new CANNON.Box(new CANNON.Vec3(1,1,1));
            body.Mass = 0;
            const geometry = new THREE.BoxGeometry(1,1,1);
            const material = new THREE.MeshLambertMaterial({ color: 0x999999 });
            const cube = new THREE.Mesh(geometry, material);
            go.Object3D = cube;
            go.Object3D.receiveShadow = true;
            go.Object3D.castShadow = true;
            go.Object3D.position.set(4, 0, 0);
        }),
        NewGO(go=>{
            go.Name = "Plane";
            var body = go.AddComponent(Rigidbody);
            body.Collider = new CANNON.Box(new CANNON.Vec3(5,5,0.01));
            body.Mass = 0;
            const geometry = new THREE.PlaneGeometry(1,1,1);
            const material = new THREE.MeshLambertMaterial({ color: 0x999999 });
            const cube = new THREE.Mesh(geometry, material);
            go.Object3D = cube;
            go.Object3D.receiveShadow = true;
            go.Object3D.castShadow = true;
            go.Object3D.scale.x = 10;
            go.Object3D.scale.y = 10;
            go.Object3D.position.y = -0.5;
            go.Object3D.rotation.x = -Math.PI/2;
        }),
        NewGO(go=>{
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(0.2, 0.6, 0.9).normalize();
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
}