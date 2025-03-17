document.addEventListener("DOMContentLoaded", () => {
    console.log("JavaScript Loaded!");

    // ✅ Select or Create Audio Element (Singleton)
    let audio = document.getElementById("audio");
    if (!audio) {
        audio = new Audio();
        audio.id = "audio";
        document.body.appendChild(audio);
    }

    const playPauseBtn = document.getElementById("play-pause");
    const playPauseIcon = playPauseBtn?.querySelector("i");
    const progressBar = document.getElementById("progress-bar");
    const currentTimeDisplay = document.getElementById("current-time");
    const durationDisplay = document.getElementById("duration");
    const playerImg = document.getElementById("player-img");
    const playerTitle = document.getElementById("player-title");
    const playerArtist = document.getElementById("player-artist");
    const musicListContainer = document.querySelector(".container");
    const nextBtn = document.getElementById("nextSong");
    const prevBtn = document.getElementById("prevSong");
    const backButton = document.getElementById("back-button");

    let isPlaying = false;

    // ✅ Prevent Duplicate Event Listeners
    if (!audio.dataset.eventsAdded) {
        audio.addEventListener("timeupdate", updateProgressBar);
        audio.addEventListener("ended", () => {
            isPlaying = false;
            localStorage.setItem("isPlaying", "false");
            updatePlayPauseIcon();
            changeSong(1);
        });

        audio.dataset.eventsAdded = "true"; // Mark as initialized
    }

    // ✅ Load Songs
    let songList = JSON.parse(localStorage.getItem("songList")) || [];
    if (!songList.length && typeof songs !== "undefined") {
        songList = songs;
        localStorage.setItem("songList", JSON.stringify(songs));
    }

    function renderSongs() {
        let containerIndex = 1;
        let songContainer = createSongContainer(containerIndex);

        songList.forEach((song, index) => {
            if (index > 0 && index % 6 === 0) {
                containerIndex++;
                songContainer = createSongContainer(containerIndex);
            }

            const songElement = document.createElement("div");
            songElement.classList.add("song");
            songElement.setAttribute("data-src", song.src);
            songElement.innerHTML = `
                <img src="${song.img}" alt="${song.title}">
                <p>${song.title}</p>
                <p>${song.artist}</p>
            `;
            songContainer.appendChild(songElement);

            songElement.addEventListener("click", () => playSelectedSong(song));
        });
    }

    function createSongContainer(index) {
        let newContainer = document.getElementById(`song-container-${index}`);
        if (!newContainer) {
            newContainer = document.createElement("div");
            newContainer.classList.add("music-list");
            newContainer.id = `song-container-${index}`;

            const containerWrapper = document.createElement("div");
            containerWrapper.classList.add("container");
            containerWrapper.innerHTML = `<h2>My Music List 🎵</h2>`;
            containerWrapper.appendChild(newContainer);

            if (musicListContainer && musicListContainer.parentNode) {
                musicListContainer.parentNode.insertBefore(containerWrapper, musicListContainer.nextSibling);
            } else {
                console.warn("Music list container not found, skipping song container creation.");
            }
            
        }
        return newContainer;
    }

    // ✅ Load Last Played Song Without Duplication
    let savedSong = JSON.parse(localStorage.getItem("currentSong"));
    let savedPosition = parseFloat(localStorage.getItem("songPosition")) || 0;

    if (savedSong && !audio.src) {
        updatePlayerUI(savedSong);
        audio.src = savedSong.src;
        audio.currentTime = savedPosition;
        if (localStorage.getItem("isPlaying") === "true") {
            audio.play().then(() => {
                isPlaying = true;
                updatePlayPauseIcon();
            }).catch(error => console.error("Playback failed:", error));
        }
    }

    playPauseBtn?.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            isPlaying = true;
        } else {
            audio.pause();
            isPlaying = false;
        }
        localStorage.setItem("isPlaying", isPlaying);
        updatePlayPauseIcon();
    });

    function updatePlayPauseIcon() {
        if (playPauseIcon) {
            playPauseIcon.classList.replace(isPlaying ? "fa-play" : "fa-pause", isPlaying ? "fa-pause" : "fa-play");
        }
    }

    function updateProgressBar() {
        if (audio.duration) {
            progressBar.value = (audio.currentTime / audio.duration) * 100;
            if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(audio.currentTime);
            if (durationDisplay) durationDisplay.textContent = formatTime(audio.duration);
            localStorage.setItem("songPosition", audio.currentTime);
        }
    }

    progressBar?.addEventListener("input", () => {
        audio.currentTime = (progressBar.value / 100) * audio.duration;
    });

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    function playSelectedSong(songData) {
        if (audio.src === songData.src) {
            return; // Prevent restarting the same song
        }

        localStorage.setItem("currentSong", JSON.stringify(songData));
        localStorage.setItem("songPosition", 0);
        localStorage.setItem("isPlaying", "true");

        updatePlayerUI(songData);
        audio.src = songData.src;
        audio.currentTime = 0;
        audio.play();
        isPlaying = true;
        updatePlayPauseIcon();
    }

    nextBtn?.addEventListener("click", () => changeSong(1));
    prevBtn?.addEventListener("click", () => changeSong(-1));

    function changeSong(direction) {
        let savedSong = JSON.parse(localStorage.getItem("currentSong"));
        let currentIndex = songList.findIndex(song => song.src === savedSong.src);

        let newIndex = (currentIndex + direction + songList.length) % songList.length;
        let newSong = songList[newIndex];

        localStorage.setItem("currentSong", JSON.stringify(newSong));
        localStorage.setItem("songPosition", 0);
        localStorage.setItem("isPlaying", "true");

        updatePlayerUI(newSong);
        audio.src = newSong.src;
        audio.currentTime = 0;
        audio.play();
        isPlaying = true;
        updatePlayPauseIcon();
    }

    function updatePlayerUI(song) {
        if (playerImg) playerImg.src = song.img;
        if (playerTitle) playerTitle.textContent = song.title;
        if (playerArtist) playerArtist.textContent = song.artist;
    }

    // ✅ Fix Back Button (Works in History)
    if (backButton) {
        backButton.addEventListener("click", (event) => {
            event.preventDefault();
            console.log("Back button clicked! History length:", history.length);
            console.log("Referrer:", document.referrer);

            if (document.referrer && document.referrer !== window.location.href) {
                window.location.href = document.referrer; // Go to the previous page
            } else {
                window.location.href = "index.html"; // Fallback to home
            }
        });
    }

    // ✅ Page Transition Without Reload
    document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", function (event) {
            if (this.getAttribute("href").startsWith("#") || this.getAttribute("href") === "javascript:void(0)") {
                return;
            }
            event.preventDefault();
            fetch(this.href)
                .then(response => response.text())
                .then(html => {
                    document.body.innerHTML = html;
                    history.pushState({}, "", this.href);
                    document.dispatchEvent(new Event("DOMContentLoaded"));
                })
                .catch(error => console.error("Error loading page:", error));
        });
    });

    renderSongs();
});
