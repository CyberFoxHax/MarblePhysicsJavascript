

class OrbitCamera extends MonoBehaviour {
    Update = null;

	public distance : number = 2;
	public yaw : number =  0;
	public pitch : number = Math.PI/8;

	public cameraSpeed : number = 0.01;
	public invertX : boolean = false;
	public invertY : boolean = false;

	public target: THREE.Object3D = null;

	/*public pitchRange : RangeAttribute;
	public yawRange : RangeAttribute;*/

	// Use this for initialization
	Start() {
		var posStorage = <string>localStorage["camPos"];
		if(posStorage != null){
			var split = posStorage.split(",")
			this.yaw = parseFloat(split[0]);
			this.pitch = parseFloat(split[1]);
		}

		var ball = FindObjectsOfType(BallTest);
		this.target = ball[0].transform;
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

		var actualDistance = this.distance;

		//Easy lock to the object
		var position: THREE.Vector3 = this.target.position.clone();

		//Rotate by pitch and yaw (and not roll, oh god my stomach)
		//C#: Quaternion rotation = Quaternion.AngleAxis(yaw, Vector3.up);
		var rotation: THREE.Quaternion = new THREE.Quaternion().setFromAxisAngle(_Vector3.up, this.yaw);
		//C#: rotation *= Quaternion.AngleAxis(pitch, Vector3.right);
		rotation.multiply(new THREE.Quaternion().setFromAxisAngle(_Vector3.right, this.pitch));

		//Offset for orbiting
		//C#: position += rotation * new Vector3(0.0f, 0.0f, -actualDistance);
		position.add(OrbitCamera.MultiplyRotation(rotation, new THREE.Vector3(0, 0, actualDistance)));

		//Lame way of updating the transform
		this.transform.quaternion.copy(rotation);
		this.transform.position.copy(position);

		localStorage["camPos"] = this.yaw +","+this.pitch;
	}

	// https://github.com/Unity-Technologies/UnityCsReference/blob/61f92bd79ae862c4465d35270f9d1d57befd1761/Runtime/Export/Math/Quaternion.cs#L91
	public static MultiplyRotation(rotation:THREE.Quaternion, point:THREE.Vector3): THREE.Vector3 {
		var x = rotation.x * 2;
		var y = rotation.y * 2;
		var z = rotation.z * 2;
		var xx = rotation.x * x;
		var yy = rotation.y * y;
		var zz = rotation.z * z;
		var xy = rotation.x * y;
		var xz = rotation.x * z;
		var yz = rotation.y * z;
		var wx = rotation.w * x;
		var wy = rotation.w * y;
		var wz = rotation.w * z;

		var res = new THREE.Vector3();
		res.x = (1 - (yy + zz)) * point.x + (xy - wz) * point.y + (xz + wy) * point.z;
		res.y = (xy + wz) * point.x + (1 - (xx + zz)) * point.y + (yz - wx) * point.z;
		res.z = (xz - wy) * point.x + (yz + wx) * point.y + (1 - (xx + yy)) * point.z;
		return res;
	}
}
