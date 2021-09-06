class GameObject {
    constructor() {
        this.Components = [];
    }
    AddComponent(ctor) {
        var p = new ctor();
        this.Components.push(p);
        return p;
    }
    GetComponent(ctor) {
        for (let i = 0; i < this.Components.length; i++) {
            if (this.Components[i].constructor == ctor) {
                return this.Components[i];
            }
        }
        return null;
    }
}
class _Input {
    constructor() {
        this._jump = false;
        this._axisRaw = new THREE.Vector2();
        this._mouseDelta = new THREE.Vector2();
        this.keyboardKeys = {};
    }
    GetButton(name) {
        switch (name) {
            case "Jump":
                return this._jump;
        }
    }
    GetKeyDown() {
        return false;
    }
    GetAxisRaw(name) {
        switch (name) {
            case "Horizontal":
                return this._axisRaw.x;
            case "Vertical":
                return this._axisRaw.y;
        }
        return 0;
    }
    GetMouseButtonDown(button) {
        return false;
    }
    GetAxis(name) {
        switch (name) {
            case "Mouse X":
                return this._mouseDelta.x;
            case "Mouse Y":
                return this._mouseDelta.y;
            default:
                break;
        }
    }
    OnFrameEnd() {
        this._mouseDelta = new THREE.Vector2();
    }
    OnKeyChanged(key, value) {
        this.keyboardKeys[key] = value;
        this._axisRaw.x = 0;
        if (this.keyboardKeys["d"] == true)
            this._axisRaw.x++;
        if (this.keyboardKeys["a"] == true)
            this._axisRaw.x--;
        this._axisRaw.y = 0;
        if (this.keyboardKeys["w"] == true)
            this._axisRaw.y++;
        if (this.keyboardKeys["s"] == true)
            this._axisRaw.y--;
        this._jump = this.keyboardKeys[" "] == true;
    }
    Init(renderer) {
        var _this = this;
        window.onkeydown = function (e) {
            _this.OnKeyChanged(e.key, true);
        };
        window.onkeyup = function (e) {
            _this.OnKeyChanged(e.key, false);
        };
        renderer.addEventListener("mousemove", function (e) {
            if (document.pointerLockElement != renderer)
                return;
            _this._mouseDelta = new THREE.Vector2(e.movementX / 33, e.movementY / 33);
        });
    }
}
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var scene;
var Time;
var Input;
var superCollider;
var textures = {};
var cannon_world;
var debugOut;
window.onload = (function () {
    return __awaiter(this, void 0, void 0, function* () {
        debugOut = document.getElementById("debug");
        var wrapper = document.getElementById("textures");
        var texes = Array.from(wrapper.children);
        for (let i = 0; i < texes.length; i++) {
            var img = texes[i];
            img.parentElement.removeChild(img);
            var rootAbsPath = location.href.replace("main.html", "");
            var relativePath = img.src.replace(rootAbsPath, "");
            var texture = new THREE.Texture(img);
            texture.needsUpdate = true;
            textures[relativePath] = texture;
        }
        wrapper.parentElement.removeChild(wrapper);
        const three_scene = new THREE.Scene();
        var camera = null;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        document.getElementById("renderer").appendChild(renderer.domElement);
        renderer.domElement.onclick = function () {
            renderer.domElement.requestPointerLock();
        };
        Input = new _Input();
        Input.Init(renderer.domElement);
        scene = CreateScene();
        for (let i = 0; i < scene.length; i++) {
            if (scene[i].Object3D == null)
                continue;
            three_scene.add(scene[i].Object3D);
            if (scene[i].Object3D instanceof THREE.PerspectiveCamera)
                camera = scene[i].Object3D;
        }
        var components;
        function CreateComponentCache() {
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
        var physicsObjects;
        time.OnPhysicsStart = function () {
            physicsObjects = components.filter(p => p.FixedUpdate != null);
        };
        time.OnPhysicsStep = function () {
            cannon_world.step(Time.fixedDeltaTime, Time.fixedDeltaTime, 0);
            for (let i = 0; i < physicsObjects.length; i++) {
                physicsObjects[i].FixedUpdate();
            }
        };
        cannon_world = new CANNON.World();
        cannon_world.gravity.set(0, -9.82, 0);
        time.Init();
        function animate() {
            CreateComponentCache();
            components.forEach(p => {
                if (p.Start != null && p._started == false) {
                    p._started = true;
                    p.Start();
                }
            });
            time.OnFrame();
            components.forEach(p => {
                if (p.Update != null)
                    p.Update();
            });
            requestAnimationFrame(animate);
            renderer.render(three_scene, camera);
            components.forEach(p => {
                if (p.LateUpdate != null)
                    p.LateUpdate();
            });
            Input.OnFrameEnd();
        }
        ;
        requestAnimationFrame(animate);
    });
});
class MonoBehaviour {
    constructor() {
        this._started = false;
    }
    get transform() {
        return this.gameObject.Object3D;
    }
}
function CreateScene() {
    function NewGO(f) {
        var go = new GameObject();
        f(go);
        return go;
    }
    var scene = [
        NewGO(go => {
            go.AddComponent(ApiTest);
        }),
        NewGO(go => {
            go.AddComponent(OrbitCamera);
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = -10;
            camera.position.y = 1;
            go.Object3D = camera;
        }),
        NewGO(go => {
            go.Name = "Ball";
            var body = go.AddComponent(Rigidbody);
            body.Mass = 0.2;
            body.IsKinematic = true;
            body.Collider = new CANNON.Sphere(0.2);
            go.AddComponent(Movement);
            var texture = textures["base.marble.jpg"];
            const geometry = new THREE.SphereGeometry(0.2, 64, 64);
            const material = new THREE.MeshPhysicalMaterial({ map: texture, roughness: 0.1 });
            const sphere = new THREE.Mesh(geometry, material);
            go.Object3D = sphere;
            go.Object3D.position.y = 30;
            go.Object3D.receiveShadow = true;
            go.Object3D.castShadow = true;
        }),
        NewGO(go => {
            go.Name = "Box";
            var body = go.AddComponent(Rigidbody);
            var size = new THREE.Vector3(10, 10, 10);
            body.Collider = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
            body.Mass = 0;
            const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
            const material = new THREE.MeshPhysicalMaterial({ color: 0x999999, map: textures["DefaultTexture.bmp"], roughness: 0.8 });
            const cube = new THREE.Mesh(geometry, material);
            go.Object3D = cube;
            go.Object3D.receiveShadow = true;
            go.Object3D.castShadow = true;
            go.Object3D.position.set(0, -10, 0);
        }),
        NewGO(go => {
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(0.2, 0.6, 0.9).multiplyScalar(100);
            light.shadow.mapSize.setScalar(256);
            light.shadow.radius = 2;
            light.castShadow = true;
            go.Object3D = light;
        }),
        NewGO(go => {
            var light = new THREE.HemisphereLight(0x99eeff, 0x223344, 0.3);
            go.Object3D = light;
        })
    ];
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (x == 5 && y == 5)
                continue;
            if (Math.random() > 0.8)
                continue;
            scene.push(NewGO(go => {
                go.Name = "Box";
                var body = go.AddComponent(Rigidbody);
                var size = new THREE.Vector3(10, Math.random() * 10, 10);
                body.Collider = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
                body.Mass = 0;
                const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
                const material = new THREE.MeshPhysicalMaterial({ color: 0x999999, map: textures["DefaultTexture.bmp"], roughness: 0.8 });
                const cube = new THREE.Mesh(geometry, material);
                go.Object3D = cube;
                go.Object3D.receiveShadow = true;
                go.Object3D.castShadow = true;
                go.Object3D.position.set((-10 / 2 + x) * 10, -5, (-10 / 2 + y) * 10);
            }));
        }
    }
    for (let i = 0; i < 2; i++) {
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                if (x == 5 && y == 5)
                    continue;
                var size = new THREE.Vector3(5 * Math.random(), 5 + Math.random() * 30, 5 * Math.random());
                if (size.y < 0.2)
                    continue;
                scene.push(NewGO(go => {
                    go.Name = "Box";
                    var body = go.AddComponent(Rigidbody);
                    body.Collider = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
                    body.Mass = 0;
                    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
                    const material = new THREE.MeshPhysicalMaterial({ color: 0x999999, map: textures["DefaultTexture.bmp"], roughness: 0.8 });
                    const cube = new THREE.Mesh(geometry, material);
                    go.Object3D = cube;
                    go.Object3D.receiveShadow = true;
                    go.Object3D.castShadow = true;
                    go.Object3D.position.set((-10 / 2 + x) * 10 + Math.random() * 10, -5, (-10 / 2 + y) * 10 + Math.random() * 10);
                }));
            }
        }
    }
    return scene;
}
class _Time {
    constructor() {
        this.PhysicsTimeStep = 0.005;
    }
    static GetNow() {
        return performance.now() / 1000;
    }
    Init() {
        this.lastFrameTime = _Time.GetNow();
        this.startTime = _Time.GetNow();
        this.physicsInterval = this.PhysicsTimeStep;
        if (this.physicsInterval < 1000 / 60) {
            this.physicsInterval = 1000 / 60;
        }
        this.fixedTime = 0;
    }
    InitPhysics() {
        if (this.fixedTime == 0) {
            this.fixedTime = this.time;
            (function (_this) {
                function Physicstep() {
                    _this.OnPhysicsFrame();
                    setTimeout(Physicstep, _this.physicsInterval - _this.fixedDeltaTime * 1000);
                }
                Physicstep();
            })(this);
        }
    }
    OnPhysicsFrame() {
        if (this.OnPhysicsStart != null)
            this.OnPhysicsStart();
        this.fixedDeltaTime = this.PhysicsTimeStep;
        while (this.fixedTime < this.time) {
            this.fixedTime += this.fixedDeltaTime;
            if (this.OnPhysicsStep != null)
                this.OnPhysicsStep();
        }
    }
    OnFrame() {
        var now = _Time.GetNow();
        this.time = now - this.startTime;
        this.deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        this.InitPhysics();
    }
}
function FindObjectOfType(ctor) {
    for (let i = 0; i < scene.length; i++) {
        for (let ii = 0; ii < scene[i].Components.length; ii++) {
            if (scene[i].Components[ii].constructor == ctor) {
                return scene[i].Components[ii];
            }
        }
    }
    return null;
}
function FindObjectsOfType(ctor) {
    var components = [];
    for (let i = 0; i < scene.length; i++) {
        for (let ii = 0; ii < scene[i].Components.length; ii++) {
            if (scene[i].Components[ii].constructor == ctor) {
                components.push(scene[i].Components[ii]);
            }
        }
    }
    return components;
}
function MultiplyRotation(rotation, point) {
    var x = rotation.x * 2;
    var y = rotation.y * 2;
    var z = rotation.z * 2;
    var xx = rotation.x * x;
    var yy = rotation.y * y;
    var zz = rotation.z * z;
    var xy = rotation.x * y;
    var xz = rotation.x * z;
    var yz = rotation.y * z;
    var wx = rotation.w * x;
    var wy = rotation.w * y;
    var wz = rotation.w * z;
    var res = new THREE.Vector3();
    res.x = (1 - (yy + zz)) * point.x + (xy - wz) * point.y + (xz + wy) * point.z;
    res.y = (xy + wz) * point.x + (1 - (xx + zz)) * point.y + (yz - wx) * point.z;
    res.z = (xz - wy) * point.x + (yz + wx) * point.y + (1 - (xx + yy)) * point.z;
    return res;
}
class _Vector3 {
    static get one() { return new THREE.Vector3(1, 1, 1); }
    static get zero() { return new THREE.Vector3(0, 0, 0); }
    static get up() { return new THREE.Vector3(0, 1, 0); }
    static get down() { return new THREE.Vector3(0, -1, 0); }
    static get left() { return new THREE.Vector3(-1, 0, 0); }
    static get right() { return new THREE.Vector3(1, 0, 0); }
    static get forward() { return new THREE.Vector3(0, 0, 1); }
    static get backward() { return new THREE.Vector3(0, 0, -1); }
}
class _Vector2 {
    static get one() { return new THREE.Vector2(1, 1); }
    static get zero() { return new THREE.Vector2(0, 0); }
    static get up() { return new THREE.Vector2(0, 1); }
    static get down() { return new THREE.Vector2(0, -1); }
    static get left() { return new THREE.Vector2(-1, 0); }
    static get right() { return new THREE.Vector2(1, 0); }
}
class ApiTest extends MonoBehaviour {
    Update() {
    }
}
class BallTest extends MonoBehaviour {
    constructor() {
        super(...arguments);
        this.Velocity = new THREE.Vector3(0, 0, 0);
        this.collisionBlacklist = {};
    }
    Start() {
        var rigid = this.gameObject.GetComponent(Rigidbody);
        rigid.IsKinematic = true;
        this.transform.position.y = 3;
    }
    Update() {
        console.log(this.collisionBlacklist);
    }
    FixedUpdate() {
        if (Time.deltaTime > 0.1)
            return;
        this.Velocity.add(new THREE.Vector3(0, cannon_world.gravity.y * Time.fixedDeltaTime * 0.5, 0));
        var vel = this.Velocity.clone().multiplyScalar(Time.fixedDeltaTime);
        this.transform.position.add(vel);
        var map = {};
        for (let i = 0; i < cannon_world.contacts.length; i++) {
            const contact = cannon_world.contacts[i];
            map[contact.id] = contact;
        }
        for (const key in this.collisionBlacklist) {
            if (map[key] == null) {
                delete this.collisionBlacklist[key];
            }
        }
        for (let i = 0; i < cannon_world.contacts.length; i++) {
            const contact = cannon_world.contacts[i];
            if (this.collisionBlacklist[contact.id] != null)
                continue;
            this.collisionBlacklist[contact.id] = contact;
            console.log(this.Velocity);
            var length = this.Velocity.length();
            this.Velocity.set(-contact.ni.x * length * 0.6, -contact.ni.y * length * 0.6, -contact.ni.z * length * 0.6);
        }
    }
}
function clamp(num, min, max) {
    return num < min
        ? min
        : num > max
            ? max
            : num;
}
class Ref {
    constructor(value) {
        this.v = value;
    }
}
class Movement extends MonoBehaviour {
    constructor() {
        super(...arguments);
        this.MaxRollVelocity = 15;
        this.AngularAcceleration = 75;
        this.BrakingAcceleration = 30;
        this.AirAcceleration = 5;
        this.Gravity = 20;
        this.StaticFriction = 1.1;
        this.KineticFriction = 0.7;
        this.BounceKineticFriction = 0.2;
        this.MaxDotSlide = 0.5;
        this.JumpImpulse = 7.5;
        this.MaxForceRadius = 50;
        this.MinBounceVel = 0.1;
        this.BounceRestitution = 0.5;
        this._remainingTime = 0.0;
        this.Velocity = _Vector3.zero;
        this.AngularVelocity = _Vector3.zero;
        this._fakeInput = _Vector2.zero;
        this.GravityDir = new THREE.Vector3(0, -1, 0);
        this._forwards = _Vector3.forward;
    }
    get CameraX() { return this._camera.yaw; }
    get CameraY() { return this._camera.pitch; }
    get Radius() { return 0.2; }
    get InputMovement() {
        return new THREE.Vector2(-Input.GetAxisRaw("Horizontal"), -Input.GetAxisRaw("Vertical")).add(this._fakeInput);
    }
    get Jump() { return Input.GetButton("Jump"); }
    Start() {
        this._camera = FindObjectsOfType(OrbitCamera)[0];
        this._rigidBody = this.gameObject.GetComponent(Rigidbody);
    }
    FixedUpdate() {
        var dt = Time.fixedDeltaTime;
        this._remainingTime += dt;
        while (this._remainingTime > 0.008) {
            var loopTime = new Ref(0.008);
            this._advancePhysics(loopTime);
            this._remainingTime -= loopTime.v;
        }
    }
    _advancePhysics(dt) {
        var contacts = [];
        var pos = new Ref(this.transform.position);
        var rot = new Ref(this.transform.quaternion);
        var velocity = new Ref(this.Velocity);
        var omega = new Ref(this.AngularVelocity);
        for (let i = 0; i < this._rigidBody.collisions.length; i++) {
            var contact = this._rigidBody.collisions[i];
            var col = new CollisionInfo();
            col.Penetration = 1;
            col.Restitution = 1;
            col.Friction = 1;
            col.Normal = new THREE.Vector3(-contact.ni.x, -contact.ni.y, -contact.ni.z);
            col.Point = new THREE.Vector3(contact.bi.position.x, contact.bi.position.y - this.Radius, contact.bi.position.z);
            col.Velocity = _Vector3.zero;
            contacts.push(col);
        }
        this._updateMove(dt, velocity, omega, contacts);
        this._updateIntegration(dt.v, pos, rot, velocity, omega);
        Rigidbody.Copy(this.transform, this._rigidBody.Body);
        this.Velocity = velocity.v;
        this._rigidBody.Body.velocity.x = this.Velocity.x;
        this._rigidBody.Body.velocity.y = this.Velocity.y;
        this._rigidBody.Body.velocity.z = this.Velocity.z;
        this._rigidBody.Body.angularVelocity.x = omega.v.x;
        this._rigidBody.Body.angularVelocity.y = omega.v.y;
        this._rigidBody.Body.angularVelocity.z = omega.v.z;
        this.AngularVelocity = omega.v;
    }
    _updateIntegration(dt, pos, rot, vel, avel) {
        pos.v.add(vel.v.clone().multiplyScalar(dt));
        var vector3 = avel.v;
        var num1 = vector3.length();
        if (num1 <= 0.0000001)
            return;
        var quaternion = new THREE.Quaternion().setFromAxisAngle(vector3.clone().multiplyScalar(1 / num1), dt * num1);
        quaternion.normalize();
        rot.v.copy(quaternion.clone().multiply(rot.v));
        rot.v.normalize();
    }
    _updateMove(dt, velocity, angVelocity, contacts) {
        var torque = new Ref(new THREE.Vector3());
        var targetAngVel = new Ref(new THREE.Vector3());
        var isMoving = this._computeMoveForces(angVelocity.v, torque, targetAngVel);
        this._velocityCancel(contacts, velocity, angVelocity, !isMoving, false);
        var externalForces = new Ref(this._getExternalForces(dt.v, contacts));
        var angAccel = new Ref(null);
        this._applyContactForces(dt.v, contacts, !isMoving, torque.v, targetAngVel.v, velocity, angVelocity, externalForces, angAccel);
        velocity.v.add(externalForces.v.clone().multiplyScalar(dt.v));
        angVelocity.v.add(angAccel.v.clone().multiplyScalar(dt.v));
        this._velocityCancel(contacts, velocity, angVelocity, !isMoving, true);
        var contactTime = dt.v;
        if (dt.v * 0.99 > contactTime) {
            velocity.v.sub(externalForces.v.clone().multiplyScalar(dt.v - contactTime));
            angVelocity.v.sub(angAccel.v.clone().multiplyScalar(dt.v - contactTime));
            dt.v = contactTime;
        }
        if (contacts.length != 0)
            this._contactTime += dt.v;
    }
    _computeMoveForces(angVelocity, torque, targetAngVel) {
        torque.v = _Vector3.zero;
        targetAngVel.v = _Vector3.zero;
        var relGravity = this.GravityDir.clone().negate().multiplyScalar(this.Radius);
        var topVelocity = angVelocity.clone().cross(relGravity);
        var sideDir = new Ref(new THREE.Vector3());
        var motionDir = new Ref(new THREE.Vector3());
        var _ = new Ref(new THREE.Vector3());
        this._getMarbleAxis(sideDir, motionDir, _);
        var topY = topVelocity.clone().dot(motionDir.v);
        var topX = topVelocity.clone().dot(sideDir.v);
        var move = this.InputMovement;
        var moveY = this.MaxRollVelocity * move.y;
        var moveX = this.MaxRollVelocity * move.x;
        if (Math.abs(moveY) < 0.001 && Math.abs(moveX) < 0.001)
            return false;
        if (topY > moveY && moveY > 0.0)
            moveY = topY;
        else if (topY < moveY && moveY < 0.0)
            moveY = topY;
        if (topX > moveX && moveX > 0.0)
            moveX = topX;
        else if (topX < moveX && moveX < 0.0)
            moveX = topX;
        var ddd = motionDir.v
            .clone()
            .multiplyScalar(moveY)
            .add(sideDir.v.multiplyScalar(moveX));
        targetAngVel.v = relGravity.clone().cross(ddd).divideScalar(relGravity.lengthSq());
        torque.v = targetAngVel.v.clone().sub(angVelocity);
        var targetAngAccel = torque.v.length();
        if (targetAngAccel > this.AngularAcceleration) {
            torque.v.multiplyScalar(this.AngularAcceleration / targetAngAccel);
        }
        return true;
    }
    _getMarbleAxis(sideDir, motionDir, upDir) {
        var m = new THREE.Quaternion().setFromEuler(new THREE.Euler(this.CameraY, 0, 0))
            .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.CameraX, 0)));
        upDir.v = this.GravityDir.clone().negate();
        motionDir.v = MultiplyRotation(m, this._forwards);
        sideDir.v = motionDir.v.clone().cross(upDir.v);
        sideDir.v.normalize();
        motionDir.v = upDir.v.clone().cross(sideDir.v);
    }
    _getExternalForces(dt, contacts) {
        var force = this.GravityDir.clone().multiplyScalar(this.Gravity);
        if (contacts.length == 0) {
            var sideDir = new Ref(new THREE.Vector3());
            var motionDir = new Ref(new THREE.Vector3());
            var _ = new Ref(new THREE.Vector3());
            this._getMarbleAxis(sideDir, motionDir, _);
            force.add(sideDir.v.clone().multiplyScalar(this.InputMovement.x)
                .add(motionDir.v.clone().multiplyScalar(this.InputMovement.y))
                .multiplyScalar(this.AirAcceleration));
        }
        return force;
    }
    _velocityCancel(contacts, velocity, omega, surfaceSlide, noBounce) {
        var flag1 = false;
        var iterations = 0;
        var done = false;
        while (!done) {
            done = true;
            ++iterations;
            for (let i = 0; i < contacts.length; i++) {
                const coll = contacts[i];
                var relativeVelocity = velocity.v.clone().sub(coll.Velocity);
                var bounceSpeed = coll.Normal.clone().dot(relativeVelocity);
                if (!flag1 && bounceSpeed < 0.0 || bounceSpeed < -0.001) {
                    var invBounce = coll.Normal.clone().multiplyScalar(bounceSpeed);
                    if (noBounce) {
                        velocity.v.sub(invBounce);
                    }
                    else if (coll.Collider != null) {
                        var contact = coll;
                        var num5 = 0.5;
                        var vector34 = contact.Normal.clone().multiplyScalar(velocity.v.dot(contact.Normal) * (1 + num5));
                        velocity.v.sub(vector34);
                    }
                    else {
                        if (coll.Velocity.length() > 0.00001 && !surfaceSlide &&
                            bounceSpeed > -this.MaxDotSlide * velocity.v.length()) {
                            velocity.v.sub(invBounce);
                            velocity.v.normalize();
                            velocity.v.multiplyScalar(velocity.v.length());
                            surfaceSlide = true;
                        }
                        else if (bounceSpeed > -this.MinBounceVel) {
                            velocity.v.sub(invBounce);
                        }
                        else {
                            var velocityAdd = invBounce.multiplyScalar(-(1.0 + this.BounceRestitution * coll.Restitution));
                            var velocityAtContact = relativeVelocity.clone().add(omega.v.clone().cross(coll.Normal.clone().negate()).multiplyScalar(this.Radius));
                            var num5 = -coll.Normal.clone().dot(relativeVelocity);
                            var vector36 = velocityAtContact.sub(coll.Normal.clone().multiplyScalar(coll.Normal.clone().dot(relativeVelocity)));
                            var num6 = vector36.length();
                            if (Math.abs(num6) > 0.001) {
                                var inertia = (5.0 * (this.BounceKineticFriction * coll.Friction) * num5 /
                                    (2.0 * this.Radius));
                                if (inertia > num6 / this.Radius)
                                    inertia = num6 / this.Radius;
                                var vector37 = vector36.clone().divideScalar(num6);
                                var vAtC = coll.Normal.clone().negate().cross(vector37.clone().negate());
                                var vector38 = vAtC.clone().multiplyScalar(inertia);
                                omega.v.add(vector38);
                                velocity.v.sub(vector38.clone().negate().cross(coll.Normal.clone().negate().multiplyScalar(this.Radius)));
                            }
                            velocity.v.add(velocityAdd);
                        }
                    }
                    done = false;
                }
            }
            flag1 = true;
            if (iterations > 6 && noBounce)
                done = true;
            if (iterations > 1e7) {
                console.log("Collision lock");
                break;
            }
        }
        if (velocity.v.lengthSq() >= 625.0)
            return;
        var flag3 = false;
        var vector39 = new THREE.Vector3(0, 0, 0);
        for (var index = 0; index < contacts.length; ++index) {
            var vector32 = vector39.clone().add(contacts[index].Normal);
            if (vector32.lengthSq() < 0.01)
                vector32.add(contacts[index].Normal);
            vector39 = vector32;
            flag3 = true;
        }
        if (!flag3)
            return;
        vector39.normalize();
        var num8 = 0.0;
        for (var index = 0; index < contacts.length; ++index) {
            if (contacts[index].Penetration < this.Radius) {
                var num3 = 0.1;
                var penetration = contacts[index].Penetration;
                var num4 = (velocity.v.clone().addScalar(num8).multiply(vector39)).dot(contacts[index].Normal);
                if (num3 * num4 < penetration)
                    num8 += (penetration - num4 * num3) / num3 / contacts[index].Normal.dot(vector39);
            }
        }
        var num9 = clamp(num8, -25, 25);
        velocity.v.add(vector39.multiplyScalar(num9));
    }
    _applyContactForces(dt, contacts, isCentered, aControl, desiredOmega, velocity, omega, linAccel, angAccel) {
        angAccel.v = _Vector3.zero;
        this._slipAmount = 0.0;
        var vector31 = this.GravityDir;
        var index1 = -1;
        var num1 = 0.0;
        for (var index2 = 0; index2 < contacts.length; ++index2) {
            var num2 = -contacts[index2].Normal.clone().dot(linAccel.v);
            if (num2 > num1) {
                num1 = num2;
                index1 = index2;
            }
        }
        var collisionInfo = index1 != -1 ? contacts[index1] : new CollisionInfo();
        if (index1 != -1 && this.Jump) {
            var vector32 = velocity.v.clone().sub(collisionInfo.Velocity);
            var num2 = collisionInfo.Normal.dot(vector32);
            if (num2 < 0.0)
                num2 = 0.0;
            if (num2 < this.JumpImpulse) {
                velocity.v.add(collisionInfo.Normal.clone().multiplyScalar(this.JumpImpulse - num2));
            }
        }
        for (var index2 = 0; index2 < contacts.length; ++index2) {
            var num2 = -contacts[index2].Normal.clone().negate().dot(linAccel.v);
            if (num2 > 0.0 && contacts[index2].Normal.dot(velocity.v.clone().sub(contacts[index2].Velocity)) <= 0.00001) {
                linAccel.v.add(contacts[index2].Normal.clone().multiplyScalar(num2));
            }
        }
        if (index1 != -1) {
            var vector32 = velocity.v.clone().add(omega.v.clone().cross(collisionInfo.Normal.clone().negate().multiplyScalar(this.Radius)).sub(collisionInfo.Velocity));
            var num2 = vector32.length();
            var flag = false;
            var vector33 = new THREE.Vector3(0, 0, 0);
            var vector34 = new THREE.Vector3(0, 0, 0);
            if (num2 != 0.0) {
                flag = true;
                var num3 = this.KineticFriction * collisionInfo.Friction;
                var num4 = (5.0 * num3 * num1 / (2.0 * this.Radius));
                var num5 = num1 * num3;
                var num6 = (num4 * this.Radius + num5) * dt;
                if (num6 > num2) {
                    var num7 = num2 / num6;
                    num4 *= num7;
                    num5 *= num7;
                    flag = false;
                }
                var vector35 = vector32.clone().divideScalar(num2);
                vector33 = collisionInfo.Normal.clone().negate().cross(vector35.clone().negate()).multiplyScalar(num4);
                vector34 = vector35.clone().multiplyScalar(-num5);
                this._slipAmount = num2 - num6;
            }
            if (!flag) {
                var vector35 = vector31.clone().negate().multiplyScalar(this.Radius);
                var vector36 = vector35.clone().cross(linAccel.v).divideScalar(vector35.lengthSq());
                if (isCentered) {
                    var vector37 = omega.v.clone().add(angAccel.v.clone().multiplyScalar(dt));
                    aControl = desiredOmega.clone().sub(vector37);
                    var num3 = aControl.length();
                    if (num3 > this.BrakingAcceleration)
                        aControl = aControl.clone().multiplyScalar(this.BrakingAcceleration / num3);
                }
                var ddd = collisionInfo.Normal.clone().negate().multiplyScalar(this.Radius);
                var vector38 = aControl.clone().cross(ddd).negate();
                var vector39 = vector36.clone().cross(ddd).add(vector38);
                var num4 = vector39.length();
                var num5 = this.StaticFriction * collisionInfo.Friction;
                if (num4 > num5 * num1) {
                    var num3 = this.KineticFriction * collisionInfo.Friction;
                    vector38.multiplyScalar(num3 * num1 / num4);
                }
                linAccel.v.add(vector38);
                angAccel.v.add(vector36);
            }
            linAccel.v.add(vector34);
            angAccel.v.add(vector33);
        }
        angAccel.v.add(aControl);
    }
}
var CollisionHelpers;
(function (CollisionHelpers) {
    function ClosestPtPointTriangle(pt, radius, p0, p1, p2, normal, closest) {
        closest.v = _Vector3.zero;
        var num1 = pt.dot(normal);
        var num2 = p0.dot(normal);
        if (Math.abs(num1 - num2) > radius * 1.1)
            return false;
        closest.v = pt.clone().add(normal.clone().multiplyScalar(num2 - num1));
        if (PointInTriangle(closest.v, p0, p1, p2))
            return true;
        var num3 = 10;
        var tSeg = new Ref(null);
        var tCap = new Ref(null);
        if (IntersectSegmentCapsule(pt, pt, p0, p1, radius, tSeg, tCap) &&
            tSeg.v < num3) {
            closest.v = p0.clone().add(p1.clone().sub(p0).multiplyScalar(tCap.v));
            num3 = tSeg.v;
        }
        if (IntersectSegmentCapsule(pt, pt, p1, p2, radius, tSeg, tCap) &&
            tSeg.v < num3) {
            closest.v = p1.clone().add(p2.clone().sub(p1)).multiplyScalar(tCap.v);
            num3 = tSeg.v;
        }
        if (IntersectSegmentCapsule(pt, pt, p2, p0, radius, tSeg, tCap) &&
            tSeg.v < num3) {
            closest.v = p2.clone().add((p0.clone().sub(p2)).multiplyScalar(tCap.v));
            num3 = tSeg.v;
        }
        return num3 < 1.0;
    }
    CollisionHelpers.ClosestPtPointTriangle = ClosestPtPointTriangle;
    function PointInTriangle(pnt, a, b, c) {
        a.sub(pnt);
        b.sub(pnt);
        c.sub(pnt);
        var bc = b.clone().cross(c);
        var ca = c.clone().cross(a);
        if (bc.dot(ca) < 0.0)
            return false;
        var ab = a.clone().cross(b);
        return bc.dot(ab) >= 0.0;
    }
    CollisionHelpers.PointInTriangle = PointInTriangle;
    function IntersectSegmentCapsule(segStart, segEnd, capStart, capEnd, radius, seg, cap) {
        var _ = new Ref(null);
        return ClosestPtSegmentSegment(segStart, segEnd, capStart, capEnd, seg, cap, _, _) < radius * radius;
    }
    CollisionHelpers.IntersectSegmentCapsule = IntersectSegmentCapsule;
    function ClosestPtSegmentSegment(p1, q1, p2, q2, s, T, c1, c2) {
        var num1 = 0.0001;
        var vector31 = q1.clone().add(p1);
        var vector32 = q2.clone().add(p2);
        var vector33 = p1.clone().add(p2);
        var num2 = vector31.dot(vector31);
        var num3 = vector32.dot(vector32);
        var num4 = vector32.dot(vector33);
        if (num2 <= num1 && num3 <= num1) {
            s.v = T.v = 0.0;
            c1.v = p1;
            c2.v = p2;
            return c1.v.clone().sub(c2.v).dot(c1.v.clone().sub(c2.v));
        }
        if (num2 <= num1) {
            s.v = 0.0;
            T.v = num4 / num3;
            T.v = clamp(T.v, 0.0, 1);
        }
        else {
            var num5 = vector31.dot(vector33);
            if (num3 <= num1) {
                T.v = 0.0;
                s.v = clamp(-num5 / num2, 0.0, 1);
            }
            else {
                var num6 = vector31.dot(vector32);
                var num7 = (num2 * num3 - num6 * num6);
                s.v = num7 == 0.0
                    ? 0.0
                    : clamp((num6 * num4 - num5 * num3) / num7, 0.0, 1);
                T.v = (num6 * s.v + num4) / num3;
                if (T.v < 0.0) {
                    T.v = 0.0;
                    s.v = clamp(-num5 / num2, 0.0, 1);
                }
                else if (T.v > 1.0) {
                    T.v = 1;
                    s.v = clamp((num6 - num5) / num2, 0.0, 1);
                }
            }
        }
        c1.v = p1.clone().add(vector31.clone().multiplyScalar(s.v));
        c2.v = p2.clone().add(vector32.clone().multiplyScalar(T.v));
        return c1.v.clone().sub(c2.v).dot(c1.v.clone().sub(c2.v));
    }
    CollisionHelpers.ClosestPtSegmentSegment = ClosestPtSegmentSegment;
})(CollisionHelpers || (CollisionHelpers = {}));
class CollisionInfo {
}
class OrbitCamera extends MonoBehaviour {
    constructor() {
        super(...arguments);
        this.distance = 2;
        this.yaw = 0;
        this.pitch = 0;
        this.cameraSpeed = 5;
        this.invertX = true;
        this.invertY = false;
        this.target = null;
    }
    Start() {
        var ball = FindObjectOfType(Movement) || FindObjectOfType(BallTest);
        this.target = ball.transform;
    }
    Update() {
        if (this.target == null)
            return;
        this.yaw += this.cameraSpeed * Input.GetAxis("Mouse X") * (this.invertX ? -1 : 1) * THREE.MathUtils.DEG2RAD;
        this.pitch += this.cameraSpeed * Input.GetAxis("Mouse Y") * (this.invertY ? 1 : -1) * THREE.MathUtils.DEG2RAD;
        var actualDistance = this.distance;
        var position = this.target.position.clone();
        var rotation = new THREE.Quaternion().setFromAxisAngle(_Vector3.up, this.yaw);
        rotation.multiply(new THREE.Quaternion().setFromAxisAngle(_Vector3.right, this.pitch));
        position.add(MultiplyRotation(rotation, new THREE.Vector3(0, 0, actualDistance)));
        this.transform.quaternion.copy(rotation);
        this.transform.position.copy(position);
    }
}
class Rigidbody extends MonoBehaviour {
    constructor() {
        super(...arguments);
        this.Mass = 0;
        this.IsKinematic = false;
        this.collisions = [];
        this.contacts = [];
        this.lastCollisions = {};
    }
    static Copy(from, to) {
        to.position.x = from.position.x;
        to.position.y = from.position.y;
        to.position.z = from.position.z;
        to.quaternion.x = from.quaternion.x;
        to.quaternion.y = from.quaternion.y;
        to.quaternion.z = from.quaternion.z;
        to.quaternion.w = from.quaternion.w;
    }
    Start() {
        var body = new CANNON.Body({
            mass: this.Mass,
            shape: this.Collider
        });
        this.Body = body;
        Rigidbody.Copy(this.transform, this.Body);
        cannon_world.addBody(this.Body);
        if (this.Body.mass == 0 && this.IsKinematic == false)
            this.Update = null;
    }
    Update() {
        if (this.IsKinematic == false)
            Rigidbody.Copy(this.Body, this.transform);
    }
    OnCollisionEnter(c) {
        if (this.CollisionEnter != null)
            this.CollisionEnter(c);
    }
    OnCollisionExit(c) {
        if (this.CollisionEnter != null)
            this.CollisionEnter(c);
    }
    OnCollisionStay(c) {
        if (this.CollisionStay != null)
            this.CollisionStay(c);
    }
    FixedUpdate() {
        var currentCollisions = {};
        this.collisions.length = 0;
        for (let i = 0; i < cannon_world.contacts.length; i++) {
            const contact = cannon_world.contacts[i];
            if (contact.bi == this.Body) {
                currentCollisions[contact.id] = contact;
                this.collisions.push(contact);
            }
        }
        for (const key in currentCollisions) {
            if (this.lastCollisions[key] == null)
                this.OnCollisionEnter(currentCollisions[key]);
            this.OnCollisionStay(currentCollisions[key]);
        }
        for (const key in this.lastCollisions) {
            if (currentCollisions[key] == null)
                this.OnCollisionExit(this.lastCollisions[key]);
        }
        this.lastCollisions = currentCollisions;
    }
}
//# sourceMappingURL=bundle.js.map