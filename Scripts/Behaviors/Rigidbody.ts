interface Transform {
    position:{x:number,y:number,z:number};
    quaternion:{x:number,y:number,z:number,w:number};
}
class Rigidbody extends MonoBehaviour {
    public Body: CANNON.Body;
    public Collider: CANNON.Shape;
    public Mass: number = 0;
    public IsKinematic: boolean = false;
    
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
        /*this.Body.addEventListener("collide", function(e){
            // figure out the contact information datastructure in e.contact
            // looks similar to CANNON.Equation but with extra properties
            var b = body;
            debugger;
            //https://schteppe.github.io/cannon.js/demos/events.html
            
        });
        console.log(this.Body);*/
    }

    public Update(){
        if(this.IsKinematic == true)
            Rigidbody.Copy(this.transform, this.Body);
        else
            Rigidbody.Copy(this.Body, this.transform);
    }


    /*private collisionBlacklist: Record<number, CANNON.ContactEquation> = {};

    public FixedUpdate(){
        var map = {};
        for (let i = 0; i < cannon_world.contacts.length; i++) {
            const contact = cannon_world.contacts[i];
            map[contact.id] = contact;
        }

        for (const key in this.collisionBlacklist){ 
            if(map[key] == null){
                delete this.collisionBlacklist[key];
            }
        }


        for (let i = 0; i < cannon_world.contacts.length; i++) {
            const contact = cannon_world.contacts[i];
            if(this.collisionBlacklist[contact.id] != null)
                continue;
            this.collisionBlacklist[contact.id] = contact;
            
            if(contact.bi != this.Body){
                continue;
            }
        }
    }*/
}