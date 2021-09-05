function FindObjectOfType<T extends MonoBehaviour>(ctor:new ()=>T): T{
    for (let i = 0; i < scene.length; i++) {
        for (let ii = 0; ii < scene[i].Components.length; ii++){
            if(scene[i].Components[ii].constructor == ctor){
                return <T>scene[i].Components[ii];
            }
        }
    }
    return null;
}

function FindObjectsOfType<T extends MonoBehaviour>(ctor:new ()=>T): T[]{
    var components: T[] = [];
    for (let i = 0; i < scene.length; i++) {
        for (let ii = 0; ii < scene[i].Components.length; ii++){
            if(scene[i].Components[ii].constructor == ctor){
                components.push(<T>scene[i].Components[ii]);
            }
        }
    }
    return components;
}

// https://github.com/Unity-Technologies/UnityCsReference/blob/61f92bd79ae862c4465d35270f9d1d57befd1761/Runtime/Export/Math/Quaternion.cs#L91
function MultiplyRotation(rotation:THREE.Quaternion, point:THREE.Vector3): THREE.Vector3 {
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