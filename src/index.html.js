const remote = require('electron').remote;
const worldTowers = require('./worlds.js');
let LastRing = '';

function isIn(object, string) {
    for (const [key, value] of Object.entries(object)) {
        if (key == string) {
            return value;
        } else {
            return false;
        }
    }
}

function gameLocationUpdated(newLocation) {
    if (newLocation != LastRing) {
        const dropdown = document.getElementById('dropdown')

        const ring = isIn(worldTowers.rings, newLocation);
        const zone = isIn(worldTowers.zones, newLocation);
        if (ring != false) {
            ring.forEach(tower => {
                var el = document.createElement('option');
                el.textContent = tower
                el.value = tower
                dropdown.add(el);
            })
        } else if (zone != false) {
            zone.forEach(tower => {
                var el = document.createElement('option');
                el.textContent = tower
                el.value = tower
                dropdown.add(el);
            })
        }

        dropdown.selectedIndex = "-1";
        LastRing = newLocation
        remote.getCurrentWindow().towerSelected = "Somewhere...";
    }
}

remote.getCurrentWindow().gameLocationUpdated(gameLocationUpdated);