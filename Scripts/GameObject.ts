class GameObject {
    public scene: GameObject[];
    public Name: string;
    public Object3D: THREE.Object3D;
    Components: MonoBehaviour[] = [];

    AddComponent<T extends MonoBehaviour>(ctor:new ()=>T):T {
        var p = new ctor();
        this.Components.push(p);
        return p;
    }

    GetComponent<T extends MonoBehaviour>(ctor:new ()=>T):T {
        for (let i = 0; i < this.Components.length; i++){
            if(this.Components[i].constructor == ctor){
                return <T>this.Components[i];
            }
        }
        return null;
    }

}