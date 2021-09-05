interface Transform {
    position:{x:number,y:number,z:number};
    quaternion:{x:number,y:number,z:number,w:number};
}
class Rigidbody extends MonoBehaviour {
    public Body: CANNON.Body;
    public Collider: CANNON.Shape;
    public Mass: number = 0;
    public IsKinematic: boolean = false;
    public collisions: CANNON.ContactEquation[] = [];
    
    public static Copy(from: THREE.Object3D, to: CANNON.Body) : void
    public static Copy(from: CANNON.Body, to: THREE.Object3D) : void
    public static Copy(from: Transform, to: Transform) : void{
        to.position.x = from.position.x;
        to.position.y = from.position.y;
        to.position.z = from.position.z;
        to.quaternion.x = from.quaternion.x;
        to.quaternion.y = from.quaternion.y;
        to.quaternion.z = from.quaternion.z;
        to.quaternion.w = from.quaternion.w;
    }

    public contacts:CANNON.ContactEquation[] = [];

    public Start(){
        var body = new CANNON.Body({
            mass: this.Mass,
            shape: this.Collider
        });
        this.Body = body;
        Rigidbody.Copy(this.transform, this.Body);
        cannon_world.addBody(this.Body);
        if(this.Body.mass == 0 && this.IsKinematic == false)
            this.Update = null;
    }

    public Update(){
        if(this.IsKinematic == false)
            Rigidbody.Copy(this.Body, this.transform);
    }

    public CollisionEnter:(b:CANNON.ContactEquation)=>void;
    public CollisionExit: (b:CANNON.ContactEquation)=>void;
    public CollisionStay: (b:CANNON.ContactEquation)=>void;

    private OnCollisionEnter(c:CANNON.ContactEquation){
        if(this.CollisionEnter != null)
            this.CollisionEnter(c);
    }
    private OnCollisionExit(c:CANNON.ContactEquation){
        if(this.CollisionEnter != null)
            this.CollisionEnter(c);
    }
    private OnCollisionStay(c:CANNON.ContactEquation){
        if(this.CollisionStay != null)
            this.CollisionStay(c);
    }

    private lastCollisions: Record<number, CANNON.ContactEquation> = {};
    public FixedUpdate(){
        var currentCollisions = {};
        this.collisions.length = 0;
        for (let i = 0; i < cannon_world.contacts.length; i++) {
            const contact = cannon_world.contacts[i];
            if(contact.bi == this.Body){
                currentCollisions[contact.id] = contact;
                this.collisions.push(contact);
            }
        }

        for (const key in currentCollisions){
            if(this.lastCollisions[key] == null)
                this.OnCollisionEnter(currentCollisions[key]);
            this.OnCollisionStay(currentCollisions[key]);
        }
        for (const key in this.lastCollisions){
            if(currentCollisions[key] == null)
                this.OnCollisionExit(this.lastCollisions[key]);
        }
        this.lastCollisions = currentCollisions;
    }
}