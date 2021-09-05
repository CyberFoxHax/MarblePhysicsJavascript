
class _Input{
    GetButton(name:string):boolean{
        switch (name) {
            case "Jump":
                return  this._jump;
        }
    }

    GetKeyDown():boolean{
        return false;
    }

    private _jump: boolean = false;
    private _axisRaw:THREE.Vector2 = new THREE.Vector2();
    GetAxisRaw(name:string):number{
        switch (name) {
            case "Horizontal":
                return this._axisRaw.x;
            case "Vertical":
                return this._axisRaw.y;
        }
        return 0;
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
        var _this = this;
        window.onkeydown = function(e: KeyboardEvent){
            switch (e.key) {
                case "w": _this._axisRaw.y = 1; break;
                case "a": _this._axisRaw.x = -1; break;
                case "s": _this._axisRaw.y = -1; break;
                case "d": _this._axisRaw.x = 1; break;
                case " ": _this._jump = true; break;
            }
        };
        window.onkeyup = function(e: KeyboardEvent){
            switch (e.key) {
                case "w": _this._axisRaw.y = 0; break;
                case "a": _this._axisRaw.x = 0; break;
                case "s": _this._axisRaw.y = 0; break;
                case "d": _this._axisRaw.x = 0; break;
                case " ": _this._jump = false; break;
            }
        };

        renderer.addEventListener("mousemove", function(e: MouseEvent){
            if(document.pointerLockElement != renderer)
                return;
            _this._mouseDelta = new THREE.Vector2(
                e.movementX/33,
                e.movementY/33,
            );
        });
    }
}