
class _Vector3 {
    public static get one():THREE.Vector3      { return new THREE.Vector3( 1, 1, 1); }
    public static get zero():THREE.Vector3     { return new THREE.Vector3( 0, 0, 0); }
    public static get up():THREE.Vector3       { return new THREE.Vector3( 0, 1, 0); }
    public static get down():THREE.Vector3     { return new THREE.Vector3( 0,-1, 0); }
    public static get left():THREE.Vector3     { return new THREE.Vector3(-1, 0, 0); }
    public static get right():THREE.Vector3    { return new THREE.Vector3( 1, 0, 0); }
    public static get forward():THREE.Vector3  { return new THREE.Vector3( 0, 0, 1); }
    public static get backward():THREE.Vector3 { return new THREE.Vector3( 0, 0,-1); }
}

class _Vector2 {
    public static get one():THREE.Vector2   { return new THREE.Vector2( 1, 1); }
    public static get zero():THREE.Vector2  { return new THREE.Vector2( 0, 0); }
    public static get up():THREE.Vector2    { return new THREE.Vector2( 0, 1); }
    public static get down():THREE.Vector2  { return new THREE.Vector2( 0,-1); }
    public static get left():THREE.Vector2  { return new THREE.Vector2(-1, 0); }
    public static get right():THREE.Vector2 { return new THREE.Vector2( 1, 0); }
}
