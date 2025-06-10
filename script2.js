async function asd() {
    try{
        const response = await fetch("https://api.sampleapis.com/beers/ale");
        if (!response.ok) {
            throw new Error(`hiba: ,${response.status}`);
        }
        const data = await response.json();
        const sorok = {};
        data.forEach((beer, index) => {
            sorok[`beer_${beer.id}`] = beer;
        });
        
        console.log("lista: ", data);
        insertSelectOptions(sorok);
    }
    catch(error){
        console.log("lista: ", error);
    }
}

asd()

function insertSelectOptions(sorok){
    const selectElement = document.getElementById('beerSelector');

    const defaultOption = document.createElement('option');
    defaultOption.text = 'Choose beer!';
    defaultOption.value = '';
    defaultOption.selected = true;
    defaultOption.disabled = true;

    selectElement.add(defaultOption);

    if(!sorok || Object.keys(sorok).length === 0){
        console.error('Hiba: Nincsenek sörök!');
        return;
    }

    for(const key in sorok){
        const option = document.createElement('option'); 
        option.text = sorok[key].name;
        option.value = sorok[key].id;
        selectElement.add(option);
    }

    selectElement.addEventListener('change', function(){
        const selectedIndex = selectElement.selectedIndex;
        const selectedBeerId = selectElement.options[selectedIndex].value;
        const selectedBeer = sorok[`beer_${selectedBeerId}`]; 
        displayBeer(selectedBeer);
    });
}

function displayBeer(beer){
    if(!beer || !beer.name){
        console.error('Hiba: Nem siekrült megjeleníteni a sört!');
        return;
    }

    const beerInfo = document.getElementById('beerInfo');
    beerInfo.innerHTML = 
    `<p>Beer's name: ${beer.name}</p>
    <p>Prize: ${beer.price}</p>
    <p>Id: ${beer.id}</p>
    <p>Average review: ${beer.rating.average}</p>
    <p>Number of reviews: ${beer.rating.reviews}</p>
    <img src="${beer.image}" alt="">
    <label for="email">Email: </label>
    <input type="email" id="email">
    <br>
    
    <button onclick="asd2()">Press this button to collect your free ale!</button>
    <div id="kuldes"></div>`
}

function asd2() {
    const kuldes = document.getElementById("kuldes")
    const email = document.getElementById("email")

    if (email.value != "") {
        kuldes.innerText = "Email sent!"
    }
    else {
        kuldes.innerText = "Email missing!"
    }
}