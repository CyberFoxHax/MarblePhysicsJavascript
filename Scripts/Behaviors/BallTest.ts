class BallTest extends MonoBehaviour {

    Start(){
		this.transform.position.y = 1;
        spheres.push(this);
        var radius = 0.5;
    }

    Update(){
		this.transform.position.y -= Time.deltaTime*0.001;
    }
}

var spheres: BallTest[] = [];
