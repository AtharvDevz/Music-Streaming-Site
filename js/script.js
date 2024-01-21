function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

function decodeURL(url) {
    let songName = url.replace("http://127.0.0.1:3000/songs/", ""); // ADD YOUR URL
    songName = songName.replaceAll("-", " ")
    songName = songName.replace(".mp3", " ")
    let i = songName.indexOf("/")
    songName = songName.slice(i + 1)

    return songName
}
async function getPlaylists() {
    let a = await fetch("/songList.html")
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let playli = div.querySelectorAll(".playlist")
    let playlists = [];
    for (let index = 0; index < playli.length; index++) {
        playlists.push(playli[index].querySelector(".playlistName").innerHTML)
    }
    return playlists
}
async function getSongs(playlist) {
    let a = await fetch("/songList.html")
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let Playlist = div.querySelector("." + playlist + " .songs")
    let as = Playlist.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href)
        }
    }
    return songs
}
let currentSong = new Audio();
const playSong = (track, pause = false) => {
    currentSong.src = track
    currentSong.addEventListener('loadedmetadata', () => {
        // This event is triggered when the metadata (including duration) is loaded
        let duration = currentSong.duration;
        document.querySelector(".songDuration").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".songInfo  .songName").innerHTML = decodeURL(track);
        document.querySelector(".songInfo  .songArtist").innerHTML = "Artist";
        document.querySelector(".currentTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`;
        document.querySelector(".volHead").style.left = (currentSong.volume * 100) + "%";

    });
    if (!pause) {
        currentSong.play()
        PBPlay.src = "assets/pause-button-icon.svg"``
    }
}
async function getCard() {
    let playlists = await getPlaylists("/songList.html")
    let a = await fetch("/songList.html")
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    for (const p1 of playlists) {
        let playli = div.querySelector("." + p1)
        let coverPhoto =  playli.querySelector(".songs img").src
        let playlistName =  playli.querySelector(".playlistName").innerHTML
        let playlistDesc =  playli.querySelector(".playlistDesc").innerHTML
        let cardContainer = document.querySelector(".card-container")
        cardContainer.innerHTML = 
        document.querySelector(".card-container").innerHTML + 
                    `<div class="card rounded" >
                        <div class="play">
                            <img src="assets/play.svg" alt="play">
                        </div>
                        <img src="${coverPhoto}" alt="img">
                        <h3>${playlistName}</h3>
                        <p>${playlistDesc}</p>
                    </div>`
    }
}

async function getSongsInPlaylist(playlist){
    console.log(playlist)
    let songUl = document.querySelector(".Playlist").getElementsByTagName("ul")[0]
    let songs = await getSongs(playlist)
    console.log(songs)
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `
        <li>
        <div class="songInfo1">            
        <a href="${song}">${decodeURL(song)}</a>
        <div class="songArtist">Artist</div>
        </div>
        <img class="invert playImg" src="assets/play-button-icon.svg" alt="play">
        </li>
        `
    }
    playSong(songs[0], true);
}
async function main() {
    // Get All Playlist Detail in card
    let playlists = await getPlaylists()
    await getCard()
    // Get the List of all songs
    // showing all songs on home Page
    let songs = await getSongs(playlists[0])
    // loading First Song
    playSong(songs[0], true);
    await getSongsInPlaylist(playlists[0])
    Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", () => {
                let playlist = e.querySelector("h3").innerHTML
                console.log(playlist)
                getSongsInPlaylist(playlist)
            })
        
    })
    // Attach an Event Listener to eah Song
    Array.from(document.querySelector(".Playlist").getElementsByTagName("li")).forEach(e => {
        let playImg = e.querySelector(".playImg")
        playImg.addEventListener("click", () => {
            if(e.querySelector(".playImg").src == "/assets/pause-button-icon.svg"){
                e.querySelector(".playImg").src = "assets/play-button-icon.svg"
                PBPlay.src = "assets/play-button-icon.svg"
                currentSong.pause()
            }else{
                e.querySelector(".playImg").src = "assets/pause-button-icon.svg"
                PBPlay.src = "assets/pause-button-icon.svg"
                playSong(e.querySelector(".songInfo1 a").getAttribute('href'));
            }
        });
    });

    PBPlay.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            PBPlay.src = "assets/pause-button-icon.svg"
        } else {
            currentSong.pause()
            PBPlay.src = "assets/play-button-icon.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".currentTime").innerHTML = `
        ${secondsToMinutesSeconds(currentSong.currentTime)}
        `
        document.querySelector(".seekBar .head").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // Attach Event Listeners to seekBar
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".head").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Hamburger Menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    // Cancel Menu
    document.querySelector(".cancel").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    PBPrev.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src)
        if ((index - 1) >= 0) {
            playSong(songs[index - 1])
        }
    })
    PBNext.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src)
        if ((index + 1) <= songs.length) {
            playSong(songs[index + 1])
        }
    })
    // Volume Button
    let currentVolume;
    volume.addEventListener("click", () => {
        if (currentSong.volume != 0) {
            currentVolume = currentSong.volume
            volume.src = "assets/NoVolume.svg"
            currentSong.volume = "0"
            let percent = 0 * 100;
            document.querySelector(".volHead").style.left = percent + "%";
        } else {
            volume.src = "assets/volume.svg"
            currentSong.volume = currentVolume
            let percent = currentVolume * 100;
            document.querySelector(".volHead").style.left = percent + "%";
        }
    })

    // Showing Volume change Button
    volume.addEventListener("mouseover", () => {
        document.querySelector(".seekVolume").style.display = 'flex';
        document.querySelector(".seekVolBar").style.display = 'flex';
        document.querySelector(".volHead").style.display = 'flex';
        volume.style.display = "block"
        setTimeout(function () {
            document.querySelector(".seekVolume").style.display = 'none';
            document.querySelector(".seekVolBar").style.display = 'none';
            document.querySelector(".volHead").style.display = 'none';
            volume.style.left = 0

        }, 3000);
    });

    volume.addEventListener("mouseout", () => {
        setTimeout(function () {
            document.querySelector(".seekVolume").style.display = 'none';
            document.querySelector(".seekVolBar").style.display = 'none';
            document.querySelector(".volHead").style.display = 'none';
            volume.style.left = 0
        }, 3000);
    });

    // Changing Volume
    document.querySelector(".seekVolBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        if (percent == 0) {
            volume.src = "assets/NoVolume.svg"
        } else {
            volume.src = "assets/volume.svg"
        }
        document.querySelector(".volHead").style.left = percent + "%";
        currentSong.volume = (percent) / 100
        document.querySelector(".seekVolume .vol").innerHTML = parseFloat(currentSong.volume.toFixed(2) * 100)
    })


    // Loading data of first Song
    // playSong(songs[0], true);
}
main()