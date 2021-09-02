
abstract class MonoBehaviour {
    public gameObject: GameObject;
    public get transform(): THREE.Object3D{
        return this.gameObject.Object3D;
    }
    public _started: boolean = false;

    public Start() : void;
    public Update() : void;
    public LateUpdate() : void;
    public FixedUpdate() : void;
}  