function log(item){
    printErr(JSON.stringify(item, null, ' '));
}

function sort(arr,item, secondItem){
    return arr.slice().sort(function(a, b) {
              var compareA = a[item];
              var compareB = b[item];
              var compareC = a[secondItem];
              var compareD = b[secondItem];
              if (compareA < compareB) {
                return -1;
              }
              if (compareA > compareB) {
                return 1;
              }
              if(secondItem){
                if (compareC < compareD) {
                    return -1;
                }
                if (compareC > compareD) {
                    return 1;
                }
            }              
              return 0;
    });     
}

function getPlayer() {
    var player = {};
    player.x = null,
    player.y= null,
    player.getMove=function(){            
        if(this.x === null || this.y===null){
            print('WAIT');
        } else {
            print(this.x + " " + this.y+ " " + "250");
        }
    };
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
    playerDestroyer:{},
    playerReaper:{},        
    updateInput : function(){
        this.myScore = parseInt(readline());       
        this.enemyScore1 = parseInt(readline());
        this.enemyScore2 = parseInt(readline());
        this.myRage = parseInt(readline());
        this.enemyRage1 = parseInt(readline());
        this.enemyRage2 = parseInt(readline());
        this.unitCount = parseInt(readline());
        this.updateCollections();
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
        }
    },
    assignMoves:function(){      
        let playerReaper = this.reapers.find(reaper=>{return reaper.playerId ===0});
        let playerDestroyer = this.destroyers.find(destroyer=>{return destroyer.playerId ===0}); 
        
        let wrecks = this.wrecks.map(wreck=>{
            return {
                wreck:wreck,
                distance:this.getVectorLength(playerReaper.x,playerReaper.y,wreck.x,wreck.y)}
            });
        let orderedWrecks = sort(wrecks,"distance");
        if(orderedWrecks.length>0){
            this.playerReaper.x = orderedWrecks[0].wreck.x;
            this.playerReaper.y = orderedWrecks[0].wreck.y;  
        }   
        
        let tankers = this.tankers.map(tanker=>{
            return {
                tanker:tanker,
                distance:this.getVectorLength(playerDestroyer.x,playerDestroyer.y,tanker.x,tanker.y)}
        });
        let orderedTankers = sort(tankers,"distance");
        if(orderedTankers.length>0){
            this.playerDestroyer.x = orderedTankers[0].tanker.x;
            this.playerDestroyer.y = orderedTankers[0].tanker.y;  
        }      
    },
    makeMoves:function(){
        this.playerReaper.getMove();      
        this.playerDestroyer.getMove();         
        print('WAIT');
    },
    updateWrecks: function(unit){
        if(unit.unitType ==4){
            this.wrecks.push(unit);
        }
    },
    updateDestroyers: function(unit){
        if(unit.unitType ==1){
            this.destroyers.push(unit);
        }
    },
    updateTankers: function(unit){
        if(unit.unitType ==3){
            this.tankers.push(unit);
        }
    },
    updateReapers: function(unit){
        if(unit.unitType === 0){
            this.reapers.push(unit);           
        }
    },
    updateCollections:function(){
        this.wrecks = [];
        this.reapers = [];
        this.tankers = [];
        this.destroyers = [];
    },
    getVectorLength: function(x,y,xx,yy){
        var dx = x-xx;
        var dy = y-yy;
        return Math.sqrt((dx*dx)+(dy*dy));
    }    
};

game.playerDestroyer = getPlayer();
game.playerReaper = getPlayer();

// game loop
while (true) { 
    game.updateInput();
    game.assignMoves();
    game.makeMoves();
}