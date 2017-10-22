/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs = readline().split(' ');
var P = parseInt(inputs[0]); // number of players in the game (2 to 4 players)
var ID = parseInt(inputs[1]); // ID of your player (0, 1, 2, or 3)
var D = parseInt(inputs[2]); // number of drones in each team (3 to 11)
var Z = parseInt(inputs[3]); // number of zones on the map (4 to 8)

function log(item){
    printErr(JSON.stringify(item, null, ' '));
}

function getZone(x,y){
    var zone = {};
    zone.x = x;
    zone.y = y;
    zone.teamId = -1;
    zone.difficulty = 0;
    zone.playerDrones = 0;
    zone.maxEnemyDrones = 0;
    return zone;
}

function getDrone(){
    var drone = {};
    drone.x = 0;
    drone.y = 0;  
    drone.target = {};
    return drone;
}

function getMove(x,y,moveValue){
    var move = {};
    move.x = x;
    move.y = y;
    move.moveValue = moveValue;
    return move;
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

var commander = {
    zones:[],
    drones:[],   
    controlledZones:0,
    finishedMove: true,
    firstMove:true,
    addZone:function(x,y, index){
        this.zones.push(getZone(x,y));
    },
    updatePlayer:function(playerID,droneIndex,x,y){           
        this.drones[playerID][droneIndex].x = x;
        this.drones[playerID][droneIndex].y = y;
    },
    setControllingTeamToZone:function(index,id){
        this.zones[index].teamId = id;
        this.zones[index].playerDrones = this.getPlayerDronesAtLocation(this.zones[index].x,this.zones[index].y);
        this.zones[index].maxEnemyDrones = this.getMaxEnemyDronesAtLocation(this.zones[index].x,this.zones[index].y);
    },
    getPlayerDronesAtLocation:function(x,y){
        return this.drones.reduce(function(accumulator, currentValue,currentIndex) {
            let numberOfdrones = currentValue.filter(function(drone){
                return drone.x === x && drone.y=== y
             }).length;            
            if((numberOfdrones > accumulator) && currentIndex === ID){
                return accumulator + numberOfdrones;
            } else {
                return accumulator
            }            
        },0);       
    },
    getMaxEnemyDronesAtLocation:function(x,y){
        return this.drones.reduce(function(accumulator, currentValue,currentIndex) {
            let numberOfdrones = currentValue.filter(function(drone){
                return drone.x === x && drone.y=== y
             }).length;            
            if((numberOfdrones > accumulator) && currentIndex !== ID){
                return accumulator + numberOfdrones;
            } else {
                return accumulator
            }            
        },0);       
    },
    calculateDifficulty: function(){
        for(let i=0;i<Z;i++){
            let enemyDrones = this.getMaxEnemyDronesAtLocation(this.zones[i].x,this.zones[i].y);            
            if((this.zones[i].teamId === -1 && enemyDrones === 0) || (this.zones[i].teamId === ID)){
                this.zones[i].difficulty = 0;
            } else if(enemyDrones > 0){
                this.zones[i].difficulty = enemyDrones;
            }
        }
    },
    getVectorLength: function(x,y,xx,yy){
        var dx = x-xx;
        var dy = y-yy;
        return Math.sqrt((dx*dx)+(dy*dy));
    },
    getZoneState: function(zone){
        //state
        //free = 0, fighting = 1, winning = 2      
        if(zone.teamId === -1 && this.getMaxEnemyDronesAtLocation(zone.x,zone.y) ===0){
            return 0;
        }
        if(zone.teamId !== ID){
            return 1;
        }
        if(zone.teamId === ID){
            return 2;
        }
    },
    getMovesForDrone: function(drone){
        let moves = [];
        let zones = [];
        for(let i=0;i<Z;i++){
            let lengthToZone = this.getVectorLength(drone.x,drone.y,this.zones[i].x,this.zones[i].y);
            let zoneState = this.getZoneState(this.zones[i]);
            zones.push({zone:this.zones[i], distance: lengthToZone, state: zoneState});
        }
        zones = sort(zones,"state","distance");       
        zones.forEach(function(currentValue,index){          
            moves.push(getMove(currentValue.zone.x,currentValue.zone.y,index))
        })            
        return moves;
    },
    checkTarget:function(){
        this.finishedMove = true;
        for(let i=0;i<D;i++){
            if(this.drones[ID][i].x !== this.drones[ID][i].target.x && 
                this.drones[ID][i].y !== this.drones[ID][i].target.y)
            {
                this.finishedMove = false;
            }           
        }
    },
    getControlledZones: function(zones){
        return zones.reduce(function(accumulator, currentValue) {                
                return accumulator + (currentValue.teamId === ID ? 1 : 0);
        },0);
    },
    getNewTeamIDForZones:function(newZones,drone,move){
        if(Object.keys(drone.target).length === 0){
            return newZones;
        }      
        let currentZone = newZones.findIndex(function(nz){
            return nz.x === drone.x && nz.y=== drone.y;
        })       
        let targetZone = newZones.findIndex(function(nz){
            return nz.x === move.x && nz.y=== move.y;
        })   
         if(currentZone === -1 || targetZone === -1){
            return newZones;
        }
        newZones[currentZone].playerDrones -=1;
        newZones[targetZone].playerDrones +=1;
        if(newZones[currentZone].playerDrones < newZones[currentZone].maxEnemyDrones){
            newZones[currentZone].teamId = -99
        }
        if(newZones[targetZone].playerDrones > newZones[targetZone].maxEnemyDrones){
            newZones[targetZone].teamId = ID
        }
        
        return newZones;
    },
    assignDrones: function(){        
        if(this.finishedMove){
            this.controlledZones = this.getControlledZones(this.zones)  
            let compareZones = this.zones.slice(); 
            let compareControlledZones = this.controlledZones;
            for(let i=0;i<D;i++){                
                let moves = sort(this.getMovesForDrone(this.drones[ID][i]),"moveValue");                
                for(let j=0;j<moves.length;j++){     
                    let newZones = compareZones.slice();
                    newZones = this.getNewTeamIDForZones(newZones,this.drones[ID][i],moves[j]);
                    let newControlledZones = this.getControlledZones(newZones)
                    if(newControlledZones > compareControlledZones || this.firstMove){
                        this.drones[ID][i].target = moves[j];                       
                        compareZones = newZones;
                        compareControlledZones=newControlledZones
                        break;
                    }
                }
                //for each, until best score is reached
                //get all actions and see which one is the best one to do first                         
            } 
            this.firstMove = false;
        }
        this.checkTarget();       
    },  
    makeMoves: function(){
        for (let i = 0; i < D; i++) {                   
            let x = this.drones[ID][i].target.x;
            let y = this.drones[ID][i].target.y;
            print(x+" "+y);
        }  
    }
}

for (var i = 0; i < Z; i++) {
    var inputs = readline().split(' ');
    var X = parseInt(inputs[0]); // corresponds to the position of the center of a zone. A zone is a circle with a radius of 100 units.
    var Y = parseInt(inputs[1]); 
    commander.addZone(X,Y, i);  
}

for(let i=0;i < P; i++){
    commander.drones.push([]); 
    for(let j=0;j < D; j++){
        commander.drones[i].push(getDrone())  
    }     
}

let numberOfzonesToControl = Math.round((Z/2)+0.9); 

// game loop
while (true) {    
    for (var i = 0; i < Z; i++) {       
        var TID = parseInt(readline()); // ID of the team controlling the zone (0, 1, 2, or 3) or -1 if it is not controlled. The zones are given in the same order as in the initialization.
        commander.setControllingTeamToZone(i,TID)
    }
  
    for (var i = 0; i < P; i++) {
        for (var j = 0; j < D; j++) {            
            var inputs = readline().split(' ');
            var DX = parseInt(inputs[0]); // The first D lines contain the coordinates of drones of a player with the ID 0, the following D lines those of the drones of player 1, and thus it continues until the last player.
            var DY = parseInt(inputs[1]);                       
            commander.updatePlayer(i,j,DX,DY);
        }
    }        
    commander.assignDrones();
    commander.makeMoves();   
}