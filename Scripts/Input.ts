
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

    private keyboardKeys: Record<string, boolean> = {};
    private OnKeyChanged(key: string, value: boolean){
        this.keyboardKeys[key] = value;

        this._axisRaw.x = 0;
        if(this.keyboardKeys["d"]==true) this._axisRaw.x++;
        if(this.keyboardKeys["a"]==true) this._axisRaw.x--;

        this._axisRaw.y = 0;
        if(this.keyboardKeys["w"]==true) this._axisRaw.y++;
        if(this.keyboardKeys["s"]==true) this._axisRaw.y--;

        this._jump = this.keyboardKeys[" "] == true;
    }

    public Init(renderer:HTMLElement){
        var _this = this;
        window.onkeydown = function(e: KeyboardEvent){
            _this.OnKeyChanged(e.key, true);
        };
        window.onkeyup = function(e: KeyboardEvent){
            _this.OnKeyChanged(e.key, false);
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