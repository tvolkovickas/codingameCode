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
    zone.drones = [];
    return zone;
}

function getDrone(x,y){
    var drone = {};
    drone.x = 0;
    drone.y = 0;  
    drone.px = 0;
    drone.py = 0;
    drone.gotTarget = false;
    return drone;
}

var commander = {
    zones:[],
    drones:[],
    playerID: ID,
    numberOfPlayers: P,
    numberOfDrones: D,
    numberOfZones: Z,
    addZone:function(x,y){
        this.zones.push(getZone(x,y))
    },
    setControllingTeamToZone:function(index,id){
        this.zones[index].teamId = id;
    },
    addDrone:function(){
        this.drones.push(getDrone())
    },
    updateDronePostiion:function(index,x,y){
        this.drones[index].px = x;
        this.drones[index].py = y;
    },
    updateDroneTarget:function(index,x,y){
        this.drones[index].x = x;
        this.drones[index].y = y;
    },
    assignDrone:function(droneIndex,zoneIndex){
        this.zones[zoneIndex].drones.push(droneIndex);  
        this.drones[droneIndex].gotTarget = true;
    },   
    getAvailableDrone: function(x,y){   
        var drones = this.drones.map(function(currentValue,index){
                var dx = x-currentValue.px;
                var dy = y-currentValue.py;
                var distance = Math.sqrt((dx*dx)+(dy*dy));
                return {
                    gotTarget: currentValue.gotTarget,                    
                    distance:distance,
                    index:index
                    };
            });
            drones = drones.sort(function(a, b) {
              var distanceA = a.distance;
              var distanceB = b.distance;
              if (distanceA < distanceB) {
                return -1;
              }
              if (distanceA > distanceB) {
                return 1;
              }
              return 0;
            });             
        return drones.find(function(drone){
            return !drone.gotTarget;
        })
    },
    releaseDrone: function(index){
        this.drones[index].gotTarget = false;
    },
    clearZone: function(index){
        this.zones[index].drones = [];
    },   
    assignDrones: function(){
        for (let i = 0; i < this.numberOfZones; i++) {
            var zone =  this.zones[i];
            if(zone.teamId == -1){
                var drone = this.getAvailableDrone(zone.x,zone.y)
                 if(drone !== undefined){
                    this.updateDroneTarget(drone.index,zone.x,zone.y);
                    this.assignDrone(drone.index,i);
                 }
            }
            if(zone.teamId == this.playerID){               
                for(let i=0;i<zone.drones.length;i++){
                    this.releaseDrone(zone.drones[i]);
                }
                this.clearZone(i); 
            }            
            if(zone.teamId != this.playerID){               
                var drone = this.getAvailableDrone(zone.x,zone.y)
                if(drone !== undefined){
                    this.updateDroneTarget(drone.index,zone.x,zone.y);
                    this.assignDrone(drone.index,i);
                }
            }
        }  
    },
    makeMoves: function(){
        for (var i = 0; i < this.numberOfDrones; i++) {
            print(this.drones[i].x+" "+this.drones[i].y);
        }  
    }
}

for (var i = 0; i < Z; i++) {
    var inputs = readline().split(' ');
    var X = parseInt(inputs[0]); // corresponds to the position of the center of a zone. A zone is a circle with a radius of 100 units.
    var Y = parseInt(inputs[1]); 
    commander.addZone(X,Y);  
}

for(var i=0;i < D; i++){
    commander.addDrone();   
}

//log(commander)

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
            if(i !== ID) continue;
            commander.updateDronePostiion(j,DX,DY);          
        }
    }
   
    commander.assignDrones();
    commander.makeMoves();
}