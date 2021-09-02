class BallTest extends MonoBehaviour {

    Start(){
		this.transform.position.y = 1;
        spheres.push(this);
        var radius = 0.5;
		this.transform.collider = new THREE.Sphere( this.transform.position, radius );
		this.transform.collider.center = new THREE.Vector3(0,1,0);
        this.transform.velocity = new THREE.Vector3( 0, 0, 0 );
        this.transform.mass = Math.pow( radius, 3 ) * Math.PI * 4 / 3;
    }

    Update(){
		this.transform.position.y -= Time.deltaTime*0.001;
		updateSphereCollisions(Time.deltaTime);
    }
}

var spheres: BallTest[] = [];

const params = {

	displayCollider: false,
	displayBVH: false,
	displayParents: false,
	visualizeDepth: 10,
	gravity: - 9.8,
	physicsSteps: 5,
	// TODO: support steps based on given sphere velocity / radius
	simulationSpeed: 1,
	sphereSize: 1,
	pause: false,

};

function onCollide(object1, object2, point, normal, velocity, offset = 0) {
	console.log(point);
}

function updateSphereCollisions(deltaTime:number) {
	const bvh = superCollider.geometry.boundsTree;
	for ( let i = 0, l = spheres.length; i < l; i ++ ) {

		const sphere = spheres[ i ].transform;
		const sphereCollider = sphere.collider;

		// move the sphere
		//sphere.velocity.y += params.gravity * deltaTime;
		sphereCollider.center.addScaledVector( sphere.velocity, deltaTime );

		// get the sphere position in world space
		var tempSphere = sphere.collider.clone();
        var deltaVec: THREE.Vector3 = new THREE.Vector3();
        var tempVec: THREE.Vector3 = new THREE.Vector3();

		let collided = false;
		bvh.shapecast({
			intersectsBounds: box => {
				return box.intersectsSphere( tempSphere );
			},
			intersectsTriangle: tri => {
				// get delta between closest point and center
				tri.closestPointToPoint( tempSphere.center, deltaVec );
				deltaVec.sub( tempSphere.center );
				const distance = deltaVec.length();
				if ( distance < tempSphere.radius ) {
					// move the sphere position to be outside the triangle
					const radius = tempSphere.radius;
					const depth = distance - radius;
					if(distance != 0)
						deltaVec.multiplyScalar(1/distance);
					tempSphere.center.addScaledVector( deltaVec, depth );
					collided = true;
				}
			},
			traverseBoundsOrder: box => {
				return box.distanceToPoint( tempSphere.center ) - tempSphere.radius;
			},
		});

		if ( collided ) {

			// get the delta direction and reflect the velocity across it
			deltaVec.subVectors( tempSphere.center, sphereCollider.center ).normalize();
			sphere.velocity.reflect( deltaVec );

			// dampen the velocity and apply some drag
			const dot = sphere.velocity.dot( deltaVec );
			sphere.velocity.addScaledVector( deltaVec, - dot * 0.5 );
			sphere.velocity.multiplyScalar( Math.max( 1.0 - deltaTime, 0 ) );

			// update the sphere collider position
			sphereCollider.center.copy( tempSphere.center );

			// find the point on the surface that was hit
			tempVec
				.copy( tempSphere.center )
				.addScaledVector( deltaVec, - tempSphere.radius );
			onCollide( sphere, null, tempVec, deltaVec, dot, 0.05 );

		}
    }
}