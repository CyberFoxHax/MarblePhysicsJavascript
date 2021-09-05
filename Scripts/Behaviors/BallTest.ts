class BallTest extends MonoBehaviour {

    Start(){
        var rigid = this.gameObject.GetComponent(Rigidbody);
        rigid.IsKinematic = true;
        this.transform.position.y = 3;
    }
    private Velocity = new THREE.Vector3(0,0,0);
    private collisionBlacklist: Record<number, CANNON.ContactEquation> = {};

    Update(){
        console.log(this.collisionBlacklist);
    }

    FixedUpdate(){
        if(Time.deltaTime > 0.1)
            return; 
        this.Velocity.add(new THREE.Vector3(0, cannon_world.gravity.y * Time.fixedDeltaTime * 0.5, 0));
        var vel = this.Velocity.clone().multiplyScalar(Time.fixedDeltaTime);
        this.transform.position.add(vel);

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
            console.log(this.Velocity);

            var length = this.Velocity.length();
            this.Velocity.set(
                -contact.ni.x * length * 0.6,
                -contact.ni.y * length * 0.6,
                -contact.ni.z * length * 0.6
            );
        }
    }
}
