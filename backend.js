console.log("Spotify Clone Loaded");

let songIndex = 0;
let audioElement = new Audio();
let masterPlay = document.getElementById('play-pause-btn');
let myProgressBar = document.getElementById('progress-bar');
let masterSongName = document.getElementById('current-song-title');
let masterArtistName = document.getElementById('current-song-artist');
let songImg = document.getElementById('current-song-img');
let currentTimeSpan = document.getElementById('current-time');
let totalDurationSpan = document.getElementById('total-duration');
let volumeBar = document.getElementById('volume-bar');
let playlistContainer = document.getElementById('playlist-container');

let songs = [];

// Fetch songs from iTunes API
async function fetchSongs() {
    try {
        const response = await fetch('https://itunes.apple.com/search?term=top+hits&media=music&limit=12');
        const data = await response.json();

        songs = data.results.map(item => ({
            songName: item.trackName,
            filePath: item.previewUrl,
            coverPath: item.artworkUrl100.replace('100x100', '300x300'), // Get higher res image
            artist: item.artistName
        }));

        renderPlaylist();
    } catch (error) {
        console.error("Error fetching songs:", error);
        alert("Failed to load songs from API.");
    }
}

function renderPlaylist() {
    playlistContainer.innerHTML = '';
    songs.forEach((song, i) => {
        let item = document.createElement('div');
        item.classList.add('item');
        item.innerHTML = `
            <img src="${song.coverPath}" alt="${song.songName}">
            <div class="play">
                <span class="fa fa-play"></span>
            </div>
            <h4>${song.songName}</h4>
            <p>${song.artist}</p>
        `;

        // Add click listener to the entire item
        item.addEventListener('click', () => {
            playSong(i);
        });

        playlistContainer.appendChild(item);
    });
}

// Handle play/pause click
masterPlay.addEventListener('click', () => {
    if (songs.length === 0) return;

    if (audioElement.paused || audioElement.currentTime <= 0) {
        audioElement.play().catch(error => console.error("Playback error:", error));
        masterPlay.classList.remove('fa-circle-play');
        masterPlay.classList.add('fa-circle-pause');
    } else {
        audioElement.pause();
        masterPlay.classList.remove('fa-circle-pause');
        masterPlay.classList.add('fa-circle-play');
    }
});

// Listen to Events
audioElement.addEventListener('timeupdate', () => {
    // Update Seekbar
    if (audioElement.duration) {
        let progress = parseInt((audioElement.currentTime / audioElement.duration) * 100);
        myProgressBar.value = progress;

        // Update time display
        let currentMinutes = Math.floor(audioElement.currentTime / 60);
        let currentSeconds = Math.floor(audioElement.currentTime % 60);
        if (currentSeconds < 10) currentSeconds = "0" + currentSeconds;
        currentTimeSpan.innerText = `${currentMinutes}:${currentSeconds}`;

        let durationMinutes = Math.floor(audioElement.duration / 60);
        let durationSeconds = Math.floor(audioElement.duration % 60);
        if (durationSeconds < 10) durationSeconds = "0" + durationSeconds;
        totalDurationSpan.innerText = `${durationMinutes}:${durationSeconds}`;
    }
});

audioElement.addEventListener('ended', () => {
    // Auto play next song
    if (songIndex >= songs.length - 1) {
        songIndex = 0;
    } else {
        songIndex += 1;
    }
    playSong(songIndex);
});

myProgressBar.addEventListener('change', () => {
    audioElement.currentTime = myProgressBar.value * audioElement.duration / 100;
});

// Handle Next/Prev
document.getElementById('next-btn').addEventListener('click', () => {
    if (songs.length === 0) return;
    if (songIndex >= songs.length - 1) {
        songIndex = 0;
    } else {
        songIndex += 1;
    }
    playSong(songIndex);
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (songs.length === 0) return;
    if (songIndex <= 0) {
        songIndex = 0;
    } else {
        songIndex -= 1;
    }
    playSong(songIndex);
});

function playSong(index) {
    songIndex = index;
    audioElement.src = songs[songIndex].filePath;
    masterSongName.innerText = songs[songIndex].songName;
    masterArtistName.innerText = songs[songIndex].artist;
    songImg.src = songs[songIndex].coverPath;
    audioElement.currentTime = 0;
    audioElement.play().catch(error => {
        console.error("Playback failed:", error);
        alert("Playback failed. Please check your internet connection.");
    });

    masterPlay.classList.remove('fa-circle-play');
    masterPlay.classList.add('fa-circle-pause');

    // Update active state in playlist (optional visual cue)
    updateActiveSongVisuals();
}

function updateActiveSongVisuals() {
    // Reset all plays
    const allPlays = document.querySelectorAll('.item .play span');
    allPlays.forEach(el => {
        el.classList.remove('fa-pause');
        el.classList.add('fa-play');
    });

    // Set current play
    const currentItem = playlistContainer.children[songIndex];
    if (currentItem) {
        const playBtn = currentItem.querySelector('.play span');
        playBtn.classList.remove('fa-play');
        playBtn.classList.add('fa-pause');
    }
}

// Volume Control
volumeBar.addEventListener('change', (e) => {
    audioElement.volume = e.target.value / 100;
});

// Initial Fetch
fetchSongs();
