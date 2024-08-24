/**** STATE ****/

// Here we have the code that sets up the state by making an empty array that will hold all our albums!

let albumsList = [];

/**** RENDERING AND LISTENING ****/

//Now we set up some variables that will be our easy way to access the elements in the dom in our html code! The first is just the container that displays all the albums, the second through fifth are all the input values for when creating an album, the album form is for the form, and the last is for the display albums button!

const albumsContainer = document.getElementById("albums-container");
const albumArtistInput = document.getElementById("album-artist");
const albumNameInput = document.getElementById("album-name");
const albumYearInput = document.getElementById("album-year");
const albumGenreInput = document.getElementById("album-genre");
const albumForm = document.getElementById("album-form");
const showAlbumsButton = document.getElementById("show-albums-button");

// Now we've got our renderAlbumList code that runs every time we update the data!
function renderAlbumList() {
    albumsContainer.innerHTML = "";

    if (albumsList.length === 0) {
        albumsContainer.innerHTML = "<p>No Albums to Display</p>";
    } else {
        albumsList.map(renderAlbum).forEach(div => albumsContainer.appendChild(div));
    }
}

//This code renders each album individually and is used in the above function! It does so by creating a div called albumDiv and then giving it some bootstrap styling, then setting the innerHTML to some html code that when strung together with the template strings from the object being passed through makes the album display, and also a little delete button! We also add an event listener onto the delete button that both deletes the album from the albumsList and deletes it from the backend. Then we return that albumDiv.
function renderAlbum(album) {
    const albumDiv = document.createElement("div");
    albumDiv.className = "bg-light mb-3 p-4";
    albumDiv.innerHTML = `
    <h5>${album.album}</h5>
    <p><strong>Artist:</strong> ${album.artist}</p>
    <p><strong>Year:</strong> ${album.year}</p>
    <p><strong>Genre:</strong> ${album.genre}</p>
    <button class="btn btn-sm btn-outline-danger delete-button">Delete</button>
    `;
    albumDiv.querySelector(".delete-button").addEventListener("click", async (event) => {
        await deleteAlbum(album.id);

        albumsList = albumsList.filter(a => a.id !== album.id);
        renderAlbumList();
    });

    return albumDiv;
}

//This is the code that adds an eventListener to the submit button at the top of our page that adds a new album to the albumList and the back end. It does so with an asynchronous function that prevents refreshing on the button click. And then makes a album object with all the values from the form that the user inputs. Using a try and catch in case it doesn't correctly upload (I was having some issues while getting it to work so this helped), it creates a new variable called createdAlbum and then awaits to see if it is posted using the asynchronous postAlbum function, passing the newAlbum through. Then it pushes that createdAlbum to the albumsList array. Then it rerenders! It also resets the values of all the boxes back to empty so the user is ready to put something new in!
albumForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const newAlbum = {
        artist: albumArtistInput.value,
        album: albumNameInput.value, 
        year: parseInt(albumYearInput.value),
        genre: albumGenreInput.value
    };

    try {
        const createdAlbum = await postAlbum(newAlbum);
        albumsList.push(createdAlbum);
        renderAlbumList();

        albumArtistInput.value = "";
        albumNameInput.value = "";
        albumYearInput.value = "";
        albumGenreInput.value = "";
    } catch (error) {
        console.error("Error saving album:", error);
        alert("Failed to save album. Please try again.");
    }
});
//This gives our show albums button the event listener that asynchronously fetches all the albums, and then renders them!
showAlbumsButton.addEventListener("click", async () => {
    albumsList = await fetchAllAlbums();
    renderAlbumList();
});

/**** FETCHING ****/
//This is our fetch all albums function that is put on the show all albums button above! It fetches the screamoalbums database from the server, and returns it using .json(). I also worked in an error handling bit in case the response isn't good!
async function fetchAllAlbums() {
    const response = await fetch("http://localhost:4500/screamoalbums");
    if (!response.ok) {
        throw new Error(`Failed to fetch albums: ${response.statusText}`);
    }
    return response.json();
}

//This is the function that post albums to the back end! It takes one paramater, and using the post method adds the new album. and returns the response .json() 
async function postAlbum(newAlbumData) {
    const response = await fetch("http://localhost:4500/screamoalbums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlbumData)
    });
    if (!response.ok) {
        throw new Error(`Failed to save album: ${response.statusText}`);
    }
    return response.json();
}

//This is the function that is run to delete an album from the back end! It uses fetch and the method DELETE to remove the album with the id that matches idToDelete.
async function deleteAlbum(idToDelete) {
    const response = await fetch("http://localhost:4500/screamoalbums/" + idToDelete, {
        method: "DELETE"
    });
    if (!response.ok) {
        throw new Error(`Failed to delete album: ${response.statusText}`);
    }
}