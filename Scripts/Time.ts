class _Time{
    public PhysicsTimeStep: number = 0.005;
    public deltaTime:number;
    public fixedDeltaTime:number;
    public fixedTime:number;
    public time:number;

    private startTime: number;
    private physicsInterval: number;
    private lastFrameTime: number;

    private static GetNow(): number{
        return performance.now() / 1000;
    }

    public OnInit(){
        this.lastFrameTime = _Time.GetNow();
        this.startTime = _Time.GetNow();
        this.physicsInterval = this.PhysicsTimeStep;
        if(this.physicsInterval < 1000/60){
            this.physicsInterval = 1000/60;
        }
        this.fixedTime = 0;
    }

    private OnPhysicsFrame(){
        if(this.OnPhysicsStart != null)
            this.OnPhysicsStart();
        this.fixedDeltaTime = this.PhysicsTimeStep;
        while(this.fixedTime < this.time){
            this.fixedTime += this.fixedDeltaTime;
            if(this.OnPhysicsStep != null)
                this.OnPhysicsStep();
        }
    }
    
    public OnFrame(){
        var now = _Time.GetNow();
        this.time = now - this.startTime;
        this.deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        if(this.fixedTime == 0){
            this.fixedTime = this.time;
            (function(_this:_Time){
                function Physicstep(){
                    _this.OnPhysicsFrame();
                    setTimeout(Physicstep, _this.physicsInterval - _this.fixedDeltaTime*1000);
                }
                Physicstep();
            })(this);
        }
    }

    public OnPhysicsStart: ()=>void;
    public OnPhysicsStep: ()=>void;
}