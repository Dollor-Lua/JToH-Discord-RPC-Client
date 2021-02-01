const remote = require('electron').remote;
const worldTowers = require('./worlds');
let LastRing = '';

function isIn(object, string) {
    for (const [key, value] of Object.entries(object)) {
        console.log(string)
        console.log(key)
        if (key === string) {
            return value;
        }
    }
    return false;
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

const btn = document.getElementById('subm');
btn.onclick = function(_e) {
    const dropdown = document.getElementById('dropdown')
    if (dropdown.value.length > 0) {
        remote.getCurrentWindow().towerSelected = dropdown.value;
    } else {
        remote.getCurrentWindow().towerSelected = 'Somewhere...';
    }
}

remote.getCurrentWindow().gameLocationUpdated(gameLocationUpdated);