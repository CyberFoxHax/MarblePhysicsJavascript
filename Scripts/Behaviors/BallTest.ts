class BallTest extends MonoBehaviour {

    Start(){
        var rigid = this.gameObject.GetComponent(Rigidbody);
        rigid.IsKinematic = true;
        this.transform.position.y = 3;
    }

    Update(){
        this.transform.position.y -= Time.deltaTime;
    }
}
