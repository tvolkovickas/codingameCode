function log(item){
    printErr(JSON.stringify(item, null, ' '));
}

function sort(arr,item, asc = true){
    return arr.slice().sort(function(a, b) {
              var compareA = a[item];
              var compareB = b[item];   
              if(asc){
                if (compareA < compareB) {
                    return -1;
                }
                if (compareA > compareB) {
                    return 1;
                } 
              } else {
                if (compareA > compareB) {
                    return -1;
                }
                if (compareA < compareB) {
                    return 1;
                } 
              }
                             
              return 0;
    });     
}

function getVectorLength(x,y,xx,yy){
        var dx = x-xx;
        var dy = y-yy;
        return Math.sqrt((dx*dx)+(dy*dy));
    }   

function getPlayer(isReaper) {
    var player = {};
    player.x = null;
    player.y= null;
    player.px = null;
    player.py = null;
    player.isReaper = isReaper;
    player.useSkill = false;
    player.getMove=function(){            
        if((player.x === null || player.y===null) && !player.useSkill){
            print('WAIT');
        } else if((player.x !== null || player.y!==null) && player.useSkill){
            print("SKILL"+ " "+player.x + " " + player.y);           
        }
        else {     
           print(player.x + " " + player.y+ " " + "300"); 
        }
    };
    player.reset =function(){
        player.x = null;
        player.y = null;
        player.useSkill = false;
    }
    return player;
}

var game = {
    myScore: 0,
    enemyScore1:0,
    enemyScore2:0,
    myRage:0,
    enemyRage1:0,
    enemyRage2: 0,
    unitCount: 0,
    units: [],
    wrecks: [],
    reapers:[],
    destroyers: [],
    tankers:[],
    doofers:[],
    playerDestroyer:{},
    playerReaper:{},  
    playerDoofer:{},
    arenaPoints:[],
    currentPoint:0,
    maxPoints:0,
    updateInput : function(){
        this.myScore = parseInt(readline());       
        this.enemyScore1 = parseInt(readline());
        this.enemyScore2 = parseInt(readline());
        this.myRage = parseInt(readline());
        this.enemyRage1 = parseInt(readline());
        this.enemyRage2 = parseInt(readline());
        this.unitCount = parseInt(readline());
        this.updateCollections();
        this.playerDoofer.reset();
        this.playerReaper.reset();
        this.playerDestroyer.reset();
        for (var i = 0; i < this.unitCount; i++) {
            var inputs = readline().split(' ');
            var unit = {};
            unit.unitId = parseInt(inputs[0]);          
            unit.unitType = parseInt(inputs[1]);
            unit.playerId = parseInt(inputs[2]);
            unit.mass = parseFloat(inputs[3]);
            unit.radius = parseInt(inputs[4]);
            unit.x = parseInt(inputs[5]);
            unit.y = parseInt(inputs[6]);
            unit.vx = parseInt(inputs[7]);
            unit.vy = parseInt(inputs[8]);
            unit.extra = parseInt(inputs[9]);
            unit.extra2 = parseInt(inputs[10]);
            this.updateWrecks(unit);
            this.updateReapers(unit);
            this.updateDestroyers(unit);
            this.updateTankers(unit);
            this.updateDoofers(unit);
        }
    },
    assignMoves:function(){      
        let playerReaper = this.reapers.find(reaper=>{return reaper.playerId ===0});
        this.playerReaper.px = playerReaper.x;
        this.playerReaper.py = playerReaper.y;
            
        let playerDestroyer = this.destroyers.find(destroyer=>{return destroyer.playerId ===0}); 
        let playerDoofer = this.doofers.find(doofer=>{return doofer.playerId ===0}); 
        
        let wrecks = this.wrecks.map(wreck=>{
            return {
                wreck:wreck,
                distance:getVectorLength(playerReaper.x,playerReaper.y,wreck.x,wreck.y)
                };
            });
        let orderedWrecks = sort(wrecks,"distance");       
        if(orderedWrecks.length>0){          
            this.playerReaper.x = orderedWrecks[0].wreck.x-playerReaper.vx;
            this.playerReaper.y = orderedWrecks[0].wreck.y-playerReaper.vy;
        }
        
        //destroyer
        let tankers = this.tankers.map(tanker=>{
            return {
                tanker:tanker,
                distance:getVectorLength(playerDestroyer.x,playerDestroyer.y,tanker.x,tanker.y)
                };
        });
        let orderedTankers = sort(tankers,"distance");
        let reapers = this.reapers.map(reaper=>{
            return {
                reaper:reaper,
                distance:getVectorLength(playerDestroyer.x,playerDestroyer.y,reaper.x,reaper.y)
                };
        });
        let orderedReapers = sort(reapers,"distance");
        let enemyReaper = orderedReapers.find(reaper=>{return reaper.reaper.playerId !==0});      
        if(this.myRage > 60 && enemyReaper && enemyReaper.distance <2000){           
            this.playerDestroyer.x = enemyReaper.reaper.x-playerDestroyer.vx;
            this.playerDestroyer.y = enemyReaper.reaper.y-playerDestroyer.vx; 
            this.playerDestroyer.useSkill = true;           
        } else if(orderedTankers.length>0){
            this.playerDestroyer.x = orderedTankers[0].tanker.x;
            this.playerDestroyer.y = orderedTankers[0].tanker.y;
        }
             
        
        //doofer 
        let distanceToPoint = getVectorLength(
            playerDoofer.x,playerDoofer.y,this.arenaPoints[this.currentPoint].x,this.arenaPoints[this.currentPoint].y);
        if(distanceToPoint < 1000){
            this.currentPoint++;
        }
        
         if(this.currentPoint == this.maxPoints){
            this.currentPoint = 0;
        }
        
        this.playerDoofer.x = this.arenaPoints[this.currentPoint].x;
        this.playerDoofer.y = this.arenaPoints[this.currentPoint].y;
    },
    makeMoves:function(){
        this.playerReaper.getMove();      
        this.playerDestroyer.getMove();         
        this.playerDoofer.getMove();    
    },
    updateWrecks: function(unit){
        if(unit.unitType ===4){
            this.wrecks.push(unit);
        }
    },
    updateDestroyers: function(unit){
        if(unit.unitType ===1){
            this.destroyers.push(unit);
        }
    },
    updateTankers: function(unit){
        if(unit.unitType ===3){
            this.tankers.push(unit);
        }
    },
    updateReapers: function(unit){
        if(unit.unitType === 0){
            this.reapers.push(unit);           
        }
    },
    updateDoofers: function(unit){
        if(unit.unitType === 2){
            this.doofers.push(unit);           
        }
    },
    updateCollections:function(){
        this.wrecks = [];
        this.reapers = [];
        this.tankers = [];
        this.destroyers = [];
        this.doofers = [];
    }    
};

game.playerDestroyer = getPlayer();
game.playerReaper = getPlayer(true);
game.playerDoofer = getPlayer();

for(let angle=0;angle<360;angle+=45){
    let x = 6000 * Math.cos(angle * (Math.PI / 180))  
    let y = 6000 * Math.sin(angle * (Math.PI / 180))
    game.maxPoints++;
    game.arenaPoints.push({x:Math.floor(x),y:Math.floor(y)});
}

// game loop
while (true) { 
    game.updateInput();
    game.assignMoves();
    game.makeMoves();
}