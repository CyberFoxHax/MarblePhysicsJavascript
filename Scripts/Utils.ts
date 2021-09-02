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
