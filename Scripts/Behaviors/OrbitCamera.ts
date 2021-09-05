
class OrbitCamera extends MonoBehaviour {

	public distance : number = 2;
	public yaw : number =  0;
	public pitch : number = 0;

	public cameraSpeed : number = 5;
	public invertX : boolean = false;
	public invertY : boolean = false;

	public target: THREE.Object3D = null;

	/*public pitchRange : RangeAttribute;
	public yawRange : RangeAttribute;*/

	// Use this for initialization
	Start() {
		var ball = FindObjectOfType(Movement) || FindObjectOfType(BallTest);
		this.target = ball.transform;
	}

	// Update is called once per frame
	Update() {
		if (this.target == null)
			return;

		//if (Input.GetMouseButtonDown(0)) {
			//Cursor.lockState = CursorLockMode.Locked;
		//}

		//if (Cursor.lockState == CursorLockMode.Locked) {
			//Get updates from the input
			this.yaw += this.cameraSpeed * Input.GetAxis("Mouse X") * (this.invertX ? -1 : 1) * THREE.MathUtils.DEG2RAD;
			this.pitch += this.cameraSpeed * Input.GetAxis("Mouse Y") * (this.invertY ? 1 : -1) * THREE.MathUtils.DEG2RAD;
		//}

		var actualDistance = this.distance;

		//Easy lock to the object
		var position: THREE.Vector3 = this.target.position.clone();

		//Rotate by pitch and yaw (and not roll, oh god my stomach)
		var rotation: THREE.Quaternion = new THREE.Quaternion().setFromAxisAngle(_Vector3.up, this.yaw);
		rotation.multiply(new THREE.Quaternion().setFromAxisAngle(_Vector3.right, this.pitch));

		//Offset for orbiting
		position.add(MultiplyRotation(rotation, new THREE.Vector3(0, 0, actualDistance)));

		//Lame way of updating the transform
		this.transform.quaternion.copy(rotation);
		this.transform.position.copy(position);
	}
}
