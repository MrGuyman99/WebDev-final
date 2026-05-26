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

// Iterates through the dataset stored in data and searches for a given term
// We return the entire row so we can use whatever data we want from it
function search(data, search_term, search_type) {
    // We find what to search for (Zip Code, Address, e.t.c)
    let what_checked = Number(iterateRadios(search_type).value);
    for (const row of data) {
        // All the values for all of the checkboxes corespond to indexes
        if (row[what_checked] == search_term) {
            return [row, what_checked];
        }
    }
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
    let search_result = search(data, term, document.getElementsByName("search_type"));
    let output = document.getElementById("output");
    output.innerText = "";
    const [row, type] = search_result;
    if (type === 2) {
        output.innerText += `Property name "${row[2]}" at address ${row[4]} has an energy rating of ${row[6]}`;
    } else if (type === 4 || type === 5) {
        output.innerText += `Address "${row[4]} named ${row[2]} has an energy rating of ${row[6]}`;
    } else {
        output.innerText += `Within zip code "${row[5]} at address ${row[4]} the energy rating is ${row[6]}`
    }
});