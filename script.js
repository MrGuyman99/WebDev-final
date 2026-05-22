// Once website has proper URL use this and get a token thing :)
// URL -> https://data.cityofchicago.org/api/v3/views/xq83-jr8c/query.csv

/*
    Structure of .CSV file:
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

// Iterates through the dataset stored in data and searches for a given term
function search(data, search_term) {
    for (const row of data) {
        if (row[2] == search_term) {
            return (row);
        }
    }
}

let data;
// Made the function as async so we can use await and wait for the Promise function to finish
document.getElementById('filepicker').addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const content = await readCSV(file);
    // Chops off the header content
    data = content.slice(1);
});

document.getElementById('buttonSubmit').addEventListener('submit', function (e) {
    e.preventDefault();
    let term = document.getElementById("searchTerm").value;
    if (term != "") {
        document.getElementById('output').innerText += search(data, term);
    }
});