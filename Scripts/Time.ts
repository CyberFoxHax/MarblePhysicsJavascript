class _Time{
    public PhysicsTimeStep: number = 0.005;
    public deltaTime:number;
    public fixedDeltaTime:number;
    public fixedTime:number;
    public time:number;

    private startTime: number;
    private physicsInterval: number;
    private lastFrameTime: number;

    public Init(){
        this.lastFrameTime = performance.now();
        this.startTime = performance.now();
        this.physicsInterval = this.PhysicsTimeStep;
        if(this.physicsInterval < 1000/60){
            this.physicsInterval = 1000/60;
        }
        this.fixedTime = 0;
        var _this = this;
        setInterval(function(){
            _this.OnPhysicsFrame();   
        }, this.physicsInterval);
    }

    private OnPhysicsFrame(){
        if(this.PhysicsStart != null)
            this.PhysicsStart();
        this.fixedDeltaTime = this.PhysicsTimeStep;
        while(this.fixedTime < this.time){
            this.fixedTime += this.fixedDeltaTime;
            if(this.PhysicsStep != null)
                this.PhysicsStep();
        }
    }
    
    public OnFrame(){
        var now = performance.now();
        this.time = now - this.startTime;
        this.deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
    }

    public PhysicsStart: ()=>void;
    public PhysicsStep: ()=>void;
}