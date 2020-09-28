var sc_widget;
var albums = [];

class Album
{
    constructor(source)
    {
        this.name = source.name;
        this.cover = source.cover;
        this.SCURL = source.SCURL;
        this.infos = source.infos;
        this.lyrics = {}

        if (source.lyrics)
        {
            this.loadLyrics(this, source.lyrics);
        }
    }

    loadLyrics(parent, lyrics)
    {
        let request = new XMLHttpRequest();
        let all;

        request.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                all = this.response.replace(/(\r)/gm, '').split("#").slice(1);
                for (let i = 0; i < all.length; i++)
                {
                    let lines = all[i].split("\n");
                    parent.lyrics[lines[0]] = lines.slice(1);
                }
            }
        }

        request.open("GET", "lyrics/" + lyrics);
        request.send();
    }
}

function loadAlbums()
{
    let request = new XMLHttpRequest();

    request.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            for (let i = 0; i < this.response.length; i ++)
            {
                albums.push(new Album(this.response[i]));
            }

            displayAlbums();
        }
    }

    request.open("GET", "albums.json", true);
    request.responseType = "json";
    request.send();
}

function displayAlbums()
{
    let selector = document.getElementById("album-selector");

    let l_slider = document.createElement("span");
    l_slider.innerHTML = "<"
    l_slider.classList.add("slider", "left-slider");
    l_slider.onclick = function() { slideAlbums(true) };
    selector.appendChild(l_slider);

    let row = document.createElement("div");
    row.id = "albums-row"

    for (let i = 0; i < albums.length; i ++)
    {
        let album = document.createElement("div");
        album.classList.add("album");
        album.innerHTML += "<img src=medias/" + albums[i].cover + ">"
        album.onclick = function() { displayThisAlbum(i) };
        row.appendChild(album);
    }

    selector.append(row);

    let r_slider = document.createElement("span");
    r_slider.innerHTML = ">"
    r_slider.classList.add("slider", "right-slider");
    r_slider.onclick = function() { slideAlbums(false) };
    selector.appendChild(r_slider);
}

function slideAlbums(left)
{
    let row = document.getElementById("albums-row"),
        children = row.children;

    children = Array.prototype.slice.call(children);

    if (left)
    {
        children.push(children.shift());
    }
    else
    {
        children.unshift(children.pop())
    }

    row.innerHTML = null;
    for (let i = 0; i < children.length; i ++)
    {
        row.appendChild(children[i]);
    }
}

function displayThisAlbum(id)
{
    // Update SoundClound player
    sc_widget.load(albums[id].SCURL);

    // Display title
    let name = document.getElementById("album-title");
    name.innerHTML = albums[id].name;

    // Display infos
    let infos = document.getElementById("album-infos");
    infos.innerHTML = "";
    if (albums[id].infos)
    {
        for (let i = 0; i < albums[id].infos.length; i ++)
        {
            infos.innerHTML += "<p>" + albums[id].infos[i] + "</p>";
        }
    }

    // Display lyrics
    let lyrics = document.getElementById("album-lyrics");
    lyrics.innerHTML = "";
    for(title in albums[id].lyrics)
    {
        lyrics.innerHTML += "<h4>" + title + "</h4>";
        for (let i = 0; i < albums[id].lyrics[title].length; i ++)
        {
            let line = albums[id].lyrics[title][i];
            if (line == "")
            {
                lyrics.innerHTML += "<br />";
            }
            else
            {
                lyrics.innerHTML += "<p>" + line + "</p>";
            }
        }
    }
}

function main()
{
    sc_widget = SC.Widget(document.getElementById("player"));
    loadAlbums();
}