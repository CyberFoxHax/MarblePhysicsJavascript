

class OrbitCamera extends MonoBehaviour {
    Update = null;

	public distance : number = 2;
	public yaw : number = 0;
	public pitch : number = 0;

	public cameraSpeed : number = 0.01;
	public invertX : boolean = false;
	public invertY : boolean = false;

	public target: THREE.Object3D = null;

	/*public pitchRange : RangeAttribute;
	public yawRange : RangeAttribute;*/

	// Use this for initialization
	Start() {
		for (let i = 0; i < scene.length; i++) {
			if(scene[i].Name == "Box"){
				this.target = scene[i].Object3D;
				break;
			}
		}
	}

	// Update is called once per frame
	LateUpdate() {
		if (this.target == null)
			return;
		
		//if (Input.GetMouseButtonDown(0)) {
			//Cursor.lockState = CursorLockMode.Locked;
		//}

		//if (Cursor.lockState == CursorLockMode.Locked) {
			//Get updates from the input
			this.yaw += this.cameraSpeed * Input.GetAxis("Mouse X") * (this.invertX ? -1 : 1);
			this.pitch += this.cameraSpeed * Input.GetAxis("Mouse Y") * (this.invertY ? 1 : -1);
		//}

		var actualDistance = this.distance;// + (target.GetComponent<Marble>().radius * 2.0f);

		//Easy lock to the object
		var position: THREE.Vector3 = this.target.position;

		//Rotate by pitch and yaw (and not roll, oh god my stomach)
		var rotation: THREE.Quaternion = new THREE.Quaternion().setFromAxisAngle(_Vector3.up, this.yaw);
		rotation.multiply(new THREE.Quaternion().setFromAxisAngle(_Vector3.right, this.pitch));

		//Offset for orbiting
		//position = rotation.multiplyVector3(new THREE.Vector3(0, 0, -actualDistance));
		position = new THREE.Vector3(0, 0, -actualDistance).applyQuaternion(rotation);

		//Lame way of updating the transform
		this.transform.setRotationFromQuaternion(rotation);
		this.transform.position.copy(position);

		this.transform.lookAt(new THREE.Vector3(0,0,0));
	}
}
