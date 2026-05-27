// Once website has proper URL use this and get a token thing :)
// URL -> https://data.cityofchicago.org/api/v3/views/xq83-jr8c/query.csv

/*
    Structure of Chicago Energy Benchmarking .CSV file:
    Data Year, ID, Property Name, Reporting Status, Address,
    ZIP Code, Chicago Energy Rating, Exempt From Chicago Energy Rating
*/

// CSV -> "a,b\n1,2" to Javascript 2D Array -> [["a", "b"], ["1", "2"]]
// Also removes extra characters like "\"Lincoln Park-CPS\"" to Lincoln Park-CPS 
function parseCSV(content) {
    const rows = content.trim().split("\n");
    // We return a new 2D array using the .map method
    return rows.map(row =>
        row.split(",").map(cell =>
            cell.trim().replace(/^"|"$/g, "")
        )
    );
}

// In a Promise() so that we can await on it later, 
// because of this we can wait for the content to finish loading
function readCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // When file is finished being read we essentially return the result to what called the function
        // We also return the parsed result
        reader.onload = (e) => resolve(parseCSV(e.target.result));
        reader.onerror = () => reject(new Error("Failed to read file :("));
        reader.readAsText(file);
    });
}

// Iterates through the radios and finds which is checked
function iterateRadios(radios) {
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i];
        }
    }
}

let what_checked;
// Iterates through the dataset stored in data and searches for a given term
// We return the entire row so we can use whatever data we want from it
function search(data, search_term, search_type) {
    // We find what to search for (Zip Code, Address, e.t.c)
    // The values of our radio buttons correspond to the indexes of the data we want to check
    // E.X Checking for zipcodes -> what_checked = 5; data[5] would access zipcode
    what_checked = Number(iterateRadios(search_type).value);
    let total = [];
    for (const row of data) {
        // All the values for all of the checkboxes corespond to indexes
        if (row[what_checked] == search_term) {
            total.push(row);
        }
    }
    return total;
}

let data;
// Made the function as async so we can use await and wait for the Promise function to finish
// This runs when the file gets picked
document.getElementById("filepicker").addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const content = await readCSV(file);
    // Chops off the header content
    data = content.slice(1);
});

// This runs when the we press submit
document.getElementById('filePicker').addEventListener('submit', function (e) {
    // Prevents page from resetting
    e.preventDefault();
    let term = document.getElementById("searchTerm").value;
    // Gets the result of our search function
    // The search function iterates through the radios on its own 
    let search_result = search(data, term, document.getElementsByName("search_type"));
    let output = document.getElementById("output");
    // Setting output to zero before doing anything (Repeat searches)
    output.innerText = "";

    // Runs if search results are empty
    if (search_result.length === 0) {
        output.innerText += `Search result turned up nothing, sorry man :(`;
        return;
    }

    // We loop through all the search results and print out the corresponding message based on what the search type was
    for (let i = 0; i < search_result.length; i++) {
        // Property Name
        if (what_checked === 2) {
            output.innerText += `In ${search_result[i][0]} property name "${search_result[i][2]}" at address ${search_result[i][4]} has an energy rating of ${search_result[i][6]}\n`;
        }
        // Address + Zipcode
        else if (what_checked === 4 || what_checked === 5) {
            output.innerText += `In ${search_result[i][0]} address "${search_result[i][4]}" in Zip-Code ${search_result[i][5]} has an energy rating of ${search_result[i][6]}\n`;
        }
        // Energy level (Note: Looking up "0.0" would return 4160 entrances, may remove this later)
        // Other side note: When I ran this firefox kindly asked that I close the tab and then firefox proceeded to crash
        else {
            output.innerText += `In ${search_result[i][0]} within zip code "${search_result[i][5]}" at address "${search_result[i][4]}" the energy rating is: ${search_result[i][6]}\n`;
        }
    }
});