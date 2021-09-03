interface Transform {
    position:{x:number,y:number,z:number};
    quaternion:{x:number,y:number,z:number,w:number};
}
class Rigidbody extends MonoBehaviour {
    public Body: CANNON.Body;
    public Collider: CANNON.Shape;
    public Mass: number = 0;
    public IsKinematic: boolean = false;
    
    private static Copy(from: THREE.Object3D, to: CANNON.Body) : void
    private static Copy(from: CANNON.Body, to: THREE.Object3D) : void
    private static Copy(from: Transform, to: Transform) : void{
        to.position.x = from.position.x;
        to.position.y = from.position.y;
        to.position.z = from.position.z;
        to.quaternion.x = from.quaternion.x;
        to.quaternion.y = from.quaternion.y;
        to.quaternion.z = from.quaternion.z;
        to.quaternion.w = from.quaternion.w;
    }

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
        this.Body.addEventListener("collide", function(e){
            // figure out the contact information datastructure in e.contact
            // looks similar to CANNON.Equation but with extra properties
            window.contact = e.contact;
            console.log(e.contact);
            //https://schteppe.github.io/cannon.js/demos/events.html
            
        });
    }

    public Update(){
        if(this.IsKinematic == true)
            Rigidbody.Copy(this.transform, this.Body);
        else
            Rigidbody.Copy(this.Body, this.transform);
    }
}