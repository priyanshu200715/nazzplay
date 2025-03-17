document.addEventListener("DOMContentLoaded", function () {
    console.log("Search Page Loaded!");

    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const searchBtn = document.getElementById("searchBtn");

    if (!searchInput || !searchResults) {
        console.error("Search input or results container not found.");
        return;
    }

    console.log("Search input and results container found!");

    // Retrieve song data from localStorage
    const songList = JSON.parse(localStorage.getItem("songList")) || [];
    
    if (!songList.length) {
        console.error("No songs found in localStorage.");
        return;
    }

    console.log("Song list loaded:", songList);

    // Function to perform search
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        console.log("User searched for:", query);

        searchResults.innerHTML = ""; // Clear previous results

        if (query === "") {
            console.log("Empty search query, no results.");
            return;
        }

        let found = false;

        songList.forEach(song => {
            if (song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query)) {
                found = true;
                const songElement = document.createElement("div");
                songElement.classList.add("recent-search-item");
                songElement.setAttribute("data-src", song.src); // Store song source
                songElement.innerHTML = `
                    <img src="${song.img}" alt="${song.title}">
                    <div class="song-details">
                        <p class="song-title">${song.title}</p>
                        <p class="artist-name">${song.artist}</p>
                    </div>
                `;

                // Click event to play the song
                songElement.addEventListener("click", () => {
                    localStorage.setItem("currentSong", JSON.stringify(song));
                    localStorage.setItem("songPosition", 0);
                    localStorage.setItem("isPlaying", "true");
                    window.location.href = "music_player.html"; // Redirect to index page for playing
                });

                searchResults.appendChild(songElement);
            }
        });

        if (!found) {
            searchResults.innerHTML = "<p>No results found.</p>";
        }
    }

    // Event listener for input search
    searchInput.addEventListener("input", performSearch);

    // Event listener for search button click
    if (searchBtn) {
        searchBtn.addEventListener("click", performSearch);
    }
});