
class _Input{
    GetButton(name:string):boolean{
        
    }

    GetKeyDown():boolean{

    }

    GetAxisRaw(name:string):number{

    }

    GetMouseButtonDown(button:number): boolean{
        return false;
    }

    
    private _mouseDelta: THREE.Vector2 = new THREE.Vector2();

    public GetAxis(name:string): number{
        switch (name) {
            case "Mouse X":
                return this._mouseDelta.x;
            case "Mouse Y":
                return this._mouseDelta.y;
            default:
                break;
        }
    }

    public OnFrameEnd(){
        this._mouseDelta = new THREE.Vector2();
    }

    public Init(renderer:HTMLElement){
        var lastPos: THREE.Vector2;
        var _this = this;
        renderer.addEventListener("mousemove", function(e: MouseEvent){
            var newPos = new THREE.Vector2(e.clientX, e.clientY);
            if(lastPos == null){
                lastPos = newPos;
                return;
            }
            _this._mouseDelta = new THREE.Vector2(
                lastPos.x - newPos.x,
                lastPos.y - newPos.y,
            );
            lastPos = newPos;
        });
    }
}