console.log('Here from now we will write the JavaScript Part');

// 🌍 Global Base URL for hosting (change here only if needed)
const BASE_URL = window.location.origin;
let currentSong = new Audio();
let songs = [];
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formatedMinutes = String(minutes).padStart(2, '0');
    const formatedseconds = String(remainingSeconds).padStart(2, '0');

    return `${formatedMinutes}:${formatedseconds}`;
}

// Predefined song lists for each folder (since we can't list directory contents on Vercel)
const SONG_DATA = {
    "june": [
        "song1.mp3",
        "song2.mp3", 
        "song3.mp3",
        "song4.mp3",
        "song5.mp3",
        "song6.mp3"
    ],
    "july": [
        "song7.mp3",
        "song8.mp3",
        "song9.mp3",
        "song10.mp3",
        "song11.mp3",
        "song12.mp3"
    ],
    "aug": [
        "song13.mp3",
        "song14.mp3",
        "song15.mp3"
    ]
};

// Predefined album data (since we can't fetch directory listings on Vercel)
const ALBUM_DATA = {
    "june": {
        "title": "June Collection",
        "description": "Summer vibes and fresh beats"
    },
    "july": {
        "title": "July Hits", 
        "description": "Mid-summer anthems and chill tracks"
    },
    "aug": {
        "title": "August Favorites",
        "description": "Late summer classics and new discoveries"
    }
};

async function getSongs(folder) {
    currFolder = folder;
    
    // Use predefined song list instead of fetching directory
    if (SONG_DATA[folder]) {
        songs = [...SONG_DATA[folder]];
    } else {
        console.warn(`No songs found for folder: ${folder}`);
        songs = [];
        return songs;
    }

    // Show all songs in Playlist
    let songUL = document.querySelector(".songList")?.getElementsByTagName("ul")[0];
    if (!songUL) {
        console.error("Could not find song list container");
        return songs;
    }
    
    songUL.innerHTML = "";
    for (const song of songs) {
        const displayName = song.replace('.mp3', '').replace(/song(\d+)/, 'Track $1');
        songUL.innerHTML += `<li> 
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${displayName}</div>
                    <div>Anss</div>
                </div>
                 <div class="playnow">
                    <span>Play Now</span>
                     <img class="invert" src="img/play.svg" alt="">
                </div>
             </li>`;
    }

    // Attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });
    
    return songs;
}

const playMusic = (track, pause = false) => {
    if (!track || !currFolder) {
        console.error("Invalid track or folder");
        return;
    }
    
    currentSong.src = `${BASE_URL}/songs/${currFolder}/${track}`;
    
    if (!pause) {
        currentSong.play().catch(err => {
            console.error("Error playing audio:", err);
            alert(`Could not play ${track}. Make sure the file exists in /songs/${currFolder}/`);
        });
        const playBtn = document.getElementById("play");
        if (playBtn) playBtn.src = "img/pause.svg";
    }
    
    const songInfo = document.querySelector(".songinfo");
    if (songInfo) {
        const displayName = track.replace('.mp3', '').replace(/song(\d+)/, 'Track $1');
        songInfo.innerHTML = displayName;
    }
    
    const songTime = document.querySelector(".songtime");
    if (songTime) {
        songTime.innerHTML = "00:00 / 00:00";
    }
};

async function displayAlbum() {
    const cardContainer = document.querySelector(".cardContainer");
    if (!cardContainer) {
        console.error("Card container not found");
        return;
    }

    cardContainer.innerHTML = ""; // Clear existing content

    // Use predefined album data instead of fetching directory listings
    for (const [folder, albumData] of Object.entries(ALBUM_DATA)) {
        cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="38" fill="#1DB954" />
                        <path d="M30 24L58 40L30 56Z" fill="#000" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="${albumData.title} Cover" 
                     onerror="this.src='/img/default-cover.jpg'; this.onerror=null;">
                <h2>${albumData.title}</h2>
                <p>${albumData.description}</p>
            </div>
        `;
    }

    // Add click listeners to load playlists
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            const folder = item.currentTarget.dataset.folder;
            songs = await getSongs(folder);
            if (songs.length > 0) {
                playMusic(songs[0]);
            }
        });
    });
}

async function main() {
    try {
        // Initialize with default folder
        await getSongs("june");
        if (songs.length > 0) {
            playMusic(songs[0], true); // Start with first song paused
        }

        await displayAlbum();

        // Play/Pause button
        const playBtn = document.getElementById("play");
        if (playBtn) {
            playBtn.addEventListener("click", () => {
                if (currentSong.paused) {
                    currentSong.play().catch(err => {
                        console.error("Play error:", err);
                        alert("Could not play audio. Check if the file exists and is accessible.");
                    });
                    playBtn.src = "img/pause.svg";
                } else {
                    currentSong.pause();
                    playBtn.src = "img/play.svg";
                }
            });
        }

        // Time update
        currentSong.addEventListener("timeupdate", () => {
            const songTime = document.querySelector(".songtime");
            const circle = document.querySelector(".circle");
            
            if (songTime && !isNaN(currentSong.duration)) {
                songTime.innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            }
            
            if (circle && !isNaN(currentSong.duration) && currentSong.duration > 0) {
                circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
            }
        });

        // Seek bar
        const seekbar = document.querySelector(".seekbar");
        if (seekbar) {
            seekbar.addEventListener("click", e => {
                if (currentSong.duration && !isNaN(currentSong.duration)) {
                    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
                    const circle = document.querySelector(".circle");
                    if (circle) circle.style.left = percent + "%";
                    currentSong.currentTime = (currentSong.duration * percent) / 100;
                }
            });
        }

        // Hamburger menu
        const hamburger = document.querySelector(".hamburger");
        if (hamburger) {
            hamburger.addEventListener("click", () => {
                const leftPanel = document.querySelector(".left");
                if (leftPanel) leftPanel.style.left = "0";
            });
        }

        // Close button
        const closeBtn = document.querySelector(".close");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                const leftPanel = document.querySelector(".left");
                if (leftPanel) leftPanel.style.left = "-120%";
            });
        }

        // Previous button
        const previousBtn = document.getElementById("previous");
        if (previousBtn) {
            previousBtn.addEventListener("click", () => {
                const currentFileName = currentSong.src.split("/").slice(-1)[0];
                let index = songs.indexOf(currentFileName);
                if (index > 0) {
                    playMusic(songs[index - 1]);
                } else if (index === 0) {
                    // Loop to last song
                    playMusic(songs[songs.length - 1]);
                }
            });
        }

        // Next button
        const nextBtn = document.getElementById("next");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                const currentFileName = currentSong.src.split("/").slice(-1)[0];
                let index = songs.indexOf(currentFileName);
                if (index >= 0 && index < songs.length - 1) {
                    playMusic(songs[index + 1]);
                } else if (index === songs.length - 1) {
                    // Loop to first song
                    playMusic(songs[0]);
                }
            });
        }

        // Auto play next song when current ends
        currentSong.addEventListener("ended", () => {
            const nextBtn = document.getElementById("next");
            if (nextBtn) {
                nextBtn.click();
            }
        });

        // Volume control
        const volumeRange = document.querySelector(".range input");
        if (volumeRange) {
            volumeRange.addEventListener("change", e => {
                currentSong.volume = parseInt(e.target.value) / 100;
            });
        }

        // Volume/Mute toggle
        const volumeImg = document.querySelector(".volume > img");
        if (volumeImg) {
            volumeImg.addEventListener("click", e => {
                const volumeRange = document.querySelector(".range input");
                if (e.target.src.includes("volume.svg")) {
                    e.target.src = e.target.src.replace("volume.svg", "mute.svg");
                    currentSong.volume = 0;
                    if (volumeRange) volumeRange.value = 0;
                } else {
                    e.target.src = e.target.src.replace("mute.svg", "volume.svg");
                    currentSong.volume = 0.10;
                    if (volumeRange) volumeRange.value = 10;
                }
            });
        }

        // Handle audio loading
        currentSong.addEventListener("loadstart", () => {
            console.log("Loading audio...");
        });

        currentSong.addEventListener("canplay", () => {
            console.log("Audio can start playing");
        });

        // Handle audio errors
        currentSong.addEventListener("error", (e) => {
            console.error("Audio error:", e);
            const songInfo = document.querySelector(".songinfo");
            if (songInfo) {
                songInfo.innerHTML = "Error loading song";
            }
        });

        // Set initial volume
        currentSong.volume = 0.1;

    } catch (error) {
        console.error("Error initializing app:", error);
    }
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}