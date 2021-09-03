class BallTest extends MonoBehaviour {

    Start(){
        var rigid = this.gameObject.GetComponent(Rigidbody);
        rigid.Body.position.y = 3;
        rigid.Body.velocity.z = 1;
    }

    Update(){
        
    }
}
