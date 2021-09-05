function clamp(num: number, min: number, max: number) {
	return num < min 
	  ? min 
	  : num > max 
		? max 
		: num
}

class Ref<T> {
	constructor(value:T) {
		this.v = value;
	}
	public v:T;
}

class Movement extends MonoBehaviour
{
	private _camera: OrbitCamera;

	// Via Marble Blast
	public MaxRollVelocity = 15;
	public AngularAcceleration = 75;
	public BrakingAcceleration = 30;
	public AirAcceleration = 5;
	public Gravity = 20;
	public StaticFriction = 1.1;
	public KineticFriction = 0.7;
	public BounceKineticFriction = 0.2;
	public MaxDotSlide = 0.5;
	public JumpImpulse = 7.5;
	public MaxForceRadius = 50;
	public MinBounceVel = 0.1;
	public BounceRestitution = 0.5;

	private _remainingTime = 0.0;

	// TODO: Clean up / rename the following
	private get CameraX():number { return this._camera.yaw; }
	private get CameraY():number { return this._camera.pitch; }
	private Velocity: THREE.Vector3 = _Vector3.zero;
	private AngularVelocity: THREE.Vector3 = _Vector3.zero;
	private get Radius() { return 0.2; }

	private get InputMovement():THREE.Vector2 {
        return new THREE.Vector2(-Input.GetAxisRaw("Horizontal"), Input.GetAxisRaw("Vertical")).add(this._fakeInput);
    }
	private _fakeInput: THREE.Vector2 = _Vector2.zero;

	private get Jump() { return Input.GetButton("Jump"); }

	private GravityDir: THREE.Vector3 = new THREE.Vector3(0,-1,0);
	private _forwards = _Vector3.forward;

	private _bounceYet: boolean;
	private _bounceSpeed: number;
	private _bouncePos: THREE.Vector3;
	private _bounceNormal: THREE.Vector3;
	private _slipAmount: number;
	private _contactTime: number;
	private _rollVolume: number;

	//private _colTests: MeshCollider[];

	//private _meshes: MeshData[];

	private _rigidBody: Rigidbody;
	//private _collider: SphereCollider;
	private _collisions: number;
	private _lastJump: number;
	private _lastNormal: THREE.Vector3;

	Start(): void {
		this._camera = FindObjectsOfType(OrbitCamera)[0];
		this._rigidBody = this.gameObject.GetComponent(Rigidbody);
		//this._rigidBody.maxAngularVelocity = Infinity;
		//this._collider = this.gameObject.GetComponent(SphereCollider);
        //this._meshes = [];
		//this._colTests = [];

        /*var meshColliders: MeshCollider[] = FindObjectsOfType(MeshCollider);
        for (let i = 0; i < meshColliders.length; i++) {
            const item = meshColliders[i];
            this._colTests.push(item);
        }

        for (let i = 0; i < this._colTests.length; i++) {
            this.GenerateMeshInfo(array[i]);
        }*/
	}

	/*private GenerateMeshInfo(meshCollider: CANNON.Body): void
	{
		var sharedMesh = meshCollider.sharedMesh;
		var triangles = sharedMesh.triangles;
       	var vertices = sharedMesh.vertices;
        
        var md = new MeshData();
        md.Triangles = triangles;
        md.Vertices = vertices;
		this._meshes.push(md);
	}*/
	
	/*public AddMesh(meshCollider: MeshCollider): void
	{
		this._colTests.push(meshCollider);
		this.GenerateMeshInfo(meshCollider);
	}*/

	Update(){
		
	}
	
	// Per-tick updates
	FixedUpdate(): void
	{
		var dt: number = Time.fixedDeltaTime;
		this._remainingTime += dt;
		while (this._remainingTime > 0.008)
		{
			var loopTime: Ref<number> = new Ref(0.008);
			this._advancePhysics(loopTime);
			this._remainingTime -= loopTime.v;
		}
	}

    _advancePhysics(dt: Ref<number>): void {
		var contacts: CollisionInfo[] = [];
		var pos: Ref<THREE.Vector3> = new Ref(this.transform.position);
		var rot: Ref<THREE.Quaternion> = new Ref(this.transform.quaternion);
		var velocity: Ref<THREE.Vector3> = new Ref(this.Velocity);
		var omega: Ref<THREE.Vector3> = new Ref(this.AngularVelocity);
		
		for (let i = 0; i < this._rigidBody.collisions.length; i++) {
			var contact = this._rigidBody.collisions[i];
			var col = new CollisionInfo();
			//col.Penetration = -contact.separation;
			col.Penetration = 1;
			col.Restitution = 1;
			col.Friction = 1;
			col.Normal = new THREE.Vector3(
				-contact.ni.x,
				-contact.ni.y,
				-contact.ni.z
			);
			col.Point = new THREE.Vector3(
				contact.bi.position.x,
				contact.bi.position.y-this.Radius,
				contact.bi.position.z
			);
			col.Velocity = _Vector3.zero;
			contacts.push(col);
			//Debug.DrawRay(contact.point, contact.normal, Color.blue, 5);
		}
        

        this._updateMove(dt, velocity, omega, contacts);
		// velocity += _gravityDir * _gravity * dt;

		this._updateIntegration(dt.v, pos, rot, velocity, omega);

        //if (this.useUnityContacts == true) {
        	Rigidbody.Copy(this.transform, this._rigidBody.Body);
            //this._rigidBody.MoveRotation(rot);
        /*}
        else {
		    this.transform.position.copy(pos.v);
		    this.transform.quaternion.copy(rot.v);
        }*/
		this.Velocity = velocity.v;
		this._rigidBody.Body.velocity.x = this.Velocity.x;
		this._rigidBody.Body.velocity.y = this.Velocity.y;
		this._rigidBody.Body.velocity.z = this.Velocity.z;
		this._rigidBody.Body.angularVelocity.x = omega.v.x;
		this._rigidBody.Body.angularVelocity.y = omega.v.y;
		this._rigidBody.Body.angularVelocity.z = omega.v.z;
		this.AngularVelocity = omega.v;
	}

	private _updateIntegration(dt: number, pos: Ref<THREE.Vector3>, rot: Ref<THREE.Quaternion>, vel: Ref<THREE.Vector3>, avel: Ref<THREE.Vector3>): void
	{
		pos.v.add(vel.v.clone().multiplyScalar(dt));
		var vector3:THREE.Vector3 = avel.v;
		var num1:number = vector3.length();
		if (num1 <= 0.0000001)
			return;
		var quaternion: THREE.Quaternion = new THREE.Quaternion().setFromAxisAngle(vector3.clone().multiplyScalar(1 / num1), dt * num1);
		quaternion.normalize();
		rot.v.copy(quaternion.clone().multiply(rot.v));
		rot.v.normalize();
	}

	private _updateMove(
		dt: Ref<number>,
		velocity: Ref<THREE.Vector3>,
		angVelocity: Ref<THREE.Vector3>,
		contacts: CollisionInfo[]): void
	{
		var torque: Ref<THREE.Vector3> = new Ref(new THREE.Vector3());
		var targetAngVel: Ref<THREE.Vector3> = new Ref(new THREE.Vector3());
		var isMoving = this._computeMoveForces(angVelocity.v, torque, targetAngVel);
		this._velocityCancel(contacts, velocity, angVelocity, !isMoving, false);
        var externalForces: Ref<THREE.Vector3> = new Ref(this._getExternalForces(dt.v, contacts));
        var angAccel: Ref<THREE.Vector3> = new Ref<THREE.Vector3>(null);
		this._applyContactForces(dt.v, contacts, !isMoving, torque.v, targetAngVel.v, velocity, angVelocity, externalForces, angAccel);
		velocity.v.add(externalForces.v.clone().multiplyScalar(dt.v));
		angVelocity.v.add(angAccel.v.clone().multiplyScalar(dt.v));
		this._velocityCancel(contacts, velocity, angVelocity, !isMoving, true);
		var contactTime: number = dt.v;
		// testMove(ref contactTime, ...)
		if (dt.v * 0.99 > contactTime)
		{
			velocity.v.sub(externalForces.v.clone().multiplyScalar(dt.v - contactTime));
			angVelocity.v.sub(angAccel.v.clone().multiplyScalar(dt.v - contactTime));
			dt.v = contactTime;
		}
		
		if (contacts.length != 0)
			this._contactTime += dt.v;
	}

	private _computeMoveForces(angVelocity: THREE.Vector3, torque: Ref<THREE.Vector3>, targetAngVel: Ref<THREE.Vector3>): boolean
	{
		torque.v = _Vector3.zero;
		targetAngVel.v = _Vector3.zero;
		var relGravity: THREE.Vector3 = this.GravityDir.clone().negate().multiplyScalar(this.Radius);
        var topVelocity: THREE.Vector3 = angVelocity.clone().cross(relGravity);
        var sideDir: Ref<THREE.Vector3> = new Ref(new THREE.Vector3());
        var motionDir: Ref<THREE.Vector3> = new Ref(new THREE.Vector3());
        var _: Ref<THREE.Vector3> = new Ref(new THREE.Vector3());
		this._getMarbleAxis(sideDir, motionDir, _);
		var topY: number = topVelocity.clone().dot(motionDir.v);
		var topX: number = topVelocity.clone().dot(sideDir.v);
		var move: THREE.Vector2 = this.InputMovement;
		// move.Normalize();
		var moveY: number = this.MaxRollVelocity * -move.y;
		var moveX: number = this.MaxRollVelocity * move.x;
		if (Math.abs(moveY) < 0.001 && Math.abs(moveX) < 0.001)
			return false;
		if (topY > moveY && moveY > 0.0)
			moveY = topY;
		else if (topY < moveY && moveY < 0.0)
			moveY = topY;
		if (topX > moveX && moveX > 0.0)
			moveX = topX;
		else if (topX < moveX && moveX < 0.0)
			moveX = topX;

		var ddd = motionDir.v
			.clone()
			.multiplyScalar(moveY)
			.add(sideDir.v.multiplyScalar(moveX));
		targetAngVel.v = relGravity.clone().cross(ddd).divideScalar(relGravity.lengthSq());
		torque.v = targetAngVel.v.clone().sub(angVelocity);
		var targetAngAccel: number = torque.v.length();
		if (targetAngAccel > this.AngularAcceleration)
		{
			torque.v.multiplyScalar(this.AngularAcceleration / targetAngAccel);
		}

		return true;
	}

	private _getMarbleAxis(sideDir: Ref<THREE.Vector3>, motionDir: Ref<THREE.Vector3>, upDir: Ref<THREE.Vector3>): void
	{
		var m = new THREE.Quaternion().setFromEuler(new THREE.Euler(this.CameraY, 0, 0))
			.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.CameraX, 0)));
		upDir.v = this.GravityDir.clone().negate();
		motionDir.v = MultiplyRotation(m, this._forwards);
		sideDir.v = motionDir.v.clone().cross(upDir.v);
		sideDir.v.normalize();
		motionDir.v = upDir.v.clone().cross(sideDir.v);
	}

	private _getExternalForces(dt: number, contacts: CollisionInfo[]): THREE.Vector3
	{
		var force: THREE.Vector3 = this.GravityDir.clone().multiplyScalar(this.Gravity);
		if (contacts.length == 0)
		{
            var sideDir: Ref<THREE.Vector3> = new Ref(new THREE.Vector3());
            var motionDir: Ref<THREE.Vector3> = new Ref(new THREE.Vector3());
            var _: Ref<THREE.Vector3> = new Ref(new THREE.Vector3());
			this._getMarbleAxis(sideDir, motionDir, _);
			force.add(
				sideDir.v.clone().multiplyScalar(this.InputMovement.x)
				.add(motionDir.v.clone().multiplyScalar(this.InputMovement.y))
				.multiplyScalar(this.AirAcceleration)
			);
		}

		return force;
	}

	private _velocityCancel(contacts: CollisionInfo[], velocity: Ref<THREE.Vector3>, omega: Ref<THREE.Vector3>, surfaceSlide: boolean, noBounce: boolean): void
	{
		var flag1: boolean = false;
		var iterations: number = 0;
		var done: boolean = false;
		while (!done) {
			done = true;
            ++iterations;
            for (let i = 0; i < contacts.length; i++) {
                const coll = contacts[i];
				var relativeVelocity: THREE.Vector3 = velocity.v.clone().sub(coll.Velocity);
				var bounceSpeed: number = coll.Normal.clone().dot(relativeVelocity);
				if (!flag1 && bounceSpeed < 0.0 || bounceSpeed < -0.001)
				{
					var invBounce: THREE.Vector3 = coll.Normal.clone().multiplyScalar(bounceSpeed);
					// _reportBounce(contacts[index].point, contacts[index].normal, -num3);
					if (noBounce)
					{
						velocity.v.sub(invBounce);
					}
					else if (coll.Collider != null)
					{
						var contact: CollisionInfo = coll;
                        /*if (false && contact.Collider.GetComponent<Movement>() is Movement owner) {
						    float num5 = 1f;
						    float num6 = 1f;
						    float num7 = 0.5f;
                            var vector3_4 =
                            (
                                (
                                    THREE.Vector3.Dot(
                                        (
                                            (velocity * num5) -
                                            (owner.Velocity * num6)
                                        ),
                                        contact.Normal
                                    ) *
                                    contact.Normal
                                ) *
                                (1f + num7)
                            );

                            /*THREE.Vector3.op_Multiply(
                                THREE.Vector3.op_Multiply(
                                    THREE.Vector3.Dot(
                                        THREE.Vector3.op_Subtraction(
                                            THREE.Vector3.op_Multiply(velocity, num5),
                                            THREE.Vector3.op_Multiply(owner.Velocity, num6)
                                        ),
                                        contact.normal
                                    ),
                                    contact.normal
                                ),
                                1f + num7
                            );*/
						    /*velocity = velocity - (vector3_4 / num5);
						    //velocity = THREE.Vector3.op_Subtraction(velocity, THREE.Vector3.op_Division(vector3_4, num5));
						    var moveComponent = owner;
						    moveComponent.Velocity = moveComponent.Velocity + (vector3_4 / num6);
						    //moveComponent.Velocity = THREE.Vector3.op_Addition(moveComponent.Velocity, THREE.Vector3.op_Division(vector3_4, num6));
						    contact.Velocity = owner.Velocity;
						    //contacts[index] = contact; // ?
						}
						else
						{*/
						    var num5: number = 0.5;
						    var vector34: THREE.Vector3 = contact.Normal.clone().multiplyScalar(velocity.v.dot(contact.Normal) * (1 + num5));
						    velocity.v.sub(vector34);
                            
						//}
					}
					else
					{
						if (coll.Velocity.length() > 0.00001 && !surfaceSlide &&
						    bounceSpeed > -this.MaxDotSlide * velocity.v.length())
						{
							velocity.v.sub(invBounce);
							velocity.v.normalize();
							velocity.v.multiplyScalar(velocity.v.length());
							surfaceSlide = true;
						}
						else if (bounceSpeed > -this.MinBounceVel)
						{
							velocity.v.sub(invBounce);
						}
						else
						{
							var velocityAdd: THREE.Vector3 = invBounce.multiplyScalar(-(1.0 + this.BounceRestitution * coll.Restitution));
							var velocityAtContact: THREE.Vector3 = relativeVelocity.clone().add(omega.v.clone().cross(coll.Normal.clone().negate()).multiplyScalar(this.Radius));
							var num5: number = -coll.Normal.clone().dot(relativeVelocity);
							var vector36: THREE.Vector3 = velocityAtContact.sub(coll.Normal.clone().multiplyScalar(coll.Normal.clone().dot(relativeVelocity)));
							//var vector36: THREE.Vector3 = velocityAtContact - coll.Normal * THREE.Vector3.Dot(coll.Normal, relativeVelocity);
							var num6: number = vector36.length();
							if (Math.abs(num6) > 0.001)
							{
                                var inertia: number = 
                                    (5.0 * (this.BounceKineticFriction * coll.Friction) * num5 /
								    (2.0 * this.Radius));
								if (inertia > num6 / this.Radius)
									inertia = num6 / this.Radius;
								var vector37: THREE.Vector3 = vector36.clone().divideScalar(num6);
								var vAtC: THREE.Vector3 = coll.Normal.clone().negate().cross(vector37.clone().negate());
								var vector38: THREE.Vector3 = vAtC.clone().multiplyScalar(inertia);
								omega.v.add(vector38);
								velocity.v.sub(vector38.clone().negate().cross(coll.Normal.clone().negate().multiplyScalar(this.Radius)));
							}

							velocity.v.add(velocityAdd);
						}
					}

					done = false;
				}
			}

			flag1 = true;
			if (iterations > 6 && noBounce)
				done = true;

            if (iterations > 1e7) {
                console.log("Collision lock");
                break;
            }
		}

		if (velocity.v.lengthSq() >= 625.0)
			return;
		var flag3: boolean = false;
		var vector39: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
		for (var index = 0; index < contacts.length; ++index)
		{
			var vector32: THREE.Vector3 = vector39.clone().add(contacts[index].Normal);
			if (vector32.lengthSq() < 0.01)
				vector32.add(contacts[index].Normal);
			vector39 = vector32;
			flag3 = true;
		}

		if (!flag3)
			return;
		vector39.normalize();
		var num8: number = 0.0;
		for (var index = 0; index < contacts.length; ++index)
		{
			if (contacts[index].Penetration < this.Radius)
			{
				var num3: number = 0.1;
				var penetration: number = contacts[index].Penetration;
				var num4: number = velocity.v.add(vector39.clone().multiplyScalar(num8)).dot(contacts[index].Normal);
				if (num3 * num4 < penetration)
					num8 += (penetration - num4 * num3) / num3 / contacts[index].Normal.dot(vector39);
			}
		}

		var num9: number = clamp(num8, -25, 25);
		velocity.v.add(vector39.multiplyScalar(num9));
	}


	private _applyContactForces(
		dt: number,
		contacts: CollisionInfo[],
		isCentered: boolean,
		aControl: THREE.Vector3,
		desiredOmega: THREE.Vector3,
		velocity: Ref<THREE.Vector3>,
		omega: Ref<THREE.Vector3>,
		linAccel: Ref<THREE.Vector3>,
		angAccel: Ref<THREE.Vector3>) : void
	{
		angAccel.v = _Vector3.zero;
		this._slipAmount = 0.0;
		var vector31: THREE.Vector3 = this.GravityDir;
		var index1: number = -1;
		var num1: number = 0.0;
		for (var index2 = 0; index2 < contacts.length; ++index2)
		{
			// if (contacts[index2].collider == null)
			// {
			var num2: number = -contacts[index2].Normal.clone().dot(linAccel.v);
			if (num2 > num1)
			{
				num1 = num2;
				index1 = index2;
			}

			// }
		}

		var collisionInfo: CollisionInfo = index1 != -1 ? contacts[index1] : new CollisionInfo();
		if (index1 != -1 && this.Jump)
		{
			var vector32: THREE.Vector3 = velocity.v.clone().sub(collisionInfo.Velocity);
			var num2: number = collisionInfo.Normal.dot(vector32);
			if (num2 < 0.0)
				num2 = 0.0;
			if (num2 < this.JumpImpulse)
			{
				velocity.v.add(collisionInfo.Normal.clone().multiplyScalar(this.JumpImpulse - num2));
				// MarbleControlComponent._soundBank.PlayCue(MarbleControlComponent._sounds[12]);
			}
		}

		for (var index2 = 0; index2 < contacts.length; ++index2)
		{
			var num2: number = -contacts[index2].Normal.clone().negate().dot(linAccel.v);
			if (num2 > 0.0 && contacts[index2].Normal.dot(velocity.v.clone().sub(contacts[index2].Velocity)) <= 0.00001){
			//if (num2 > 0.0 && THREE.Vector3.Dot(contacts[index2].Normal, velocity - contacts[index2].Velocity) <= 0.00001){
				linAccel.v.add(contacts[index2].Normal.clone().multiplyScalar(num2));
			}
		}

		if (index1 != -1)
		{
			// (collisionInfo.velocity - (collisionInfo.normal * THREE.Vector3.Dot(collisionInfo.normal, collisionInfo.velocity)));
			var vector32: THREE.Vector3 = velocity.v.clone().add(omega.v.clone().cross(collisionInfo.Normal.clone().negate().multiplyScalar(this.Radius)).sub(collisionInfo.Velocity));
			//var vector32: THREE.Vector3 = velocity + THREE.Vector3.Cross(omega, -collisionInfo.Normal * Radius) - collisionInfo.Velocity;
			var num2: number = vector32.length();
			var flag: boolean = false;
			var vector33: THREE.Vector3 = new THREE.Vector3(0,0,0);
			var vector34: THREE.Vector3 = new THREE.Vector3(0,0,0);
			if (num2 != 0.0)
			{
				flag = true;
				var num3: number = this.KineticFriction * collisionInfo.Friction;
				var num4: number = (5.0 * num3 * num1 / (2.0 * this.Radius));
				var num5: number = num1 * num3;
				var num6: number = (num4 * this.Radius + num5) * dt;
				if (num6 > num2)
				{
					var num7: number = num2 / num6;
					num4 *= num7;
					num5 *= num7;
					flag = false;
				}

				var vector35: THREE.Vector3 = vector32.clone().divideScalar(num2);
				vector33 = collisionInfo.Normal.clone().negate().cross(vector35.clone().negate()).multiplyScalar(num4);
				vector34 = vector35.clone().multiplyScalar(-num5);
				this._slipAmount = num2 - num6;
			}

			if (!flag)
			{
				var vector35: THREE.Vector3 = vector31.clone().negate().multiplyScalar(this.Radius);
				var vector36: THREE.Vector3 = vector35.clone().cross(linAccel.v).divideScalar(vector35.lengthSq());
				if (isCentered)
				{
					var vector37: THREE.Vector3 = omega.v.clone().add(angAccel.v).multiplyScalar(dt);
					aControl = desiredOmega.clone().sub(vector37);
					var num3 = aControl.length();
					if (num3 > this.BrakingAcceleration)
						aControl = aControl.clone().multiplyScalar(this.BrakingAcceleration / num3);
				}

				var ddd = collisionInfo.Normal.clone().negate().multiplyScalar(this.Radius)
				var vector38: THREE.Vector3 = aControl.clone().cross(ddd).negate();
				var vector39: THREE.Vector3 = vector36.clone().cross(ddd).add(vector38);
				var num4: number = vector39.length();
				var num5: number = this.StaticFriction * collisionInfo.Friction;
				if (num4 > num5 * num1)
				{
					var num3: number = this.KineticFriction * collisionInfo.Friction;
					vector38.multiplyScalar(num3 * num1 / num4);
				}

				linAccel.v.add(vector38);
				angAccel.v.add(vector36);
			}

			linAccel.v.add(vector34);
			angAccel.v.add(vector33);
		}

		angAccel.v.add(aControl);
	}
}

namespace CollisionHelpers {
    export function ClosestPtPointTriangle(
        pt: THREE.Vector3,
        radius: number,
        p0: THREE.Vector3,
        p1: THREE.Vector3,
        p2: THREE.Vector3,
        normal: THREE.Vector3,
        closest: Ref<THREE.Vector3>): boolean
    {
        closest.v = _Vector3.zero;
        var num1: number = pt.dot(normal);
        var num2: number = p0.dot(normal);
        if (Math.abs(num1 - num2) > radius * 1.1)
            return false;
        closest.v = pt.clone().add(normal.clone().multiplyScalar(num2 - num1));
        if (PointInTriangle(closest.v, p0, p1, p2))
            return true;
		var num3: number = 10;
		var tSeg: Ref<number> = new Ref(null);
		var tCap: Ref<number> = new Ref(null);
        if (IntersectSegmentCapsule(pt, pt, p0, p1, radius, tSeg, tCap) &&
            tSeg.v < num3)
        {
            closest.v = p0.clone().add(p1.clone().sub(p0).multiplyScalar(tCap.v));
            num3 = tSeg.v;
        }

        if (IntersectSegmentCapsule(pt, pt, p1, p2, radius, tSeg, tCap) &&
            tSeg.v < num3)
        {
            closest.v = p1.clone().add(p2.clone().sub(p1)).multiplyScalar(tCap.v);
            num3 = tSeg.v;
        }

        if (IntersectSegmentCapsule(pt, pt, p2, p0, radius, tSeg, tCap) &&
            tSeg.v < num3)
        {
            closest.v = p2.clone().add((p0.clone().sub(p2)).multiplyScalar(tCap.v));
            num3 = tSeg.v;
        }

        return num3 < 1.0;
    }

    export function PointInTriangle(pnt: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): boolean
    {
        a.sub(pnt);
        b.sub(pnt);
        c.sub(pnt);
        var bc: THREE.Vector3 = b.clone().cross(c);
        var ca: THREE.Vector3 = c.clone().cross(a);
        if (bc.dot(ca) < 0.0)
            return false;
        var ab: THREE.Vector3 = a.clone().cross(b);
        return bc.dot(ab) >= 0.0;
    }

    export function IntersectSegmentCapsule(
        segStart: THREE.Vector3,
        segEnd: THREE.Vector3,
        capStart: THREE.Vector3,
        capEnd: THREE.Vector3,
        radius: number,
        seg: Ref<number>,
        cap: Ref<number>): boolean
    {
        var _: Ref<THREE.Vector3> = new Ref(null);
        return ClosestPtSegmentSegment(segStart, segEnd, capStart, capEnd, seg, cap, _, _) < radius * radius;
    }

    export function ClosestPtSegmentSegment(
        p1: THREE.Vector3,
        q1: THREE.Vector3,
        p2: THREE.Vector3,
        q2: THREE.Vector3,
        s: Ref<number>,
        T: Ref<number>,
        c1: Ref<THREE.Vector3>,
        c2: Ref<THREE.Vector3>): number
    {
        var num1: number = 0.0001;
        var vector31: THREE.Vector3 = q1.clone().add(p1);
        var vector32: THREE.Vector3 = q2.clone().add(p2);
		var vector33: THREE.Vector3 = p1.clone().add(p2);
        var num2: number = vector31.dot(vector31);
        var num3: number = vector32.dot(vector32);
        var num4: number = vector32.dot(vector33);
        if (num2 <= num1 && num3 <= num1)
        {
            s.v = T.v = 0.0;
            c1.v = p1;
            c2.v = p2;
            return c1.v.clone().sub(c2.v).dot( c1.v.clone().sub(c2.v) );
        }

        if (num2 <= num1)
        {
            s.v = 0.0;
			T.v = num4 / num3;
            T.v = clamp(T.v, 0.0, 1);
        }
        else
        {
            var num5: number = vector31.dot(vector33);
            if (num3 <= num1)
            {
                T.v = 0.0;
                s.v = clamp(-num5 / num2, 0.0, 1);
            }
            else
            {
                var num6: number = vector31.dot(vector32);
                var num7: number = (num2 * num3 - num6 * num6);
                s.v = num7 == 0.0
                    ? 0.0
                    : clamp((num6 * num4 - num5 * num3) / num7, 0.0, 1);
                T.v = (num6 * s.v + num4) / num3;
                if (T.v < 0.0)
                {
                    T.v = 0.0;
                    s.v = clamp(-num5 / num2, 0.0, 1);
                }
                else if (T.v > 1.0)
                {
                    T.v = 1;
                    s.v = clamp((num6 - num5) / num2, 0.0, 1);
                }
            }
        }

        c1.v = p1.clone().add(vector31.clone().multiplyScalar(s.v));
        c2.v = p2.clone().add(vector32.clone().multiplyScalar(T.v));
        return c1.v.clone().sub(c2.v).dot(
			c1.v.clone().sub(c2.v));
    }
}


class CollisionInfo
{
    public Point: THREE.Vector3;
    public Normal: THREE.Vector3;
    public Velocity: THREE.Vector3;
    public Collider: CANNON.Body;
    public Friction: number;
    public Restitution: number;
    public Penetration: number;
}

/*class MeshData {
    public Triangles: number[];
    public Vertices: THREE.Vector3[];
}*/